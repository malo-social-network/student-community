import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="header">
            <nav>
                <ul>
                    <li><Link to="/">Accueil</Link></li>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/profile">Profil</Link></li>
                            <li><Link to="/create-post">Créer un post</Link></li>
                            <li><button onClick={handleLogout}>Déconnexion</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">Connexion</Link></li>
                            <li><Link to="/register">Inscription</Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
