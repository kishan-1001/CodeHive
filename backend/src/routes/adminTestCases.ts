import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticateToken, isAdmin);

// Get test cases for a problem
router.get('/:problemId/test-cases', async (req, res) => {
    const { problemId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM test_cases WHERE problem_id = $1 ORDER BY id ASC',
            [problemId]
        );
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a test case
router.post('/:problemId/test-cases', async (req, res) => {
    const { problemId } = req.params;
    const { input, expected_output, is_sample, is_hidden } = req.body;

    // Basic validation
    if (!input || expected_output === undefined) {
        return res.status(400).json({ error: 'Input and Expected Output are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [problemId, input, expected_output, is_sample || false, is_hidden || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a test case
router.delete('/test-cases/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM test_cases WHERE id = $1', [id]);
        res.json({ message: 'Test case deleted successfully' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
