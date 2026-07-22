const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('../models/Food');

// Load environment variables
dotenv.config();

const foods = [
  { name: 'Apple (1 Medium)', calories: 95, carbohydrates: 25, proteins: 0.5, fats: 0.3, servingSize: 182 },
  { name: 'Banana (1 Medium)', calories: 105, carbohydrates: 27, proteins: 1.3, fats: 0.4, servingSize: 118 },
  { name: 'Chicken Breast (Cooked, 100g)', calories: 165, carbohydrates: 0, proteins: 31, fats: 3.6, servingSize: 100 },
  { name: 'White Rice (Cooked, 100g)', calories: 130, carbohydrates: 28, proteins: 2.7, fats: 0.3, servingSize: 100 },
  { name: 'Brown Rice (Cooked, 100g)', calories: 111, carbohydrates: 23, proteins: 2.6, fats: 0.9, servingSize: 100 },
  { name: 'Whole Egg (Large, Boiled)', calories: 78, carbohydrates: 0.6, proteins: 6.3, fats: 5.3, servingSize: 50 },
  { name: 'Broccoli (Cooked, 100g)', calories: 35, carbohydrates: 7.2, proteins: 2.4, fats: 0.4, servingSize: 100 },
  { name: 'Salmon Filet (Cooked, 100g)', calories: 206, carbohydrates: 0, proteins: 22, fats: 12.4, servingSize: 100 },
  { name: 'Oatmeal (Cooked, 100g)', calories: 71, carbohydrates: 12, proteins: 2.5, fats: 1.4, servingSize: 100 },
  { name: 'Whole Milk (1 cup)', calories: 149, carbohydrates: 12, proteins: 8, fats: 8, servingSize: 244 },
  { name: 'Almonds (1 oz / 28g)', calories: 164, carbohydrates: 6.1, proteins: 6, fats: 14, servingSize: 28 },
  { name: 'Avocado (1 Medium)', calories: 240, carbohydrates: 12.7, proteins: 3, fats: 22, servingSize: 150 },
  { name: 'Greek Yogurt (Nonfat, 100g)', calories: 59, carbohydrates: 3.6, proteins: 10, fats: 0.4, servingSize: 100 },
  { name: 'Spinach (Raw, 100g)', calories: 23, carbohydrates: 3.6, proteins: 2.9, fats: 0.4, servingSize: 100 },
  { name: 'Sweet Potato (Baked, 100g)', calories: 90, carbohydrates: 20.7, proteins: 2, fats: 0.2, servingSize: 100 },
  { name: 'Olive Oil (1 tbsp)', calories: 119, carbohydrates: 0, proteins: 0, fats: 13.5, servingSize: 14 },
  { name: 'Whey Protein Powder (1 scoop)', calories: 120, carbohydrates: 3, proteins: 24, fats: 1.5, servingSize: 30 },
  { name: 'Peanut Butter (1 tbsp)', calories: 94, carbohydrates: 3.1, proteins: 4, fats: 8.1, servingSize: 16 },
  { name: 'Canned Tuna (In Water, 100g)', calories: 116, carbohydrates: 0, proteins: 26, fats: 0.8, servingSize: 100 },
  { name: 'Quinoa (Cooked, 100g)', calories: 120, carbohydrates: 21.3, proteins: 4.4, fats: 1.9, servingSize: 100 }
];

const dns = require('dns');

const seedFoods = async () => {
  const uri = process.env.MONGO_URI;
  if (uri && uri.startsWith('mongodb+srv')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('DNS server override failed, using default DNS:', dnsErr.message);
    }
  }

  try {
    await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/nutrition-assistant');
    console.log('Connected to database for seeding...');

    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing food database.');

    // Insert seeds
    await Food.insertMany(foods);
    console.log('Successfully seeded default food items!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedFoods();
