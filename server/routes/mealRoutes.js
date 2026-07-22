const express = require('express');
const router = express.Router();
const {
  getDailyMeals,
  logMealItem,
  removeMealItem,
} = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDailyMeals)
  .post(protect, logMealItem);

router.route('/daily').get(protect, getDailyMeals);

router.delete('/:mealId/item/:itemId', protect, removeMealItem);

module.exports = router;
