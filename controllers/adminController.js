const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
    try {
        const totalFoods = await FoodItem.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            totalFoods,
            totalOrders,
            totalUsers,
            pendingOrders
        });
    } catch (error) {
        next(error);
    }
};
