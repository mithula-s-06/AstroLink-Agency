const express = require('express');
const { adminMiddleware, authMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all anomalies
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [anomalies] = await connection.query(`
            SELECT a.*, s.satellite_name, m.mission_name,
                   u_reported.full_name as reported_by_name,
                   u_resolved.full_name as resolved_by_name
            FROM anomalies a
            LEFT JOIN satellites s ON a.satellite_id = s.satellite_id
            LEFT JOIN missions m ON a.mission_id = m.mission_id
            LEFT JOIN users u_reported ON a.reported_by = u_reported.user_id
            LEFT JOIN users u_resolved ON a.resolved_by = u_resolved.user_id
            ORDER BY a.detected_at DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: anomalies
        });

    } catch (error) {
        console.error('Error fetching anomalies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching anomalies',
            error: error.message
        });
    }
});

// Get anomaly by ID
router.get('/:anomalyId', authMiddleware, async (req, res) => {
    try {
        const { anomalyId } = req.params;
        const connection = await pool.getConnection();

        const [anomalies] = await connection.query(`
            SELECT a.*, s.satellite_name, m.mission_name,
                   u_reported.full_name as reported_by_name,
                   u_resolved.full_name as resolved_by_name
            FROM anomalies a
            LEFT JOIN satellites s ON a.satellite_id = s.satellite_id
            LEFT JOIN missions m ON a.mission_id = m.mission_id
            LEFT JOIN users u_reported ON a.reported_by = u_reported.user_id
            LEFT JOIN users u_resolved ON a.resolved_by = u_resolved.user_id
            WHERE a.anomaly_id = ?
        `, [anomalyId]);

        connection.release();

        if (anomalies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anomaly not found'
            });
        }

        res.json({
            success: true,
            data: anomalies[0]
        });

    } catch (error) {
        console.error('Error fetching anomaly:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching anomaly',
            error: error.message
        });
    }
});

// Get unresolved anomalies older than 7 days
router.get('/unresolved/critical', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [anomalies] = await connection.query(`
            SELECT a.*, s.satellite_name, m.mission_name,
                   DATEDIFF(NOW(), a.detected_at) as days_unresolved,
                   u.full_name as reported_by_name
            FROM anomalies a
            LEFT JOIN satellites s ON a.satellite_id = s.satellite_id
            LEFT JOIN missions m ON a.mission_id = m.mission_id
            LEFT JOIN users u ON a.reported_by = u.user_id
            WHERE a.is_resolved = FALSE 
            AND DATEDIFF(NOW(), a.detected_at) > 7
            ORDER BY a.detected_at ASC
        `);

        connection.release();

        res.json({
            success: true,
            data: anomalies,
            count: anomalies.length
        });

    } catch (error) {
        console.error('Error fetching critical anomalies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching critical anomalies',
            error: error.message
        });
    }
});

// Get anomalies by satellite
router.get('/satellite/:satelliteId', authMiddleware, async (req, res) => {
    try {
        const { satelliteId } = req.params;
        const connection = await pool.getConnection();

        const [anomalies] = await connection.query(`
            SELECT a.*, s.satellite_name, m.mission_name,
                   u_reported.full_name as reported_by_name,
                   u_resolved.full_name as resolved_by_name
            FROM anomalies a
            LEFT JOIN satellites s ON a.satellite_id = s.satellite_id
            LEFT JOIN missions m ON a.mission_id = m.mission_id
            LEFT JOIN users u_reported ON a.reported_by = u_reported.user_id
            LEFT JOIN users u_resolved ON a.resolved_by = u_resolved.user_id
            WHERE a.satellite_id = ?
            ORDER BY a.detected_at DESC
        `, [satelliteId]);

        connection.release();

        res.json({
            success: true,
            data: anomalies
        });

    } catch (error) {
        console.error('Error fetching anomalies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching anomalies',
            error: error.message
        });
    }
});

// Get satellites with frequent anomalies
router.get('/analysis/frequent', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [satellites] = await connection.query(`
            SELECT s.satellite_id, s.satellite_name, s.status,
                   COUNT(a.anomaly_id) as total_anomalies,
                   SUM(CASE WHEN a.is_resolved = FALSE THEN 1 ELSE 0 END) as unresolved_anomalies,
                   AVG(CASE WHEN a.severity = 'Critical' THEN 1 
                           WHEN a.severity = 'High' THEN 0.75
                           WHEN a.severity = 'Medium' THEN 0.5
                           ELSE 0.25 END) as average_severity
            FROM satellites s
            LEFT JOIN anomalies a ON s.satellite_id = a.satellite_id
            GROUP BY s.satellite_id, s.satellite_name, s.status
            HAVING total_anomalies > 0
            ORDER BY total_anomalies DESC
        `);

        connection.release();

        res.json({
            success: true,
            data: satellites
        });

    } catch (error) {
        console.error('Error fetching satellite anomaly analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching satellite anomaly analysis',
            error: error.message
        });
    }
});

// Create anomaly (Admin only)
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const {
            satellite_id,
            mission_id,
            anomaly_type,
            severity,
            description,
            impact_assessment,
            is_resolved
        } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `INSERT INTO anomalies 
            (satellite_id, mission_id, anomaly_type, severity, description, impact_assessment, is_resolved, detected_at, reported_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [
                satellite_id,
                mission_id,
                anomaly_type,
                severity || 'Medium',
                description,
                impact_assessment,
                is_resolved ? 1 : 0,
                req.user.user_id
            ]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Anomaly reported successfully',
            anomaly_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating anomaly:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating anomaly',
            error: error.message
        });
    }
});

