const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getProfile, updateProfile, getUserPosts , deleteUser} = require('../controllers/userController');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/:userId/posts', authenticateToken, getUserPosts);
router.delete('/users/:email', deleteUser);

module.exports = router;
