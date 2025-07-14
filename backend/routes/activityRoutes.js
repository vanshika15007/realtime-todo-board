const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getRecentActivities, smartAssign } = require('../controllers/activityController');

// Get recent activities
router.get('/', auth, getRecentActivities);

// Smart assign task
router.post('/smart-assign/:taskId', auth, smartAssign);

module.exports = router; 