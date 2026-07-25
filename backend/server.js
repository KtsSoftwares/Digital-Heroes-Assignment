const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('MongoDB Connected to DigitalHeroesDB');
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        })
        .catch(err => console.error('Database connection error:', err));
}

module.exports = app; // Export the app for testing