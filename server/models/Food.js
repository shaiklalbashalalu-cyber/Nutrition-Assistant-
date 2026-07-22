const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a food name'],
      unique: true,
      trim: true,
    },
    calories: {
      type: Number,
      required: [true, 'Please add calories in kcal'],
    },
    carbohydrates: {
      type: Number,
      required: [true, 'Please add carbohydrates in grams'],
    },
    proteins: {
      type: Number,
      required: [true, 'Please add proteins in grams'],
    },
    fats: {
      type: Number,
      required: [true, 'Please add fats in grams'],
    },
    servingSize: {
      type: Number,
      default: 100, // standard 100g or 1 serving
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Food', foodSchema);
