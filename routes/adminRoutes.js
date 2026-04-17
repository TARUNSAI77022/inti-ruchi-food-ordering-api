const express = require('express');
const { getStats } = require('../controllers/adminController');
const { getAdminFoods } = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.route('/stats').get(protect, authorize('admin'), getStats);

/**
 * @swagger
 * /api/admin/foods:
 *   get:
 *     summary: Get all food items including unavailable (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all food items
 */
router.route('/foods').get(protect, authorize('admin'), getAdminFoods);

module.exports = router;
