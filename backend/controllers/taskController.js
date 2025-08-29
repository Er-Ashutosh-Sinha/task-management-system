const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags, assignee } =
      req.body;

    // Create task
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      tags,
      assignee: assignee || req.user._id, // Default to creator if no assignee
      createdBy: req.user._id,
    });

    // Log activity
    await ActivityLog.create({
      action: 'create',
      entityType: 'task',
      entityId: task._id,
      userId: req.user._id,
      metadata: { title: task.title },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with pagination, filtering, and search
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};

    // Admins can see all tasks, members only their own
    if (req.user.role !== 'admin') {
      filter.$or = [{ createdBy: req.user._id }, { assignee: req.user._id }];
    }

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Add priority filter if provided
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Add assignee filter if provided
    if (req.query.assignee) {
      filter.assignee = req.query.assignee;
    }

    // Add search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Add due date filters
    if (req.query.dueDateFrom || req.query.dueDateTo) {
      filter.dueDate = {};
      if (req.query.dueDateFrom) {
        filter.dueDate.$gte = new Date(req.query.dueDateFrom);
      }
      if (req.query.dueDateTo) {
        filter.dueDate.$lte = new Date(req.query.dueDateTo);
      }
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[req.query.sortBy] = sortOrder;
    } else {
      // Default sort by createdAt descending
      sort = { createdAt: -1 };
    }

    // Get tasks with filter, sort, skip, and limit
    const tasks = await Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    const total = await Task.countDocuments(filter);
    res.json({
      tasks,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
      },
    });
  } catch (error) {
    console.error('Error in getTasks:', error); // Log the error
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is authorized to access this task (admin, creator, or assignee only)
    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user._id.toString() &&
      (!task.assignee ||
        task.assignee._id.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to access this task' });
    }
    // User is authorized, continue

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is authorized to update this task
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this task' });
    }

    // Store original values for activity log
    const originalValues = {
      title: task.title,
      status: task.status,
      priority: task.priority,
    };

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log activity
    const changes = {};
    if (originalValues.title !== updatedTask.title) {
      changes.title = { from: originalValues.title, to: updatedTask.title };
    }
    if (originalValues.status !== updatedTask.status) {
      changes.status = { from: originalValues.status, to: updatedTask.status };
    }
    if (originalValues.priority !== updatedTask.priority) {
      changes.priority = {
        from: originalValues.priority,
        to: updatedTask.priority,
      };
    }

    if (Object.keys(changes).length > 0) {
      await ActivityLog.create({
        action: 'update',
        entityType: 'task',
        entityId: updatedTask._id,
        userId: req.user._id,
        changes,
        metadata: { title: updatedTask.title },
      });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is authorized to delete this task
    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this task' });
    }

    // Log activity before deletion
    await ActivityLog.create({
      action: 'delete',
      entityType: 'task',
      entityId: task._id,
      userId: req.user._id,
      metadata: { title: task.title },
    });

    // Delete task
    await Task.findByIdAndDelete(task._id);

    res.json({ message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
