const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const initializeOrganizations = require('./init-orgs');
const authRoutes = require('./routes/auth');
const missionsRoutes = require('./routes/missions');
const satellitesRoutes = require('./routes/satellites');
const anomaliesRoutes = require('./routes/anomalies');
const organizationsRoutes = require('./routes/organizations');
const groundstationsRoutes = require('./routes/groundstations');
const crewlogsRoutes = require('./routes/crewlogs');
const telemetryRoutes = require('./routes/telemetry');
const uploadsRoutes = require('./routes/uploads');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Suppress Chrome DevTools noise (before static files)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.json({});
});

// Suppress favicon 404 (before static files)
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/satellites', satellitesRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/groundstations', groundstationsRoutes);
app.use('/api/crewlogs', crewlogsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AstroLink Agency API is running',
        timestamp: new Date()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

(async () => {
    app.listen(PORT, () => {
        console.log(`AstroLink Agency API Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
    
    // Initialize organizations
    await initializeOrganizations();
})();
