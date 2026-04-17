const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const MealType = require('../models/MealType');

dotenv.config({ path: path.join(__dirname, '../.env') });

const normalizeData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected. Initiating normalization...');

        // Build mappings
        const categories = await Category.find();
        const mealtypes = await MealType.find();

        const catMap = {};
        categories.forEach(c => catMap[c.name.toLowerCase()] = c._id);
        const mealMap = {};
        mealtypes.forEach(m => mealMap[m.name.toLowerCase()] = m._id);

        const foods = await FoodItem.find();
        console.log(`Found ${foods.length} food items to process.\n----------------------------------------`);

        for (let food of foods) {
            const textToMatch = `${food.name} ${food.description}`.toLowerCase().trim();

            // 1. Determine Category
            let assignCat = 'specials';
            if (/(chicken|mutton|fish|prawn|egg)/i.test(textToMatch)) {
                assignCat = 'non-veg';
            } else if (/(paneer|veg|mushroom)/i.test(textToMatch)) {
                assignCat = 'veg';
            }

            // 2. Determine Meal Type (Ordered by Priority)
            let assignMeal = 'lunch'; // Fallback Default

            // Step 1 -> Snacks
            if (/(starter|fry|pakodi|roll|noodles|manchuria|65|kebab)/i.test(textToMatch)) {
                assignMeal = 'snacks';
            }
            // Step 2 -> Breakfast
            else if (/(idly|dosa|poori|upma|pongal|breakfast)/i.test(textToMatch)) {
                assignMeal = 'breakfast';
            }
            // Step 3 -> Dinner
            else if (/(roti|naan|chapathi|fried rice|pulao|pulav)/i.test(textToMatch)) {
                assignMeal = 'dinner';
            }
            // Step 4 -> Lunch
            else if (/(meals|curry|biryani|rice)/i.test(textToMatch)) {
                assignMeal = 'lunch'; // Keeps fallback explicitly mapped
            }

            // Lookup IDs
            const catId = catMap[assignCat];
            const mealId = mealMap[assignMeal];

            if (!catId || !mealId) {
                console.log(`⚠️  Warning: Missing Reference Map -> Cat[${assignCat}], Meal[${assignMeal}] for [${food.name}]`);
                continue;
            }

            // Optional: Skip if identical. But we're dynamically correcting all just in case.
            // Some existing ObjectIds might match stringified. It's safer to firmly $set.
            await FoodItem.updateOne(
                { _id: food._id },
                { $set: { category: catId, mealType: mealId } }
            );

            console.log(`[NORMALIZE] ${food.name} `);
            console.log(`   -> Category : ${assignCat.toUpperCase()}`);
            console.log(`   -> MealType : ${assignMeal.toUpperCase()}\n`);
        }

        console.log('✅ All food items natively normalized & updated to Object IDs successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Migration Error: ${error}`);
        process.exit(1);
    }
};

normalizeData();
