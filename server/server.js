const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = async () => {
  const conn = await require('./config/db');
  await conn();
};

// Load env vars from project root
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });


// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/diet-plans', require('./routes/dietPlanRoutes'));

// Basic home route
app.get('/', (req, res) => {
  res.send('Nutrition Assistant API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
