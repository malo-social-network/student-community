const { getPool } = require('../config/database');

exports.getProfile = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({error: 'Utilisateur non trouvé'});
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Erreur lors de la récupération du profil'});
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const pool = getPool();
        const {username, email} = req.body;
        console.log('Updating profile with:', { username, email, userId: req.user.id });
        await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
        const [updatedUser] = await pool.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
        console.log('Updated user data:', updatedUser[0]);
        res.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({error: 'Erreur lors de la mise à jour du profil'});
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Erreur lors de la récupération des posts de l\'utilisateur'});
    }
};
