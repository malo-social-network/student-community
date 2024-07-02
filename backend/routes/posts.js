const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const postController = require('../controllers/postController');

router.post('/', authenticateToken, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);
router.get('/:postId/comments', postController.getPostComments);
router.post('/:postId/comments', authenticateToken, postController.addComment);

module.exports = router;
