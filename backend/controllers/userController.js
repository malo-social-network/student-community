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

    const [updatedUser] = await pool.query('SELECT username, email FROM users WHERE id = ?', [req.user.id]);

    if (updatedUser.length === 0) {
        return res.status(404).json({ message: 'User not found after update' });
    }

    res.json({
        message: 'Profile updated successfully',
        user: updatedUser[0]
    });
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
    const userId = req.user.id;
    const [posts] = await pool.query(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.user_id = ?
    `, [userId]);
    res.json(posts);
};
