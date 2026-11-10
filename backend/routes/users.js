const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get all users (Admin only)
router.get('/', adminMiddleware, async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        const [users] = await connection.query(`
            SELECT 
                u.user_id,
                u.full_name,
                u.username,
                u.email,
                u.role,
                u.is_active,
                u.created_at
            FROM users u
            ORDER BY u.created_at DESC
        `);
        
        connection.release();
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get single user by ID (Admin only)
router.get('/:userId', adminMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const connection = await pool.getConnection();
        
        const [users] = await connection.query(`
            SELECT 
                u.user_id,
                u.full_name,
                u.username,
                u.email,
                u.role,
                u.is_active,
                u.created_at
            FROM users u
            WHERE u.user_id = ?
        `, [userId]);
        
        connection.release();
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// Update user role (Admin only)
router.put('/:userId', adminMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "user" or "admin"'
            });
        }
        
        const connection = await pool.getConnection();
        
        // Check if user exists
        const [users] = await connection.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update role
        await connection.query(
            'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [role, userId]
        );
        
        connection.release();
        
        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user_id: userId, role }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
});

// Delete user (Admin only)
router.delete('/:userId', adminMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const connection = await pool.getConnection();
        
        // Check if user exists
        const [users] = await connection.query('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (users.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Delete user
        await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);
        
        connection.release();
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

module.exports = router;
