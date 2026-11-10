const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all telemetry data
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [telemetry] = await connection.query(`
            SELECT t.*, s.satellite_name, m.mission_name
            FROM telemetry t
            LEFT JOIN satellites s ON t.satellite_id = s.satellite_id
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            ORDER BY t.timestamp DESC
            LIMIT 500
        `);

        connection.release();

        res.json({
            success: true,
            data: telemetry
        });

    } catch (error) {
        console.error('Error fetching telemetry data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching telemetry data',
            error: error.message
        });
    }
});

// Get telemetry for specific satellite
router.get('/satellite/:satelliteId', authMiddleware, async (req, res) => {
    try {
        const { satelliteId } = req.params;
        const connection = await pool.getConnection();

        const [telemetry] = await connection.query(`
            SELECT t.*, s.satellite_name, m.mission_name
            FROM telemetry t
            LEFT JOIN satellites s ON t.satellite_id = s.satellite_id
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            WHERE t.satellite_id = ?
            ORDER BY t.timestamp DESC
            LIMIT 100
        `, [satelliteId]);

        connection.release();

        res.json({
            success: true,
            data: telemetry
        });

    } catch (error) {
        console.error('Error fetching satellite telemetry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching satellite telemetry',
            error: error.message
        });
    }
});

// Get telemetry details
router.get('/:telemetryId', authMiddleware, async (req, res) => {
    try {
        const { telemetryId } = req.params;
        const connection = await pool.getConnection();

        const [telemetry] = await connection.query(`
            SELECT t.*, s.satellite_name, m.mission_name
            FROM telemetry t
            LEFT JOIN satellites s ON t.satellite_id = s.satellite_id
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            WHERE t.telemetry_id = ?
        `, [telemetryId]);

        if (telemetry.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }

        connection.release();

        res.json({
            success: true,
            data: telemetry[0]
        });

    } catch (error) {
        console.error('Error fetching telemetry details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching telemetry details',
            error: error.message
        });
    }
});

// Create telemetry record (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    let connection;
    try {
        const {
            satellite_id,
            altitude,
            velocity,
            battery_percentage,
            cpu_temperature_celsius,
            signal_strength_dbm,
            link_quality_percentage
        } = req.body;

        // Validation
        if (!satellite_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: satellite_id'
            });
        }

        connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO telemetry 
            (satellite_id, altitude, velocity, battery_percentage, cpu_temperature_celsius, signal_strength_dbm, link_quality_percentage, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                satellite_id,
                altitude || null,
                velocity || null,
                battery_percentage || null,
                cpu_temperature_celsius || null,
                signal_strength_dbm || null,
                link_quality_percentage || null
            ]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Telemetry record created successfully',
            telemetry_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating telemetry record:', error);
        if (connection) connection.release();
        res.status(500).json({
            success: false,
            message: 'Error creating telemetry record',
            error: error.message
        });
    }
});

// Update telemetry (Admin only)
router.put('/:telemetryId', adminMiddleware, async (req, res) => {
    let connection;
    try {
        const { telemetryId } = req.params;
        const {
            altitude,
            velocity,
            battery_percentage,
            cpu_temperature_celsius,
            signal_strength_dbm,
            link_quality_percentage
        } = req.body;

        connection = await pool.getConnection();

        const updateFields = [];
        const updateValues = [];

        if (altitude !== undefined) {
            updateFields.push('altitude = ?');
            updateValues.push(altitude);
        }
        if (velocity !== undefined) {
            updateFields.push('velocity = ?');
            updateValues.push(velocity);
        }
        if (battery_percentage !== undefined) {
            updateFields.push('battery_percentage = ?');
            updateValues.push(battery_percentage);
        }
        if (cpu_temperature_celsius !== undefined) {
            updateFields.push('cpu_temperature_celsius = ?');
            updateValues.push(cpu_temperature_celsius);
        }
        if (signal_strength_dbm !== undefined) {
            updateFields.push('signal_strength_dbm = ?');
            updateValues.push(signal_strength_dbm);
        }
        if (link_quality_percentage !== undefined) {
            updateFields.push('link_quality_percentage = ?');
            updateValues.push(link_quality_percentage);
        }

        if (updateFields.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(telemetryId);

        const [result] = await connection.query(
            `UPDATE telemetry SET ${updateFields.join(', ')} WHERE telemetry_id = ?`,
            updateValues
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }

        res.json({
            success: true,
            message: 'Telemetry record updated successfully'
        });

    } catch (error) {
        console.error('Error updating telemetry:', error);
        if (connection) connection.release();
        res.status(500).json({
            success: false,
            message: 'Error updating telemetry',
            error: error.message
        });
    }
});

// Delete telemetry (Admin only)
router.delete('/:telemetryId', adminMiddleware, async (req, res) => {
    let connection;
    try {
        const { telemetryId } = req.params;
        connection = await pool.getConnection();

        const [result] = await connection.query(
            `DELETE FROM telemetry WHERE telemetry_id = ?`,
            [telemetryId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }

        res.json({
            success: true,
            message: 'Telemetry record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting telemetry:', error);
        if (connection) connection.release();
        res.status(500).json({
            success: false,
            message: 'Error deleting telemetry',
            error: error.message
        });
    }
});

module.exports = router;
