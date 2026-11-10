const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const uploadDirs = {
    missions: path.join(__dirname, '../../frontend/uploads/missions'),
    satellites: path.join(__dirname, '../../frontend/uploads/satellites'),
    groundstations: path.join(__dirname, '../../frontend/uploads/groundstations')
};

Object.values(uploadDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for different entity types
const getStorage = (entityType) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = uploadDirs[entityType];
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            // Create unique filename with timestamp
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);
            cb(null, `${name}-${uniqueSuffix}${ext}`);
        }
    });
};

// File filter for images only
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Create upload middleware for each entity type
const uploadMissions = multer({
    storage: getStorage('missions'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const uploadSatellites = multer({
    storage: getStorage('satellites'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const uploadGroundstations = multer({
    storage: getStorage('groundstations'),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = {
    uploadMissions,
    uploadSatellites,
    uploadGroundstations
};
