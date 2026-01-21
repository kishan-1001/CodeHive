import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Apply auth and admin check
router.use(authenticateToken, isAdmin);

// 1. List All Contests
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching contests:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Get Contest Details (with problems)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contestRes = await pool.query('SELECT * FROM contests WHERE id = $1', [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const problemsRes = await pool.query(`
            SELECT cp.*, p.title, p.difficulty, p.slug 
            FROM contest_problems cp
            JOIN problems p ON cp.problem_id = p.id
            WHERE cp.contest_id = $1
            ORDER BY cp.problem_order ASC
        `, [id]);

        res.json({ ...contestRes.rows[0], problems: problemsRes.rows });
    } catch (err: any) {
        console.error('Error fetching contest details:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. Create Contest (Draft)
router.post('/', async (req: any, res) => {
    const { title, description, start_time, end_time, problems, is_published } = req.body;
    const userId = req.user.id;

    if (!title || !start_time || !end_time) {
        return res.status(400).json({ error: 'Title, Start Time, and End Time are required' });
    }

    try {
        await pool.query('BEGIN');

        const contestRes = await pool.query(
            'INSERT INTO contests (title, description, start_time, end_time, is_published, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, start_time, end_time, is_published || false, userId]
        );
        const contestId = contestRes.rows[0].id;

        if (problems && Array.isArray(problems) && problems.length > 0) {
            // problems: { id: number, points: number }[]
            for (let i = 0; i < problems.length; i++) {
                const p = problems[i];
                await pool.query(
                    'INSERT INTO contest_problems (contest_id, problem_id, problem_order, points) VALUES ($1, $2, $3, $4)',
                    [contestId, p.id, i + 1, p.points || 100]
                );
            }
        }

        await pool.query('COMMIT');
        res.status(201).json(contestRes.rows[0]);
    } catch (err: any) {
        await pool.query('ROLLBACK');
        console.error('Error creating contest:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. Update Contest
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, is_published, problems } = req.body;

    try {
        await pool.query('BEGIN');

        await pool.query(
            'UPDATE contests SET title = $1, description = $2, start_time = $3, end_time = $4, is_published = $5 WHERE id = $6',
            [title, description, start_time, end_time, is_published, id]
        );

        // If problems provided, replace all existing
        if (problems && Array.isArray(problems)) {
            await pool.query('DELETE FROM contest_problems WHERE contest_id = $1', [id]);

            if (problems.length > 0) {
                for (let i = 0; i < problems.length; i++) {
                    const p = problems[i];
                    await pool.query(
                        'INSERT INTO contest_problems (contest_id, problem_id, problem_order, points) VALUES ($1, $2, $3, $4)',
                        [id, p.id, i + 1, p.points || 100]
                    );
                }
            }
        }

        await pool.query('COMMIT');
        res.json({ message: 'Contest updated successfully' });
    } catch (err: any) {
        await pool.query('ROLLBACK');
        console.error('Error updating contest:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. Delete Contest
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM contests WHERE id = $1', [id]);
        res.json({ message: 'Contest deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting contest:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;

