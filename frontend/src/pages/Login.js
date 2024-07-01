import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Auth.css'; // Nous allons créer ce fichier CSS plus tard

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(email, password);
            console.log('Login successful', data);
            // Ici, vous devriez stocker le token d'authentification et rediriger l'utilisateur
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Une erreur est survenue lors de la connexion');
        }
    };




    return (
        <div className="auth-container">
            <h1>Connexion</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
};

export default Login;
