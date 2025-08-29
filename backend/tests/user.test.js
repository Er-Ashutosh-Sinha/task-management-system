const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

describe('Users', () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create an admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    adminId = admin._id;

    // Create a regular user
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'member',
    });

    userId = user._id;

    // Login users to get tokens
    let res = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });

    adminToken = res.body.token;

    res = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });

    userToken = res.body.token;
  });

  describe('GET /api/users', () => {
    it('should get all users when requested by admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      // Check that passwords are not included
      res.body.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should not allow non-admin users to get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      // Updated expectation to match middleware message
      expect(res.body).toHaveProperty(
        'message',
        'User not authorized to access this route'
      );
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should update user role when requested by admin', async () => {
      const res = await request(app)
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(res.body).toHaveProperty('_id', userId.toString());
      expect(res.body).toHaveProperty('role', 'admin');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not allow non-admin users to update user roles', async () => {
      const res = await request(app)
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);

      // Updated expectation to match middleware message
      expect(res.body).toHaveProperty(
        'message',
        'User not authorized to access this route'
      );
    });

    it('should not allow user to change their own role', async () => {
      const res = await request(app)
        .patch(`/api/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'member' })
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Cannot change your own role');
    });

    it('should return 404 when trying to update role of non-existent user', async () => {
      const fakeId = '5f9d88e1f1b6c42d8c8b4567'; // Valid ObjectId format

      const res = await request(app)
        .patch(`/api/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(404);

      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should create activity log when updating user role', async () => {
      await request(app)
        .patch(`/api/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      // Check that activity log was created
      const logs = await ActivityLog.find({
        entityType: 'user',
        entityId: userId,
      });

      expect(logs.length).toBe(1);
      expect(logs[0]).toHaveProperty('action', 'update');
      // Use .toString() for ObjectId comparison
      expect(logs[0].userId.toString()).toBe(adminId.toString());
      expect(logs[0].changes.role).toBe('member');
      expect(logs[0].changes.newRole).toBe('admin');
    });
  });
});
