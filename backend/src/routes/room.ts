import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { broadcastToRoom, notifyLeaderboardUpdate } from '../services/roomSocket';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { executionLimiter } from '../utils/executionLimiter';

const router = Router();
const execAsync = promisify(exec);

// --- Helpers for Execution (Duplicated from arena.ts for isolation) ---

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

    // Process input for special cases (e.g. LeetCode style arrays)
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
        const child = spawn('docker', ['run', '--rm', '--network', 'none', '-i', image, 'sh']);

        let stdoutData = '';
        let stderrData = '';

        child.stdout.on('data', (data) => { stdoutData += data.toString(); });
        child.stderr.on('data', (data) => { stderrData += data.toString(); });

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

            if (code === 124) {
                resolve({ output: stdoutData.trim(), error: 'TLE', runtime });
                return;
            }
            if (code !== 0) {
                if (['c', 'cpp', 'java'].includes(language) && filteredStderr.toLowerCase().includes('error')) {
                    resolve({ output: filteredStderr, error: 'CE', runtime });
                    return;
                }
                if (['python', 'javascript'].includes(language) && (filteredStderr.includes('SyntaxError') || filteredStderr.includes('IndentationError'))) {
                    resolve({ output: filteredStderr, error: 'CE', runtime });
                    return;
                }
                resolve({ output: stdoutData.trim(), error: 'RE', runtime });
                return;
            }
            resolve({ output: stdoutData.trim(), runtime });
        });

        child.on('error', (err) => reject(err));
        child.stdin.write(script);
        child.stdin.end();
    });
}

// ----------------------------------------------------------------------

