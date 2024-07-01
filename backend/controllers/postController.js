const pool = require('../config/database');

exports.getAllPosts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Erreur lors de la récupération des posts'});
    }
};

exports.getPostById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT posts.*, users.username
             FROM posts
             JOIN users ON posts.user_id = users.id
             WHERE posts.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({error: 'Post non trouvé'});
        }

        const post = rows[0];
        post.created_at = new Date(post.created_at).toISOString();

        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Erreur lors de la récupération du post'});
    }
};

exports.createPost = async (req, res) => {
    try {
        const {title, content} = req.body;
        const [result] = await pool.query(
            'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
            [req.user.id, title, content]
        );
        res.status(201).json({
            id: result.insertId,
            user_id: req.user.id,
            title,
            content,
            created_at: new Date()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Erreur lors de la création du post'});
    }
};

exports.getPostComments = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT comments.*, users.username 
             FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE post_id = ? 
             ORDER BY created_at DESC`,
            [req.params.postId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const [result] = await pool.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
            [req.params.postId, req.user.id, content]
        );
        const [newComment] = await pool.query(
            'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?',
            [result.insertId]
        );
        res.status(201).json(newComment[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    }
};
