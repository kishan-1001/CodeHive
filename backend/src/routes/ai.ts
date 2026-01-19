import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { aiService } from '../services/aiService';
import { pool } from '../config/db';

const router = Router();

// POST /api/ai/feedback
// Generate feedback for a specific problem submission
router.post('/feedback', authenticateToken, async (req, res) => {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Fetch problem details to give context to AI
        const problemRes = await pool.query('SELECT title, description FROM problems WHERE id = $1', [problemId]);
        if (problemRes.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        const { title, description } = problemRes.rows[0];

        const feedback = await aiService.getCodeFeedback(code, language, title, description);

        res.json(feedback);
    } catch (error) {
        console.error('Feedback Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate feedback' });
    }
});

export default router;
