import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getPosts} from '../services/api';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Erreur lors de la récupération des posts:", err);
                setError("Impossible de charger les posts. Veuillez réessayer plus tard.");
            }
        };
        fetchPosts();
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="home">
            <h1>Fil d'actualité</h1>
            <div className="post-list">
                {posts.map(post => (
                    <div key={post.id} className="post-preview">
                        <h2>{post.title}</h2>
                        <p>{post.content.substring(0, 100)}...</p>
                        <Link to={`/post/${post.id}`}>Lire la suite</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
