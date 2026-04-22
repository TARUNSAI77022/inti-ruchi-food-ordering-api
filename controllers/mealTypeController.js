const mongoose = require('mongoose');
const MealType = require('../models/MealType');

exports.createMealType = async (req, res, next) => {
    try {
        const mealType = await MealType.create(req.body);
        res.status(201).json({ success: true, data: mealType });
    } catch (error) {
        next(error);
    }
};

exports.getMealTypes = async (req, res, next) => {
    try {
        const mealTypes = await MealType.find();
        res.status(200).json({ success: true, count: mealTypes.length, data: mealTypes });
    } catch (error) {
        next(error);
    }
};

exports.getMealType = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid ID format' });
        const mealType = await MealType.findById(req.params.id);
        if (!mealType) return res.status(404).json({ success: false, error: 'Meal Type not found' });
        res.status(200).json({ success: true, data: mealType });
    } catch (error) {
        next(error);
    }
};

exports.updateMealType = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid ID format' });
        const mealType = await MealType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!mealType) return res.status(404).json({ success: false, error: 'Meal Type not found' });
        res.status(200).json({ success: true, data: mealType });
    } catch (error) {
        next(error);
    }
};

exports.deleteMealType = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid ID format' });
        const mealType = await MealType.findByIdAndDelete(req.params.id);
        if (!mealType) return res.status(404).json({ success: false, error: 'Meal Type not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
