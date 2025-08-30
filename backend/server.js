const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Load environment variables
require('./config/env');

// to print project staructure uncomment the below line
// require('./config/printStructure');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const statsRoutes = require('./routes/stats');

// Initialize app
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'Task Manager API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';

  res.status(statusCode).json({ message });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Only connect to MongoDB and start server if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager')
    .then(() => {
      console.log('Connected to MongoDB Database');
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

// Export app for testing
module.exports = app;
