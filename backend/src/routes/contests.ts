import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = Router();
const execAsync = promisify(exec);

// --- Helper Functions (Duplicated from arena.ts for isolation) ---
async function isDockerRunning(): Promise<boolean> {
    try {
        await execAsync('docker ps');
        return true;
    } catch {
        return false;
    }
}

async function runTestCase(code: string, language: string, input: string, timeLimitMs: number = 2000): Promise<{ output: string; error?: string; runtime?: number }> {
    const startTime = Date.now();
    const timeLimitSec = Math.max(1, Math.ceil((timeLimitMs + 1000) / 1000)); // Add 1s buffer

    const encodedCode = Buffer.from(code).toString('base64');

    // Process input for special cases (like LeetCode style array inputs)
    let processedInput = input;
    if ((language === 'cpp' || language === 'c' || language === 'java' || language === 'python' || language === 'javascript') && input) {
        if (input.startsWith('nums = [')) {
            const match = input.match(/nums = \[([^\]]+)\], target = (\d+)/);
            if (match) {
                const numsStr = match[1];
                const target = match[2];
                const nums = numsStr.split(',').map(s => s.trim());
                processedInput = nums.join(' ') + '\n' + target;
            }
        }
    }
    const encodedInput = (processedInput !== undefined && processedInput !== null) ? Buffer.from(processedInput).toString('base64') : null;

    let image: string;
    let script: string;

    switch (language) {
        case 'c':
            image = 'gcc:latest';
            script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.c
        gcc /tmp/code.c -o /tmp/code || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s /tmp/code < /tmp/input.txt
      `;
            break;
        case 'cpp':
            image = 'gcc:latest';
            script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.cpp
        g++ -O3 /tmp/code.cpp -o /tmp/code || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s /tmp/code < /tmp/input.txt
      `;
            break;
        case 'python':
            image = 'python:3.9-alpine';
            script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.py
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s python3 -u /tmp/code.py < /tmp/input.txt
      `;
            break;
        case 'javascript':
            image = 'node:18-alpine';
            script = `
        echo "${encodedCode}" | base64 -d > /tmp/code.js
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s node --input-type=module /tmp/code.js < /tmp/input.txt
      `;
            break;
        case 'java':
            image = 'amazoncorretto:11';
            script = `
        echo "${encodedCode}" | base64 -d > /tmp/Main.java
        javac /tmp/Main.java || exit 1
        ${encodedInput !== null ? `echo "${encodedInput}" | base64 -d > /tmp/input.txt` : 'touch /tmp/input.txt'}
        timeout ${timeLimitSec}s java -cp /tmp Main < /tmp/input.txt
      `;
            break;
        default:
            throw new Error('Unsupported language');
    }

    return new Promise((resolve, reject) => {
        const child = spawn('docker', ['run', '--rm', '-i', image, 'sh']);

        let stdoutData = '';
        let stderrData = '';

        child.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        child.on('close', (code) => {
            const runtime = Date.now() - startTime;

            // Filter stderr noise
            let filteredStderr = stderrData;
            if (stderrData) {
                const lines = stderrData.split('\n');
                filteredStderr = lines.filter(line =>
                    !line.includes('Pulling') && !line.includes('Digest') && !line.includes('Status') && !line.includes('Waiting')
                ).join('\n').trim();
            }

            // Check exit codes
            if (code === 124) { // Timeout specific exit code
                resolve({ output: stdoutData.trim(), error: 'TLE', runtime });
                return;
            }

            // Compilation Error detection (non-zero exit + error message)
            if (code !== 0) {
                if (['c', 'cpp', 'java'].includes(language) && filteredStderr.toLowerCase().includes('error')) {
                    resolve({ output: filteredStderr, error: 'CE', runtime });
                    return;
                }
                if (['python', 'javascript'].includes(language) && (filteredStderr.includes('SyntaxError') || filteredStderr.includes('IndentationError'))) {
                    resolve({ output: filteredStderr, error: 'CE', runtime });
                    return;
                }
                // General Runtime Error if not TLE or CE
                resolve({ output: stdoutData.trim(), error: 'RE', runtime });
                return;
            }

            resolve({ output: stdoutData.trim(), runtime });
        });

        child.on('error', (err) => {
            reject(err);
        });

        // Write the script to stdin and close it
        child.stdin.write(script);
        child.stdin.end();
    });
}
// --- End Helper Functions ---


// List Published Contests
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contests WHERE is_published = true ORDER BY start_time ASC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching contests:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Published Contest Details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const contestRes = await pool.query('SELECT * FROM contests WHERE id = $1 AND is_published = true', [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Contest not found' });
        }

        const problemsRes = await pool.query(`
            SELECT cp.problem_id, cp.points, cp.problem_order, p.title, p.difficulty, p.slug 
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

// Contest Submission
router.post('/:id/submit', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { code, language, problem_id } = req.body;
    const user_id = (req as any).user.id;

    if (!code || !language || !problem_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // 1. Check Contest Status & Time
        const contestRes = await pool.query('SELECT * FROM contests WHERE id = $1 AND is_published = true', [id]);
        if (contestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Contest not found' });
        }
        const contest = contestRes.rows[0];
        const now = new Date();
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.end_time);

        if (now < startTime) {
            return res.status(403).json({ error: 'Contest has not started yet' });
        }
        if (now > endTime) {
            return res.status(403).json({ error: 'Contest has ended' });
        }

        // 2. Build Full Code (Wrapper + User Code)
        let wrapperCode = '';
        try {
            const templateResult = await pool.query(`
        SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2
      `, [problem_id, language]);
            if (templateResult.rows.length > 0) {
                wrapperCode = templateResult.rows[0].wrapper_code;
            }
        } catch (dbError) {
            console.warn('Could not fetch wrapper code:', dbError);
        }

        let fullCode = code;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
        }

        // 3. Fetch Test Cases
        const testCasesResult = await pool.query(`
      SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id
    `, [problem_id]);

        if (testCasesResult.rows.length === 0) {
            return res.status(400).json({ error: 'No test cases found for this problem' });
        }

        const testCases = testCasesResult.rows;
        let allPassed = true;
        let totalRuntime = 0;

        // 4. Execution Config
        let baseTimeLimitMs = 2000;
        try {
            const probRes = await pool.query('SELECT time_limit_ms FROM problems WHERE id = $1', [problem_id]);
            if (probRes.rows.length > 0) baseTimeLimitMs = probRes.rows[0].time_limit_ms;
        } catch (e) { }

        let timeMultiplier = 1.0;
        if (language === 'java') timeMultiplier = 2.0;
        else if (['python', 'javascript'].includes(language)) timeMultiplier = 3.0;
        const finalTimeLimitMs = Math.ceil(baseTimeLimitMs * timeMultiplier);

        // 5. Run Test Cases
        if (!(await isDockerRunning())) {
            return res.status(500).json({ error: 'Execution environment unavailable' });
        }

        for (const testCase of testCases) {
            const result = await runTestCase(fullCode, language, testCase.input, finalTimeLimitMs);

            if (result.error) {
                // Log failed submission
                await logSubmission(id, user_id, problem_id, language, code, result.error, 0);
                return res.json({ verdict: result.error === 'CE' ? 'compilation_error' : result.error === 'TLE' ? 'time_limit_exceeded' : 'runtime_error', message: result.error, output: result.output });
            }

            if (result.output !== testCase.expected_output.trim()) {
                await logSubmission(id, user_id, problem_id, language, code, 'WA', result.runtime || 0);
                return res.json({ verdict: 'wrong_answer', message: 'Wrong Answer' });
            }
            totalRuntime += result.runtime || 0;
        }

        // 6. Success
        const avgRuntime = Math.round(totalRuntime / testCases.length);
        await logSubmission(id, user_id, problem_id, language, code, 'AC', avgRuntime);

        res.json({ verdict: 'accepted', message: 'All test cases passed!' });

    } catch (error: any) {
        console.error('Contest Submit Error:', error);
        res.status(500).json({ error: 'Server error during submission' });
    }
    // Get User's Contest Results (for AI Feedback)
    router.get('/:id/my-results', authenticateToken, async (req, res) => {
        const { id } = req.params;
        const user_id = (req as any).user.id;

        try {
            // 1. Fetch Contest Basic Info
            const contestRes = await pool.query('SELECT title, description FROM contests WHERE id = $1', [id]);
            if (contestRes.rows.length === 0) {
                return res.status(404).json({ error: 'Contest not found' });
            }
            const contest = contestRes.rows[0];

            // 2. Fetch Problems with Points
            const problemsRes = await pool.query(`
            SELECT p.id, p.title, p.description, p.difficulty, cp.points
            FROM contest_problems cp
            JOIN problems p ON cp.problem_id = p.id
            WHERE cp.contest_id = $1
            ORDER BY cp.problem_order ASC
        `, [id]);

            // 3. Fetch User's Best Submissions (AC preferred)
            // We want to know if they solved it, and get their code.
            const results = await Promise.all(problemsRes.rows.map(async (problem) => {
                const subRes = await pool.query(`
                SELECT verdict, code, language, runtime_ms
                FROM contest_submissions
                WHERE contest_id = $1 AND user_id = $2 AND problem_id = $3
                ORDER BY 
                    CASE WHEN verdict = 'AC' THEN 1 ELSE 2 END,
                    submitted_at DESC
                LIMIT 1
            `, [id, user_id, problem.id]);

                const submission = subRes.rows[0];

                return {
                    ...problem,
                    is_solved: submission?.verdict === 'AC',
                    user_code: submission?.code || '',
                    language: submission?.language || 'javascript',
                    verdict: submission?.verdict || 'Not Attempted'
                };
            }));

            // Calculate User Score (Dynamic based on contest_problems points)
            const score = results.reduce((acc, curr) => {
                if (curr.is_solved) {
                    return acc + (curr.points || 0);
                }
                return acc;
            }, 0);

            res.json({
                session: { id, score }, // Mocking session structure for compatibility
                problems: results
            });

        } catch (error) {
            console.error('Error fetching contest results:', error);
            res.status(500).json({ error: 'Failed to fetch results' });
        }
    });

});

// Helper to log submission to DB
async function logSubmission(contestId: string, userId: number, problemId: number, lang: string, code: string, verdict: string, runtime: number) {
    try {
        await pool.query(`
            INSERT INTO contest_submissions (contest_id, user_id, problem_id, language, code, verdict, runtime_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [contestId, userId, problemId, lang, code, verdict, runtime]);
    } catch (e) {
        console.error('Failed to log contest submission:', e);
        // We don't block the response if logging fails, but it's critical for scoring
    }
}



export default router;
