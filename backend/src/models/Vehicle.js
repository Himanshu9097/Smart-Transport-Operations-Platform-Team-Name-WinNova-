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
    enum: ['available', 'on_trip', 'in_shop', 'retired'],
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

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
