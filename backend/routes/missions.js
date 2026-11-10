const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all missions (viewable by all authenticated users)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [missions] = await connection.query(`
            SELECT m.*, o.org_name, m.image_url
            FROM missions m
            LEFT JOIN organizations o ON m.org_id = o.org_id
            ORDER BY m.created_at DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: missions
        });

    } catch (error) {
        console.error('Error fetching missions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching missions',
            error: error.message
        });
    }
});

// Get mission details with all related data
router.get('/:missionId', authMiddleware, async (req, res) => {
    try {
        const { missionId } = req.params;
        const connection = await pool.getConnection();

        // Get mission details
        const [missions] = await connection.query(`
            SELECT m.*, o.org_name
            FROM missions m
            LEFT JOIN organizations o ON m.org_id = o.org_id
            WHERE m.mission_id = ?
        `, [missionId]);

        if (missions.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        // Get satellites
        const [satellites] = await connection.query(`
            SELECT s.*, 
                   COUNT(DISTINCT p.payload_id) as payload_count,
                   s.image_url
            FROM satellites s
            LEFT JOIN payloads p ON s.satellite_id = p.satellite_id
            WHERE s.mission_id = ?
            GROUP BY s.satellite_id
        `, [missionId]);

        // Get ground stations
        const [groundStations] = await connection.query(`
            SELECT gs.*, gs.image_url
            FROM ground_stations gs
            WHERE gs.mission_id = ?
        `, [missionId]);

        // Get anomalies
        const [anomalies] = await connection.query(`
            SELECT a.*
            FROM anomalies a
            WHERE a.mission_id = ?
            ORDER BY a.detected_at DESC
        `, [missionId]);

        // Get milestones
        const [milestones] = await connection.query(`
            SELECT m.*
            FROM mission_milestones m
            WHERE m.mission_id = ?
            ORDER BY m.planned_date
        `, [missionId]);

        // Get crew logs
        const [crewLogs] = await connection.query(`
            SELECT cl.*
            FROM crew_logs cl
            WHERE cl.mission_id = ?
            ORDER BY cl.log_date DESC, cl.log_time DESC
        `, [missionId]);

        connection.release();

        res.json({
            success: true,
            data: {
                mission: missions[0],
                satellites,
                ground_stations: groundStations,
                anomalies,
                milestones,
                crew_logs: crewLogs
            }
        });

    } catch (error) {
        console.error('Error fetching mission details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mission details',
            error: error.message
        });
    }
});

// Create new mission (Admin only)
router.post('/', adminMiddleware, [
    body('mission_name').notEmpty().withMessage('Mission name is required'),
    body('mission_type').isIn(['Earth Orbit', 'Deep Space', 'Lunar', 'Planetary', 'Communications', 'Weather', 'Navigation']).withMessage('Invalid mission type'),
    body('start_date').isISO8601().withMessage('Valid start date required'),
    body('end_date').isISO8601().withMessage('Valid end date required'),
    body('org_id').isInt().withMessage('Valid organization required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            mission_name,
            mission_type,
            mission_status,
            start_date,
            end_date,
            mission_description,
            budget,
            org_id
        } = req.body;

        // Validate required fields
        if (!mission_name || !mission_type || !start_date || !end_date || !org_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: mission_name, mission_type, start_date, end_date, org_id'
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const connection = await pool.getConnection();

        try {
            // Create mission
            const [missionResult] = await connection.query(
                `INSERT INTO missions 
                (mission_name, mission_type, mission_status, org_id, start_date, end_date, mission_description, budget, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mission_name,
                    mission_type,
                    mission_status || 'Planning',
                    org_id,
                    start_date,
                    end_date,
                    mission_description || null,
                    budget ? parseFloat(budget) : null,
                    req.user.user_id
                ]
            );

            connection.release();

            res.status(201).json({
                success: true,
                message: 'Mission created successfully',
                mission_id: missionResult.insertId
            });

        } catch (error) {
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error creating mission:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating mission',
            error: error.message
        });
    }
});

// Update mission (Admin only)
router.put('/:missionId', adminMiddleware, async (req, res) => {
    let connection;
    try {
        const { missionId } = req.params;
        const { mission_name, mission_type, mission_status, end_date, mission_description, budget, image_url } = req.body;

        connection = await pool.getConnection();

        const updateFields = [];
        const updateValues = [];

        if (mission_name !== undefined) {
            updateFields.push('mission_name = ?');
            updateValues.push(mission_name);
        }
        if (mission_type !== undefined) {
            updateFields.push('mission_type = ?');
            updateValues.push(mission_type);
        }
        if (mission_status !== undefined) {
            updateFields.push('mission_status = ?');
            updateValues.push(mission_status);
        }
        if (end_date !== undefined) {
            updateFields.push('end_date = ?');
            updateValues.push(end_date);
        }
        if (mission_description !== undefined) {
            updateFields.push('mission_description = ?');
            updateValues.push(mission_description);
        }
        if (budget !== undefined) {
            updateFields.push('budget = ?');
            updateValues.push(budget ? parseFloat(budget) : null);
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

        updateValues.push(missionId);

        const [result] = await connection.query(
            `UPDATE missions SET ${updateFields.join(', ')}, updated_at = NOW() WHERE mission_id = ?`,
            updateValues
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mission not found'
            });
        }

        res.json({
            success: true,
            message: 'Mission updated successfully'
        });

    } catch (error) {
        console.error('Error updating mission:', error);
        if (connection) connection.release();
        res.status(500).json({
            success: false,
            message: 'Error updating mission',
            error: error.message
        });
    }
});

// Delete mission (Admin only)
router.delete('/:missionId', adminMiddleware, async (req, res) => {
    try {
        const { missionId } = req.params;
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Delete related records first
            await connection.query('DELETE FROM crew_logs WHERE mission_id = ?', [missionId]);
            await connection.query('DELETE FROM anomalies WHERE mission_id = ?', [missionId]);
            await connection.query('DELETE FROM ground_stations WHERE mission_id = ?', [missionId]);
            
            // Delete satellites and related telemetry
            const [satellites] = await connection.query('SELECT satellite_id FROM satellites WHERE mission_id = ?', [missionId]);
            for (const sat of satellites) {
                await connection.query('DELETE FROM telemetry WHERE satellite_id = ?', [sat.satellite_id]);
            }
            await connection.query('DELETE FROM satellites WHERE mission_id = ?', [missionId]);

            // Delete mission milestones
            await connection.query('DELETE FROM mission_milestones WHERE mission_id = ?', [missionId]);

            // Delete the mission
            const [result] = await connection.query(
                'DELETE FROM missions WHERE mission_id = ?',
                [missionId]
            );

            await connection.commit();
            connection.release();

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mission not found'
                });
            }

            res.json({
                success: true,
                message: 'Mission deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error deleting mission:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting mission',
            error: error.message
        });
    }
});

module.exports = router;
