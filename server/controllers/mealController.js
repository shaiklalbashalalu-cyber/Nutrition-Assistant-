const Meal = require('../models/Meal');
const Food = require('../models/Food');
const NutritionFact = require('../models/NutritionFact');

// Helper function to update NutritionFact for a meal
const updateMealNutritionFact = async (mealId) => {
  const meal = await Meal.findById(mealId).populate('items.food');
  if (!meal) {
    await NutritionFact.deleteOne({ mealId });
    return;
  }

  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProteins = 0;
  let totalFats = 0;

  meal.items.forEach((item) => {
    if (item.food) {
      // quantity is multiplier of the standard serving size (e.g. 1 unit = 100g)
      totalCalories += Math.round(item.food.calories * item.quantity);
      totalCarbs += Math.round(item.food.carbohydrates * item.quantity * 10) / 10;
      totalProteins += Math.round(item.food.proteins * item.quantity * 10) / 10;
      totalFats += Math.round(item.food.fats * item.quantity * 10) / 10;
    }
  });

  // Update or create NutritionFact for the meal
  await NutritionFact.findOneAndUpdate(
    { mealId: meal._id },
    {
      calories: totalCalories,
      carbohydrates: totalCarbs,
      proteins: totalProteins,
      fats: totalFats,
    },
    { upsert: true, new: true }
  );
};

// @desc    Get meals and nutrition facts for a specific date
// @route   GET /api/meals/daily
// @access  Private
const getDailyMeals = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: 'Please provide a date query parameter (YYYY-MM-DD)' });
    }

    const meals = await Meal.find({ userId: req.user._id, date }).populate('items.food');

    // Retrieve corresponding NutritionFacts for these meals
    const mealIds = meals.map(m => m._id);
    const facts = await NutritionFact.find({ mealId: { $in: mealIds } });

    // Combine meals with their nutrition facts
    const mealsWithFacts = meals.map((meal) => {
      const fact = facts.find((f) => f.mealId.toString() === meal._id.toString()) || {
        calories: 0,
        carbohydrates: 0,
        proteins: 0,
        fats: 0,
      };
      return {
        ...meal.toObject(),
        nutritionFact: fact,
      };
    });

    res.json(mealsWithFacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log food to a meal (Create meal or append if mealType exists)
// @route   POST /api/meals
// @access  Private
const logMealItem = async (req, res) => {
  try {
    const { date, mealType, foodId, quantity } = req.body;

    if (!date || !mealType || !foodId || !quantity) {
      return res.status(400).json({ message: 'Please provide date, mealType, foodId, and quantity' });
    }

    // Verify food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Find if meal of this type already exists for the user on this date
    let meal = await Meal.findOne({ userId: req.user._id, date, mealType });

    if (meal) {
      // Check if food already in meal, if so update quantity, else push
      const itemIndex = meal.items.findIndex(item => item.food.toString() === foodId);
      if (itemIndex > -1) {
        meal.items[itemIndex].quantity += Number(quantity);
      } else {
        meal.items.push({ food: foodId, quantity: Number(quantity) });
      }
      await meal.save();
    } else {
      // Create new meal log
      meal = await Meal.create({
        userId: req.user._id,
        date,
        mealType,
        items: [{ food: foodId, quantity: Number(quantity) }],
      });
    }

    // Recalculate NutritionFact
    await updateMealNutritionFact(meal._id);

    // Return updated meal populated
    const populatedMeal = await Meal.findById(meal._id).populate('items.food');
    const nutritionFact = await NutritionFact.findOne({ mealId: meal._id });

    res.status(201).json({
      ...populatedMeal.toObject(),
      nutritionFact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove food item from meal
// @route   DELETE /api/meals/:mealId/item/:itemId
// @access  Private
const removeMealItem = async (req, res) => {
  try {
    const { mealId, itemId } = req.params;

    let meal = await Meal.findOne({ _id: mealId, userId: req.user._id });
    if (!meal) {
      return res.status(404).json({ message: 'Meal log not found' });
    }

    // Filter out item
    meal.items = meal.items.filter(item => item._id.toString() !== itemId);

    if (meal.items.length === 0) {
      // Delete empty meal and its NutritionFact
      await Meal.deleteOne({ _id: mealId });
      await NutritionFact.deleteOne({ mealId });
      return res.json({ message: 'Meal log and empty nutrition facts removed', mealDeleted: true });
    } else {
      await meal.save();
      await updateMealNutritionFact(meal._id);
      
      const populatedMeal = await Meal.findById(meal._id).populate('items.food');
      const nutritionFact = await NutritionFact.findOne({ mealId: meal._id });
      
      return res.json({
        ...populatedMeal.toObject(),
        nutritionFact,
        mealDeleted: false,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyMeals,
  logMealItem,
  removeMealItem,
};
