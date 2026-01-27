import express from 'express';
import { pool } from '../config/db';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth';
import { GlobalLeaderboardService } from '../services/globalLeaderboard';
import { PlatformFetcherService } from '../services/platformFetcher';

const router = express.Router();

import { LeaderboardService } from '../services/leaderboardService';

// --- Routes ---

// Get Global Leaderboard
router.get('/', optionalAuthenticateToken, async (req: any, res) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        console.log(`Leaderboard request. User role: ${req.user?.role}, Is Admin: ${isAdmin}`);

        const currentUserId = req.user?.id || 0;

        // Option: Limit to top 100
        const result = await pool.query(`
            SELECT 
                l.*,
                CASE 
                    WHEN u.id = $2 THEN u.name
                    WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN 'Anonymous' 
                    ELSE u.name 
                END as name,
                CASE 
                    WHEN u.id = $2 THEN u.username
                    WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN NULL 
                    ELSE u.username 
                END as username,
                CASE 
                    WHEN u.id = $2 THEN u.avatar_url
                    WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN NULL 
                    ELSE u.avatar_url 
                END as avatar_url
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.total_score DESC
            LIMIT 100
        `, [isAdmin, currentUserId]); // Pass isAdmin and currentUserId

        // Add implicit rank
        const leaderboard = result.rows.map((row, index) => ({
            ...row,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sync/Refresh User Score (Can be called manually or by frontend on profile load)
router.post('/sync', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const scores = await LeaderboardService.calculateUserScore(userId);
        res.json({ message: 'Score synced', scores });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync score' });
    }
});

// Get Current User's CodeHive Rank
router.get('/my-rank', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        // Calculate rank efficiently
        // Rank = count of users with higher total_score + 1
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) + 1 FROM leaderboard WHERE total_score > l.total_score) as rank
            FROM leaderboard l
            WHERE l.user_id = $1
        `, [userId]);

        const rank = result.rows[0]?.rank ? parseInt(result.rows[0].rank) : null;
        res.json({ rank });
    } catch (error) {
        console.error('Error fetching my rank:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Re-calculate ALL scores (Heavy operation)
router.post('/recalculate-all', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    try {
        const users = await pool.query('SELECT id FROM users');
        let count = 0;
        for (const user of users.rows) {
            await LeaderboardService.calculateUserScore(user.id);
            count++;
        }
        res.json({ message: `Recalculated scores for ${count} users` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to batch recalculate' });
    }
});



// --- Global Leaderboard Routes ---

// Get Global Leaderboard
router.get('/global', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15; // Default 15 as requested
        const search = (req.query.search as string) || '';

        const offset = (page - 1) * limit;

        const leaderboard = await GlobalLeaderboardService.getLeaderboard(limit, offset, search);
        const total = await GlobalLeaderboardService.getLeaderboardCount(search);

        res.json({
            data: leaderboard,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Sync authenticated user's Global Score
router.post('/global/sync', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch latest stats from external APIs
        await PlatformFetcherService.fetchAndUpsertUserStats(userId);

        // 2. Recalculate score
        const newScore = await GlobalLeaderboardService.updateUserGlobalScore(userId);
        res.json({ message: 'Global score synced', universal_score: newScore });
    } catch (error) {
        console.error('Error syncing global score:', error);
        res.status(500).json({ error: 'Failed to sync global score' });
    }
});

// Get Current User's Global Rank
router.get('/global/my-rank', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const rankData = await GlobalLeaderboardService.getUserRank(userId);
        res.json(rankData); // Returns null if no score yet
    } catch (error) {
        console.error('Error fetching global rank:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
