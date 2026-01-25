import express from 'express';
import { pool } from '../config/db';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth';
import { GlobalLeaderboardService } from '../services/globalLeaderboard';
import { PlatformFetcherService } from '../services/platformFetcher';

const router = express.Router();

// Helper to calculate score for a specific user
const calculateUserScore = async (userId: number) => {
    try {
        // 1. Practice Score (Unique solved problems)
        // Easy=10, Medium=30, Hard=50
        const practiceRes = await pool.query(`
            SELECT 
                SUM(
                    CASE 
                        WHEN p.difficulty = 'Easy' THEN 10
                        WHEN p.difficulty = 'Medium' THEN 30
                        WHEN p.difficulty = 'Hard' THEN 50
                        ELSE 0
                    END
                ) as practice_score
            FROM (
                -- Get unique solved problems
                SELECT DISTINCT problem_id 
                FROM submissions 
                WHERE user_id = $1 AND verdict = 'AC'
            ) s
            JOIN problems p ON s.problem_id = p.id
        `, [userId]);
        const practiceScore = parseInt(practiceRes.rows[0].practice_score || '0');

        // 2. Arena Score
        // Sum of session scores + 20 bonus for completed sessions (assuming 'completed' status means fully done)
        const arenaRes = await pool.query(`
            SELECT 
                SUM(score) as total_session_score,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions
            FROM arena_sessions
            WHERE user_id = $1
        `, [userId]);
        const arenaBaseScore = parseInt(arenaRes.rows[0].total_session_score || '0');
        const completedSessions = parseInt(arenaRes.rows[0].completed_sessions || '0');
        const arenaScore = arenaBaseScore + (completedSessions * 20);

        // 3. Contest Score
        // Sum of points from contest submissions (assuming contest logic stores points somewhere or we sum raw submissions)
        // For now, let's assume we sum unique AC submissions within contest windows OR simply use existing contest_submissions
        // If contest_submissions table exists and tracks points:
        // Checking schema: contest_submissions has 'verdict' but points are on 'contest_problems' (or similar).
        // Let's do a join.

        let contestScore = 0;
        try {
            const contestRes = await pool.query(`
                 SELECT 
                    SUM(cp.points) as score
                 FROM contest_submissions cs
                 JOIN contest_problems cp ON cs.problem_id = cp.problem_id AND cs.contest_id = cp.contest_id
                 WHERE cs.user_id = $1 AND cs.verdict = 'accepted'
                 -- Only count unique problems per contest? 
                 -- Ideally yes, but simpler query for now:
            `, [userId]);

            // Refined unique problem query:
            const refinedContestRes = await pool.query(`
                SELECT SUM(points) as total_points FROM (
                    SELECT DISTINCT ON (cs.problem_id, cs.contest_id) cp.points
                    FROM contest_submissions cs
                    JOIN contest_problems cp ON cs.problem_id = cp.problem_id AND cs.contest_id = cp.contest_id
                    WHERE cs.user_id = $1 AND cs.verdict = 'accepted'
                ) unique_solves
            `, [userId]);

            contestScore = parseInt(refinedContestRes.rows[0].total_points || '0');
        } catch (err) {
            console.warn("Contest score calculation failed (maybe tables missing?), defaulting to 0", err);
        }

        const totalScore = practiceScore + arenaScore + contestScore;

        // Update Leaderboard Table
        await pool.query(`
            INSERT INTO leaderboard (user_id, practice_score, arena_score, contest_score, total_score, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                practice_score = $2,
                arena_score = $3,
                contest_score = $4,
                total_score = $5,
                updated_at = NOW()
        `, [userId, practiceScore, arenaScore, contestScore, totalScore]);

        return { practiceScore, arenaScore, contestScore, totalScore };

    } catch (error) {
        console.error("Error calculating score for user", userId, error);
        throw error;
    }
};

// --- Routes ---

// Get Global Leaderboard
router.get('/', optionalAuthenticateToken, async (req: any, res) => {
    try {
        const isAdmin = req.user?.role === 'admin';
        console.log(`Leaderboard request. User role: ${req.user?.role}, Is Admin: ${isAdmin}`);

        // Option: Limit to top 100
        const result = await pool.query(`
            SELECT 
                l.*,
                CASE WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN 'Anonymous' ELSE u.name END as name,
                CASE WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN NULL ELSE u.username END as username,
                CASE WHEN u.is_public = FALSE AND $1::boolean = FALSE THEN NULL ELSE u.avatar_url END as avatar_url
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.total_score DESC
            LIMIT 100
        `, [isAdmin]); // Pass isAdmin as parameter

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
        const scores = await calculateUserScore(userId);
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
            await calculateUserScore(user.id);
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
