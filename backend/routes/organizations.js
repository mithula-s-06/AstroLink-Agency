const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all organizations
router.get('/', authMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [organizations] = await connection.query(`
            SELECT o.*, COUNT(DISTINCT m.mission_id) as mission_count
            FROM organizations o
            LEFT JOIN missions m ON o.org_id = m.org_id
            GROUP BY o.org_id
            ORDER BY o.org_name
        `);

        connection.release();

        res.json({
            success: true,
            data: organizations
        });

    } catch (error) {
        console.error('Error fetching organizations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organizations',
            error: error.message
        });
    }
});

// Get organization by ID
router.get('/:orgId', authMiddleware, async (req, res) => {
    try {
        const { orgId } = req.params;
        const connection = await pool.getConnection();

        const [organizations] = await connection.query(`
            SELECT * FROM organizations WHERE org_id = ?
        `, [orgId]);

        if (organizations.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Get missions for this organization
        const [missions] = await connection.query(`
            SELECT * FROM missions WHERE org_id = ?
        `, [orgId]);

        connection.release();

        res.json({
            success: true,
            data: {
                organization: organizations[0],
                missions
            }
        });

    } catch (error) {
        console.error('Error fetching organization:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organization',
            error: error.message
        });
    }
});

module.exports = router;
