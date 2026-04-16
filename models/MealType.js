const mongoose = require('mongoose');

const mealTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a meal type name'],
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MealType', mealTypeSchema);