// 1. Create HiveBattle (Room)
router.post('/create', authenticateToken, async (req: any, res) => {
    const { topics, problemCount, timeLimitMinutes } = req.body;
    const adminId = req.user.id;

    if (!topics || !problemCount || !timeLimitMinutes) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const config = { topics, problemCount, timeLimitMinutes };

        const roomRes = await pool.query(`
            INSERT INTO rooms (room_code, host_id, status, config)
            VALUES ($1, $2, 'waiting', $3)
            RETURNING id, room_code, created_at
        `, [roomCode, adminId, config]);
        const room = roomRes.rows[0];

        await pool.query(`INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)`, [room.id, adminId]);

        // Select Problems
        const problemsRes = await pool.query(`
            SELECT p.id FROM problems p
            JOIN problem_topics pt ON p.id = pt.problem_id
            JOIN topics t ON pt.topic_id = t.id
            WHERE t.name = ANY($1)
            ORDER BY RANDOM()
            LIMIT $2
        `, [topics, problemCount]);

        let selectedProblemIds = problemsRes.rows.map(r => r.id);
        if (selectedProblemIds.length < problemCount) {
            const extraRes = await pool.query(`
                SELECT id FROM problems 
                WHERE id != ALL($1)
                ORDER BY RANDOM()
                LIMIT $2
            `, [selectedProblemIds.length > 0 ? selectedProblemIds : [-1], problemCount - selectedProblemIds.length]);
            selectedProblemIds = [...selectedProblemIds, ...extraRes.rows.map(r => r.id)];
        }

        if (selectedProblemIds.length > 0) {
            const values = selectedProblemIds.map((pid, idx) => `(${room.id}, ${pid}, ${idx})`).join(',');
            await pool.query(`INSERT INTO room_problems (room_id, problem_id, order_index) VALUES ${values}`);
        }

        res.json({ roomId: room.id, roomCode: room.room_code });

    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

// 2. Join HiveBattle
// 2. Join HiveBattle
router.post('/join', authenticateToken, async (req: any, res) => {
    const { roomCode } = req.body;
    const userId = req.user.id;

    if (!roomCode) return res.status(400).json({ error: 'Room code required' });

    try {
        const roomRes = await pool.query('SELECT id, status FROM rooms WHERE room_code = $1', [roomCode]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

        const room = roomRes.rows[0];

        if (room.status !== 'waiting') return res.status(403).json({ error: 'Match already started or finished' });

        // Check if user has been kicked or finished
        const existingParticipantRes = await pool.query('SELECT status FROM room_participants WHERE room_id = $1 AND user_id = $2', [room.id, userId]);
        if (existingParticipantRes.rows.length > 0) {
            const status = existingParticipantRes.rows[0].status;
            if (status === 'kicked') return res.status(403).json({ error: 'You have been removed from this room' });
            if (status === 'finished') return res.status(403).json({ error: 'You have already finished this battle' });
        }

        await pool.query(`
            INSERT INTO room_participants (room_id, user_id, status)
            VALUES ($1, $2, 'joined')
            ON CONFLICT (room_id, user_id) DO UPDATE SET status = 'joined' WHERE room_participants.status != 'kicked' AND room_participants.status != 'finished'
        `, [room.id, userId]);

        notifyLeaderboardUpdate(room.id);
        res.json({ roomId: room.id, message: 'Joined successfully' });

    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Failed to join room' });
    }
});





// 3. Get Room History (User's Battles)
router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT 
                r.id,
                r.room_code,
                r.created_at,
                rp_user.score,
                rp_user.time_taken,
                (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as total_participants,
                (
                    SELECT COUNT(*) + 1 
                    FROM room_participants sub_rp 
                    WHERE sub_rp.room_id = r.id 
                    AND (
                        sub_rp.score > rp_user.score 
                        OR (sub_rp.score = rp_user.score AND sub_rp.time_taken < rp_user.time_taken)
                    )
                ) as rank
            FROM room_participants rp_user
            JOIN rooms r ON rp_user.room_id = r.id
            WHERE rp_user.user_id = $1 AND r.status != 'waiting'
            ORDER BY r.created_at DESC
        `, [userId]);

        const history = result.rows.map(row => ({
            id: row.id,
            roomCode: row.room_code,
            date: row.created_at,
            score: row.score,
            rank: parseInt(row.rank),
            totalParticipants: parseInt(row.total_participants)
        }));

        res.json(history);
    } catch (error) {
        console.error('Error fetching room history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// 4. Get Room Details
router.get('/:roomId', authenticateToken, async (req: any, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const roomRes = await pool.query(`
            SELECT r.*, u.username as host_name 
            FROM rooms r
            JOIN users u ON r.host_id = u.id
            WHERE r.id = $1
        `, [roomId]);

        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
        const room = roomRes.rows[0];

        const participantsRes = await pool.query(`
            SELECT u.id, u.username, u.avatar_url, rp.score, rp.time_taken
            FROM room_participants rp
            JOIN users u ON rp.user_id = u.id
            WHERE rp.room_id = $1
            ORDER BY rp.score DESC, rp.time_taken ASC
        `, [roomId]);

        const isParticipant = participantsRes.rows.some(p => p.id === userId);
        if (!isParticipant) return res.status(403).json({ error: 'Not a participant' });

        let problems: any[] = [];
        if (room.status !== 'waiting') {
            const problemsRes = await pool.query(`
                SELECT 
                    p.id, p.title, p.slug, p.difficulty, rp.order_index,
                    CASE 
                        WHEN p.difficulty = 'Easy' THEN 10
                        WHEN p.difficulty = 'Medium' THEN 30
                        WHEN p.difficulty = 'Hard' THEN 50
                        ELSE 0
                    END as points
                FROM room_problems rp
                JOIN problems p ON rp.problem_id = p.id
                WHERE rp.room_id = $1
                ORDER BY rp.order_index
            `, [roomId]);
            problems = problemsRes.rows;
        }

        res.json({
            room,
            participants: participantsRes.rows,
            problems,
            isHost: room.host_id === userId
        });

    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

// 4. Start Match
router.post('/:roomId/start', authenticateToken, async (req: any, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const roomRes = await pool.query('SELECT host_id, config FROM rooms WHERE id = $1', [roomId]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

        if (roomRes.rows[0].host_id !== userId) return res.status(403).json({ error: 'Only host can start' });

        const timeLimitMinutes = roomRes.rows[0].config.timeLimitMinutes || 30;
        const startTime = new Date();
        const expiresAt = new Date(startTime.getTime() + timeLimitMinutes * 60000);

        await pool.query(`
            UPDATE rooms 
            SET status = 'active', start_time = $1, expires_at = $2
            WHERE id = $3
        `, [startTime, expiresAt, roomId]);

        broadcastToRoom(parseInt(roomId), { type: 'ROOM_STARTED', startTime, expiresAt });
        res.json({ message: 'Room started' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to start room' });
    }
});

// 5. Submit Solution (REAL EXECUTION)
router.post('/submit', authenticateToken, async (req: any, res) => {
    const { roomId, problemId, code, language } = req.body;
    const userId = req.user.id;

    if (!roomId || !problemId || !code || !language) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 0. Check Concurrency Limit
    if (!executionLimiter.tryAcquire()) {
        return res.status(429).json({
            error: 'Server is currently busy (max concurrent executions reached). Please wait a moment and try again.'
        });
    }

    try {
        // 1. Check Docker
        if (!(await isDockerRunning())) {
            return res.status(500).json({ error: 'Execution Service Unavailable (Docker not running)' });
        }

        // 2. Validate Room
        const roomRes = await pool.query('SELECT status, start_time FROM rooms WHERE id = $1', [roomId]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
        const room = roomRes.rows[0];
        if (room.status !== 'active') return res.status(403).json({ error: 'Match is not active' });

        // 3. Fetch Wrapper Code
        let wrapperCode = '';
        const templateResult = await pool.query(`SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2`, [problemId, language]);
        if (templateResult.rows.length > 0) {
            wrapperCode = templateResult.rows[0].wrapper_code;
        }

        let fullCode = code;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
        }

        // 4. Fetch Test Cases
        const testCasesResult = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id`, [problemId]);
        if (testCasesResult.rows.length === 0) return res.status(400).json({ error: 'No test cases found for this problem' });

        const testCases = testCasesResult.rows;
        let allPassed = true;
        let totalRuntime = 0;
        let finalVerdict = 'AC';
        let errorOutput = '';

        // Time Limit Logic
        let baseTimeLimitMs = 2000;
        try {
            const problemResult = await pool.query('SELECT time_limit_ms FROM problems WHERE id = $1', [problemId]);
            if (problemResult.rows.length > 0) baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
        } catch (e) { }

        let timeMultiplier = language === 'java' ? 2.0 : ['python', 'javascript'].includes(language) ? 3.0 : 1.0;
        const finalTimeLimitMs = Math.ceil(baseTimeLimitMs * timeMultiplier);

        // 5. Run Tests
        for (const testCase of testCases) {
            const result = await runTestCase(fullCode, language, testCase.input, finalTimeLimitMs);

            if (result.error) {
                allPassed = false;
                finalVerdict = result.error === 'CE' ? 'CE' : result.error === 'TLE' ? 'TLE' : 'RE';
                errorOutput = result.output;

                // Record Failed Submission
                await pool.query(`
                    INSERT INTO room_submissions (room_id, user_id, problem_id, language, code, verdict, runtime_ms)
                    VALUES ($1, $2, $3, $4, $5, $6, 0)
                `, [roomId, userId, problemId, language, code, finalVerdict]);

                return res.json({ verdict: finalVerdict, message: result.error, output: result.output });
            }

            if (result.output?.trim() !== testCase.expected_output?.trim()) {
                allPassed = false;
                finalVerdict = 'WA';

                await pool.query(`
                    INSERT INTO room_submissions (room_id, user_id, problem_id, language, code, verdict, runtime_ms)
                    VALUES ($1, $2, $3, $4, $5, 'WA', $6)
                `, [roomId, userId, problemId, language, code, result.runtime || 0]);

                return res.json({ verdict: 'WA', message: 'Wrong Answer' });
            }
            totalRuntime += result.runtime || 0;
        }

        // 6. Success (AC)
        const avgRuntime = Math.round(totalRuntime / testCases.length);

        // Check if already solved correctly in this room
        const solvedCheck = await pool.query(
            'SELECT id FROM room_submissions WHERE room_id = $1 AND user_id = $2 AND problem_id = $3 AND verdict = $4',
            [roomId, userId, problemId, 'AC']
        );

        if (solvedCheck.rows.length === 0) {
            // First AC! Update Score
            const diffRes = await pool.query('SELECT difficulty FROM problems WHERE id = $1', [problemId]);
            const difficulty = diffRes.rows[0]?.difficulty || 'Medium';
            const points = difficulty === 'Easy' ? 10 : difficulty === 'Hard' ? 50 : 30;

            const startTime = new Date(room.start_time).getTime();
            const now = Date.now();
            const timeTakenSeconds = Math.floor((now - startTime) / 1000);

            await pool.query(`
                UPDATE room_participants
                SET score = score + $1, time_taken = time_taken + $2
                WHERE room_id = $3 AND user_id = $4
            `, [points, timeTakenSeconds, roomId, userId]);

            notifyLeaderboardUpdate(Number(roomId));
        }

        // Record AC Submission
        await pool.query(`
            INSERT INTO room_submissions (room_id, user_id, problem_id, language, code, verdict, runtime_ms)
            VALUES ($1, $2, $3, $4, $5, 'AC', $6)
        `, [roomId, userId, problemId, language, code, avgRuntime]);

        res.json({ verdict: 'AC', runtime: avgRuntime, message: 'Accepted' });

    } catch (error: any) {
        console.error('Submit error:', error);
        res.status(500).json({ error: 'Submission failed', details: error.message });
    } finally {
        executionLimiter.release();
    }
});

