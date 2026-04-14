const FoodItem = require('../models/FoodItem');

// @desc    Get all food items
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res, next) => {
    try {
        const foods = await FoodItem.find({ available: true });
        res.status(200).json({ success: true, count: foods.length, data: foods });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Admin
exports.createFood = async (req, res, next) => {
    try {
        const food = await FoodItem.create(req.body);
        res.status(201).json({ success: true, data: food });
    } catch (error) {
        next(error);
    }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res, next) => {
    try {
        let food = await FoodItem.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ success: false, error: 'Food item not found' });
        }

        food = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: food });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFood = async (req, res, next) => {
    try {
        const food = await FoodItem.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ success: false, error: 'Food item not found' });
        }

        await food.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
