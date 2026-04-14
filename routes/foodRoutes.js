const express = require('express');
const { getFoods, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: Get all food items
 *     tags: [Foods]
 *     security: []
 *     responses:
 *       200:
 *         description: Returns list of foods
 *   post:
 *     summary: Create a food item (Admin only)
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.route('/')
    .get(getFoods)
    .post(protect, authorize('admin'), createFood);

/**
 * @swagger
 * /api/foods/{id}:
 *   put:
 *     summary: Update food item (Admin only)
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a food item (Admin only)
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.route('/:id')
    .put(protect, authorize('admin'), updateFood)
    .delete(protect, authorize('admin'), deleteFood);

module.exports = router;
