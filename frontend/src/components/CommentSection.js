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
            const comment = await addComment(postId, newComment);
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (err) {
            setError('Erreur lors de l\'ajout du commentaire');
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
                        <small>Par {comment.username} le {new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
