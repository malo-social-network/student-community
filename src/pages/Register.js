import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import './Auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await register(username, email, password);
            console.log('Registration successful', data);
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError('Inscription réussie mais aucun token reçu');
            }
        } catch (err) {
            console.error('Erreur détaillée lors de l\'inscription:', err);
            if (err.response && err.response.data) {
                setError(err.response.data.error || 'Une erreur est survenue lors de l\'inscription');
            } else {
                setError('Erreur de connexion au serveur');
            }
        }
    };

    return (
        <div className="auth-container">
            <h1>Inscription</h1>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
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
                <button type="submit">S'inscrire</button>
            </form>
        </div>
    );
};

export default Register;
