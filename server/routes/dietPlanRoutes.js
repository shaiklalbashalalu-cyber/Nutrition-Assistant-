const express = require('express');
const router = express.Router();
const {
  createDietPlan,
  getActiveDietPlan,
  getProgressReport,
} = require('../controllers/dietPlanController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createDietPlan);

router.get('/active', protect, getActiveDietPlan);
router.get('/progress', protect, getProgressReport);

module.exports = router;
