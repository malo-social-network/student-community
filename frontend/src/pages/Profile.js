import React, { useState, useEffect } from 'react';
import { getProfile, getUserPosts, updateProfile } from '../services/api';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});

    const fetchUserData = async () => {
        try {
            const userData = await getProfile();
            setUser(userData);
            setEditedUser(userData);
            const userPosts = await getUserPosts();
            setPosts(userPosts);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(editedUser);
            await fetchUserData(); // Recharger les données après la mise à jour
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Profil</h1>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Nom d'utilisateur:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={editedUser.username || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={editedUser.email || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Sauvegarder</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Annuler</button>
                </form>
            ) : (
                <div>
                    <p>Nom d'utilisateur: {user?.username}</p>
                    <p>Email: {user?.email}</p>
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
