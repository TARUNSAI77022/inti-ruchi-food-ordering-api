const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const MealType = require('../models/MealType');

const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

const formatFoodResponse = (food) => {
    return {
        _id: food._id,
        name: food.name,
        description: food.description,
        price: food.price,
        imageUrl: food.imageUrl,
        available: food.available,
        createdAt: food.createdAt,
        updatedAt: food.updatedAt,
        category: food.category,
        mealType: food.mealType,
        categoryName: food.category?.name || null,
        mealTypeName: food.mealType?.name || null
    };
};

const resolveFilter = async (model, input) => {
    if (!input) return null;

    let itemsToResolve = [];
    let isQueryObject = false;
    let queryKey = '';

    if (typeof input === 'object' && !Array.isArray(input)) {
        const key = Object.keys(input)[0];
        if (['$in', '$nin', '$all'].includes(key)) {
            itemsToResolve = Array.isArray(input[key]) ? input[key] : [input[key]];
            isQueryObject = true;
            queryKey = key;
        } else {
            return null;
        }
    } else {
        itemsToResolve = Array.isArray(input) ? input : [input];
    }

    const resolvedIds = [];
    for (const item of itemsToResolve) {
        if (isObjectId(item)) {
            const exists = await model.findById(item);
            if (exists) resolvedIds.push(exists._id);
        } else {
            const exists = await model.findOne({ name: item });
            if (exists) resolvedIds.push(exists._id);
        }
    }

    if (resolvedIds.length === 0) return null;

    if (isQueryObject) {
        return { [queryKey]: resolvedIds };
    }

    return resolvedIds.length === 1 ? resolvedIds[0] : { $in: resolvedIds };
};

const resolveCategoryFilter = async (input) => resolveFilter(Category, input);
const resolveMealTypeFilter = async (input) => resolveFilter(MealType, input);

// @desc    Get all food items
// @route   GET /api/foods
// @access  Public
exports.getFoods = async (req, res, next) => {
    try {
        let query = { available: true };

        if (req.query.category) {
            const resolved = await resolveCategoryFilter(req.query.category);
            if (!resolved) return res.status(404).json({ success: false, error: 'Category not found in query' });
            query.category = resolved;
        }

        if (req.query.mealType) {
            const resolved = await resolveMealTypeFilter(req.query.mealType);
            if (!resolved) return res.status(404).json({ success: false, error: 'MealType not found in query' });
            query.mealType = resolved;
        }

        const foods = await FoodItem.find(query)
            .populate('category', 'name')
            .populate('mealType', 'name')
            .lean();

        const formattedFoods = foods.map(formatFoodResponse);

        res.status(200).json({ success: true, count: formattedFoods.length, data: formattedFoods });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all food items (Admin only - includes unavailable)
// @route   GET /api/admin/foods
// @access  Private/Admin
exports.getAdminFoods = async (req, res, next) => {
    try {
        const foods = await FoodItem.find()
            .populate('category', 'name')
            .populate('mealType', 'name')
            .lean();

        const formattedFoods = foods.map(formatFoodResponse);

        res.status(200).json({ success: true, count: formattedFoods.length, data: formattedFoods });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single food item
// @route   GET /api/foods/:id
// @access  Public
exports.getFood = async (req, res, next) => {
    try {
        if (!isObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }

        const food = await FoodItem.findById(req.params.id)
            .populate('category', 'name')
            .populate('mealType', 'name')
            .lean();

        if (!food) {
            return res.status(404).json({ success: false, error: 'Food item not found' });
        }

        res.status(200).json({ success: true, data: formatFoodResponse(food) });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new food item
// @route   POST /api/foods
// @access  Private/Admin
exports.createFood = async (req, res, next) => {
    try {
        const { category, mealType } = req.body;

        if (category) {
            if (isObjectId(category)) {
                const cat = await Category.findById(category);
                if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
            } else {
                const cat = await Category.findOne({ name: category });
                if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
                req.body.category = cat._id;
            }
        }

        if (mealType) {
            if (isObjectId(mealType)) {
                const meal = await MealType.findById(mealType);
                if (!meal) return res.status(404).json({ success: false, error: 'MealType not found' });
            } else {
                const meal = await MealType.findOne({ name: mealType });
                if (!meal) return res.status(404).json({ success: false, error: 'MealType not found' });
                req.body.mealType = meal._id;
            }
        }

        if (!req.body.imageUrl) {
            req.body.imageUrl = 'https://via.placeholder.com/300';
        }

        let food = await FoodItem.create(req.body);
        food = await FoodItem.findById(food._id).populate('category', 'name').populate('mealType', 'name').lean();
        res.status(201).json({ success: true, data: formatFoodResponse(food) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFood = async (req, res, next) => {
    try {
        console.log(`[UPDATE FOOD API] Updating ID: ${req.params.id}`);
        console.log(`[UPDATE FOOD API] Request Body Payload:`, req.body);

        // Validate Food ID
        if (!isObjectId(req.params.id)) {
            console.log(`[UPDATE FOOD API] Invalid ObjectId: ${req.params.id}`);
            return res.status(400).json({ success: false, error: 'Invalid ID format' });
        }

        const { category, mealType } = req.body;

        if (category) {
            if (isObjectId(category)) {
                const cat = await Category.findById(category);
                if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
            } else {
                const cat = await Category.findOne({ name: category });
                if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
                req.body.category = cat._id;
            }
        }

        if (mealType) {
            if (isObjectId(mealType)) {
                const meal = await MealType.findById(mealType);
                if (!meal) return res.status(404).json({ success: false, error: 'MealType not found' });
            } else {
                const meal = await MealType.findOne({ name: mealType });
                if (!meal) return res.status(404).json({ success: false, error: 'MealType not found' });
                req.body.mealType = meal._id;
            }
        }

        let food = await FoodItem.findById(req.params.id);

        if (!food) {
            console.log(`[UPDATE FOOD API] Food item not found in DB`);
            return res.status(404).json({ success: false, error: 'Food item not found' });
        }

        food = await FoodItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('category', 'name').populate('mealType', 'name').lean();

        console.log(`[UPDATE FOOD API] Update successful`);
        res.status(200).json({ success: true, data: formatFoodResponse(food) });
    } catch (error) {
        console.error(`[UPDATE FOOD API] Internal Server Error:`, error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
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
