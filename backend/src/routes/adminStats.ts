import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Apply auth and admin check
router.use(authenticateToken, isAdmin);

// Get Dashboard Stats
router.get('/', async (req, res) => {
    try {
        const problemsCount = await pool.query('SELECT COUNT(*) FROM problems');
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const activeSessionsCount = await pool.query("SELECT COUNT(*) FROM arena_sessions WHERE status = 'active'");

        res.json({
            totalProblems: parseInt(problemsCount.rows[0].count),
            totalUsers: parseInt(usersCount.rows[0].count),
            activeSessions: parseInt(activeSessionsCount.rows[0].count)
        });
    } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
