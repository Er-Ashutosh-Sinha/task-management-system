const Task = require('../models/Task');

// @desc    Get stats overview
// @route   GET /api/stats/overview
// @access  Private
const getStatsOverview = async (req, res, next) => {
  try {
    // Build filter for user-specific data
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.$or = [{ createdBy: req.user._id }, { assignee: req.user._id }];
    }

    // Get total tasks count by status
    const statusCounts = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to object for easier access
    const statusCountsObj = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get tasks count by priority
    const priorityCounts = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert to object for easier access
    const priorityCountsObj = priorityCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    });

    // Get tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await Task.countDocuments({
      ...filter,
      dueDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: { $ne: 'done' },
    });

    res.json({
      tasksByStatus: {
        todo: statusCountsObj.todo || 0,
        'in-progress': statusCountsObj['in-progress'] || 0,
        done: statusCountsObj.done || 0,
      },
      tasksByPriority: {
        low: priorityCountsObj.low || 0,
        medium: priorityCountsObj.medium || 0,
        high: priorityCountsObj.high || 0,
      },
      overdueTasks,
      dueToday,
      totalTasks:
        (statusCountsObj.todo || 0) +
        (statusCountsObj['in-progress'] || 0) +
        (statusCountsObj.done || 0),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatsOverview,
};
