const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  reg: {
    type: String,
    required: [true, 'Please add a registration number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a vehicle name/model'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Truck', 'Trailer', 'LJV', 'Tipper'],
    required: [true, 'Please add a vehicle type']
  },
  maxLoad: {
    type: Number,
    required: [true, 'Please add maximum load capacity in tons']
  },
  odometer: {
    type: Number,
    required: [true, 'Please add odometer in KM']
  },
  cost: {
    type: Number,
    required: [true, 'Please add acquisition cost']
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'in_shop', 'retired', 'reserved', 'maintenance', 'inactive'],
    default: 'available'
  },
  
  // Extended fields added by collaborator
  nickname: { type: String, trim: true },
  category: { type: String, trim: true },
  brand: { type: String, trim: true },
  model: { type: String, trim: true },
  mfgYear: { type: String, trim: true },
  color: { type: String, trim: true },
  vin: { type: String, trim: true },
  engineNum: { type: String, trim: true },
  regState: { type: String, trim: true },
  regDate: { type: String, trim: true },
  
  seatingCapacity: { type: String, trim: true },
  cargoCapacity: { type: String, trim: true },
  maxGrossWeight: { type: String, trim: true },
  fuelTankCapacity: { type: String, trim: true },
  
  ownerName: { type: String, trim: true },
  purchaseDate: { type: String, trim: true },
  purchaseCost: { type: String, trim: true },
  vendor: { type: String, trim: true },
  warrantyExpiry: { type: String, trim: true },
  leaseType: { type: String, default: 'Owned' },

  // New fields for Vehicle Status and Fuel Information
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  depotLocation: { type: String, trim: true },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'Electric', 'CNG', 'Hybrid'],
    default: 'Diesel'
  },
  fuelCardNumber: { type: String, trim: true },
  mileage: { type: Number },
  avgMonthlyFuelConsumption: { type: Number },

  insurance: {
    company: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    coverageAmount: { type: Number },
    startDate: { type: String, trim: true },
    expiryDate: { type: String, trim: true },
    reminderDays: { type: Number }
  },
  documents: {
    rc: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } },
    insurance: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } },
    pollution: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } },
    fitness: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } },
    permit: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } },
    tax: { fileName: { type: String, default: '' }, issueDate: { type: String, default: '' }, expiryDate: { type: String, default: '' } }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
