const FoodItem = require('../models/FoodItem');

// @desc    Get all unique categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await FoodItem.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};
