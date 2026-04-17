const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a food name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a category']
    },
    mealType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MealType',
        required: [true, 'Please add a meal type']
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/300'
    },
    available: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
