const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// All analytics routes require authentication
router.post('/generate-summary', auth, analyticsController.generateAISummary);
router.get('/data', auth, analyticsController.getAnalyticsData);

module.exports = router;
