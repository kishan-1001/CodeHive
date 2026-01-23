import express from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/profile/coding-profiles
 * @desc Get user's connected coding profiles
 * @access Private
 */
router.get('/coding-profiles', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const query = `
      SELECT p.name, p.slug, upp.username, upp.profile_url, upp.verified
      FROM platforms p
      LEFT JOIN user_platform_profiles upp 
        ON p.id = upp.platform_id AND upp.user_id = $1
      ORDER BY p.id
    `;

        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching coding profiles:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /api/profile/coding-profiles
 * @desc Update user's coding profiles (usernames)
 * @access Private
 */
router.post('/coding-profiles', authenticateToken, async (req: any, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const { profiles } = req.body; // Expecting { leetcode: "handle", codeforces: "handle", ... }

        // platform slugs map to names or inputs
        // We assume the frontend sends data keyed by platform slug or name.
        // Let's rely on slugs.

        // 1. Get all valid platforms
        const platformsRes = await client.query('SELECT id, slug FROM platforms');
        const platformsMap = new Map(); // slug -> id
        platformsRes.rows.forEach(p => platformsMap.set(p.slug.toLowerCase(), p.id));

        const updates = [];

        for (const [platformKey, username] of Object.entries(profiles)) {
            const platformId = platformsMap.get(platformKey.toLowerCase());

            if (!platformId) continue; // Skip invalid platforms

            if (!username || (typeof username === 'string' && username.trim() === '')) {
                // If username is empty, we might want to delete the profile or set to null?
                // For now, let's treat empty string as "remove profile" or just skip upsert if we want to keep history?
                // User request "enter his... credential", implies setting it.
                // Let's assume empty string means DELETE/NULL or just don't insert.
                // Actually, easiest is to allow clearing.

                // If username is empty string, let's remove the entry or set username to null.
                // Let's delete the row for cleanliness if it exists.
                await client.query(
                    `DELETE FROM user_platform_profiles WHERE user_id = $1 AND platform_id = $2`,
                    [userId, platformId]
                );
                continue;
            }

            // Upsert
            const query = `
        INSERT INTO user_platform_profiles (user_id, platform_id, username, created_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, platform_id)
        DO UPDATE SET 
          username = EXCLUDED.username
      `;
            updates.push(client.query(query, [userId, platformId, username.toString().trim()]));
        }

        await Promise.all(updates);
        await client.query('COMMIT');

        res.json({ message: 'Profiles updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating coding profiles:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});

export default router;
