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
        <div className="post-detail">
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            <p>Par {post.username} le {formatDate(post.created_at)} </p>
            <CommentSection postId={post.id}/>
        </div>
    );
};

export default PostDetail;
