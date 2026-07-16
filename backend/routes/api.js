const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import controllers
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser
} = require('../controllers/authController');

const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

const {
  createReservation,
  getReservations,
  updateReservationStatus,
  checkInReservation,
  checkOutReservation
} = require('../controllers/reservationController');

const {
  getHousekeepingTasks,
  updateHousekeepingStatus,
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceStatus,
  getServiceRequests,
  createServiceRequest,
  updateServiceStatus,
  getFeedback,
  submitFeedback,
  getNotifications,
  markNotificationRead,
  getDashboardStats
} = require('../controllers/operationsController');

// --- Authentication Routes ---
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/profile', protect, getUserProfile);
router.get('/auth/users', protect, authorize('admin', 'manager'), getAllUsers);
router.put('/auth/users/:id', protect, authorize('admin'), updateUser);

// --- Room Routes ---
router.get('/rooms', getRooms);
router.get('/rooms/:id', getRoomById);
router.post('/rooms', protect, authorize('admin', 'manager'), createRoom);
router.put('/rooms/:id', protect, authorize('admin', 'manager'), updateRoom);
router.delete('/rooms/:id', protect, authorize('admin'), deleteRoom);

// --- Reservation Routes ---
router.post('/reservations', protect, createReservation);
router.get('/reservations', protect, getReservations);
router.put('/reservations/:id', protect, authorize('admin', 'manager', 'receptionist'), updateReservationStatus);
router.put('/reservations/:id/checkin', protect, authorize('admin', 'manager', 'receptionist'), checkInReservation);
router.put('/reservations/:id/checkout', protect, authorize('admin', 'manager', 'receptionist'), checkOutReservation);

// --- Housekeeping Routes ---
router.get('/operations/housekeeping', protect, getHousekeepingTasks);
router.put('/operations/housekeeping/:id', protect, authorize('admin', 'manager', 'housekeeping'), updateHousekeepingStatus);

// --- Maintenance Routes ---
router.get('/operations/maintenance', protect, getMaintenanceRequests);
router.post('/operations/maintenance', protect, createMaintenanceRequest);
router.put('/operations/maintenance/:id', protect, authorize('admin', 'manager', 'maintenance'), updateMaintenanceStatus);

// --- Guest Service Routes ---
router.get('/operations/services', protect, getServiceRequests);
router.post('/operations/services', protect, authorize('guest'), createServiceRequest);
router.put('/operations/services/:id', protect, authorize('admin', 'manager', 'receptionist'), updateServiceStatus);

// --- Feedback Routes ---
router.get('/operations/feedback', protect, getFeedback);
router.post('/operations/feedback', protect, authorize('guest'), submitFeedback);

// --- Notification Routes ---
router.get('/operations/notifications', protect, getNotifications);
router.put('/operations/notifications/read', protect, markNotificationRead);

// --- Dashboard Stats Route ---
router.get('/operations/stats', protect, authorize('admin', 'manager'), getDashboardStats);

module.exports = router;
