const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const symptomRoutes = require('./routes/symptomRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/reports', reportRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to PCOS Health Tracker API',
    endpoints: {
      users: '/api/users',
      symptoms: '/api/symptoms',
      reports: '/api/reports'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;