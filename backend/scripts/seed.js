const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Housekeeping = require('../models/Housekeeping');
const Maintenance = require('../models/Maintenance');
const Service = require('../models/Service');
const Feedback = require('../models/Feedback');
const Invoice = require('../models/Invoice');

const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/luxurystay';

const seedData = async () => {
  try {
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB. Clearing database...');

    // Clear existing collection records
    await User.deleteMany({});
    await Guest.deleteMany({});
    await Room.deleteMany({});
    await Reservation.deleteMany({});
    await Housekeeping.deleteMany({});
    await Maintenance.deleteMany({});
    await Service.deleteMany({});
    await Feedback.deleteMany({});
    await Invoice.deleteMany({});

    console.log('Database cleared. Seeding users...');

    // Hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create staff users
    const admin = await User.create({
      fullName: 'Chief Admin Arthur',
      email: 'admin@luxurystay.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1 555-0199',
      status: 'active'
    });

    const manager = await User.create({
      fullName: 'Manager Victoria',
      email: 'manager@luxurystay.com',
      password: hashedPassword,
      role: 'manager',
      phone: '+1 555-0188',
      status: 'active'
    });

    const receptionist = await User.create({
      fullName: 'Receptionist Sarah',
      email: 'reception@luxurystay.com',
      password: hashedPassword,
      role: 'receptionist',
      phone: '+1 555-0177',
      status: 'active'
    });

    const housekeeper = await User.create({
      fullName: 'Housekeeper Jack',
      email: 'housekeep@luxurystay.com',
      password: hashedPassword,
      role: 'housekeeping',
      phone: '+1 555-0166',
      status: 'active'
    });

    const technician = await User.create({
      fullName: 'Technician Marcus',
      email: 'repair@luxurystay.com',
      password: hashedPassword,
      role: 'maintenance',
      phone: '+1 555-0155',
      status: 'active'
    });

    const guestUser = await User.create({
      fullName: 'Guest Eleanor',
      email: 'guest@luxurystay.com',
      password: hashedPassword,
      role: 'guest',
      phone: '+1 555-0144',
      status: 'active'
    });

    // Create guest profile details
    const guestProfile = await Guest.create({
      userId: guestUser._id,
      passportNumber: 'US-987654321',
      address: '221B Baker St, London, UK',
      preferences: 'High floor, feather pillows, silent side, likes green tea.'
    });

    console.log('Users seeded. Seeding rooms...');

    // Create room records
    const roomsData = [
      {
        roomNumber: '101',
        roomType: 'Standard Room',
        floor: 1,
        capacity: 2,
        price: 120,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Espresso Maker'],
        status: 'Available',
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '102',
        roomType: 'Standard Room',
        floor: 1,
        capacity: 2,
        price: 120,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning'],
        status: 'Cleaning',
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '201',
        roomType: 'Deluxe Oasis',
        floor: 2,
        capacity: 3,
        price: 220,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Balcony', 'Mini Bar', 'Ocean View'],
        status: 'Occupied',
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '202',
        roomType: 'Deluxe Oasis',
        floor: 2,
        capacity: 3,
        price: 220,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Balcony', 'Mini Bar'],
        status: 'Reserved',
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '301',
        roomType: 'Executive Suite',
        floor: 3,
        capacity: 4,
        price: 450,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Living Room', 'Bathtub', 'In-room Dining', 'VIP Access'],
        status: 'Available',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '302',
        roomType: 'Executive Suite',
        floor: 3,
        capacity: 4,
        price: 450,
        amenities: ['Wi-Fi', 'Smart TV', 'Air Conditioning', 'Living Room', 'Bathtub', 'Balcony'],
        status: 'Maintenance',
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=85']
      },
      {
        roomNumber: '401',
        roomType: 'Grand Penthouse',
        floor: 4,
        capacity: 6,
        price: 950,
        amenities: ['Private Pool', 'VIP Lounge', 'Jacuzzi', 'Ocean Panoramic View', 'Personal Butler', 'Home Theater', '24/7 Room Service'],
        status: 'Available',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=85']
      }
    ];

    const seededRooms = await Room.insertMany(roomsData);
    console.log('Rooms seeded. Seeding sample historical data...');

    // Find the references
    const room201 = seededRooms.find(r => r.roomNumber === '201');
    const room102 = seededRooms.find(r => r.roomNumber === '102');
    const room302 = seededRooms.find(r => r.roomNumber === '302');

    // Create a checked-in reservation for Eleanor in room 201
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() - 3); // 3 days ago
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 2); // 2 days from now

    const reservation = await Reservation.create({
      guestId: guestUser._id,
      roomId: room201._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: 2,
      bookingStatus: 'CheckedIn',
      paymentStatus: 'Unpaid'
    });

    // Seed housekeeping tasks
    await Housekeeping.create({
      roomId: room102._id,
      assignedStaff: housekeeper._id,
      taskStatus: 'Pending'
    });

    // Seed maintenance ticket
    await Maintenance.create({
      roomId: room302._id,
      issue: 'Air conditioner filter requires replacement and compressor is making noise.',
      priority: 'High',
      assignedTo: technician._id,
      status: 'In Progress'
    });

    // Seed guest service request
    await Service.create({
      guestId: guestUser._id,
      serviceType: 'Room Service',
      details: 'Organic chamomile tea with light honey, delivered to Room 201.',
      requestStatus: 'Pending'
    });

    // Seed testimonials feedback
    await Feedback.create({
      guestId: guestUser._id,
      rating: 5,
      review: 'LuxuryStay HMS exceeded my expectations! The Softly theme design of their customer app feels so calming, and staff were extremely prompt.'
    });

    // Create an old checked-out reservation and an invoice for analytics seed
    const oldCheckIn = new Date();
    oldCheckIn.setMonth(oldCheckIn.getMonth() - 1);
    oldCheckIn.setDate(5);
    const oldCheckOut = new Date(oldCheckIn);
    oldCheckOut.setDate(oldCheckIn.getDate() + 4);

    const oldRes = await Reservation.create({
      guestId: guestUser._id,
      roomId: room201._id,
      checkInDate: oldCheckIn,
      checkOutDate: oldCheckOut,
      guests: 2,
      bookingStatus: 'CheckedOut',
      paymentStatus: 'Paid',
      createdAt: oldCheckIn
    });

    // Generate historical invoice
    await Invoice.create({
      reservationId: oldRes._id,
      subtotal: room201.price * 4,
      tax: Math.round((room201.price * 4) * 0.12),
      discount: 50,
      totalAmount: (room201.price * 4) + Math.round((room201.price * 4) * 0.12) - 50,
      paymentMethod: 'Credit Card',
      invoiceDate: oldCheckOut
    });

    console.log('Seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
