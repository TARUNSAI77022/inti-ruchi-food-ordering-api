const express = require('express');
const { getFoods, getFood, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditMiddleware');

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
 *                 description: CATEGORY_ID
 *               mealType:
 *                 type: string
 *                 description: MEALTYPE_ID
 *               imageUrl:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created
 */
router.route('/')
    .get(getFoods)
    .post(protect, authorize('admin'), auditLogger('Created Food Item'), createFood);

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     summary: Get single food item
 *     tags: [Foods]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 description: CATEGORY_ID
 *               mealType:
 *                 type: string
 *                 description: MEALTYPE_ID
 *               imageUrl:
 *                 type: string
 *               available:
 *                 type: boolean
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
    .get(getFood)
    .put(protect, authorize('admin'), auditLogger('Updated Food Item'), updateFood)
    .delete(protect, authorize('admin'), auditLogger('Deleted Food Item'), deleteFood);

module.exports = router;