// 6. Run Code (Sample Test Cases Only)
router.post('/run', authenticateToken, async (req: any, res) => {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check Concurrency Limit
    if (!executionLimiter.tryAcquire()) {
        return res.status(429).json({
            error: 'Server is currently busy (max concurrent executions reached). Please wait a moment and try again.'
        });
    }

    try {
        if (!(await isDockerRunning())) {
            return res.status(500).json({ error: 'Execution Service Unavailable' });
        }

        // Fetch Wrapper
        let wrapperCode = '';
        const templateResult = await pool.query(`SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2`, [problemId, language]);
        if (templateResult.rows.length > 0) wrapperCode = templateResult.rows[0].wrapper_code;

        let fullCode = code;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
        }

        // Fetch Sample Test Cases
        const testCasesResult = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 AND is_sample = true ORDER BY id`, [problemId]);
        const testCases = testCasesResult.rows;

        // If no samples, fetch first 2 regular cases
        if (testCases.length === 0) {
            const fallbackRes = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id LIMIT 2`, [problemId]);
            testCases.push(...fallbackRes.rows);
        }

        const results = [];
        let baseTimeLimitMs = 2000;
        try {
            const problemResult = await pool.query('SELECT time_limit_ms FROM problems WHERE id = $1', [problemId]);
            if (problemResult.rows.length > 0) baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
        } catch (e) { }

        let timeMultiplier = language === 'java' ? 2.0 : ['python', 'javascript'].includes(language) ? 3.0 : 1.0;
        const finalTimeLimitMs = Math.ceil(baseTimeLimitMs * timeMultiplier);

        for (const testCase of testCases) {
            const result = await runTestCase(fullCode, language, testCase.input, finalTimeLimitMs);
            const passed = !result.error && result.output?.trim() === testCase.expected_output?.trim();

            results.push({
                input: testCase.input,
                expected_output: testCase.expected_output,
                output: result.output || '',
                error: result.error,
                passed,
                runtime: result.runtime
            });
        }

        res.json({ results });

    } catch (error: any) {
        console.error('Run Code Error:', error);
        res.status(500).json({ error: 'Execution failed', details: error.message });
    } finally {
        executionLimiter.release();
    }
});

// --- Room Cleanup Service ---
setInterval(async () => {
    try {
        const result = await pool.query(`
            UPDATE rooms 
            SET status = 'completed' 
            WHERE status = 'active' AND expires_at < NOW()
            RETURNING id
        `);

        if (result.rows.length > 0) {
            console.log(`[Cleanup] Closed ${result.rows.length} expired rooms.`);
            result.rows.forEach(row => {
                // Optional: Notify sockets that room ended
                // broadcastToRoom(row.id, { type: 'ROOM_ENDED' });
            });
        }
    } catch (error) {
        console.error('[Cleanup] Error closing expired rooms:', error);
    }
}, 60000); // Check every minute

export default router;
