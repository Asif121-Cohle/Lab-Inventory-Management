const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Check availability (any authenticated user)
router.get('/check-availability', scheduleController.checkAvailability);

// Professor routes
router.post('/', authorize('professor'), scheduleController.createSchedule);
router.get('/my-schedules', authorize('professor'), scheduleController.getMySchedules);
router.put('/:id', authorize('professor'), scheduleController.updateSchedule);
router.delete('/:id', authorize('professor'), scheduleController.cancelSchedule);

// Lab assistant can view all schedules
router.get('/', authorize('professor', 'lab_assistant'), scheduleController.getAllSchedules);

module.exports = router;
