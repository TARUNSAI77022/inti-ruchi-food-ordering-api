const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const MealType = require('../models/MealType');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Total count
        const totalCount = await FoodItem.countDocuments();
        console.log(`Total food items in collection: ${totalCount}`);

        // 2. Recent items
        console.log('\n--- 20 Most Recently Added Items ---');
        const recentItems = await FoodItem.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('category', 'name')
            .populate('mealType', 'name')
            .lean();
        
        recentItems.forEach(item => {
            console.log(`- ${item.name} | Cat: ${item.category?.name} | Meal: ${item.mealType?.name} | Created: ${item.createdAt}`);
        });

        // 3. Check specific items
        console.log('\n--- Checking Specific Items ---');
        const checkItems = ["Idli", "Masala Dosa", "Chicken Meals", "Parotta with Chicken Curry"];
        for (const name of checkItems) {
            const item = await FoodItem.findOne({ name });
            console.log(`${name}: ${item ? 'Exists ✅' : 'NOT FOUND ❌'}`);
        }

        // 4. Category & MealType mapping check
        console.log('\n--- Sample Data (ObjectId Verification) ---');
        const sampleDocs = await FoodItem.find().sort({ createdAt: -1 }).limit(3).lean();
        sampleDocs.forEach(item => {
            console.log(`Item: ${item.name}`);
            console.log(`  category type: ${typeof item.category} (${item.category})`);
            console.log(`  mealType type: ${typeof item.mealType} (${item.mealType})`);
            console.log(`  Full object: ${JSON.stringify(item, null, 2)}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verify();
