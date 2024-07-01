import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { login } from '../services/api';

jest.mock('../services/api');

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    // Tests CRUD
    test('renders Login form correctly', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
        expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
    });

    test('shows error message on failed login', async () => {
        login.mockRejectedValueOnce(new Error('Login failed'));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByText(/se connecter/i));

        const errorMessage = await screen.findByText('Login failed');
        expect(errorMessage).toBeInTheDocument();
    });

    test('redirects on successful login', async () => {
        login.mockResolvedValueOnce({ token: 'fake-token' });
        const localStorageMock = jest.spyOn(window.localStorage.__proto__, 'setItem');

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByText(/se connecter/i));

        await waitFor(() => {
            expect(localStorageMock).toHaveBeenCalledWith('token', 'fake-token');
        });
    });

    // Tests de performance

    // Test de performance du rendu initial
    test('initial render performance', () => {
        const start = performance.now();

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const end = performance.now();
        const duration = end - start;
        console.log(`Initial render took ${duration} ms`);
        expect(duration).toBeLessThan(500); // Ajustez le seuil selon les besoins
    });

    // Test de performance de la fonction de connexion
    test('login function performance', async () => {
        const start = performance.now();
        login.mockResolvedValueOnce({ token: 'fake-token' });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByText(/se connecter/i));

        await waitFor(() => expect(login).toHaveBeenCalled());
        const end = performance.now();

        const duration = end - start;
        console.log(`Login function took ${duration} ms`);
        expect(duration).toBeLessThan(1000); // Ajustez le seuil selon les besoins
    });

    // Test de performance de la soumission du formulaire
    test('form submission performance', async () => {
        login.mockResolvedValueOnce({ token: 'fake-token' });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'password' } });

        const start = performance.now();
        fireEvent.click(screen.getByText(/se connecter/i));

        await waitFor(() => expect(login).toHaveBeenCalled());
        const end = performance.now();

        const duration = end - start;
        console.log(`Form submission took ${duration} ms`);
        expect(duration).toBeLessThan(500); // Ajustez le seuil selon les besoins
    });

    // Test de performance de la mise à jour du champ email
    test('email field update performance', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const start = performance.now();
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
        const end = performance.now();

        const duration = end - start;
        console.log(`Email field update took ${duration} ms`);
        expect(duration).toBeLessThan(100); // Ajustez le seuil selon les besoins
    });

    // Test de performance de la mise à jour du champ mot de passe
    test('password field update performance', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const start = performance.now();
        fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'password' } });
        const end = performance.now();

        const duration = end - start;
        console.log(`Password field update took ${duration} ms`);
        expect(duration).toBeLessThan(100);
    });
});
