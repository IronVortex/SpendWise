const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/monthly-comparison', analyticsController.getMonthlyComparison);
router.get('/alerts', analyticsController.getAlerts);

module.exports = router;
