import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { login, getPosts } from './api';

const mock = new MockAdapter(axios);

describe('API tests', () => {
    afterEach(() => {
        mock.reset();
    });

    test('login successful', async () => {
        mock.onPost('/api/auth/login').reply(200, { token: 'fake-token' });

        const response = await login('test@example.com', 'password123');
        expect(response.token).toBe('fake-token');
    });

    test('get posts', async () => {
        const mockPosts = [{ id: 1, title: 'Test Post' }];
        mock.onGet('/api/posts').reply(200, mockPosts);

        const posts = await getPosts();
        expect(posts).toEqual(mockPosts);
    });
});
