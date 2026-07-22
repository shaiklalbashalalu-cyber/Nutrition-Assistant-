const DietPlan = require('../models/DietPlan');
const NutritionFact = require('../models/NutritionFact');
const Meal = require('../models/Meal');
const { calculateNutritionTargets } = require('../utils/nutritionFunctions');

// @desc    Create a new diet plan
// @route   POST /api/diet-plans
// @access  Private
const createDietPlan = async (req, res) => {
  try {
    const { name, goal, startDate, endDate } = req.body;

    if (!name || !goal || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide name, goal, startDate, and endDate' });
    }

    // Set any previous active plan to inactive
    await DietPlan.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });

    // Create the Diet Plan
    const dietPlan = await DietPlan.create({
      userId: req.user._id,
      name,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    });

    // Calculate targets using the Nutrition Functions module
    const targets = calculateNutritionTargets(req.user, goal);

    // Save target NutritionFact linked to this diet plan
    const targetFact = await NutritionFact.create({
      dietPlanId: dietPlan._id,
      calories: targets.calories,
      carbohydrates: targets.carbohydrates,
      proteins: targets.proteins,
      fats: targets.fats,
    });

    res.status(201).json({
      ...dietPlan.toObject(),
      targets: targetFact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get the active diet plan
// @route   GET /api/diet-plans/active
// @access  Private
const getActiveDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ userId: req.user._id, isActive: true });

    if (!dietPlan) {
      return res.json(null);
    }

    // Find its targets from NutritionFact
    const targets = await NutritionFact.findOne({ dietPlanId: dietPlan._id });

    res.json({
      ...dietPlan.toObject(),
      targets: targets || {
        calories: 2000,
        carbohydrates: 250,
        proteins: 100,
        fats: 65,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get progress report (adherence analysis)
// @route   GET /api/diet-plans/progress
// @access  Private
const getProgressReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate query parameters (YYYY-MM-DD)' });
    }

    // Find active or recent diet plan
    const dietPlan = await DietPlan.findOne({ userId: req.user._id, isActive: true });
    
    let targets = null;
    if (dietPlan) {
      targets = await NutritionFact.findOne({ dietPlanId: dietPlan._id });
    }

    // Fallback default targets if none exists
    if (!targets) {
      // Calculate based on current user stats and maintenance goal
      const calculated = calculateNutritionTargets(req.user, 'maintenance');
      targets = {
        calories: calculated.calories,
        carbohydrates: calculated.carbohydrates,
        proteins: calculated.proteins,
        fats: calculated.fats,
      };
    }

    // Find all meals in the date range
    const meals = await Meal.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    const mealIds = meals.map(m => m._id);
    const mealFacts = await NutritionFact.find({ mealId: { $in: mealIds } });

    // Group nutrition by date
    const dailyIntake = {};
    
    // Initialize empty days in date range
    let curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0];
      dailyIntake[dateStr] = { calories: 0, carbohydrates: 0, proteins: 0, fats: 0, logged: false };
      curr.setDate(curr.getDate() + 1);
    }

    // Sum up the logged items by date
    meals.forEach((meal) => {
      const fact = mealFacts.find(f => f.mealId.toString() === meal._id.toString());
      if (fact) {
        const dateStr = meal.date;
        if (!dailyIntake[dateStr]) {
          dailyIntake[dateStr] = { calories: 0, carbohydrates: 0, proteins: 0, fats: 0, logged: false };
        }
        dailyIntake[dateStr].calories += fact.calories;
        dailyIntake[dateStr].carbohydrates += fact.carbohydrates;
        dailyIntake[dateStr].proteins += fact.proteins;
        dailyIntake[dateStr].fats += fact.fats;
        dailyIntake[dateStr].logged = true;
      }
    });

    res.json({
      targets,
      dailyIntake,
      dietPlanInfo: dietPlan || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDietPlan,
  getActiveDietPlan,
  getProgressReport,
};
