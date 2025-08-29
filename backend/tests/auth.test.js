const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Authentication', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', userData.name);
      expect(res.body).toHaveProperty('email', userData.email);
      expect(res.body).toHaveProperty('role', 'member');
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123',
      });

      const userData = {
        name: 'Test User 2',
        email: 'test@example.com', // Same email as previous user
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123', // This will be hashed by the pre-save hook
      });
    });

    it('should login an existing user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', loginData.email);
      expect(res.body).toHaveProperty('role', 'member');
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
  });
});
