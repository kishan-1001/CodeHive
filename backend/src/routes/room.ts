import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { broadcastToRoom, notifyLeaderboardUpdate } from '../services/roomSocket';
import { CodeExecutionService } from '../services/CodeExecutionService';

const router = Router();

// --- Room Logic ---

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
router.post('/join', authenticateToken, async (req: any, res) => {
    const { roomCode } = req.body;
    const userId = req.user.id;

    if (!roomCode) return res.status(400).json({ error: 'Room code required' });

    try {
        const roomRes = await pool.query('SELECT id, status FROM rooms WHERE room_code = $1', [roomCode]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });

        const room = roomRes.rows[0];

        if (room.status !== 'waiting') return res.status(403).json({ error: 'Match already started or finished' });

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

// 3. Submit Solution
router.post('/submit', authenticateToken, async (req: any, res) => {
    const { roomId, problemId, code, language } = req.body;
    const userId = req.user.id;

    if (!roomId || !problemId || !code || !language) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const roomRes = await pool.query('SELECT status, start_time FROM rooms WHERE id = $1', [roomId]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
        const room = roomRes.rows[0];
        if (room.status !== 'active') return res.status(403).json({ error: 'Match is not active' });

        let wrapperCode = '';
        const templateResult = await pool.query(`SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2`, [problemId, language]);
        if (templateResult.rows.length > 0) wrapperCode = templateResult.rows[0].wrapper_code;

        let fullCode = code;
        let lineOffset = 0;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
            lineOffset = wrapperCode.split('// <<< INSERT USER CODE HERE >>>')[0].split('\n').length - 1;
        }

        const testCasesResult = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id`, [problemId]);
        if (testCasesResult.rows.length === 0) return res.status(400).json({ error: 'No test cases found' });

        let baseTimeLimitMs = 2000;
        try {
            const problemResult = await pool.query('SELECT time_limit_ms FROM problems WHERE id = $1', [problemId]);
            if (problemResult.rows.length > 0) baseTimeLimitMs = Number(problemResult.rows[0].time_limit_ms);
        } catch (e) { }

        const result = await CodeExecutionService.executeAndAnalyze({
            code: fullCode,
            language,
            testCases: testCasesResult.rows,
            timeLimitMs: baseTimeLimitMs,
            problemId,
            userId
        });

        const finalVerdict = result.error ? (result.error.type === 'TIME_LIMIT_EXCEEDED' ? 'TLE' : result.error.type === 'COMPILATION_ERROR' ? 'CE' : 'RE') : (result.allPassed ? 'AC' : 'WA');

        await pool.query(`
            INSERT INTO room_submissions (room_id, user_id, problem_id, language, code, verdict, runtime_ms)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [roomId, userId, problemId, language, code, finalVerdict, result.avgRuntime || 0]);

        if (finalVerdict === 'AC') {
            const solvedCheck = await pool.query(
                'SELECT id FROM room_submissions WHERE room_id = $1 AND user_id = $2 AND problem_id = $3 AND verdict = $4 AND id != LASTVAL()',
                [roomId, userId, problemId, 'AC']
            );

            if (solvedCheck.rows.length === 0) {
                const diffRes = await pool.query('SELECT difficulty FROM problems WHERE id = $1', [problemId]);
                const difficulty = diffRes.rows[0]?.difficulty || 'Medium';
                const points = difficulty === 'Easy' ? 10 : difficulty === 'Hard' ? 50 : 30;

                const startTime = new Date(room.start_time).getTime();
                const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

                await pool.query(`
                    UPDATE room_participants
                    SET score = score + $1, time_taken = time_taken + $2
                    WHERE room_id = $3 AND user_id = $4
                `, [points, timeTakenSeconds, roomId, userId]);

                notifyLeaderboardUpdate(Number(roomId));
            }
        }

        res.json({ verdict: finalVerdict, runtime: result.avgRuntime, message: finalVerdict === 'AC' ? 'Accepted' : result.error?.message || 'Wrong Answer' });

    } catch (error: any) {
        res.status(500).json({ error: 'Submission failed', details: error.message });
    }
});

