const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Tasks', () => {
  let userToken;
  let userId;
  let adminToken;
  let adminId;

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create a regular user
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'member',
    });

    userId = user._id;

    // Create an admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    adminId = admin._id;

    // Login users to get tokens
    let res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });

    userToken = res.body.token;

    res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });

    adminToken = res.body.token;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high',
        status: 'todo',
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(taskData)
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', taskData.title);
      expect(res.body).toHaveProperty('description', taskData.description);
      expect(res.body).toHaveProperty('priority', taskData.priority);
      expect(res.body).toHaveProperty('status', taskData.status);
      expect(res.body).toHaveProperty('createdBy', userId.toString());
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create some test tasks
      await Task.create([
        {
          title: 'Task 1',
          description: 'First test task',
          priority: 'high',
          status: 'todo',
          createdBy: userId,
        },
        {
          title: 'Task 2',
          description: 'Second test task',
          priority: 'medium',
          status: 'in-progress',
          createdBy: userId,
        },
      ]);
    });

    it('should get tasks for the logged in user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('tasks');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('tasks');
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.tasks[0]).toEqual(
        expect.objectContaining({
          status: 'todo',
        })
      );
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      // Create a task to update
      const task = await Task.create({
        title: 'Task to update',
        description: 'This task will be updated',
        priority: 'medium',
        status: 'todo',
        createdBy: userId,
      });

      taskId = task._id;
    });

    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in-progress',
      };

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body).toHaveProperty('title', updateData.title);
      expect(res.body).toHaveProperty('status', updateData.status);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      // Create a task to delete
      const task = await Task.create({
        title: 'Task to delete',
        description: 'This task will be deleted',
        priority: 'low',
        status: 'todo',
        createdBy: userId,
      });

      taskId = task._id;
    });

    it('should delete a task', async () => {
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
