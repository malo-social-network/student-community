const request = require('supertest');
const app = require('../server');
const { getPool, initializeDatabase} = require('../config/database');

let authToken;
let userId;
let postId;

beforeAll(async () => {
  await initializeDatabase();

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
  // Nous n'avons plus besoin de fermer le serveur manuellement

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
        expect(res.body.user).toHaveProperty('username', 'updateduser');
        expect(res.body.user).toHaveProperty('email', 'updated@example.com');
    });
});

describe('Post CRUD Operations', () => {
  test('Should create a new post', async () => {
    const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content'
        });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Post');
    postId = res.body.id;
  });

  test('Should get all posts', async () => {
    const res = await request(app)
        .get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('Should get a specific post', async () => {
    const res = await request(app)
        .get(`/api/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', postId);
  });
});
