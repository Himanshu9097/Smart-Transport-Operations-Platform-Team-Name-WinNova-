const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

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
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/drivers
router.post('/drivers', protect, async (req, res) => {
  try {
    const { name, license, category, expiry, contact, score, status } = req.body;

    // Check unique license
    const driverExists = await Driver.findOne({ license: license.toUpperCase() });
    if (driverExists) {
      return res.status(400).json({ success: false, message: `Driver with license ${license} already exists` });
    }

    const driver = await Driver.create({
      name,
      license,
      category,
      expiry,
      contact,
      score: score || 100,
      status: status || 'available'
    });

    res.status(201).json({ success: true, data: driver });
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
    const { source, destination, vehicleId, driverId, weight, distance, status, revenue } = req.body;

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

    const trip = await Trip.create({
      id: tripId,
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      weight,
      distance,
      status: status || 'draft',
      revenue: revenue || 0
    });

    // 5. Dispatching a trip automatically changes vehicle & driver to 'on_trip'
    if (trip.status === 'dispatched') {
      vehicle.status = 'on_trip';
      await vehicle.save();

      driver.status = 'on_trip';
      await driver.save();
    }

    const populatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(201).json({ success: true, data: populatedTrip });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/trips/:id/status
router.put('/trips/:id/status', protect, async (req, res) => {
  try {
    const { status, revenue } = req.body;
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const oldStatus = trip.status;
    const newStatus = status;

    if (oldStatus === newStatus) {
      return res.json({ success: true, data: trip });
    }

    trip.status = newStatus;
    if (revenue !== undefined) {
      trip.revenue = revenue;
    }
    await trip.save();

    // Fetch related vehicle & driver
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    // Business Logic state changes:
    
    // A. Dispatching trip: sets statuses to on_trip
    if (newStatus === 'dispatched' && oldStatus !== 'dispatched') {
      if (vehicle) { vehicle.status = 'on_trip'; await vehicle.save(); }
      if (driver) { driver.status = 'on_trip'; await driver.save(); }
    }

    // B. Completing trip: changes vehicle and driver back to Available
    if (newStatus === 'completed') {
      if (vehicle) { vehicle.status = 'available'; await vehicle.save(); }
      if (driver) { driver.status = 'available'; await driver.save(); }
    }

    // C. Cancelling a dispatched trip: restores vehicle and driver to Available
    if (newStatus === 'cancelled' && oldStatus === 'dispatched') {
      if (vehicle) { vehicle.status = 'available'; await vehicle.save(); }
      if (driver) { driver.status = 'available'; await driver.save(); }
    }

    const populatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.json({ success: true, data: populatedTrip });
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
    const { vehicleId, type, amount, liters, date } = req.body;

    const expense = await Expense.create({
      vehicle: vehicleId,
      type,
      amount,
      liters: liters || 0,
      date: date || Date.now()
    });

    const populatedExpense = await Expense.findById(expense._id).populate('vehicle');
    res.status(201).json({ success: true, data: populatedExpense });
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
