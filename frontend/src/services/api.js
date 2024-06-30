import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
};

export const getProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const getPost = async (postId) => {
    const response = await axios.get(`${API_URL}/posts/${postId}`);
    return response.data;
};

export const getPosts = async () => {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
};

export const createPost = async (title, content) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/posts`,
        { title, content },
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
};

export const getUserPosts = async (userId) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/${userId}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const updateProfile = async (userData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/profile`, userData, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const getComments = async (postId) => {
    const response = await axios.get(`${API_URL}/posts/${postId}/comments`);
    return response.data;
};

export const addComment = async (postId, content) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
        `${API_URL}/posts/${postId}/comments`,
        { content },
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
};
