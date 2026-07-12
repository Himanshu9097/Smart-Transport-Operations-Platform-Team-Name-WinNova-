const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Please add a source location'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination location'],
    trim: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please associate a vehicle']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Please associate a driver']
  },
  weight: {
    type: Number,
    required: [true, 'Please add cargo weight in tons']
  },
  distance: {
    type: Number,
    required: [true, 'Please add planned distance in KM']
  },
  actualDistance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'dispatched', 'in_transit', 'completed', 'cancelled'],
    default: 'draft'
  },
  revenue: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', TripSchema);
