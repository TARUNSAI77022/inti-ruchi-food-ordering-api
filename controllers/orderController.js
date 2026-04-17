const Order = require('../models/Order');
const FoodItem = require('../models/FoodItem');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    try {
        const { items, idempotencyKey } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No order items' });
        }

        // Check for idempotency
        if (idempotencyKey) {
            const existingOrder = await Order.findOne({ idempotencyKey });
            if (existingOrder) {
                return res.status(200).json({ success: true, data: existingOrder, message: 'Duplicate request handled' });
            }
        }

        let totalAmount = 0;
        const itemsWithSnapshots = [];

        for (const item of items) {
            const food = await FoodItem.findById(item.foodId);
            if (!food) {
                return res.status(404).json({ success: false, error: `Food item ${item.foodId} not found` });
            }

            const itemPrice = food.price;
            totalAmount += itemPrice * item.quantity;

            itemsWithSnapshots.push({
                foodId: item.foodId,
                quantity: item.quantity,
                price: itemPrice
            });
        }

        // Generate Order Number: ORD-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `ORD-${dateStr}-${randomStr}`;

        const order = new Order({
            userId: req.user._id,
            items: itemsWithSnapshots,
            totalAmount,
            idempotencyKey,
            orderNumber
        });

        const createdOrder = await order.save();
        res.status(201).json({ success: true, data: createdOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('items.foodId', 'name price imageUrl');

        const total = await Order.countDocuments({ userId: req.user._id });

        res.status(200).json({ 
            success: true, 
            count: orders.length, 
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: orders 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('items.foodId', 'name price imageUrl');

        const total = await Order.countDocuments();

        res.status(200).json({ 
            success: true, 
            count: orders.length, 
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: orders 
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('items.foodId', 'name price imageUrl');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check ownership or admin
        if (order.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Validate status transitions
        const allowedTransitions = {
            'pending': ['preparing', 'cancelled'],
            'preparing': ['delivered', 'cancelled'],
            'delivered': [], // Final state
            'cancelled': []  // Final state
        };

        if (status && !allowedTransitions[order.status].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: `Cannot transition from ${order.status} to ${status}` 
            });
        }

        order.status = status || order.status;
        const updatedOrder = await order.save();

        res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Prevent deletion of active orders (preparing)
        if (order.status === 'preparing') {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete an order that is currently being prepared' 
            });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized to delete' });
        }

        order.isDeleted = true;
        order.deletedAt = Date.now();
        order.deletedBy = req.user._id;
        await order.save();

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        next(error);
    }
};
