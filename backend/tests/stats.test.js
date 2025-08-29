const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Task = require('../models/Task');

describe('Stats', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await Task.deleteMany({});

    // Create a user
    const user = await User.create({
      name: 'Stats User',
      email: 'stats@example.com',
      password: 'password123',
      role: 'member',
    });

    userId = user._id;

    // Login user to get token
    const res = await request(app).post('/api/auth/login').send({
      email: 'stats@example.com',
      password: 'password123',
    });

    userToken = res.body.token;

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
      {
        title: 'Task 3',
        description: 'Third test task',
        priority: 'low',
        status: 'done',
        createdBy: userId,
      },
    ]);
  });

  describe('GET /api/stats/overview', () => {
    it('should get stats overview for the user', async () => {
      const res = await request(app)
        .get('/api/stats/overview')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('tasksByStatus');
      expect(res.body).toHaveProperty('tasksByPriority');
      expect(res.body).toHaveProperty('overdueTasks');
      expect(res.body).toHaveProperty('dueToday');
      expect(res.body).toHaveProperty('totalTasks');

      // Check that we have the expected counts
      expect(res.body.totalTasks).toBe(3);
    });
  });
});
