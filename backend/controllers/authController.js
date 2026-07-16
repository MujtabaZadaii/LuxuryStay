const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Guest = require('../models/Guest');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Staff or Guest)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { fullName, email, password, role, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || 'guest',
      phone
    });

    if (user) {
      // If role is guest, also create a guest profile
      if (user.role === 'guest') {
        await Guest.create({
          userId: user._id,
          passportNumber: req.body.passportNumber || '',
          address: req.body.address || '',
          preferences: req.body.preferences || ''
        });
      }

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
      }

      // Check if guest details exist
      let guestDetails = null;
      if (user.role === 'guest') {
        guestDetails = await Guest.findOne({ userId: user._id });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          guestProfile: guestDetails,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      let guestDetails = null;
      if (user.role === 'guest') {
        guestDetails = await Guest.findOne({ userId: user._id });
      }
      res.json({ success: true, data: { ...user.toObject(), guestProfile: guestDetails } });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users / staff (Admin/Manager only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status / role (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;
    user.fullName = req.body.fullName || user.fullName;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();
    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUser
};