// 4. Run Code (Samples)
router.post('/run', authenticateToken, async (req: any, res) => {
    const { code, language, problemId } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        let wrapperCode = '';
        const templateResult = await pool.query(`SELECT wrapper_code FROM problem_templates WHERE problem_id = $1 AND language = $2`, [problemId, language]);
        if (templateResult.rows.length > 0) wrapperCode = templateResult.rows[0].wrapper_code;

        let fullCode = code;
        let lineOffset = 0;
        if (wrapperCode) {
            fullCode = wrapperCode.replace('// <<< INSERT USER CODE HERE >>>', code).replace('# <<< INSERT USER CODE HERE >>>', code);
            lineOffset = wrapperCode.split('// <<< INSERT USER CODE HERE >>>')[0].split('\n').length - 1;
        }

        const testCasesResult = await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 AND is_sample = true ORDER BY id`, [problemId]);
        const testCases = testCasesResult.rows.length > 0 ? testCasesResult.rows : (await pool.query(`SELECT id, input, expected_output FROM test_cases WHERE problem_id = $1 ORDER BY id LIMIT 2`, [problemId])).rows;

        const results = [];
        for (const tc of testCases) {
            const execResult = await CodeExecutionService.execute(fullCode, language, tc.input, 5000, lineOffset);
            results.push({
                input: tc.input,
                expected_output: tc.expected_output,
                output: execResult.output,
                error: execResult.error?.type,
                passed: !execResult.error && execResult.output.trim() === tc.expected_output.trim(),
                runtime: execResult.runtime
            });
        }
        res.json({ results });
    } catch (error: any) {
        res.status(500).json({ error: 'Execution failed', details: error.message });
    }
});

// Rest of routes (history, details, start, cleanup) remain mostly same...
// ... (omitted for brevity in this replace, but I'll ensure they are present in the final write)
// I will actually do a full write to ensure no loss of logic.

router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                r.id, r.room_code, r.created_at, rp_user.score, rp_user.time_taken,
                (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as total_participants,
                (SELECT COUNT(*) + 1 FROM room_participants sub_rp WHERE sub_rp.room_id = r.id AND (sub_rp.score > rp_user.score OR (sub_rp.score = rp_user.score AND sub_rp.time_taken < rp_user.time_taken))) as rank
            FROM room_participants rp_user
            JOIN rooms r ON rp_user.room_id = r.id
            WHERE rp_user.user_id = $1 AND r.status != 'waiting'
            ORDER BY r.created_at DESC
        `, [userId]);
        res.json(result.rows.map(row => ({ id: row.id, roomCode: row.room_code, date: row.created_at, score: row.score, rank: parseInt(row.rank), totalParticipants: parseInt(row.total_participants) })));
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.get('/:roomId', authenticateToken, async (req: any, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    try {
        const roomRes = await pool.query(`SELECT r.*, u.username as host_name FROM rooms r JOIN users u ON r.host_id = u.id WHERE r.id = $1`, [roomId]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const room = roomRes.rows[0];
        const participantsRes = await pool.query(`SELECT u.id, u.username, u.avatar_url, rp.score, rp.time_taken FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = $1 ORDER BY rp.score DESC, rp.time_taken ASC`, [roomId]);
        if (!participantsRes.rows.some(p => p.id === userId)) return res.status(403).json({ error: 'Denied' });
        let problems: any[] = [];
        if (room.status !== 'waiting') {
            problems = (await pool.query(`SELECT p.id, p.title, p.slug, p.difficulty, rp.order_index, CASE WHEN p.difficulty = 'Easy' THEN 10 WHEN p.difficulty = 'Medium' THEN 30 WHEN p.difficulty = 'Hard' THEN 50 ELSE 0 END as points FROM room_problems rp JOIN problems p ON rp.problem_id = p.id WHERE rp.room_id = $1 ORDER BY rp.order_index`, [roomId])).rows;
        }
        res.json({ room, participants: participantsRes.rows, problems, isHost: room.host_id === userId });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.post('/:roomId/start', authenticateToken, async (req: any, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    try {
        const roomRes = await pool.query('SELECT host_id, config FROM rooms WHERE id = $1', [roomId]);
        if (roomRes.rows.length === 0 || roomRes.rows[0].host_id !== userId) return res.status(403).json({ error: 'Unauthorized' });
        const timeLimit = roomRes.rows[0].config.timeLimitMinutes || 30;
        const startTime = new Date();
        const expiresAt = new Date(startTime.getTime() + timeLimit * 60000);
        await pool.query(`UPDATE rooms SET status = 'active', start_time = $1, expires_at = $2 WHERE id = $3`, [startTime, expiresAt, roomId]);
        broadcastToRoom(parseInt(roomId), { type: 'ROOM_STARTED', startTime, expiresAt });
        res.json({ message: 'Started' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

setInterval(async () => {
    try {
        await pool.query(`UPDATE rooms SET status = 'completed' WHERE status = 'active' AND expires_at < NOW()`);
    } catch (e) { }
}, 60000);

export default router;
