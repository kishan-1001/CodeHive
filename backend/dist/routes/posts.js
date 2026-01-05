"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all posts
router.get('/', async (req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT 
        p.*, 
        u.name as author_name, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Create a post
router.post('/', auth_1.authenticateToken, async (req, res) => {
    console.log('Create Post Request Body:', req.body);
    console.log('Create Post User:', req.user);
    const { title, content } = req.body;
    const userId = req.user.id;
    try {
        const result = await db_1.pool.query('INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *', [userId, title, content]);
        console.log('Post created successfully:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Like a post
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
        // Check if liked
        const check = await db_1.pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        if (check.rows.length > 0) {
            // Unlike
            await db_1.pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            res.json({ message: 'Unliked' });
        }
        else {
            // Like
            await db_1.pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            res.json({ message: 'Liked' });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Comment on a post
router.post('/:id/comment', auth_1.authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;
    try {
        const result = await db_1.pool.query('INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *', [postId, userId, content]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await db_1.pool.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
