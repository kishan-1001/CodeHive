import express from 'express';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        p.*, 
        CASE WHEN u.is_public = FALSE THEN 'Anonymous' ELSE u.name END as author_name,
        CASE WHEN u.is_public = FALSE THEN NULL ELSE u.avatar_url END as avatar_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a post
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like a post
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if liked
        const check = await pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);

        if (check.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            res.json({ message: 'Unliked' });
        } else {
            // Like
            await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            res.json({ message: 'Liked' });
        }
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Comment on a post
router.post('/:id/comment', authenticateToken, async (req: AuthRequest, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [postId, userId, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await pool.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
