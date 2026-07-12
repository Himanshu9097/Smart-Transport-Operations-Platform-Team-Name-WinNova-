const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a driver name'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  license: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a license category'],
    trim: true
  },
  expiry: {
    type: Date,
    required: [true, 'Please add license expiry date']
  },
  contact: {
    type: String,
    required: [true, 'Please add contact number']
  },
  score: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'off_duty', 'suspended'],
    default: 'available'
  },
  aadhaar: {
    type: String,
    trim: true
  },
  pan: {
    type: String,
    trim: true,
    uppercase: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  aadhaarFile: {
    type: String
  },
  panFile: {
    type: String
  },
  dlFile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Driver', DriverSchema);
