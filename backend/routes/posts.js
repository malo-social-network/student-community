const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAllPosts,
    getPostById,
    createPost,
    getPostComments,
    addComment
} = require('../controllers/postController');

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', authenticateToken, createPost);
router.get('/:postId/comments', getPostComments);
router.post('/:postId/comments', authenticateToken, addComment);

module.exports = router;
