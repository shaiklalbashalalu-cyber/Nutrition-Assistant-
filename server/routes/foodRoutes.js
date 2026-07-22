const express = require('express');
const router = express.Router();
const { getFoods, createFood } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFoods)
  .post(protect, createFood);

module.exports = router;
