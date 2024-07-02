const getPool = require('../config/database').getPool;

exports.getProfile = async (req, res) => {
    const pool = getPool();
    const [user] = await pool.query('SELECT username, email FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user[0]);
};

exports.updateProfile = async (req, res) => {
    const pool = getPool();
    await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [req.body.username, req.body.email, req.user.id]);
    res.json({ message: 'Profile updated successfully' });
};

exports.deleteProfile = async (req, res) => {
    const pool = getPool();
    const [user] = await pool.query('SELECT id FROM users WHERE id = ?', [req.user.id]);
    if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }
    await pool.query('DELETE FROM comments WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM posts WHERE user_id = ?', [req.user.id]);
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'User deleted successfully' });
};

exports.getUserPosts = async (req, res) => {
    const pool = getPool();
    const [posts] = await pool.query('SELECT * FROM posts WHERE user_id = ?', [req.params.userId]);
    res.json(posts);
};
