import React from 'react';
import { Link } from 'react-router-dom';
import './Post.css';

const Post = ({ post }) => {
    return (
        <div className="post">
            <h2>{post.title}</h2>
            <p className="post-author">Par: {post.author}</p>
            <p className="post-content">{post.content.substring(0, 100)}...</p>
            <Link to={`/post/${post.id}`} className="post-link">Lire la suite</Link>
        </div>
    );
};

export default Post;
