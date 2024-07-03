import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '../services/api';

const CommentSection = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const fetchedComments = await getComments(postId);
            setComments(fetchedComments);
        } catch (err) {
            setError('Erreur lors du chargement des commentaires');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let comment = await addComment(postId, newComment);
            if (!comment.created_at) {
                comment.created_at = new Date().toISOString();
            }
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (err) {
            setError('Erreur lors de l\'ajout du commentaire');
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Date inconnue';
        } else {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    };

    return (
        <div className="comment-section">
            <h3>Commentaires</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
        <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            required
        />
                <button type="submit">Publier</button>
            </form>
            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment.id} className="comment">
                        <p>{comment.content}</p>
                        <small>Par {comment.username || 'Utilisateur inconnu'} le {formatDate(comment.created_at)}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
