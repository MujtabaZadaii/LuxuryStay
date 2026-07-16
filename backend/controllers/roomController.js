const Room = require('../models/Room');

// @desc    Get all rooms (filtered/unfiltered)
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
  try {
    const { status, roomType, floor } = req.query;
    let query = {};

    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (floor) query.floor = Number(floor);

    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  const { roomNumber, roomType, floor, capacity, price, amenities, images } = req.body;

  try {
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ success: false, message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      floor: Number(floor),
      capacity: Number(capacity),
      price: Number(price),
      amenities: amenities || [],
      images: images || [],
      status: 'Available'
    });

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.roomNumber = req.body.roomNumber || room.roomNumber;
    room.roomType = req.body.roomType || room.roomType;
    room.floor = req.body.floor !== undefined ? Number(req.body.floor) : room.floor;
    room.capacity = req.body.capacity !== undefined ? Number(req.body.capacity) : room.capacity;
    room.price = req.body.price !== undefined ? Number(req.body.price) : room.price;
    room.status = req.body.status || room.status;
    room.amenities = req.body.amenities || room.amenities;
    room.images = req.body.images || room.images;

    const updatedRoom = await room.save();
    res.json({ success: true, data: updatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
