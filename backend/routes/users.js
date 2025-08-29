const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, updateUserRole } = require('../controllers/userController');

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers);
router.route('/:id/role').patch(updateUserRole);

module.exports = router;