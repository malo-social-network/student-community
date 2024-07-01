const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const userRoutes = require('./users');

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);

module.exports = router;
