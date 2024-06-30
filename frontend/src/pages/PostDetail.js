import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../services/api';
import CommentSection from '../components/CommentSection';

const PostDetail = () => {
    const [post, setPost] = useState(null);
    const [error, setError] = useState('');
    const { id } = useParams();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const fetchedPost = await getPost(id);
                setPost(fetchedPost);
            } catch (err) {
                setError('Erreur lors du chargement du post');
            }
        };
        fetchPost();
    }, [id]);

    if (error) return <div className="error">{error}</div>;
    if (!post) return <div>Chargement...</div>;

    return (
        <div className="post-detail">
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <small>Par {post.username} le {new Date(post.created_at).toLocaleString()}</small>
            <CommentSection postId={post.id} />
        </div>
    );
};

export default PostDetail;
