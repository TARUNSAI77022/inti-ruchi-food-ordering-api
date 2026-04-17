const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const FoodItem = require('../models/FoodItem');
const Category = require('../models/Category');
const MealType = require('../models/MealType');

const newItems = [
    // BREAKFAST (TIFFINS)
    { name: "Idli", description: "Steamed rice cakes served with chutney and sambar", price: 120, category: "Veg", mealType: "Breakfast" },
    { name: "Plain Dosa", description: "Crispy rice crepe served with chutney", price: 100, category: "Veg", mealType: "Breakfast" },
    { name: "Masala Dosa", description: "Crispy dosa filled with spiced potato masala", price: 150, category: "Veg", mealType: "Breakfast" },
    { name: "Onion Dosa", description: "Dosa topped with finely chopped onions", price: 140, category: "Veg", mealType: "Breakfast" },
    { name: "Pongal", description: "South Indian comfort food made with rice and moong dal", price: 130, category: "Veg", mealType: "Breakfast" },
    { name: "Upma", description: "Savory semolina porridge with vegetables", price: 110, category: "Veg", mealType: "Breakfast" },
    { name: "Poori with Curry", description: "Fluffy deep fried bread served with potato curry", price: 160, category: "Veg", mealType: "Breakfast" },
    { name: "Medu Vada", description: "Deep fried savory lentil donuts", price: 120, category: "Veg", mealType: "Breakfast" },
    { name: "Rava Dosa", description: "Crispy dosa made with semolina and rice flour", price: 180, category: "Specials", mealType: "Breakfast" },
    { name: "Pesarattu", description: "Moong dal crepe served with ginger chutney", price: 170, category: "Specials", mealType: "Breakfast" },

    // LUNCH (MEALS)
    { name: "Veg Meals", description: "Traditional South Indian vegetarian platter", price: 250, category: "Veg", mealType: "Lunch" },
    { name: "Mini Meals", description: "Quick vegetarian meal with essential items", price: 180, category: "Veg", mealType: "Lunch" },
    { name: "Sambar Rice", description: "Rice mixed with flavorful sambar and ghee", price: 140, category: "Veg", mealType: "Lunch" },
    { name: "Curd Rice", description: "Creamy yogurt rice tempered with mustard seeds", price: 130, category: "Veg", mealType: "Lunch" },
    { name: "Lemon Rice", description: "Tangy rice flavored with lemon and turmeric", price: 140, category: "Veg", mealType: "Lunch" },
    { name: "Tomato Rice", description: "Spicy and tangy rice cooked with tomatoes", price: 140, category: "Veg", mealType: "Lunch" },
    { name: "Chicken Meals", description: "Full meal served with spicy chicken curry", price: 350, category: "Non-Veg", mealType: "Lunch" },
    { name: "Mutton Curry Rice", description: "Steamed rice served with tender mutton curry", price: 390, category: "Non-Veg", mealType: "Lunch" },
    { name: "Fish Curry Meals", description: "Regional fish curry served with steamed rice", price: 370, category: "Non-Veg", mealType: "Lunch" },
    { name: "Egg Curry Rice", description: "Spiced egg curry served with steamed rice", price: 220, category: "Non-Veg", mealType: "Lunch" },
    { name: "Andhra Meals", description: "Authentic spicy Andhra style full meal", price: 320, category: "Specials", mealType: "Lunch" },

    // SNACKS
    { name: "Gobi Manchurian", description: "Crispy cauliflower florets in spicy sauce", price: 200, category: "Veg", mealType: "Snacks" },
    { name: "Paneer 65", description: "Spicy deep-fried paneer cubes", price: 240, category: "Veg", mealType: "Snacks" },
    { name: "Veg Pakoda", description: "Crispy mixed vegetable fritters", price: 150, category: "Veg", mealType: "Snacks" },
    { name: "Mirchi Bajji", description: "Deep fried chili fritters with tangy filling", price: 120, category: "Veg", mealType: "Snacks" },
    { name: "Chicken 65", description: "Classic spicy deep-fried chicken", price: 280, category: "Non-Veg", mealType: "Snacks" },
    { name: "Chicken Fry", description: "Andhra style spicy dry chicken fry", price: 270, category: "Non-Veg", mealType: "Snacks" },
    { name: "Fish Fry", description: "Crispy taw fried fish with regional spices", price: 300, category: "Non-Veg", mealType: "Snacks" },
    { name: "Egg Pakoda", description: "Battered and deep fried boiled eggs", price: 180, category: "Non-Veg", mealType: "Snacks" },
    { name: "Starter Platter", description: "Assorted mix of our best starters", price: 400, category: "Specials", mealType: "Snacks" },

    // DINNER
    { name: "Chapati with Veg Curry", description: "Soft whole wheat bread served with mixed veg curry", price: 180, category: "Veg", mealType: "Dinner" },
    { name: "Paneer Butter Masala", description: "Rich and creamy paneer curry", price: 260, category: "Veg", mealType: "Dinner" },
    { name: "Veg Fried Rice", description: "Aromatic rice stir-fried with vegetables", price: 220, category: "Veg", mealType: "Dinner" },
    { name: "Veg Noodles", description: "Stir-fried noodles with crisp vegetables", price: 210, category: "Veg", mealType: "Dinner" },
    { name: "Chicken Curry with Roti", description: "Spicy chicken curry served with whole wheat rotis", price: 320, category: "Non-Veg", mealType: "Dinner" },
    { name: "Butter Chicken", description: "Tender chicken in creamy tomato-based gravy", price: 340, category: "Non-Veg", mealType: "Dinner" },
    { name: "Egg Fried Rice", description: "Fried rice with scrambled eggs and spices", price: 230, category: "Non-Veg", mealType: "Dinner" },
    { name: "Chicken Fried Rice", description: "Classic chicken fried rice", price: 260, category: "Non-Veg", mealType: "Dinner" },
    { name: "Parotta with Chicken Curry", description: "Flaky parotta served with spicy chicken gravy", price: 280, category: "Specials", mealType: "Dinner" },
    { name: "Kothu Parotta", description: "Scrambled parotta with egg, meat, and spices", price: 250, category: "Specials", mealType: "Dinner" }
];

