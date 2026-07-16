const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('LuxuryStay HMS API running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
