import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/submissions/:problemId
router.get('/:problemId', authenticateToken, async (req, res) => {
    const { problemId } = req.params;
    const user_id = (req as any).user.id;

    try {
        const result = await pool.query(`
      SELECT 
        id, 
        verdict, 
        runtime_ms, 
        memory_kb, 
        language, 
        code,
        time_complexity_static,
        space_complexity_static,
        created_at
      FROM submissions
      WHERE user_id = $1 AND problem_id = $2
      ORDER BY created_at DESC
    `, [user_id, problemId]);

        res.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch submissions' });
    }
});

export default router;
