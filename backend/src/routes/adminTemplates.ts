import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';
import { decodeHTMLEntities } from '../utils/htmlUtils';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticateToken, isAdmin);

// Get templates for a problem
router.get('/:problemId/templates', async (req, res) => {
    const { problemId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM problem_templates WHERE problem_id = $1 ORDER BY language ASC',
            [problemId]
        );
        const rows = result.rows.map(row => ({
            ...row,
            starter_code: decodeHTMLEntities(row.starter_code),
            wrapper_code: decodeHTMLEntities(row.wrapper_code)
        }));
        res.json(rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add or Update a template (Upsert)
router.post('/:problemId/templates', async (req, res) => {
    const { problemId } = req.params;
    const { language, starter_code, wrapper_code } = req.body;

    if (!language || !starter_code) {
        return res.status(400).json({ error: 'Language and Starter Code are required' });
    }

    try {
        // Check if template exists
        const checkRes = await pool.query(
            'SELECT id FROM problem_templates WHERE problem_id = $1 AND language = $2',
            [problemId, language]
        );

        let result;
        if (checkRes.rows.length > 0) {
            // Update
            result = await pool.query(
                `UPDATE problem_templates 
                 SET starter_code = $1, wrapper_code = $2
                 WHERE id = $3
                 RETURNING *`,
                [starter_code, wrapper_code || '', checkRes.rows[0].id]
            );
        } else {
            // Insert
            result = await pool.query(
                `INSERT INTO problem_templates (problem_id, language, starter_code, wrapper_code)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [problemId, language, starter_code, wrapper_code || '']
            );
        }

        res.json({
            ...result.rows[0],
            starter_code: decodeHTMLEntities(result.rows[0].starter_code),
            wrapper_code: decodeHTMLEntities(result.rows[0].wrapper_code)
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a template
router.delete('/templates/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM problem_templates WHERE id = $1', [id]);
        res.json({ message: 'Template deleted successfully' });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
