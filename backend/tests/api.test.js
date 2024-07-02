const request = require('supertest');
const app = require('../server');
const { getPool } = require('../config/database');

let authToken;
let userId;
let postId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword'
    });
  authToken = res.body.token;
  userId = res.body.userId;
  console.log('User registered with ID:', userId);
});

afterAll(async () => {
  const pool = getPool();
  await pool.query('DELETE FROM comments WHERE user_id = ?', [userId]);
  await pool.query('DELETE FROM posts WHERE user_id = ?', [userId]);
  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  await pool.end();
});

describe('User CRUD Operations', () => {
  test('Should get user profile', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  test('Should update user profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'updateduser',
        email: 'updated@example.com'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profile updated successfully');
  });

  test('Should delete user profile', async () => {
    const res = await request(app)
      .delete('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });
});

describe('Post CRUD Operations', () => {
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword'
      });
    authToken = res.body.token;
    userId = res.body.userId;
  });

  afterAll(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM comments WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM posts WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  });

  test('Should create a new post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Post',
        content: 'This is a test post content'
      });
    console.log('Create post response:', res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Post');
    postId = res.body.id;
  }, 10000); // Increase timeout to 10 seconds

  test('Should get all posts', async () => {
    const res = await request(app)
      .get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('Should get a specific post', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}`);
    console.log('Get post response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', postId);
  });

  test('Should update a specific post', async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated Post',
        content: 'This is updated content'
      });
    console.log('Update post response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Post updated successfully');
  }, 10000); // Increase timeout to 10 seconds

  test('Should delete a specific post', async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${authToken}`);
    console.log('Delete post response:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Post deleted successfully');
  }, 10000); // Increase timeout to 10 seconds
});
