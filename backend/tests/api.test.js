const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
    // Test pour la route d'inscription
    it('POST http://localhost:5000/api/auth/register should create a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    // Test pour la route de connexion
    it('POST /api/auth/login should login a user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    // Test pour récupérer les posts
    it('GET /api/posts should return posts', async () => {
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    });
});
