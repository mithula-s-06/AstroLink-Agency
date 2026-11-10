const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

// Password validation rules
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// Email validation
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Sign Up Route
router.post('/signup', [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('username').isEmail().withMessage('Username must be a valid email address'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').custom(validatePassword).withMessage(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
    ),
    body('confirm_password').custom((value, { req }) => value === req.body.password).withMessage(
        'Passwords do not match'
    ),
    body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { full_name, username, email, password, role } = req.body;

        const connection = await pool.getConnection();

        // Check if user already exists
        const [existingUser] = await connection.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await connection.query(
            'INSERT INTO users (full_name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [full_name, username, email, hashedPassword, role]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user_id: result.insertId
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signup',
            error: error.message
        });
    }
});

// Login Route
router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        const connection = await pool.getConnection();

        // Find user
        const [users] = await connection.query(
            'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
            [username, username]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        connection.release();

        // Generate JWT Token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

module.exports = router;
