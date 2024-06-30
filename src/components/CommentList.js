import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '../services/api';

const CommentList = ({ postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const fetchedComments = await getComments(postId);
            setComments(fetchedComments);
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const addedComment = await addComment(postId, newComment);
            setComments([addedComment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
        }
    };

    return (
        <div className="comment-section">
            <h3>Commentaires</h3>
            <form onSubmit={handleSubmit}>
        <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            required
        />
                <button type="submit">Poster</button>
            </form>
            <div className="comment-list">
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

export default CommentList;
