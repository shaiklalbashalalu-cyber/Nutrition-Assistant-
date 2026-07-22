const Food = require('../models/Food');

// @desc    Get all foods or search foods by name
// @route   GET /api/foods
// @access  Private (or Public)
const getFoods = async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};
    
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const foods = await Food.find(query).limit(50);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a custom food item
// @route   POST /api/foods
// @access  Private
const createFood = async (req, res) => {
  try {
    const { name, calories, carbohydrates, proteins, fats, servingSize } = req.body;

    if (!name || calories === undefined || carbohydrates === undefined || proteins === undefined || fats === undefined) {
      return res.status(400).json({ message: 'Please add all food nutritional facts fields' });
    }

    // Check if food already exists
    const foodExists = await Food.findOne({ name });
    if (foodExists) {
      return res.status(400).json({ message: 'Food item with this name already exists' });
    }

    const food = await Food.create({
      name,
      calories,
      carbohydrates,
      proteins,
      fats,
      servingSize: servingSize || 100,
    });

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFoods,
  createFood,
};
