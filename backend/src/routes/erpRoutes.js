const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');
const https = require('https');
const ImageKit = require('imagekit');
const { sendTripCreatedEmail, sendTripStatusEmail } = require('../utils/mailer');


// @route   GET /api/imagekit/auth
// Returns authentication parameters for client-side ImageKit uploads
// ImageKit is initialized lazily inside the handler so env vars are already loaded
router.get('/imagekit/auth', protect, (req, res) => {
  try {
    const ik = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    const authParams = ik.getAuthenticationParameters();
    res.json({ success: true, ...authParams, publicKey: process.env.IMAGEKIT_PUBLIC_KEY, urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Helper to automatically recalculate and save a driver's safety score based on profile documents and trips
async function recalculateDriverScore(driverId) {
  try {
    const driver = await Driver.findById(driverId);
    if (!driver) return 95;

    let score = 95; // base score

    // Expiry check
    const today = new Date();
    const expiryDate = new Date(driver.expiry);
    if (expiryDate < today) {
      score -= 30; // Expired license penalty
    }

    // Document checks
    if (!driver.avatar) score -= 5;
    if (!driver.aadhaarFile) score -= 10;
    if (!driver.panFile) score -= 5;
    if (!driver.dlFile) score -= 15;

    // Trip checks
    const trips = await Trip.find({ driver: driverId });
    const completedCount = trips.filter(t => t.status === 'completed').length;
    const cancelledCount = trips.filter(t => t.status === 'cancelled').length;

    score += (completedCount * 3);  // safe completed trips reward
    score -= (cancelledCount * 10); // cancelled trips penalty

    // Keep score bounds: 0 to 100
    score = Math.max(0, Math.min(100, score));

    driver.score = score;
    await driver.save();
    return score;
  } catch (err) {
    console.error('Error recalculating driver score:', err);
    return 95;
  }
}

// ==========================================
// 1. VEHICLES REGISTRY
// ==========================================

// @route   GET /api/vehicles
router.get('/vehicles', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({}).populate('assignedDriver');
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/vehicles
router.post('/vehicles', protect, async (req, res) => {
  try {
    const { reg } = req.body;

    // Check unique reg
    const vehicleExists = await Vehicle.findOne({ reg: reg.toUpperCase() });
    if (vehicleExists) {
      return res.status(400).json({ success: false, message: `Vehicle with registration ${reg} already exists` });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      reg: reg.toUpperCase(),
      status: req.body.status || 'available'
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/vehicles/:id
router.put('/vehicles/:id', protect, async (req, res) => {
  try {
    const { reg } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Check unique reg if changed
    if (reg && reg.toUpperCase() !== vehicle.reg) {
      const vehicleExists = await Vehicle.findOne({ reg: reg.toUpperCase() });
      if (vehicleExists) {
        return res.status(400).json({ success: false, message: `Vehicle with registration ${reg} already exists` });
      }
      vehicle.reg = reg.toUpperCase();
    }

    const fieldsToUpdate = [
      'name', 'type', 'maxLoad', 'odometer', 'cost', 'status',
      'nickname', 'category', 'brand', 'model', 'mfgYear', 'color', 'vin', 'engineNum', 'regState', 'regDate',
      'seatingCapacity', 'cargoCapacity', 'maxGrossWeight', 'fuelTankCapacity',
      'ownerName', 'purchaseDate', 'purchaseCost', 'vendor', 'warrantyExpiry', 'leaseType',
      'assignedDriver', 'depotLocation', 'fuelType', 'fuelCardNumber', 'mileage', 'avgMonthlyFuelConsumption',
      'insurance', 'documents'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });

    vehicle.lastUpdated = Date.now();

    await vehicle.save();
    const updatedVehicle = await Vehicle.findById(vehicle._id).populate('assignedDriver');
    res.json({ success: true, data: updatedVehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/vehicles/:id
router.delete('/vehicles/:id', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 2. DRIVER MANAGEMENT
// ==========================================

// @route   GET /api/drivers
router.get('/drivers', protect, async (req, res) => {
  try {
    const drivers = await Driver.find({});
    for (const d of drivers) {
      await recalculateDriverScore(d._id);
    }
    const updatedDrivers = await Driver.find({});
    res.json({ success: true, count: updatedDrivers.length, data: updatedDrivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/upload
router.post('/upload', protect, async (req, res) => {
  try {
    const { file, fileName } = req.body;
    if (!file || !fileName) {
      return res.status(400).json({ success: false, message: 'Missing file content or fileName' });
    }

    // ImageKit upload API requires multipart/form-data
    const boundary = '----FormBoundary' + Date.now().toString(16);
    
    // Build multipart body parts
    const parts = [];
    
    // file field (base64 data URI string)
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"\r\n\r\n${file}\r\n`);
    
    // fileName field
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="fileName"\r\n\r\n${fileName}\r\n`);
    
    // closing boundary
    parts.push(`--${boundary}--\r\n`);
    
    const bodyStr = parts.join('');
    const bodyBuffer = Buffer.from(bodyStr, 'utf-8');

    const IMAGEKIT_PRIVATE_KEY = 'private_pcy2TU8UVadsQ/FtlE1MHwUZ8r8=';

    const options = {
      hostname: 'upload.imagekit.io',
      path: '/api/v1/files/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        'Authorization': 'Basic ' + Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64')
      }
    };

    const ikReq = https.request(options, (ikRes) => {
      let rawData = '';
      ikRes.on('data', (chunk) => { rawData += chunk; });
      ikRes.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          if (ikRes.statusCode >= 200 && ikRes.statusCode < 300) {
            res.status(200).json({ success: true, url: parsed.url, fileId: parsed.fileId });
          } else {
            console.error('ImageKit error:', ikRes.statusCode, rawData);
            res.status(ikRes.statusCode).json({ success: false, message: parsed.message || 'ImageKit upload failed' });
          }
        } catch (e) {
          console.error('ImageKit parse error:', rawData);
          res.status(500).json({ success: false, message: 'Invalid response from ImageKit' });
        }
      });
    });

    ikReq.on('error', (err) => {
      console.error('ImageKit request error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    });

    ikReq.write(bodyBuffer);
    ikReq.end();

  } catch (err) {
    console.error('Upload route error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/drivers
router.post('/drivers', protect, async (req, res) => {
  try {
    const { name, email, license, category, expiry, contact, score, status, aadhaar, pan, bloodGroup, address, avatar, aadhaarFile, panFile, dlFile } = req.body;

    // Check unique license
    const driverExists = await Driver.findOne({ license: license.toUpperCase() });
    if (driverExists) {
      return res.status(400).json({ success: false, message: `Driver with license ${license} already exists` });
    }

    const driver = await Driver.create({
      name,
      email,
      license: license.toUpperCase(),
      category,
      expiry,
      contact,
      score: score || 100,
      status: status || 'available',
      aadhaar,
      pan: pan ? pan.toUpperCase() : undefined,
      bloodGroup,
      address,
      avatar,
      aadhaarFile,
      panFile,
      dlFile
    });

    await recalculateDriverScore(driver._id);
    const updatedDriver = await Driver.findById(driver._id);
    res.status(201).json({ success: true, data: updatedDriver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/drivers/:id
router.put('/drivers/:id', protect, async (req, res) => {
  try {
    const { name, email, license, category, expiry, contact, score, status, aadhaar, pan, bloodGroup, address, avatar, aadhaarFile, panFile, dlFile } = req.body;
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // 1. Check unique license if changed
    if (license && license.toUpperCase() !== driver.license) {
      const licenseExists = await Driver.findOne({ license: license.toUpperCase() });
      if (licenseExists) {
        return res.status(400).json({ success: false, message: `Driver with license ${license} already exists` });
      }
      driver.license = license.toUpperCase();
    }

    // 2. Validate status change rules
    if (status && status !== driver.status) {
      // Driver cannot be suspended or off duty if currently on trip
      if (driver.status === 'on_trip' && (status === 'suspended' || status === 'off_duty')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Driver is currently on a trip. Complete or cancel the trip before changing status.' 
        });
      }
      driver.status = status;
    }

    if (name) driver.name = name;
    if (email !== undefined) driver.email = email;
    if (category) driver.category = category;
    if (expiry) driver.expiry = expiry;
    if (contact) driver.contact = contact;
    if (score !== undefined) driver.score = Number(score);
    if (aadhaar !== undefined) driver.aadhaar = aadhaar;
    if (pan !== undefined) driver.pan = pan ? pan.toUpperCase() : undefined;
    if (bloodGroup !== undefined) driver.bloodGroup = bloodGroup;
    if (address !== undefined) driver.address = address;
    if (avatar !== undefined) driver.avatar = avatar;
    if (aadhaarFile !== undefined) driver.aadhaarFile = aadhaarFile;
    if (panFile !== undefined) driver.panFile = panFile;
    if (dlFile !== undefined) driver.dlFile = dlFile;

    await driver.save();
    await recalculateDriverScore(driver._id);
    const updatedDriver = await Driver.findById(driver._id);
    res.json({ success: true, data: updatedDriver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/drivers/:id
router.delete('/drivers/:id', protect, async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // Block deletion if driver is currently on trip
    if (driver.status === 'on_trip') {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver is currently on a trip. Cannot delete an active driver.' 
      });
    }

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Driver profile removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. TRIP MANAGEMENT
// ==========================================

// @route   GET /api/trips
router.get('/trips', protect, async (req, res) => {
  try {
    const trips = await Trip.find({}).populate('vehicle').populate('driver');
    res.json({ success: true, count: trips.length, data: trips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/trips
router.post('/trips', protect, async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, weight, distance, status, revenue, driverSalary, estimatedFuelCost, actualFuelCost } = req.body;

    // Fetch associated entities
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    // --- Validation Rules Checks ---
    
    // 1. Retired, In Shop, Maintenance, or Inactive vehicles must never appear in dispatch
    if (['retired', 'in_shop', 'maintenance', 'inactive'].includes(vehicle.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Vehicle status is '${vehicle.status}'. It cannot be assigned to a trip.` 
      });
    }

    // 2. Drivers with expired licenses or Suspended status cannot be assigned
    if (driver.status === 'suspended') {
      return res.status(400).json({ success: false, message: 'Driver status is Suspended. Cannot assign to trips.' });
    }
    
    const today = new Date();
    const expiryDate = new Date(driver.expiry);
    if (expiryDate < today) {
      return res.status(400).json({ success: false, message: 'Driver license has expired. Cannot assign to trips.' });
    }

    // 3. A driver or vehicle already marked On Trip cannot be assigned
    if (vehicle.status === 'on_trip') {
      return res.status(400).json({ success: false, message: 'Vehicle is currently on another trip.' });
    }
    if (driver.status === 'on_trip') {
      return res.status(400).json({ success: false, message: 'Driver is currently on another trip.' });
    }

    // 4. Cargo Weight must not exceed vehicle's max capacity
    if (Number(weight) > vehicle.maxLoad) {
      return res.status(400).json({ 
        success: false, 
        message: `Cargo weight (${weight} Tons) exceeds vehicle's maximum load capacity (${vehicle.maxLoad} Tons).` 
      });
    }

    const tripId = `TR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const calculatedSalary = driverSalary !== undefined ? Number(driverSalary) : Math.floor(Number(distance) * 5);
    const vehicleMileage = vehicle.mileage || 10;
    const calculatedEstFuelCost = estimatedFuelCost !== undefined ? Number(estimatedFuelCost) : Math.floor((Number(distance) / vehicleMileage) * 95);

    const trip = await Trip.create({
      id: tripId,
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      weight,
      distance,
      status: status || 'draft',
      revenue: revenue || 0,
      driverSalary: calculatedSalary,
      estimatedFuelCost: calculatedEstFuelCost,
      actualFuelCost: actualFuelCost ? Number(actualFuelCost) : 0
    });

    // 5. Dispatching or In Transit automatically changes vehicle & driver to 'on_trip'
    if (trip.status === 'dispatched' || trip.status === 'in_transit') {
      vehicle.status = 'on_trip';
      await vehicle.save();

      driver.status = 'on_trip';
      await driver.save();
    }

    await recalculateDriverScore(driverId);

    // Send trip creation/assignment email (non-blocking)
    sendTripCreatedEmail(trip, driver, vehicle).catch(err => console.error('Trip assignment email failure:', err.message));

    const populatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(201).json({ success: true, data: populatedTrip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/trips/:id/status
router.put('/trips/:id/status', protect, async (req, res) => {
  try {
    const { status, revenue, actualDistance, driverSalary, actualFuelCost } = req.body;
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const oldStatus = trip.status;
    const newStatus = status;

    if (oldStatus === newStatus && revenue === undefined && actualDistance === undefined && driverSalary === undefined && actualFuelCost === undefined) {
      return res.json({ success: true, data: trip });
    }

    trip.status = newStatus;
    if (revenue !== undefined) {
      trip.revenue = Number(revenue);
    }
    if (actualDistance !== undefined) {
      trip.actualDistance = Number(actualDistance);
    }
    if (driverSalary !== undefined) {
      trip.driverSalary = Number(driverSalary);
    }
    if (actualFuelCost !== undefined) {
      trip.actualFuelCost = Number(actualFuelCost);
    }
    await trip.save();

    // Fetch related vehicle & driver
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    // Business Logic state changes:
    
    // A. Dispatching or In Transit: sets statuses to on_trip
    if ((newStatus === 'dispatched' || newStatus === 'in_transit') && (oldStatus !== 'dispatched' && oldStatus !== 'in_transit')) {
      if (vehicle) { vehicle.status = 'on_trip'; await vehicle.save(); }
      if (driver) { driver.status = 'on_trip'; await driver.save(); }
    }

    // B. Completing trip: changes vehicle and driver back to Available
    if (newStatus === 'completed') {
      if (vehicle) { vehicle.status = 'available'; await vehicle.save(); }
      if (driver) { driver.status = 'available'; await driver.save(); }
    }

    // C. Cancelling a dispatched or in-transit trip: restores vehicle and driver to Available
    if (newStatus === 'cancelled' && (oldStatus === 'dispatched' || oldStatus === 'in_transit')) {
      if (vehicle) { vehicle.status = 'available'; await vehicle.save(); }
      if (driver) { driver.status = 'available'; await driver.save(); }
    }

    if (driver) {
      await recalculateDriverScore(driver._id);
    }

    // Send trip status update email if transitioned to in_transit or completed (non-blocking)
    if (newStatus === 'in_transit' || newStatus === 'completed') {
      sendTripStatusEmail(trip, driver, vehicle, newStatus).catch(err => console.error('Trip status email failure:', err.message));
    }

    const populatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json({ success: true, data: populatedTrip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update general trip details
router.put('/trips/:id', protect, async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, weight, distance, actualDistance, status, revenue, driverSalary, estimatedFuelCost, actualFuelCost } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const oldVehicleId = trip.vehicle.toString();
    const oldDriverId = trip.driver.toString();
    const oldStatus = trip.status;

    if (source) trip.source = source;
    if (destination) trip.destination = destination;
    if (weight !== undefined) trip.weight = Number(weight);
    if (distance !== undefined) trip.distance = Number(distance);
    if (actualDistance !== undefined) trip.actualDistance = Number(actualDistance);
    if (revenue !== undefined) trip.revenue = Number(revenue);
    if (driverSalary !== undefined) trip.driverSalary = Number(driverSalary);
    if (estimatedFuelCost !== undefined) trip.estimatedFuelCost = Number(estimatedFuelCost);
    if (actualFuelCost !== undefined) trip.actualFuelCost = Number(actualFuelCost);

    // Handle vehicle change
    if (vehicleId && vehicleId !== oldVehicleId) {
      const newVehicle = await Vehicle.findById(vehicleId);
      if (!newVehicle) {
        return res.status(404).json({ success: false, message: 'New vehicle not found' });
      }
      if (newVehicle.status === 'retired' || newVehicle.status === 'in_shop') {
        return res.status(400).json({ success: false, message: `New vehicle status is '${newVehicle.status}'. It cannot be assigned.` });
      }
      if (newVehicle.status === 'on_trip') {
        return res.status(400).json({ success: false, message: 'New vehicle is currently on another trip.' });
      }

      // If trip is active, swap vehicle statuses
      if (trip.status === 'dispatched' || trip.status === 'in_transit') {
        newVehicle.status = 'on_trip';
        await newVehicle.save();

        const oldVehicle = await Vehicle.findById(oldVehicleId);
        if (oldVehicle) {
          oldVehicle.status = 'available';
          await oldVehicle.save();
        }
      }
      trip.vehicle = vehicleId;
    }

    // Handle driver change
    if (driverId && driverId !== oldDriverId) {
      const newDriver = await Driver.findById(driverId);
      if (!newDriver) {
        return res.status(404).json({ success: false, message: 'New driver not found' });
      }
      if (newDriver.status === 'suspended') {
        return res.status(400).json({ success: false, message: 'New driver status is Suspended.' });
      }
      const today = new Date();
      if (new Date(newDriver.expiry) < today) {
        return res.status(400).json({ success: false, message: 'New driver license has expired.' });
      }
      if (newDriver.status === 'on_trip') {
        return res.status(400).json({ success: false, message: 'New driver is currently on another trip.' });
      }

      // If trip is active, swap driver statuses
      if (trip.status === 'dispatched' || trip.status === 'in_transit') {
        newDriver.status = 'on_trip';
        await newDriver.save();

        const oldDriver = await Driver.findById(oldDriverId);
        if (oldDriver) {
          oldDriver.status = 'available';
          await oldDriver.save();
        }
      }
      trip.driver = driverId;
    }

    // Handle status change
    if (status && status !== oldStatus) {
      trip.status = status;

      const currentVehicle = await Vehicle.findById(trip.vehicle);
      const currentDriver = await Driver.findById(trip.driver);

      // Transition to active
      if ((status === 'dispatched' || status === 'in_transit') && (oldStatus !== 'dispatched' && oldStatus !== 'in_transit')) {
        if (currentVehicle) { currentVehicle.status = 'on_trip'; await currentVehicle.save(); }
        if (currentDriver) { currentDriver.status = 'on_trip'; await currentDriver.save(); }
      }

      // Completion
      if (status === 'completed') {
        if (currentVehicle) { currentVehicle.status = 'available'; await currentVehicle.save(); }
        if (currentDriver) { currentDriver.status = 'available'; await currentDriver.save(); }
      }

      // Cancellation
      if (status === 'cancelled' && (oldStatus === 'dispatched' || oldStatus === 'in_transit')) {
        if (currentVehicle) { currentVehicle.status = 'available'; await currentVehicle.save(); }
        if (currentDriver) { currentDriver.status = 'available'; await currentDriver.save(); }
      }
    }

    await trip.save();

    // Recalculate scores
    if (trip.driver) {
      await recalculateDriverScore(trip.driver);
    }
    if (oldDriverId && oldDriverId !== trip.driver.toString()) {
      await recalculateDriverScore(oldDriverId);
    }

    // Send trip status update email if transitioned to in_transit or completed (non-blocking)
    if (status && status !== oldStatus && (status === 'in_transit' || status === 'completed')) {
      const currentVehicle = await Vehicle.findById(trip.vehicle);
      const currentDriver = await Driver.findById(trip.driver);
      sendTripStatusEmail(trip, currentDriver, currentVehicle, status).catch(err => console.error('Trip status email failure:', err.message));
    }

    const populated = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete a trip and release its vehicle & driver if active
router.delete('/trips/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Release vehicle and driver if the deleted trip was dispatched or in transit
    if (trip.status === 'dispatched' || trip.status === 'in_transit') {
      const vehicle = await Vehicle.findById(trip.vehicle);
      if (vehicle) {
        vehicle.status = 'available';
        await vehicle.save();
      }

      const driver = await Driver.findById(trip.driver);
      if (driver) {
        driver.status = 'available';
        await driver.save();
      }
    }

    await Trip.findByIdAndDelete(req.params.id);

    if (trip.driver) {
      await recalculateDriverScore(trip.driver);
    }

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 4. MAINTENANCE LOGS
// ==========================================

// @route   GET /api/maintenance
router.get('/maintenance', protect, async (req, res) => {
  try {
    const logs = await Maintenance.find({}).populate('vehicle');
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/maintenance
router.post('/maintenance', protect, async (req, res) => {
  try {
    const { vehicleId, issue, cost } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const log = await Maintenance.create({
      vehicle: vehicleId,
      issue,
      cost
    });

    // 1. Creating active maintenance automatically changes vehicle status to In Shop
    vehicle.status = 'in_shop';
    await vehicle.save();

    // 2. Automatically log a corresponding maintenance cost in expenses
    await Expense.create({
      vehicle: vehicleId,
      type: 'maintenance',
      amount: cost
    });

    const populatedLog = await Maintenance.findById(log._id).populate('vehicle');
    res.status(201).json({ success: true, data: populatedLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/maintenance/:id/close
router.put('/maintenance/:id/close', protect, async (req, res) => {
  try {
    const log = await Maintenance.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    log.status = 'closed';
    await log.save();

    // Restore vehicle status (unless it has been retired)
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && vehicle.status !== 'retired') {
      vehicle.status = 'available';
      await vehicle.save();
    }

    const populatedLog = await Maintenance.findById(log._id).populate('vehicle');
    res.json({ success: true, data: populatedLog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. EXPENSES & FUEL LOGS
// ==========================================

// @route   GET /api/expenses
router.get('/expenses', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({}).populate('vehicle');
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/expenses
router.post('/expenses', protect, async (req, res) => {
  try {
    const { vehicleId, type, amount, liters, odometer, date } = req.body;

    const expense = await Expense.create({
      vehicle: vehicleId,
      type,
      amount,
      liters: liters || 0,
      odometer: odometer || 0,
      date: date || Date.now()
    });

    const populatedExpense = await Expense.findById(expense._id).populate('vehicle');
    res.status(201).json({ success: true, data: populatedExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/expenses/:id
router.put('/expenses/:id', protect, async (req, res) => {
  try {
    const { vehicleId, type, amount, liters, odometer, date } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense log not found' });
    }

    if (vehicleId) expense.vehicle = vehicleId;
    if (type) expense.type = type;
    if (amount !== undefined) expense.amount = Number(amount);
    if (liters !== undefined) expense.liters = Number(liters);
    if (odometer !== undefined) expense.odometer = Number(odometer);
    if (date) expense.date = date;

    await expense.save();
    const populatedExpense = await Expense.findById(expense._id).populate('vehicle');
    res.json({ success: true, data: populatedExpense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/expenses/:id
router.delete('/expenses/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense log not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense log removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. REPORTS & ANALYTICS
// ==========================================

// @route   GET /api/reports/analytics
router.get('/reports/analytics', protect, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const trips = await Trip.find({ status: 'completed' });
    const expenses = await Expense.find({});

    const reportData = vehicles.map(v => {
      // 1. Fetch expenses for this vehicle
      const vehicleExpenses = expenses.filter(e => e.vehicle.toString() === v._id.toString());
      
      const maintenanceCosts = vehicleExpenses
        .filter(e => e.type === 'maintenance')
        .reduce((sum, e) => sum + e.amount, 0);

      const fuelCosts = vehicleExpenses
        .filter(e => e.type === 'fuel')
        .reduce((sum, e) => sum + e.amount, 0);

      const totalLiters = vehicleExpenses
        .filter(e => e.type === 'fuel')
        .reduce((sum, e) => sum + e.liters, 0);

      const otherCosts = vehicleExpenses
        .filter(e => e.type === 'toll' || e.type === 'other')
        .reduce((sum, e) => sum + e.amount, 0);

      const totalOperationalCost = fuelCosts + maintenanceCosts;

      // 2. Fetch completed trips & compute total revenue + distance
      const vehicleTrips = trips.filter(t => t.vehicle.toString() === v._id.toString());
      const totalRevenue = vehicleTrips.reduce((sum, t) => sum + t.revenue, 0);
      const totalDistance = vehicleTrips.reduce((sum, t) => sum + t.distance, 0);

      // 3. Compute Fuel Efficiency (Distance / Fuel Liters)
      const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;

      // 4. Compute ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      const numerator = totalRevenue - (maintenanceCosts + fuelCosts);
      const roi = v.cost > 0 ? (numerator / v.cost).toFixed(4) : 0;

      return {
        vehicleId: v._id,
        reg: v.reg,
        name: v.name,
        type: v.type,
        acquisitionCost: v.cost,
        status: v.status,
        maintenanceCost: maintenanceCosts,
        fuelCost: fuelCosts,
        otherCost: otherCosts,
        totalOperationalCost,
        revenue: totalRevenue,
        distanceTraveled: totalDistance,
        fuelEfficiency: Number(fuelEfficiency),
        roi: Number(roi)
      };
    });

    res.json({ success: true, data: reportData });
// @route   POST /api/copilot/chat
// @desc    Intelligent logistics recommendations using Cloudflare Worker AI
router.post('/copilot/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Load active fleet snapshot from database to populate model context
    const [vehicles, drivers, trips, maintenance] = await Promise.all([
      Vehicle.find({ status: { $ne: 'retired' } }).select('reg name type status maxLoad mileage odometer'),
      Driver.find({}).select('name status score expiry'),
      Trip.find({ status: { $in: ['draft', 'dispatched', 'in_transit'] } }).populate('vehicle').populate('driver').select('id source destination weight status'),
      Maintenance.find({ resolved: false }).populate('vehicle').select('issue cost resolved')
    ]);

    // 2. Format a highly descriptive context string
    const vehiclesCtx = vehicles.map(v => `- ${v.name} (${v.reg}): Type=${v.type}, Status=${v.status}, MaxLoad=${v.maxLoad}T, Mileage=${v.mileage}KM/L, Odometer=${v.odometer}KM`).join('\n');
    const driversCtx = drivers.map(d => `- ${d.name}: Status=${d.status}, SafetyScore=${d.score}%, LicenseExpiry=${d.expiry ? new Date(d.expiry).toISOString().split('T')[0] : 'N/A'}`).join('\n');
    const tripsCtx = trips.map(t => `- Trip ${t.id}: ${t.source} to ${t.destination}, Status=${t.status}, Assigned Driver=${t.driver?.name || 'N/A'}, Vehicle=${t.vehicle?.name || 'N/A'}, Load=${t.weight}T`).join('\n');
    const maintCtx = maintenance.map(m => `- ${m.vehicle?.name || 'Vehicle'}: Issue="${m.issue}", EstCost=₹${m.cost}`).join('\n');

    const systemPrompt = `You are the AI Fleet Copilot for the TransitOps logistics management platform.
Your job is to provide smart recommendations, predictive insights, and answers using the real-time fleet dataset below.

CURRENT FLEET SNAPSHOT:
=== VEHICLES ===
${vehiclesCtx || 'No active vehicles.'}

=== DRIVERS ===
${driversCtx || 'No drivers found.'}

=== ACTIVE DISPATCHED TRIPS ===
${tripsCtx || 'No active trips currently.'}

=== PENDING UNRESOLVED MAINTENANCE ===
${maintCtx || 'No unresolved maintenance issues.'}

INSTRUCTIONS:
1. Always base recommendations (like vehicle or driver options) on real-time parameters from the snapshot.
2. If asked "Which vehicle should I dispatch?", recommend a vehicle with Status=available, checking that its MaxLoad matches the weight if a cargo weight was provided.
3. If asked "Which driver is available?", recommend the available driver (Status=available) with the highest SafetyScore.
4. Keep answers brief, actionable, and formatted in clean markdown bullets. Do not make up any registration plates, names, or numbers not in the snapshot.
5. If the request cannot be answered from the snapshot, reply politely with helpful fleet suggestions.`;

    // 3. Format messages payload for Cloudflare Worker AI
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Append conversation history if present
    if (history && Array.isArray(history)) {
      history.forEach(h => {
        if (h.role && h.content) {
          messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
        }
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // 4. Send request to Cloudflare Worker AI endpoint
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`;
    
    const response = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || 'Cloudflare AI execution failed');
    }

    const reply = data.result?.response || data.result?.reply || 'Could not calculate response.';
    res.json({ success: true, reply });
  } catch (err) {
    console.error('Copilot AI API Failure:', err.message);
    res.status(500).json({ success: false, message: 'Copilot AI engine offline: ' + err.message });
  }
});

module.exports = router;
