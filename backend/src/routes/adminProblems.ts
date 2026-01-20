import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticateToken, isAdmin);

// List all problems
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM problems ORDER BY id ASC');
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new problem
router.post('/', async (req, res) => {
    const { title, description, difficulty, slug, topics, companies } = req.body;
    try {
        await pool.query('BEGIN');

        // Insert problem
        const problemResult = await pool.query(
            'INSERT INTO problems (title, description, difficulty, slug) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, description, difficulty, slug]
        );
        const problemId = problemResult.rows[0].id;

        // Insert topics
        if (topics && topics.length > 0) {
            for (const topicId of topics) {
                await pool.query(
                    'INSERT INTO problem_topics (problem_id, topic_id) VALUES ($1, $2)',
                    [problemId, topicId]
                );
            }
        }

        // Insert companies (assuming existing table or text based)
        // Note: Basic implementation, expand as needed for companies table if normalized
        if (companies && companies.length > 0) {
            for (const company of companies) {
                await pool.query(
                    'INSERT INTO problem_companies (problem_id, company_name) VALUES ($1, $2)',
                    [problemId, company]
                );
            }
        }

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Problem created successfully', id: problemId });
    } catch (err: any) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

// Update a problem
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, slug, topics, companies } = req.body;

    try {
        await pool.query('BEGIN');

        // Update problem details
        await pool.query(
            'UPDATE problems SET title = $1, description = $2, difficulty = $3, slug = $4 WHERE id = $5',
            [title, description, difficulty, slug, id]
        );

        // Update topics (Delete all and re-insert for simplicity)
        await pool.query('DELETE FROM problem_topics WHERE problem_id = $1', [id]);
        if (topics && topics.length > 0) {
            for (const topicId of topics) {
                await pool.query(
                    'INSERT INTO problem_topics (problem_id, topic_id) VALUES ($1, $2)',
                    [id, topicId]
                );
            }
        }

        // Update companies
        await pool.query('DELETE FROM problem_companies WHERE problem_id = $1', [id]);
        if (companies && companies.length > 0) {
            for (const company of companies) {
                await pool.query(
                    'INSERT INTO problem_companies (problem_id, company_name) VALUES ($1, $2)',
                    [id, company]
                );
            }
        }

        await pool.query('COMMIT');
        res.json({ message: 'Problem updated successfully' });
    } catch (err: any) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

// Delete a problem
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Cascade delete should handle relations if DB is set up correctly, 
        // otherwise delete manually from related tables first.
        // Assuming cascade for now or manual cleanup:
        await pool.query('BEGIN');
        await pool.query('DELETE FROM problem_topics WHERE problem_id = $1', [id]);
        await pool.query('DELETE FROM problem_companies WHERE problem_id = $1', [id]);
        await pool.query('DELETE FROM problem_templates WHERE problem_id = $1', [id]);
        await pool.query('DELETE FROM test_cases WHERE problem_id = $1', [id]);
        await pool.query('DELETE FROM problems WHERE id = $1', [id]);
        await pool.query('COMMIT');

        res.json({ message: 'Problem deleted successfully' });
    } catch (err: any) {
        await pool.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    }
});

export default router;
