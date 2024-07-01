import axios from "axios";

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

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
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const getPost = async (postId) => {
    try {
        const response = await axios.get(`${API_URL}/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const getPosts = async () => {
    try {
        const response = await axios.get(`${API_URL}/posts`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const createPost = async (title, content) => {
    try {
        const headers = getAuthHeaders();
        const response = await axios.post(
            `${API_URL}/posts`,
            { title, content },
            { headers }
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const getUserPosts = async (userId) => {
    try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_URL}/users/${userId}/posts`, { headers });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const getProfile = async () => {
    try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_URL}/users/profile`, { headers });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const updateProfile = async (userData) => {
    try {
        const headers = getAuthHeaders();
        const response = await axios.put(`${API_URL}/users/profile`, userData, { headers });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const getComments = async (postId) => {
    try {
        const response = await axios.get(`${API_URL}/posts/${postId}/comments`);
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};

export const addComment = async (postId, content) => {
    try {
        const headers = getAuthHeaders();
        const response = await axios.post(
            `${API_URL}/posts/${postId}/comments`,
            { content },
            { headers }
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Erreur réseau');
    }
};
