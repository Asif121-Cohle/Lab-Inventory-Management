const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/', materialController.getAllMaterials);

// Lab assistant only - must be before /:id to avoid conflicts
router.post('/search', materialController.aiSearchMaterials);
router.post('/categorize', authorize('lab_assistant'), materialController.categorizeMaterialHandler);
router.post('/', authorize('lab_assistant'), materialController.addMaterial);
router.put('/:id', authorize('lab_assistant'), materialController.updateMaterial);
router.delete('/:id', authorize('lab_assistant'), materialController.deleteMaterial);

// Must be last due to :id parameter
router.get('/:id', materialController.getMaterialById);

module.exports = router;
