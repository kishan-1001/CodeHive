"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
// Get all topics
router.get('/topics', async (req, res) => {
    try {
        const result = await db_1.pool.query('SELECT * FROM topics ORDER BY name');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get all problems (optionally filtered by topic slug)
router.get('/problems', async (req, res) => {
    const { topic } = req.query; // topic slug
    try {
        let query = `
      SELECT p.id, p.title, p.difficulty, p.description, 
             COALESCE(json_agg(json_build_object('name', t.name, 'slug', t.slug)) FILTER (WHERE t.id IS NOT NULL), '[]') as topics
      FROM problems p
      LEFT JOIN problem_topics pt ON p.id = pt.problem_id
      LEFT JOIN topics t ON pt.topic_id = t.id
    `;
        // If filtering by topic
        const params = [];
        if (topic) {
            query += ` WHERE EXISTS (
        SELECT 1 FROM problem_topics pt2
        JOIN topics t2 ON pt2.topic_id = t2.id
        WHERE pt2.problem_id = p.id AND t2.slug = $1
      )`;
            params.push(topic);
        }
        query += ` GROUP BY p.id ORDER BY p.id`;
        const result = await db_1.pool.query(query, params);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get single problem by ID
router.get('/problems/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db_1.pool.query(`
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
        const testCasesResult = await db_1.pool.query(`
            SELECT input, expected_output
            FROM test_cases
            WHERE problem_id = $1 AND is_sample = true
            ORDER BY id
        `, [id]);
        const problem = result.rows[0];
        problem.sample_test_cases = testCasesResult.rows;
        res.json(problem);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get single problem by slug
router.get('/problems/slug/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const result = await db_1.pool.query(`
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get starter code and wrapper code for a problem and language
router.get('/:id/templates/:language', async (req, res) => {
    const { id, language } = req.params;
    try {
        const result = await db_1.pool.query(`
            SELECT starter_code, wrapper_code
            FROM problem_templates
            WHERE problem_id = $1 AND language = $2
        `, [id, language]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found for this problem and language' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
