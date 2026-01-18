const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Student routes
router.post('/', authorize('student'), requestController.createRequest);
router.get('/my-requests', authorize('student'), requestController.getMyRequests);

// Lab assistant routes
router.get('/pending', authorize('lab_assistant'), requestController.getPendingRequests);
router.put('/:id/approve', authorize('lab_assistant'), requestController.approveRequest);
router.put('/:id/reject', authorize('lab_assistant'), requestController.rejectRequest);

module.exports = router;
