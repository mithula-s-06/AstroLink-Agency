const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all ground stations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [groundStations] = await connection.query(`
            SELECT gs.*, m.mission_name,
                   COUNT(DISTINCT s.satellite_id) as connected_satellites
            FROM ground_stations gs
            LEFT JOIN missions m ON gs.mission_id = m.mission_id
            LEFT JOIN satellites s ON gs.mission_id = s.mission_id
            GROUP BY gs.station_id
            ORDER BY gs.created_at DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: groundStations
        });

    } catch (error) {
        console.error('Error fetching ground stations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ground stations',
            error: error.message
        });
    }
});

// Get ground station details
router.get('/:stationId', authMiddleware, async (req, res) => {
    try {
        const { stationId } = req.params;
        const connection = await pool.getConnection();

        const [stations] = await connection.query(`
            SELECT gs.*, m.mission_name
            FROM ground_stations gs
            LEFT JOIN missions m ON gs.mission_id = m.mission_id
            WHERE gs.station_id = ?
        `, [stationId]);

        if (stations.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Ground station not found'
            });
        }

        // Get connected satellites
        const [satellites] = await connection.query(`
            SELECT s.* FROM satellites s
            WHERE s.mission_id = ?
        `, [stations[0].mission_id]);

        connection.release();

        res.json({
            success: true,
            data: {
                station: stations[0],
                satellites
            }
        });

    } catch (error) {
        console.error('Error fetching ground station details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ground station details',
            error: error.message
        });
    }
});

// Create ground station (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const {
            station_name,
            station_code,
            mission_id,
            latitude,
            longitude,
            country,
            antenna_type,
            status,
            uptime_percentage,
            image_url
        } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO ground_stations 
            (station_name, station_code, mission_id, latitude, longitude, country, antenna_type, status, uptime_percentage, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                station_name,
                station_code,
                mission_id,
                latitude,
                longitude,
                country,
                antenna_type,
                status || 'Active',
                uptime_percentage || 99.5,
                image_url || null
            ]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Ground station created successfully',
            station_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating ground station:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating ground station',
            error: error.message
        });
    }
});

// Update ground station (Admin only)
router.put('/:stationId', adminMiddleware, async (req, res) => {
    try {
        const { stationId } = req.params;
        const {
            station_name,
            station_code,
            latitude,
            longitude,
            country,
            antenna_type,
            status,
            uptime_percentage,
            image_url
        } = req.body;

        const connection = await pool.getConnection();

        const updateFields = [];
        const updateValues = [];

        if (station_name !== undefined) {
            updateFields.push('station_name = ?');
            updateValues.push(station_name);
        }
        if (station_code !== undefined) {
            updateFields.push('station_code = ?');
            updateValues.push(station_code);
        }
        if (latitude !== undefined) {
            updateFields.push('latitude = ?');
            updateValues.push(latitude);
        }
        if (longitude !== undefined) {
            updateFields.push('longitude = ?');
            updateValues.push(longitude);
        }
        if (country !== undefined) {
            updateFields.push('country = ?');
            updateValues.push(country);
        }
        if (antenna_type !== undefined) {
            updateFields.push('antenna_type = ?');
            updateValues.push(antenna_type);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (uptime_percentage !== undefined) {
            updateFields.push('uptime_percentage = ?');
            updateValues.push(uptime_percentage);
        }
        if (image_url !== undefined) {
            updateFields.push('image_url = ?');
            updateValues.push(image_url);
        }

        if (updateFields.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(stationId);

        const [result] = await connection.query(
            `UPDATE ground_stations SET ${updateFields.join(', ')}, updated_at = NOW() WHERE station_id = ?`,
            updateValues
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ground station not found'
            });
        }

        res.json({
            success: true,
            message: 'Ground station updated successfully'
        });

    } catch (error) {
        console.error('Error updating ground station:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ground station',
            error: error.message
        });
    }
});

// Delete ground station (Admin only)
router.delete('/:stationId', adminMiddleware, async (req, res) => {
    try {
        const { stationId } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `DELETE FROM ground_stations WHERE station_id = ?`,
            [stationId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ground station not found'
            });
        }

        res.json({
            success: true,
            message: 'Ground station deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting ground station:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ground station',
            error: error.message
        });
    }
});

module.exports = router;
