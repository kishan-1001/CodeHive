import express from 'express';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
    // Note: This endpoint is public right now, so we can't easily check 'is_saved' for a specific user unless we assume auth is optional but possible.
    // For now, let's assume the frontend sends a token if available, and we decode it manually or make this endpoint optional-auth.
    // Simpler approach: Update logic to handle authenticated users if header exists.

    // BUT, the current middleware `authenticateToken` is not applied here. 
    // To support `is_saved`, we need to know who the user is. 
    // Let's check header manually for this specific route or just query it separately in frontend.
    // Better: Make it optional auth. 

    // For simplicity given the inputs, let's try to get userId from header if present
    let currentUserId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        try {
            const token = authHeader.split(' ')[1];
            // Decode token (basic, without verify for speed/simplicity in this specific read-only context, 
            // but for production we should use verify. Let's assume we can trust the ID for UI checks)
            // Ideally we import jwt and verify.
            const jwt = require('jsonwebtoken');
            // We need the secret. It's in .env but better to use the specific environment variable
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            currentUserId = decoded.id;
            console.log('GET /posts: Identified User ID:', currentUserId);
        } catch (e) {
            console.error('GET /posts: Token verification failed:', e);
        }
    } else {
        console.log('GET /posts: No Auth Header present');
    }

    try {
        const queryText = `
            SELECT 
                p.*, 
                CASE WHEN u.is_public = FALSE THEN 'Anonymous' ELSE u.name END as author_name,
                CASE WHEN u.is_public = FALSE THEN NULL ELSE u.avatar_url END as avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
                ${currentUserId ? `CASE WHEN sp.post_id IS NOT NULL THEN true ELSE false END` : 'false'} as is_saved
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ${currentUserId ? `LEFT JOIN saved_posts sp ON p.id = sp.post_id AND sp.user_id = $1` : ''}
            ORDER BY p.created_at DESC
        `;

        const queryParams = currentUserId ? [currentUserId] : [];
        const result = await pool.query(queryText, queryParams);

        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper to extract hashtags


// Create a post
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, content]
        );
        const post = result.rows[0];



        res.status(201).json(post);
    } catch (err: any) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get trending topics
router.get('/trending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.name, COUNT(pt.post_id) as count
            FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            JOIN posts p ON pt.post_id = p.id
            WHERE p.created_at > NOW() - INTERVAL '7 days'
            GROUP BY t.id, t.name
            ORDER BY count DESC
            LIMIT 5
        `);

        res.json(result.rows.map(row => ({
            name: `#${row.name}`,
            count: `${row.count} insights this week`
        })));
    } catch (err: any) {
        console.error('Error fetching trending topics:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get top contributors
router.get('/top-contributors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.name, 
                u.username,
                u.avatar_url,
                COUNT(l.id) as total_likes
            FROM users u
            JOIN posts p ON u.id = p.user_id
            JOIN likes l ON p.id = l.post_id
            GROUP BY u.id, u.name, u.username, u.avatar_url
            ORDER BY total_likes DESC
            LIMIT 3
        `);

        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching top contributors:', err);
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

        // Also process tags in comments? Maybe later.

        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get saved posts
router.get('/saved', authenticateToken, async (req: AuthRequest, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                CASE WHEN u.is_public = FALSE THEN 'Anonymous' ELSE u.name END as author_name,
                CASE WHEN u.is_public = FALSE THEN NULL ELSE u.avatar_url END as avatar_url,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
                true as is_saved
            FROM saved_posts sp
            JOIN posts p ON sp.post_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE sp.user_id = $1
            ORDER BY sp.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching saved posts:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Toggle Save Post
router.post('/:id/save', authenticateToken, async (req: AuthRequest, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if saved
        const check = await pool.query('SELECT * FROM saved_posts WHERE post_id = $1 AND user_id = $2', [postId, userId]);

        if (check.rows.length > 0) {
            // Unsave
            await pool.query('DELETE FROM saved_posts WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            res.json({ message: 'Unsaved', is_saved: false });
        } else {
            // Save
            await pool.query('INSERT INTO saved_posts (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            res.json({ message: 'Saved', is_saved: true });
        }
    } catch (err: any) {
        console.error('Error toggling save post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const result = await pool.query(`
      SELECT c.*, u.name as author_name, u.avatar_url
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
