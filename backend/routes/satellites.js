const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all satellites
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [satellites] = await connection.query(`
            SELECT s.*, m.mission_name,
                   COUNT(DISTINCT p.payload_id) as payload_count
            FROM satellites s
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            LEFT JOIN payloads p ON s.satellite_id = p.satellite_id
            GROUP BY s.satellite_id
            ORDER BY s.created_at DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: satellites
        });

    } catch (error) {
        console.error('Error fetching satellites:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching satellites',
            error: error.message
        });
    }
});

// Get satellite with telemetry and payloads
router.get('/:satelliteId', authMiddleware, async (req, res) => {
    try {
        const { satelliteId } = req.params;
        const connection = await pool.getConnection();

        // Get satellite info
        const [satellites] = await connection.query(`
            SELECT s.*, m.mission_name
            FROM satellites s
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            WHERE s.satellite_id = ?
        `, [satelliteId]);

        if (satellites.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Satellite not found'
            });
        }

        // Get payloads
        const [payloads] = await connection.query(`
            SELECT * FROM payloads WHERE satellite_id = ?
        `, [satelliteId]);

        // Get latest telemetry
        const [latestTelemetry] = await connection.query(`
            SELECT * FROM telemetry 
            WHERE satellite_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        `, [satelliteId]);

        // Get anomalies
        const [anomalies] = await connection.query(`
            SELECT * FROM anomalies 
            WHERE satellite_id = ?
            ORDER BY detected_at DESC
        `, [satelliteId]);

        connection.release();

        res.json({
            success: true,
            data: {
                satellite: satellites[0],
                payloads,
                telemetry: latestTelemetry,
                anomalies
            }
        });

    } catch (error) {
        console.error('Error fetching satellite details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching satellite details',
            error: error.message
        });
    }
});

// Get satellites with low battery
router.get('/mission/:missionId/low-battery', authMiddleware, async (req, res) => {
    try {
        const { missionId } = req.params;
        const connection = await pool.getConnection();

        const [satellites] = await connection.query(`
            SELECT s.*, m.mission_name,
                   COUNT(DISTINCT a.anomaly_id) as anomaly_count
            FROM satellites s
            LEFT JOIN missions m ON s.mission_id = m.mission_id
            LEFT JOIN anomalies a ON s.satellite_id = a.satellite_id
            WHERE s.mission_id = ? AND s.current_battery_percentage < 20
            GROUP BY s.satellite_id
            ORDER BY s.current_battery_percentage ASC
        `, [missionId]);

        connection.release();

        res.json({
            success: true,
            data: satellites
        });

    } catch (error) {
        console.error('Error fetching low battery satellites:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching low battery satellites',
            error: error.message
        });
    }
});

// Add satellite to mission (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const {
            satellite_name,
            norad_id,
            mission_id,
            satellite_type,
            launch_date,
            weight_kg,
            status,
            current_battery_percentage,
            operational_life_years,
            image_url
        } = req.body;

        // Validation
        if (!satellite_name || !satellite_type || !mission_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: satellite_name, satellite_type, mission_id'
            });
        }
        
        const validTypes = ['LEO', 'MEO', 'GEO', 'Polar', 'Sun-Synchronous'];
        if (!validTypes.includes(satellite_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid satellite type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const connection = await pool.getConnection();

        // Parse numeric values
        const parsedWeight = weight_kg ? parseFloat(weight_kg) : null;
        const parsedBattery = current_battery_percentage ? parseFloat(current_battery_percentage) : 100;
        const parsedLifeYears = operational_life_years ? parseFloat(operational_life_years) : null;
        const parsedMissionId = parseInt(mission_id);

        const [result] = await connection.query(
            `INSERT INTO satellites 
            (satellite_name, norad_id, mission_id, satellite_type, launch_date, weight_kg, status, current_battery_percentage, operational_life_years, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                satellite_name,
                norad_id,
                parsedMissionId,
                satellite_type,
                launch_date,
                parsedWeight,
                status || 'Pre-Launch',
                parsedBattery,
                parsedLifeYears,
                image_url || null
            ]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Satellite added successfully',
            satellite_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding satellite:', error);
        console.error('Error details:', {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState
        });
        
        // Handle specific database errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mission ID. The mission does not exist.'
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(400).json({
                success: false,
                message: 'Satellite with this NORAD ID already exists.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error adding satellite',
            error: error.message
        });
    }
});

// Update satellite (Admin only)
router.put('/:satelliteId', adminMiddleware, async (req, res) => {
     let connection;
     try {
         const { satelliteId } = req.params;
         const {
             satellite_name,
             satellite_type,
             status,
             current_battery_percentage,
             operational_life_years,
             launch_date,
             image_url,
             weight_kg,
             norad_id,
             mission_id
         } = req.body;

         connection = await pool.getConnection();

         const updateFields = [];
         const updateValues = [];

         if (satellite_name !== undefined) {
             updateFields.push('satellite_name = ?');
             updateValues.push(satellite_name);
         }
         if (satellite_type !== undefined) {
             updateFields.push('satellite_type = ?');
             updateValues.push(satellite_type);
         }
         if (status !== undefined) {
             updateFields.push('status = ?');
             updateValues.push(status);
         }
         if (current_battery_percentage !== undefined) {
             updateFields.push('current_battery_percentage = ?');
             updateValues.push(current_battery_percentage);
         }
         if (operational_life_years !== undefined) {
             updateFields.push('operational_life_years = ?');
             updateValues.push(operational_life_years);
         }
         if (launch_date !== undefined) {
             updateFields.push('launch_date = ?');
             updateValues.push(launch_date);
         }
         if (image_url !== undefined) {
             updateFields.push('image_url = ?');
             updateValues.push(image_url);
         }
         if (weight_kg !== undefined) {
             updateFields.push('weight_kg = ?');
             updateValues.push(weight_kg);
         }
         if (norad_id !== undefined) {
             updateFields.push('norad_id = ?');
             updateValues.push(norad_id);
         }
         if (mission_id !== undefined) {
             updateFields.push('mission_id = ?');
             updateValues.push(mission_id);
         }

         if (updateFields.length === 0) {
             connection.release();
             return res.status(400).json({
                 success: false,
                 message: 'No fields to update'
             });
         }

         updateValues.push(satelliteId);

         const [result] = await connection.query(
             `UPDATE satellites SET ${updateFields.join(', ')} WHERE satellite_id = ?`,
             updateValues
         );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Satellite not found'
            });
        }

        res.json({
            success: true,
            message: 'Satellite updated successfully'
        });

    } catch (error) {
        console.error('Error updating satellite:', error);
        if (connection) connection.release();
        res.status(500).json({
            success: false,
            message: 'Error updating satellite',
            error: error.message
        });
    }
    });

// Delete satellite (Admin only)
router.delete('/:satelliteId', adminMiddleware, async (req, res) => {
    try {
        const { satelliteId } = req.params;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Delete related records
            await connection.query('DELETE FROM telemetry WHERE satellite_id = ?', [satelliteId]);
            await connection.query('DELETE FROM anomalies WHERE satellite_id = ?', [satelliteId]);
            await connection.query('DELETE FROM payloads WHERE satellite_id = ?', [satelliteId]);

            // Delete the satellite
            const [result] = await connection.query(
                'DELETE FROM satellites WHERE satellite_id = ?',
                [satelliteId]
            );

            await connection.commit();
            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Satellite not found'
                });
            }

            res.json({
                success: true,
                message: 'Satellite deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error deleting satellite:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting satellite',
            error: error.message
        });
    }
});

module.exports = router;
