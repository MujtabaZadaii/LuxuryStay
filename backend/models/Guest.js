const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  passportNumber: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  preferences: {
    type: String,
    trim: true,
    default: ''
  },
  bookingHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }]
});

module.exports = mongoose.model('Guest', GuestSchema);
