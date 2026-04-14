const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const FoodItem = require('../models/FoodItem');

// Load environment variables properly relative to script or cwd
dotenv.config({ path: path.join(__dirname, '../.env') });

// Duplicated from frontend logic to maintain image aesthetic consistency
const getDishImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes('biryani') || n.includes('pulao') || n.includes('rice') || n.includes('sangati')) return '/assets/paneer-biryani.png';
    if (n.includes('mutton')) return '/assets/gongura-mutton.png';
    if (n.includes('prawn') || n.includes('royya') || n.includes('royalu')) return '/assets/prawns-fry.png';
    if (n.includes('fish') || n.includes('chepala') || n.includes('korameenu') || n.includes('chapa') || n.includes('apollo')) return '/assets/fish-pulusu.png';
    if (n.includes('chicken') || n.includes('kodi') || n.includes('natukodi')) return '/assets/chicken-vepudu.png';
    if (n.includes('paneer')) return '/assets/paneer-biryani.png';
    if (n.includes('veg') || n.includes('paneer') || n.includes('corn') || n.includes('dal') || n.includes('tomato') || n.includes('mushroom')) return '/assets/andhra-thali.png';
    return '/assets/shrimp-curry.png'; // Default fallback
};

// 1. Separate Extraction Logic
const extractData = () => {
    const tsFilePath = path.join(__dirname, '../../src/data/menu.ts');
    let fileContent = fs.readFileSync(tsFilePath, 'utf8');
    
    // Strip the TypeScript export to isolate the raw Object string
    fileContent = fileContent.replace('export const menuData = ', '').trim();
    if (fileContent.endsWith(';')) fileContent = fileContent.slice(0, -1);

    // Safely evaluate the plain object structure into a JavaScript object
    let menuData;
    eval(`menuData = ${fileContent}`); 

    const extractedFoods = [];

    for (const [category, items] of Object.entries(menuData)) {
        for (const item of items) {
            // Price parsing: frontend has symbols like "₹259" or "₹259 (Reg) | ₹459 (Handi)"
            // The DB schema specifies Price as Number, so we'll snag the base integer price
            let numericPrice = 0;
            const priceMatch = item.price.match(/\d+/);
            if (priceMatch) {
                numericPrice = parseInt(priceMatch[0]);
            }

            extractedFoods.push({
                name: item.name,
                description: item.description || 'Authentic and traditional regional recipe.',
                price: numericPrice,
                category: category,
                image: getDishImage(item.name),
                available: true
            });
        }
    }

    console.log(`✅ Food items extracted: ${extractedFoods.length} discrete items found in frontend menu.ts`);
    return extractedFoods;
};

// 2. Separate DB Insertion Logic
const syncFoodItems = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const foods = extractData();
        let inserted = 0;
        let updated = 0;

        for (const food of foods) {
            // Upsert (update if exists, insert if not) based on name to prevent duplicates
            const result = await FoodItem.updateOne(
                { name: food.name },
                { $set: food },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                inserted++;
            } else if (result.modifiedCount > 0) {
                updated++;
            }
        }

        console.log(`✅ Data inserted successfully. (Inserted: ${inserted}, Updated: ${updated})`);
        process.exit();
    } catch (error) {
        console.error(`❌ Error syncing food items: ${error.message}`);
        process.exit(1);
    }
};

// Run execution
syncFoodItems();
