const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent user from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    // Log activity
    await ActivityLog.create({
      action: 'update',
      entityType: 'user',
      entityId: user._id,
      userId: req.user._id,
      changes: { role: user.role, newRole: role },
      metadata: { updatedBy: req.user.name }
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};