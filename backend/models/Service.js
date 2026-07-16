const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Room Service', 'Laundry', 'Airport Pickup', 'Taxi', 'Wake-Up Call', 'Extra Towels', 'Housekeeping', 'Food Delivery'],
    required: true
  },
  details: {
    type: String,
    trim: true,
    default: ''
  },
  requestStatus: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', ServiceSchema);
