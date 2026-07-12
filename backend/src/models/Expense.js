const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Please associate a vehicle']
  },
  type: {
    type: String,
    enum: ['fuel', 'toll', 'insurance', 'maintenance', 'miscellaneous'],
    required: [true, 'Please specify expense type']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify expense amount']
  },
  liters: {
    type: Number,
    default: 0 // Optional, applicable for fuel type logs
  },
  odometer: {
    type: Number,
    default: 0 // Optional, applicable for fuel type logs
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
