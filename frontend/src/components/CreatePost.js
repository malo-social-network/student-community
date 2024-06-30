import React, { useState } from 'react';
import { createPost } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const newPost = await createPost(title, content);
            console.log('Post créé:', newPost);
            navigate('/'); // Redirige vers la page d'accueil après la création
        } catch (err) {
            console.error('Erreur lors de la création du post:', err);
            setError('Erreur lors de la création du post. Veuillez réessayer.');
        }
    };

    return (
        <div className="create-post">
            <h2>Créer un nouveau post</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Titre:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content">Contenu:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Publier</button>
            </form>
        </div>
    );
};

export default CreatePost;
