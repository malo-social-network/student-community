const getPool = require('../config/database').getPool;

exports.createPost = async (req, res) => {
    try {
        const pool = getPool();
        console.log('Creating post for user:', req.user);
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const [result] = await pool.query('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [req.user.id, req.body.title, req.body.content]);
        console.log('Post created with ID:', result.insertId);
        res.status(201).json({ id: result.insertId, title: req.body.title, content: req.body.content });
    } catch (error) {
        console.error('Failed to create post:', error);
        res.status(500).json({ message: 'Failed to create post', error });
    }
};

exports.getAllPosts = async (req, res) => {
    const pool = getPool();
    const [posts] = await pool.query('SELECT * FROM posts');
    res.json(posts);
};

exports.getPost = async (req, res) => {
    const pool = getPool();
    console.log('Fetching post with ID:', req.params.id);
    const [post] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (post.length === 0) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post[0]);
};

exports.updatePost = async (req, res) => {
    try {
        const pool = getPool();
        console.log('Updating post with ID:', req.params.id);
        const [result] = await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [req.body.title, req.body.content, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Failed to update post:', error);
        res.status(500).json({ message: 'Failed to update post', error });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const pool = getPool();
        console.log('Deleting post with ID:', req.params.id);
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        await pool.query('DELETE FROM comments WHERE post_id = ?', [req.params.id]);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ message: 'Failed to delete post', error });
    }
};

exports.getPostComments = async (req, res) => {
    const pool = getPool();
    const [comments] = await pool.query('SELECT * FROM comments WHERE post_id = ?', [req.params.postId]);
    res.json(comments);
};

exports.addComment = async (req, res) => {
    try {
        const pool = getPool();
        const [result] = await pool.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [req.params.postId, req.user.id, req.body.content]);
        res.status(201).json({ id: result.insertId, content: req.body.content });
    } catch (error) {
        console.error('Failed to add comment:', error);
        res.status(500).json({ message: 'Failed to add comment', error });
    }
};
