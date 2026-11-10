const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all crew logs
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [crewLogs] = await connection.query(`
            SELECT cl.*, m.mission_name
            FROM crew_logs cl
            LEFT JOIN missions m ON cl.mission_id = m.mission_id
            ORDER BY cl.log_date DESC, cl.log_time DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: crewLogs
        });

    } catch (error) {
        console.error('Error fetching crew logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching crew logs',
            error: error.message
        });
    }
});

// Get crew logs for a mission
router.get('/mission/:missionId', authMiddleware, async (req, res) => {
    try {
        const { missionId } = req.params;
        const connection = await pool.getConnection();

        const [crewLogs] = await connection.query(`
            SELECT cl.*
            FROM crew_logs cl
            WHERE cl.mission_id = ?
            ORDER BY cl.log_date DESC, cl.log_time DESC
        `, [missionId]);

        connection.release();

        res.json({
            success: true,
            data: crewLogs
        });

    } catch (error) {
        console.error('Error fetching mission crew logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mission crew logs',
            error: error.message
        });
    }
});

// Get crew log details
router.get('/:logId', authMiddleware, async (req, res) => {
    try {
        const { logId } = req.params;
        const connection = await pool.getConnection();

        const [logs] = await connection.query(`
            SELECT cl.*, m.mission_name
            FROM crew_logs cl
            LEFT JOIN missions m ON cl.mission_id = m.mission_id
            WHERE cl.log_id = ?
        `, [logId]);

        if (logs.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Crew log not found'
            });
        }

        connection.release();

        res.json({
            success: true,
            data: logs[0]
        });

    } catch (error) {
        console.error('Error fetching crew log details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching crew log details',
            error: error.message
        });
    }
});

// Create crew log (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const {
            mission_id,
            satellite_id,
            crew_member_name,
            crew_member_role,
            log_date,
            log_time,
            log_description,
            activity_type,
            duration_hours
        } = req.body;

        // Validation
        if (!mission_id || !crew_member_name || !log_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: mission_id, crew_member_name, log_date'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO crew_logs 
            (mission_id, satellite_id, crew_member_name, crew_member_role, log_date, log_time, log_description, activity_type, duration_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                mission_id,
                satellite_id,
                crew_member_name,
                crew_member_role,
                log_date,
                log_time,
                log_description,
                activity_type,
                duration_hours
            ]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Crew log created successfully',
            log_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating crew log:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating crew log',
            error: error.message
        });
    }
});

// Update crew log (Admin only)
router.put('/:logId', adminMiddleware, async (req, res) => {
    try {
        const { logId } = req.params;
        const {
            crew_member_name,
            crew_member_role,
            log_description,
            activity_type,
            duration_hours
        } = req.body;

        const connection = await pool.getConnection();

        const updateFields = [];
        const updateValues = [];

        if (crew_member_name !== undefined) {
            updateFields.push('crew_member_name = ?');
            updateValues.push(crew_member_name);
        }
        if (crew_member_role !== undefined) {
            updateFields.push('crew_member_role = ?');
            updateValues.push(crew_member_role);
        }
        if (log_description !== undefined) {
            updateFields.push('log_description = ?');
            updateValues.push(log_description);
        }
        if (activity_type !== undefined) {
            updateFields.push('activity_type = ?');
            updateValues.push(activity_type);
        }
        if (duration_hours !== undefined) {
            updateFields.push('duration_hours = ?');
            updateValues.push(duration_hours);
        }

        if (updateFields.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(logId);

        const [result] = await connection.query(
            `UPDATE crew_logs SET ${updateFields.join(', ')}, updated_at = NOW() WHERE log_id = ?`,
            updateValues
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Crew log not found'
            });
        }

        res.json({
            success: true,
            message: 'Crew log updated successfully'
        });

    } catch (error) {
        console.error('Error updating crew log:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating crew log',
            error: error.message
        });
    }
});

// Delete crew log (Admin only)
router.delete('/:logId', adminMiddleware, async (req, res) => {
    try {
        const { logId } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `DELETE FROM crew_logs WHERE log_id = ?`,
            [logId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Crew log not found'
            });
        }

        res.json({
            success: true,
            message: 'Crew log deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting crew log:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting crew log',
            error: error.message
        });
    }
});

module.exports = router;
