
import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// Get all topics
router.get('/topics', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM topics ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all problems (optionally filtered by topic slug and difficulty)
router.get('/problems', async (req, res) => {
    const { topic, difficulty } = req.query; // topic slug, difficulty
    try {
        let query = `
      SELECT p.id, p.title, p.difficulty, p.description, 
             COALESCE(json_agg(json_build_object('name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as topics
      FROM problems p
      LEFT JOIN problem_topics pt ON p.id = pt.problem_id
      LEFT JOIN topics t ON pt.topic_id = t.id
    `;

        const params: any[] = [];
        const conditions: string[] = [];

        // Filter by topic
        if (topic) {
            conditions.push(`EXISTS (
        SELECT 1 FROM problem_topics pt2
        JOIN topics t2 ON pt2.topic_id = t2.id
        WHERE pt2.problem_id = p.id AND t2.slug = $${params.length + 1}
      )`);
            params.push(topic);
        }

        // Filter by difficulty
        if (difficulty && difficulty !== 'All') {
            conditions.push(`p.difficulty = $${params.length + 1}`);
            params.push(difficulty);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` GROUP BY p.id ORDER BY p.id`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single problem by ID
router.get('/problems/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
      SELECT p.*,
             COALESCE(json_agg(json_build_object('name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as topics
      FROM problems p
      LEFT JOIN problem_topics pt ON p.id = pt.problem_id
      LEFT JOIN topics t ON pt.topic_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Get sample test cases
        const testCasesResult = await pool.query(`
            SELECT input, expected_output
            FROM test_cases
            WHERE problem_id = $1 AND is_sample = true
            ORDER BY id
        `, [id]);

        const problem = result.rows[0];
        problem.sample_test_cases = testCasesResult.rows;

        res.json(problem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single problem by slug
router.get('/problems/slug/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await pool.query(`
      SELECT p.*,
             COALESCE(json_agg(json_build_object('name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as topics
      FROM problems p
      LEFT JOIN problem_topics pt ON p.id = pt.problem_id
      LEFT JOIN topics t ON pt.topic_id = t.id
      WHERE p.slug = $1
      GROUP BY p.id
    `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get starter code and wrapper code for a problem and language
router.get('/:id/templates/:language', async (req, res) => {
    const { id, language } = req.params;
    try {
        const result = await pool.query(`
            SELECT starter_code, wrapper_code
            FROM problem_templates
            WHERE problem_id = $1 AND language = $2
        `, [id, language]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found for this problem and language' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get solutions for a problem and language
router.get('/:id/solutions/:language', async (req, res) => {
    const { id, language } = req.params;
    try {
        const result = await pool.query(`
            SELECT id, problem_id, language, solution_type, explanation, code, time_complexity, space_complexity
            FROM problem_solutions
            WHERE problem_id = $1 AND language = $2
        `, [id, language]);

        // Return empty array if no solutions found (which is valid, just means none exist yet)
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
