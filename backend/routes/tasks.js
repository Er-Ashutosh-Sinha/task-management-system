const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { taskValidation, updateTaskValidation, paginationValidation } = require('../middleware/validation');
const { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');

// All routes are protected
router.use(protect);

router.route('/')
  .post(taskValidation, createTask)
  .get(paginationValidation, getTasks);

router.route('/:id')
  .get(getTaskById)
  .put(updateTaskValidation, updateTask)
  .delete(deleteTask);

module.exports = router;