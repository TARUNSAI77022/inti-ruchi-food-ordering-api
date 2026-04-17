const express = require('express');
const { getMealTypes, getMealType, createMealType, updateMealType, deleteMealType } = require('../controllers/mealTypeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const auditLogger = require('../middleware/auditMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/meal-types:
 *   get:
 *     summary: Get all meal types
 *     tags: [MealTypes]
 *     security: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a meal type (Admin only)
 *     tags: [MealTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.route('/')
    .get(getMealTypes)
    .post(protect, authorize('admin'), auditLogger('Created Meal Type'), createMealType);

/**
 * @swagger
 * /api/meal-types/{id}:
 *   get:
 *     summary: Get a meal type by ID
 *     tags: [MealTypes]
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
 *     summary: Update a meal type (Admin only)
 *     tags: [MealTypes]
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
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a meal type (Admin only)
 *     tags: [MealTypes]
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
    .get(getMealType)
    .put(protect, authorize('admin'), auditLogger('Updated Meal Type'), updateMealType)
    .delete(protect, authorize('admin'), auditLogger('Deleted Meal Type'), deleteMealType);

module.exports = router;
