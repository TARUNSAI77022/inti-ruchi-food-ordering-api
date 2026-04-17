const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const migrate = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('fooditems');
        const foods = await collection.find({}).toArray();

        console.log(`Found ${foods.length} items to check.`);

        const placeholder = "https://via.placeholder.com/300";

        for (const food of foods) {
            let initialUrl = food.imageUrl || food.image;
            let finalUrl = initialUrl;
            let source = food.imageUrl ? 'imageUrl' : (food.image ? 'image' : 'none');

            const isValid = (url) => {
                if (!url || typeof url !== 'string') return false;
                if (url === 'no-photo.jpg') return false;
                if (url.startsWith('/assets/')) return true;
                if (url.startsWith('http://') || url.startsWith('https://')) return true;
                return false;
            };

            if (!isValid(finalUrl)) {
                console.log(`Item "${food.name}": Invalid URL "${finalUrl}" from ${source}. Resetting to placeholder.`);
                finalUrl = placeholder;
            } else {
                console.log(`Item "${food.name}": Keeping URL "${finalUrl}" from ${source}.`);
            }

            await collection.updateOne(
                { _id: food._id },
                {
                    $set: { imageUrl: finalUrl },
                    $unset: { image: "" }
                }
            );
        }

        console.log('Migration successfully completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
