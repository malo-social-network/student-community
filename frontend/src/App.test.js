import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import App from './App';
import Login from './pages/Login';
import { login } from './services/api';

jest.mock('./services/api');

describe('App Component', () => {
  test('renders main navigation elements', () => {
    render(<App />);
    expect(screen.getByText(/Fil d'actualité/i)).toBeInTheDocument();
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
  });
});

describe('Login Component', () => {
  test('renders login form', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  test('submits form with user input', async () => {
    login.mockResolvedValue({ token: 'fake-token' });

    render(<BrowserRouter><Login /></BrowserRouter>);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));
    });

    expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});

describe('API functions', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  test('getPosts fetches posts correctly', async () => {
    const mockPosts = [{ id: 1, title: 'Test Post' }];
    mock.onGet('http://localhost:5000/api/posts').reply(200, mockPosts);

    const { getPosts } = require('./services/api');
    const result = await getPosts();

    expect(result).toEqual(mockPosts);
  });

  test('createPost creates a new post', async () => {
    const newPost = { title: 'New Post', content: 'Content' };
    mock.onPost('http://localhost:5000/api/posts').reply(201, newPost);

    const { createPost } = require('./services/api');
    const result = await createPost('New Post', 'Content');

    expect(result).toEqual(newPost);
  });
});
