const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStatsOverview } = require('../controllers/statsController');

// All routes are protected
router.use(protect);

router.route('/overview').get(getStatsOverview);

module.exports = router;
