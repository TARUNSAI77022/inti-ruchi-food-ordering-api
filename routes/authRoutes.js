const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' }
});

const router = express.Router();
const validator = require('express-validator');

// Validation rules
const registerValidation = [
    validator.body('name').notEmpty().withMessage('Name is required').trim(),
    validator.body('email').isEmail().withMessage('Please provide a valid email'),
    validator.body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[a-zA-Z]/).withMessage('Password must contain a letter')
];

const loginValidation = [
    validator.body('email').isEmail().withMessage('Please provide a valid email'),
    validator.body('password').notEmpty().withMessage('Password is required')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: user or admin
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', registerValidation, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@inti.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: User logged in successfully returns JWT token
 */
router.post('/login', loginLimiter, loginValidation, loginUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (Revoke Token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/logout', protect, logoutUser);

module.exports = router;
