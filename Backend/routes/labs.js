const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', labController.getAllLabs);
router.get('/:id', labController.getLabById);
router.get('/:id/materials', labController.getLabMaterials);

// Lab assistant only
router.post('/', authorize('lab_assistant'), labController.createLab);

module.exports = router;