// Update anomaly (Admin only)
router.put('/:anomalyId', adminMiddleware, async (req, res) => {
    try {
        const { anomalyId } = req.params;
        const {
            anomaly_type,
            severity,
            description,
            impact_assessment,
            is_resolved
        } = req.body;

        const connection = await pool.getConnection();

        const updateFields = [];
        const updateValues = [];

        if (anomaly_type !== undefined) {
            updateFields.push('anomaly_type = ?');
            updateValues.push(anomaly_type);
        }
        if (severity !== undefined) {
            updateFields.push('severity = ?');
            updateValues.push(severity);
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (impact_assessment !== undefined) {
            updateFields.push('impact_assessment = ?');
            updateValues.push(impact_assessment);
        }
        if (is_resolved !== undefined) {
            updateFields.push('is_resolved = ?');
            updateValues.push(is_resolved ? 1 : 0);
        }

        if (updateFields.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(anomalyId);

        const [result] = await connection.query(
            `UPDATE anomalies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE anomaly_id = ?`,
            updateValues
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anomaly not found'
            });
        }

        res.json({
            success: true,
            message: 'Anomaly updated successfully'
        });

    } catch (error) {
        console.error('Error updating anomaly:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating anomaly',
            error: error.message
        });
    }
});

// Resolve anomaly (Admin only)
router.put('/:anomalyId/resolve', adminMiddleware, async (req, res) => {
    try {
        const { anomalyId } = req.params;
        const { resolution_procedure } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE anomalies 
            SET is_resolved = TRUE, resolved_at = NOW(), resolution_procedure = ?, resolved_by = ?, updated_at = NOW()
            WHERE anomaly_id = ?`,
            [resolution_procedure, req.user.user_id, anomalyId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anomaly not found'
            });
        }

        res.json({
            success: true,
            message: 'Anomaly resolved successfully'
        });

    } catch (error) {
        console.error('Error resolving anomaly:', error);
        res.status(500).json({
            success: false,
            message: 'Error resolving anomaly',
            error: error.message
        });
    }
});

// Delete anomaly (Admin only)
router.delete('/:anomalyId', adminMiddleware, async (req, res) => {
    try {
        const { anomalyId } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM anomalies WHERE anomaly_id = ?',
            [anomalyId]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anomaly not found'
            });
        }

        res.json({
            success: true,
            message: 'Anomaly deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting anomaly:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting anomaly',
            error: error.message
        });
    }
});

module.exports = router;
