import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const router = Router();
const execAsync = promisify(exec);

// --- Helper Functions (Duplicated from submit.ts for isolation) ---
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
    const timeLimitSec = Math.max(1, Math.ceil(timeLimitMs / 1000));

    const encodedCode = Buffer.from(code).toString('base64');

    // Process input for special cases
    let processedInput = input;
    if ((language === 'cpp' || language === 'c' || language === 'java' || language === 'python' || language === 'javascript') && input) {
        if (input.startsWith('nums = [')) {
            const match = input.match(/nums = \[([^\]]+)\], target = (\d+)/);
            if (match) {
                const numsStr = match[1];
                const target = match[2];
                const nums = numsStr.split(',').map(s => s.trim());
                const newInput = nums.join(' ') + '\n' + target;
                processedInput = newInput;
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

            // 1. Strict Match: Company + Topic + Difficulty
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

            // 2. Topic Match: Topic + Difficulty
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

            // 3. Random Match: Correct Difficulty
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

            // 4. Fallback: Any Random Problem
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
            return res.status(404).json({ error: 'No problems found matching your criteria.' });
        }

        // Create Session with 1.5-hour expiration
        const expiresAt = new Date(Date.now() + 1.5 * 60 * 60 * 1000); // 1 hour 30 mins from now

        const sessionResult = await pool.query(`
      INSERT INTO arena_sessions (user_id, total_problems, status, expires_at)
      VALUES ($1, $2, 'active', $3)
      RETURNING id
    `, [user_id, selectedProblems.length, expiresAt]);

        const sessionId = sessionResult.rows[0].id;

        // Insert Problems into Session
        const problemValues = selectedProblems.map((p, idx) => `(${sessionId}, ${p.id}, ${idx})`).join(',');
        await pool.query(`
      INSERT INTO arena_session_problems (session_id, problem_id, order_index)
      VALUES ${problemValues}
    `);

        res.json({ sessionId, problemCount: selectedProblems.length });

    } catch (error: any) {
        console.error('Error creating arena session:', error);
        res.status(500).json({ error: 'Failed to create arena session', details: error.message });
    }
});

// 2. Get Arena Session Details
router.get('/:sessionId', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    const user_id = (req as any).user.id;

    try {
        // Fetch Session
        const sessionResult = await pool.query(`
      SELECT * FROM arena_sessions WHERE id = $1 AND user_id = $2
    `, [sessionId, user_id]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionResult.rows[0];

        // Fetch Problems
        const problemsResult = await pool.query(`
        SELECT p.id, p.title, p.description, p.difficulty, p.slug, asp.is_solved, asp.order_index
        FROM arena_session_problems asp
        JOIN problems p ON asp.problem_id = p.id
        WHERE asp.session_id = $1
        ORDER BY asp.order_index
    `, [sessionId]);

        res.json({ session, problems: problemsResult.rows });

    } catch (error) {
        console.error('Error fetching arena session:', error);
        res.status(500).json({ error: 'Failed to fetch arena session' });
    }
});

