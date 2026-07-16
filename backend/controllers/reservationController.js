const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Service = require('../models/Service');
const Housekeeping = require('../models/Housekeeping');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  const { roomId, checkInDate, checkOutDate, guests } = req.body;
  const guestId = req.user.role === 'guest' ? req.user._id : req.body.guestId;

  try {
    if (!guestId) {
      return res.status(400).json({ success: false, message: 'Guest ID is required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Room is not available for booking' });
    }

    // Create reservation
    const reservation = await Reservation.create({
      guestId,
      roomId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests: Number(guests) || 1,
      bookingStatus: 'Pending',
      paymentStatus: 'Unpaid'
    });

    // Update room status to Reserved
    room.status = 'Reserved';
    await room.save();

    // Create Notification
    await Notification.create({
      userId: guestId,
      title: 'Reservation Pending',
      message: `Your booking for Room ${room.roomNumber} is pending confirmation.`,
      type: 'Booking'
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'guest') {
      query.guestId = req.user._id;
    }

    const reservations = await Reservation.find(query)
      .populate('guestId', 'fullName email phone')
      .populate('roomId', 'roomNumber roomType floor price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update reservation status / Confirmation (Manager/Receptionist)
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservationStatus = async (req, res) => {
  const { bookingStatus, paymentStatus } = req.body;

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (bookingStatus) reservation.bookingStatus = bookingStatus;
    if (paymentStatus) reservation.paymentStatus = paymentStatus;

    await reservation.save();

    // Notify guest
    await Notification.create({
      userId: reservation.guestId,
      title: `Reservation ${bookingStatus || 'Updated'}`,
      message: `Your reservation status is now ${bookingStatus || 'updated'}.`,
      type: 'Booking'
    });

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-In guest
// @route   PUT /api/reservations/:id/checkin
// @access  Private
const checkInReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.bookingStatus !== 'Confirmed' && reservation.bookingStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Reservation is not eligible for check-in' });
    }

    reservation.bookingStatus = 'CheckedIn';
    await reservation.save();

    // Update Room to Occupied
    const room = await Room.findById(reservation.roomId);
    if (room) {
      room.status = 'Occupied';
      await room.save();
    }

    // Notify guest
    await Notification.create({
      userId: reservation.guestId,
      title: 'Welcome / Checked In',
      message: `You have successfully checked into Room ${room ? room.roomNumber : ''}. Enjoy your stay!`,
      type: 'CheckIn'
    });

    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-Out guest & process final billing
// @route   PUT /api/reservations/:id/checkout
// @access  Private
const checkOutReservation = async (req, res) => {
  const { paymentMethod, discount } = req.body;

  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('guestId')
      .populate('roomId');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.bookingStatus !== 'CheckedIn') {
      return res.status(400).json({ success: false, message: 'Reservation is not currently checked in' });
    }

    // 1. Calculate nights
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(); // Out date is now
    const diffDays = Math.max(1, Math.round(Math.abs((checkOut - checkIn) / oneDay)));

    const roomRate = reservation.roomId.price;
    const roomCharges = roomRate * diffDays;

    // 2. Fetch completed services charges
    const services = await Service.find({ guestId: reservation.guestId._id, requestStatus: 'Completed' });
    // For simplicity, let's assume service items have standard flat rates based on type
    const serviceRates = {
      'Room Service': 25,
      'Laundry': 15,
      'Airport Pickup': 50,
      'Taxi': 20,
      'Wake-Up Call': 0,
      'Extra Towels': 5,
      'Housekeeping': 0,
      'Food Delivery': 10
    };

    let serviceCharges = 0;
    services.forEach(svc => {
      serviceCharges += serviceRates[svc.serviceType] || 0;
    });

    const subtotal = roomCharges + serviceCharges;
    const tax = Math.round(subtotal * 0.12); // 12% tax
    const discountVal = Number(discount) || 0;
    const totalAmount = Math.max(0, subtotal + tax - discountVal);

    // 3. Create Invoice
    const invoice = await Invoice.create({
      reservationId: reservation._id,
      subtotal,
      tax,
      discount: discountVal,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash'
    });

    // 4. Update Reservation
    reservation.bookingStatus = 'CheckedOut';
    reservation.paymentStatus = 'Paid';
    await reservation.save();

    // 5. Update Room to Cleaning
    const room = await Room.findById(reservation.roomId._id);
    if (room) {
      room.status = 'Cleaning';
      await room.save();

      // Create a default Housekeeping task
      // Find a housekeeping staff
      const housekeeper = await User.findOne({ role: 'housekeeping', status: 'active' });
      if (housekeeper) {
        await Housekeeping.create({
          roomId: room._id,
          assignedStaff: housekeeper._id,
          taskStatus: 'Pending'
        });
      }
    }

    // 6. Notify guest
    await Notification.create({
      userId: reservation.guestId._id,
      title: 'Checked Out / Invoice Generated',
      message: `You have successfully checked out. A total invoice of $${totalAmount} has been processed.`,
      type: 'CheckOut'
    });

    res.json({
      success: true,
      message: 'Check-out completed, invoice generated.',
      data: {
        reservation,
        invoice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
  updateReservationStatus,
  checkInReservation,
  checkOutReservation
};
