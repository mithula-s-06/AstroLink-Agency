const express = require('express');
const { adminMiddleware } = require('../middleware/auth');
const { uploadMissions, uploadSatellites, uploadGroundstations } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload mission image
router.post('/missions', adminMiddleware, uploadMissions.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/missions/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Mission image uploaded successfully',
            imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading mission image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading mission image',
            error: error.message
        });
    }
});

// Upload satellite image
router.post('/satellites', adminMiddleware, uploadSatellites.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/satellites/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Satellite image uploaded successfully',
            imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading satellite image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading satellite image',
            error: error.message
        });
    }
});

// Upload ground station image
router.post('/groundstations', adminMiddleware, uploadGroundstations.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/groundstations/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Ground station image uploaded successfully',
            imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading ground station image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading ground station image',
            error: error.message
        });
    }
});

// Delete image
router.delete('/:type/:filename', adminMiddleware, (req, res) => {
    try {
        const { type, filename } = req.params;
        const validTypes = ['missions', 'satellites', 'groundstations'];

        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image type'
            });
        }

        const filePath = path.join(__dirname, `../../frontend/uploads/${type}/${filename}`);
        
        // Prevent directory traversal attacks
        const resolvedPath = path.resolve(filePath);
        const uploadsPath = path.resolve(path.join(__dirname, '../../frontend/uploads'));
        
        if (!resolvedPath.startsWith(uploadsPath)) {
            return res.status(403).json({
                success: false,
                message: 'Invalid file path'
            });
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image file not found'
            });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
});

module.exports = router;
