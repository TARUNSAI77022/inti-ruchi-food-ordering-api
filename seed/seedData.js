const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

dotenv.config({ path: '.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Clear existing data
        await User.deleteMany();
        await FoodItem.deleteMany();
        await Order.deleteMany();

        await User.create({
            name: 'Admin',
            email: 'admin@inti.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('✅ Data Seeded Successfully with Admin User');
        process.exit();
    } catch (error) {
        console.error(`❌ Error Seeding Data: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // Optional flush code
} else {
    seedData();
}
