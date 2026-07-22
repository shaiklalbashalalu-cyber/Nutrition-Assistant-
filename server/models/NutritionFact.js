const mongoose = require('mongoose');

const nutritionFactSchema = new mongoose.Schema(
  {
    mealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      default: null,
    },
    dietPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan',
      default: null,
    },
    calories: {
      type: Number,
      required: true,
      default: 0,
    },
    carbohydrates: {
      type: Number,
      required: true,
      default: 0,
    },
    proteins: {
      type: Number,
      required: true,
      default: 0,
    },
    fats: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up by meal or diet plan
nutritionFactSchema.index({ mealId: 1 });
nutritionFactSchema.index({ dietPlanId: 1 });

module.exports = mongoose.model('NutritionFact', nutritionFactSchema);
