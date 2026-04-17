const express = require('express');
const { createOrder, getOrders, getMyOrders, getOrderById, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order (Authenticated User)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created Order
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: All orders list
 */
router.route('/')
    .post(protect, createOrder)
    .get(protect, authorize('admin'), getOrders);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current logged in user's orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: User's orders
 */
router.route('/my').get(protect, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order details
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Soft delete order (Admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.route('/:id')
    .get(protect, getOrderById)
    .delete(protect, authorize('admin'), deleteOrder);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 example: preparing
 *     responses:
 *       200:
 *         description: Updated status
 */
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);

module.exports = router;