const addItems = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const categories = await Category.find();
        const mealTypes = await MealType.find();

        const catMap = {};
        categories.forEach(c => catMap[c.name.toLowerCase()] = c._id);
        const mealMap = {};
        mealTypes.forEach(m => mealMap[m.name.toLowerCase()] = m._id);

        console.log('Resolved mappings for categories and meal types.');

        let insertedCount = 0;
        let skippedCount = 0;

        for (const itemData of newItems) {
            const existingItem = await FoodItem.findOne({ 
                name: { $regex: new RegExp(`^${itemData.name}$`, 'i') } 
            });

            if (existingItem) {
                console.log(`Skipping existing item: ${itemData.name}`);
                skippedCount++;
                continue;
            }

            const catId = catMap[itemData.category.toLowerCase()];
            const mealId = mealMap[itemData.mealType.toLowerCase()];

            if (!catId || !mealId) {
                console.error(`Missing reference for ${itemData.name}: Cat[${itemData.category}], Meal[${itemData.mealType}]`);
                continue;
            }

            await FoodItem.create({
                ...itemData,
                category: catId,
                mealType: mealId,
                imageUrl: "https://via.placeholder.com/300",
                available: true
            });

            console.log(`Inserted new item: ${itemData.name}`);
            insertedCount++;
        }

        console.log('----------------------------------------');
        console.log(`Success: ${insertedCount} items inserted.`);
        console.log(`Skipped: ${skippedCount} existing items.`);
        process.exit(0);
    } catch (err) {
        console.error('Operation failed:', err);
        process.exit(1);
    }
};

addItems();
