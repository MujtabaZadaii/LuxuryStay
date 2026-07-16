const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomType: {
    type: String,
    required: true, // e.g. Deluxe, Executive Suite, Penthouse, Standard
    trim: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance', 'Out of Service'],
    default: 'Available'
  },
  images: [{
    type: String
  }]
});

module.exports = mongoose.model('Room', RoomSchema);
