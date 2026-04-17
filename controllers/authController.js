const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Tag
const generateToken = (id, role, version) => {
    return jwt.sign({ userId: id, role, tokenVersion: version }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: 'user' // Strictly enforce user role
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: generateToken(user._id, user.role, user.tokenVersion)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
            return res.status(403).json({ 
                success: false, 
                error: `Account is temporarily locked. Try again in ${minutesLeft} minutes.` 
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Increment login attempts
            user.loginAttempts += 1;
            
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + (1 * 60 * 60 * 1000); // Lock for 1 hour
            }
            
            await user.save();
            
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Reset login attempts on success
        if (user.loginAttempts > 0 || user.lockUntil) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: generateToken(user._id, user.role, user.tokenVersion)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout / Revoke Token
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.tokenVersion += 1;
        await user.save();

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
