const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.post('/', chatController.chat);
router.get('/suggestions', chatController.getSuggestions);

module.exports = router;
