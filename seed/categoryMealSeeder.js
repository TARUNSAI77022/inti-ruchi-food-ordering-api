const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const MealType = require('../models/MealType');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const categories = [
    { name: 'Veg', description: 'Pure vegetarian dishes' },
    { name: 'Non-Veg', description: 'Non-vegetarian specialties' },
    { name: 'Specials', description: 'Chef special items' }
];

const mealTypes = [
    { name: 'Breakfast' },
    { name: 'Lunch' },
    { name: 'Dinner' },
    { name: 'Snacks' }
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Seeding Categories...');
        for (const cat of categories) {
            await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true, setDefaultsOnInsert: true });
        }

        console.log('Seeding Meal Types...');
        for (const meal of mealTypes) {
            await MealType.findOneAndUpdate({ name: meal.name }, meal, { upsert: true, new: true, setDefaultsOnInsert: true });
        }

        console.log('✅ Categories and Meal Types Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error(`❌ Error importing data: ${error.message}`);
        process.exit(1);
    }
};

importData();
