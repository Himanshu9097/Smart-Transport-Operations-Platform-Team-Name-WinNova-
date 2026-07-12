const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');

const erpRoutes = require('./routes/erpRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to ensure DB connection is ready on Serverless Functions
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed in request middleware:', error.message);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', erpRoutes);

// Basic Route for Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TransitOps API is running smoothly',
    timestamp: new Date(),
    dbState: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

