const { Joi, celebrate } = require('celebrate');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'member').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Task validation schemas
const taskSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  assignee: Joi.string().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  dueDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  assignee: Joi.string().optional(),
});

// Pagination and filtering schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  search: Joi.string().optional(),
});

module.exports = {
  registerValidation: celebrate({ body: registerSchema }),
  loginValidation: celebrate({ body: loginSchema }),
  taskValidation: celebrate({ body: taskSchema }),
  updateTaskValidation: celebrate({ body: updateTaskSchema }),
  paginationValidation: celebrate({ query: paginationSchema }),
};
