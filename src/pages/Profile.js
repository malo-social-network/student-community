import React, { useState, useEffect } from 'react';
import { getProfile, getUserPosts, updateProfile } from '../services/api';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await getProfile();
            setUser(userData);
            setEditedUser(userData);
            const userPosts = await getUserPosts(userData.id);
            setPosts(userPosts);
        } catch (err) {
            setError('Erreur lors du chargement du profil');
            console.error(err);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedUser(user);
    };

    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(editedUser);
            setUser(editedUser);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError('Erreur lors de la mise à jour du profil');
            console.error(err);
        }
    };

    if (!user) return <div>Chargement...</div>;

    return (
        <div className="profile">
            <h1>Profil</h1>
            {error && <p className="error">{error}</p>}
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Nom d'utilisateur:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={editedUser.username}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={editedUser.email}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Sauvegarder</button>
                    <button type="button" onClick={handleCancel}>Annuler</button>
                </form>
            ) : (
                <div>
                    <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <button onClick={handleEdit}>Modifier le profil</button>
                </div>
            )}

            <h2>Mes posts</h2>
            {posts.length > 0 ? (
                <ul>
                    {posts.map(post => (
                        <li key={post.id}>
                            <Link to={`/post/${post.id}`}>{post.title}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Vous n'avez pas encore de posts.</p>
            )}
        </div>
    );
};

export default Profile;
