import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { CodeExecutionService } from '../services/CodeExecutionService';

const router = Router();

// 1. Create Arena Session
router.post('/create', authenticateToken, async (req, res) => {
    const { companies, topics } = req.body;
    const user_id = (req as any).user.id;

    if (!companies || !topics || companies.length === 0 || topics.length === 0) {
        return res.status(400).json({ error: 'Companies and topics are required' });
    }

    try {
        const targetStructure = ['Easy', 'Medium', 'Medium', 'Hard'];
        let selectedProblems: any[] = [];
        const selectedIds: number[] = [];

        for (const difficulty of targetStructure) {
            const excludeIds = selectedIds.length > 0 ? selectedIds : [-1];

            const strictRes = await pool.query(`
                SELECT p.id, p.title, p.difficulty FROM problems p
                JOIN problem_companies pc ON p.id = pc.problem_id
                JOIN companies c ON pc.company_id = c.id
                JOIN problem_topics pt ON p.id = pt.problem_id
                JOIN topics t ON pt.topic_id = t.id
                WHERE c.name = ANY($1) 
                  AND t.name = ANY($2) 
                  AND p.difficulty = $3
                  AND p.id != ALL($4)
                GROUP BY p.id
                ORDER BY RANDOM()
                LIMIT 1
            `, [companies, topics, difficulty, excludeIds]);

            if (strictRes.rows.length > 0) {
                const p = strictRes.rows[0];
                selectedProblems.push(p);
                selectedIds.push(p.id);
                continue;
            }

            const topicRes = await pool.query(`
                SELECT p.id, p.title, p.difficulty FROM problems p
                JOIN problem_topics pt ON p.id = pt.problem_id
                JOIN topics t ON pt.topic_id = t.id
                WHERE t.name = ANY($1) 
                  AND p.difficulty = $2
                  AND p.id != ALL($3)
                GROUP BY p.id
                ORDER BY RANDOM()
                LIMIT 1
            `, [topics, difficulty, excludeIds]);

            if (topicRes.rows.length > 0) {
                const p = topicRes.rows[0];
                selectedProblems.push(p);
                selectedIds.push(p.id);
                continue;
            }

            const diffRes = await pool.query(`
                SELECT p.id, p.title, p.difficulty FROM problems p
                WHERE p.difficulty = $1
                  AND p.id != ALL($2)
                ORDER BY RANDOM()
                LIMIT 1
            `, [difficulty, excludeIds]);

            if (diffRes.rows.length > 0) {
                const p = diffRes.rows[0];
                selectedProblems.push(p);
                selectedIds.push(p.id);
                continue;
            }

            const randomRes = await pool.query(`
                SELECT p.id, p.title, p.difficulty FROM problems p
                WHERE p.id != ALL($1)
                ORDER BY RANDOM()
                LIMIT 1
            `, [excludeIds]);

            if (randomRes.rows.length > 0) {
                const p = randomRes.rows[0];
                selectedProblems.push(p);
                selectedIds.push(p.id);
                continue;
            }
        }

        if (selectedProblems.length === 0) {
            return res.status(404).json({ error: 'No problems found' });
        }

        const expiresAt = new Date(Date.now() + 1.5 * 60 * 60 * 1000);

        const sessionResult = await pool.query(`
            INSERT INTO arena_sessions (user_id, total_problems, status, expires_at)
            VALUES ($1, $2, 'active', $3)
            RETURNING id
        `, [user_id, selectedProblems.length, expiresAt]);

        const sessionId = sessionResult.rows[0].id;
        const problemValues = selectedProblems.map((p, idx) => `(${sessionId}, ${p.id}, ${idx})`).join(',');
        await pool.query(`INSERT INTO arena_session_problems (session_id, problem_id, order_index) VALUES ${problemValues}`);

        res.json({ sessionId, problemCount: selectedProblems.length });

    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

// 2. Get Arena Session Details
router.get('/:sessionId', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    const user_id = (req as any).user.id;
    try {
        const sessionResult = await pool.query(`SELECT * FROM arena_sessions WHERE id = $1 AND user_id = $2`, [sessionId, user_id]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const problemsResult = await pool.query(`SELECT p.id, p.title, p.description, p.difficulty, p.slug, asp.is_solved, asp.order_index FROM arena_session_problems asp JOIN problems p ON asp.problem_id = p.id WHERE asp.session_id = $1 ORDER BY asp.order_index`, [sessionId]);
        res.json({ session: sessionResult.rows[0], problems: problemsResult.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// 3. Submit Solution
router.post('/submit', authenticateToken, async (req, res) => {
    const { code, language, problem_id, session_id } = req.body;
    const user_id = (req as any).user.id;

    if (!code || !language || !problem_id || !session_id) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        let wrapperCode = '';
        const templateResult = await pool.query(`SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2`, [problem_id, language]);
        if (templateResult.rows.length > 0) wrapperCode = templateResult.rows[0].wrapper_code;

        let fullCode = code;
        let lineOffset = 0;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
            lineOffset = wrapperCode.split('// <<< INSERT USER CODE HERE >>>')[0].split('\n').length - 1;
        }

        const testCasesResult = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id`, [problem_id]);
        if (testCasesResult.rows.length === 0) return res.status(400).json({ error: 'No test cases' });

        let baseTimeLimitMs = 2000;
        let difficulty = 'Easy';
        try {
            const problemResult = await pool.query('SELECT time_limit_ms, difficulty FROM problems WHERE id = $1', [problem_id]);
            if (problemResult.rows.length > 0) {
                baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
                difficulty = problemResult.rows[0].difficulty;
            }
        } catch (e) { }

        const result = await CodeExecutionService.executeAndAnalyze({
            code: fullCode,
            language,
            testCases: testCasesResult.rows,
            timeLimitMs: baseTimeLimitMs,
            problemId: problem_id,
            userId: user_id
        });

        const finalVerdict = result.error ? (result.error.type === 'TIME_LIMIT_EXCEEDED' ? 'TLE' : result.error.type === 'COMPILATION_ERROR' ? 'CE' : result.error.type === 'SECURITY_VIOLATION' ? 'SV' : 'RE') : (result.allPassed ? 'AC' : 'WA');

        // Record in arena_submissions
        await pool.query(`
            INSERT INTO arena_submissions (session_id, user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, time_taken_seconds, time_complexity, space_complexity)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'O(1)', 'O(1)')
        `, [session_id, user_id, problem_id, language, code, finalVerdict, result.avgRuntime || 0, Math.ceil((result.avgRuntime || 0) / 1000)]);

        if (finalVerdict === 'AC') {
            await pool.query(`UPDATE arena_session_problems SET is_solved = true WHERE session_id = $1 AND problem_id = $2`, [session_id, problem_id]);
            let points = difficulty === 'Easy' ? 4 : difficulty === 'Hard' ? 6 : 5;
            await pool.query(`UPDATE arena_sessions SET score = score + $1 WHERE id = $2`, [points, session_id]);
        }

        res.json({ verdict: finalVerdict.toLowerCase(), message: result.error?.message || (finalVerdict === 'AC' ? 'Accepted' : 'Wrong Answer') });

    } catch (error: any) {
        res.status(500).json({ error: 'Failed' });
    }
});

// 4. Finish Session
router.post('/finish', authenticateToken, async (req, res) => {
    const { sessionId } = req.body;
    const user_id = (req as any).user.id;
    try {
        await pool.query(`UPDATE arena_sessions SET status = 'completed', expires_at = NOW() WHERE id = $1 AND user_id = $2`, [sessionId, user_id]);
        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
