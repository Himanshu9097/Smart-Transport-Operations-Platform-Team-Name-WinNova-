const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please associate a vehicle']
  },
  issue: {
    type: String,
    required: [true, 'Please specify the maintenance issue'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Please specify maintenance cost']
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
