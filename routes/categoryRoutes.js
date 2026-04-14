const express = require('express');
const { getCategories } = require('../controllers/categoryController');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all unique food categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Array of categories
 */
router.route('/').get(getCategories);

module.exports = router;
