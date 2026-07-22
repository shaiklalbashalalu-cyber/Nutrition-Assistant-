/**
 * Nutrition Functions Module
 * Calculates BMR, TDEE, target calories and macronutrients based on user profile and goals.
 */

const calculateNutritionTargets = (user, goal) => {
  const { weight, height, age, gender, activityLevel } = user;

  // 1. Calculate Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
  let bmr = 0;
  if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // default to male or other (which uses male equation as baseline)
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // 2. Calculate Total Daily Energy Expenditure (TDEE) based on activity level
  let multiplier = 1.2; // sedentary
  switch (activityLevel) {
    case 'lightly_active':
      multiplier = 1.375;
      break;
    case 'moderately_active':
      multiplier = 1.55;
      break;
    case 'very_active':
      multiplier = 1.725;
      break;
    case 'extra_active':
      multiplier = 1.9;
      break;
    default:
      multiplier = 1.2;
  }

  const tdee = Math.round(bmr * multiplier);

  // 3. Adjust Calories based on Goal
  let targetCalories = tdee;
  if (goal === 'weight_loss') {
    targetCalories = Math.max(1200, tdee - 500); // safety floor of 1200 kcal
  } else if (goal === 'muscle_gain') {
    targetCalories = tdee + 350;
  }

  // 4. Calculate Macronutrients distribution
  // weight_loss: 35% carbs, 35% protein, 30% fat
  // maintenance: 50% carbs, 20% protein, 30% fat
  // muscle_gain: 45% carbs, 30% protein, 25% fat
  let carbsPct = 0.50;
  let proteinPct = 0.20;
  let fatPct = 0.30;

  if (goal === 'weight_loss') {
    carbsPct = 0.35;
    proteinPct = 0.35;
    fatPct = 0.30;
  } else if (goal === 'muscle_gain') {
    carbsPct = 0.45;
    proteinPct = 0.30;
    fatPct = 0.25;
  }

  // Carbs: 4 kcal/g, Protein: 4 kcal/g, Fat: 9 kcal/g
  const targetCarbs = Math.round((targetCalories * carbsPct) / 4);
  const targetProteins = Math.round((targetCalories * proteinPct) / 4);
  const targetFats = Math.round((targetCalories * fatPct) / 9);

  return {
    calories: targetCalories,
    carbohydrates: targetCarbs,
    proteins: targetProteins,
    fats: targetFats,
    bmr: Math.round(bmr),
    tdee,
  };
};

module.exports = { calculateNutritionTargets };