// 3. Submit Solution
router.post('/submit', authenticateToken, async (req, res) => {
    const { code, language, problem_id, session_id } = req.body;
    const user_id = (req as any).user.id;

    if (!code || !language || !problem_id || !session_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        if (!(await isDockerRunning())) {
            return res.status(500).json({ error: 'System error: Execution environment unavailable' });
        }

        // Fetch wrapper code
        let wrapperCode = '';
        try {
            const templateResult = await pool.query(`
        SELECT wrapper_code
        FROM problem_templates
        WHERE problem_id = $1 AND language = $2
      `, [problem_id, language]);

            if (templateResult.rows.length > 0) {
                wrapperCode = templateResult.rows[0].wrapper_code;
            }
        } catch (dbError) {
            console.warn('Could not fetch wrapper code:', dbError);
        }

        // Combine user code
        let fullCode = code;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
        }

        // Fetch test cases
        const testCasesResult = await pool.query(`
      SELECT id, input, expected_output
      FROM test_cases
      WHERE problem_id = $1
      ORDER BY id
    `, [problem_id]);

        if (testCasesResult.rows.length === 0) {
            return res.status(400).json({ error: 'No test cases found' });
        }

        const testCases = testCasesResult.rows;
        let allPassed = true;
        let totalRuntime = 0;

        // Fetch problem time limit and difficulty
        let baseTimeLimitMs = 2000;
        let difficulty = 'Easy';
        try {
            const problemResult = await pool.query('SELECT time_limit_ms, difficulty FROM problems WHERE id = $1', [problem_id]);
            if (problemResult.rows.length > 0) {
                baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
                difficulty = problemResult.rows[0].difficulty;
            }
        } catch (e) { }

        // Multiplier
        let timeMultiplier = 1.0;
        if (language === 'java') timeMultiplier = 2.0;
        else if (['python', 'javascript'].includes(language)) timeMultiplier = 3.0;

        const finalTimeLimitMs = Math.ceil(baseTimeLimitMs * timeMultiplier);

        // Run tests
        for (const testCase of testCases) {
            const result = await runTestCase(fullCode, language, testCase.input, finalTimeLimitMs);

            if (result.error) {
                // Record fail in submissions table
                await pool.query(`
             INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, complexity_source)
             VALUES ($1, $2, $3, $4, $5, 0, 0, 'unknown')
           `, [user_id, problem_id, language, code, result.error]);

                // Record in arena_submissions
                await pool.query(`
             INSERT INTO arena_submissions (session_id, user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, time_taken_seconds, time_complexity, space_complexity)
             VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 'Unknown', 'Unknown')
           `, [session_id, user_id, problem_id, language, code, result.error]);

                return res.json({ verdict: result.error === 'CE' ? 'compilation_error' : result.error === 'TLE' ? 'time_limit_exceeded' : 'runtime_error', message: result.error, output: result.output });
            }

            if (result.output !== testCase.expected_output.trim()) {
                allPassed = false;
                await pool.query(`
            INSERT INTO submissions (user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, complexity_source)
            VALUES ($1, $2, $3, $4, 'WA', $5, 0, 'unknown')
            `, [user_id, problem_id, language, code, result.runtime || 0]);

                // Record in arena_submissions
                await pool.query(`
            INSERT INTO arena_submissions (session_id, user_id, problem_id, language, code, verdict, runtime_ms, memory_kb, time_taken_seconds, time_complexity, space_complexity)
            VALUES ($1, $2, $3, $4, $5, 'WA', $6, 0, $7, 'Unknown', 'Unknown')
            `, [session_id, user_id, problem_id, language, code, result.runtime || 0, Math.ceil((result.runtime || 0) / 1000)]);

                return res.json({ verdict: 'wrong_answer', message: 'Wrong Answer' });
            }
            totalRuntime += result.runtime || 0;
        }

        // Success!
        const avgRuntime = Math.round(totalRuntime / testCases.length);

        // Save AC to submissions
        await pool.query(`
      INSERT INTO submissions (
        user_id, problem_id, language, code, verdict, 
        runtime_ms, memory_kb, complexity_source
      )
      VALUES ($1, $2, $3, $4, 'AC', $5, 0, 'static')
    `, [user_id, problem_id, language, code, avgRuntime]);

        // Save AC to arena_submissions
        await pool.query(`
      INSERT INTO arena_submissions (
        session_id, user_id, problem_id, language, code, verdict, 
        runtime_ms, memory_kb, time_taken_seconds, time_complexity, space_complexity
      )
      VALUES ($1, $2, $3, $4, $5, 'AC', $6, 0, $7, 'O(1)', 'O(1)')
    `, [session_id, user_id, problem_id, language, code, avgRuntime, Math.ceil(avgRuntime / 1000)]);

        // Update Arena Session Problem Status
        await pool.query(`
        UPDATE arena_session_problems
        SET is_solved = true
        WHERE session_id = $1 AND problem_id = $2
    `, [session_id, problem_id]);

        // Calculate points based on difficulty
        let points = 4;
        if (difficulty === 'Medium') points = 5;
        if (difficulty === 'Hard') points = 6;

        // Update Score
        await pool.query(`
        UPDATE arena_sessions
        SET score = score + $1
        WHERE id = $2
    `, [points, session_id]);

        res.json({ verdict: 'accepted', message: 'All test cases passed!' });

    } catch (error: any) {
        console.error('Arena Submit Error', error);
        res.status(500).json({ error: error.message || 'Submission failed' });
    }
});


// 4. Finish Session
router.post('/finish', authenticateToken, async (req, res) => {
    const { sessionId } = req.body;
    const user_id = (req as any).user.id;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        await pool.query(`
            UPDATE arena_sessions 
            SET status = 'completed', expires_at = NOW() 
            WHERE id = $1 AND user_id = $2
        `, [sessionId, user_id]);

        res.json({ message: 'Session completed successfully' });
    } catch (error) {
        console.error('Error finishing session:', error);
        res.status(500).json({ error: 'Failed to finish session' });
    }
});

export default router;
