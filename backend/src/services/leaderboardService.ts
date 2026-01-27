import { pool } from '../config/db';

export class LeaderboardService {

    // Helper to calculate score for a specific user
    static async calculateUserScore(userId: number) {
        try {
            // 1. Practice Score (Unique solved problems)
            // Easy=10, Medium=30, Hard=50
            const practiceRes = await pool.query(`
                SELECT 
                    SUM(
                        CASE 
                            WHEN p.difficulty = 'Easy' THEN 10
                            WHEN p.difficulty = 'Medium' THEN 30
                            WHEN p.difficulty = 'Hard' THEN 50
                            ELSE 0
                        END
                    ) as practice_score
                FROM (
                    -- Get unique solved problems
                    SELECT DISTINCT problem_id 
                    FROM submissions 
                    WHERE user_id = $1 AND verdict = 'AC'
                ) s
                JOIN problems p ON s.problem_id = p.id
            `, [userId]);
            const practiceScore = parseInt(practiceRes.rows[0].practice_score || '0');

            // 2. Arena Score
            // Sum of session scores + 20 bonus for completed sessions (assuming 'completed' status means fully done)
            const arenaRes = await pool.query(`
                SELECT 
                    SUM(score) as total_session_score,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions
                FROM arena_sessions
                WHERE user_id = $1
            `, [userId]);
            const arenaBaseScore = parseInt(arenaRes.rows[0].total_session_score || '0');
            const completedSessions = parseInt(arenaRes.rows[0].completed_sessions || '0');
            const arenaScore = arenaBaseScore + (completedSessions * 20);

            // 3. Contest Score
            let contestScore = 0;
            try {
                // Refined unique problem query:
                const refinedContestRes = await pool.query(`
                    SELECT SUM(points) as total_points FROM (
                        SELECT DISTINCT ON (cs.problem_id, cs.contest_id) cp.points
                        FROM contest_submissions cs
                        JOIN contest_problems cp ON cs.problem_id = cp.problem_id AND cs.contest_id = cp.contest_id
                        WHERE cs.user_id = $1 AND cs.verdict = 'accepted'
                    ) unique_solves
                `, [userId]);

                contestScore = parseInt(refinedContestRes.rows[0].total_points || '0');
            } catch (err) {
                console.warn("Contest score calculation failed (maybe tables missing?), defaulting to 0", err);
            }

            const totalScore = practiceScore + arenaScore + contestScore;

            // Update Leaderboard Table
            await pool.query(`
                INSERT INTO leaderboard (user_id, practice_score, arena_score, contest_score, total_score, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    practice_score = $2,
                    arena_score = $3,
                    contest_score = $4,
                    total_score = $5,
                    updated_at = NOW()
            `, [userId, practiceScore, arenaScore, contestScore, totalScore]);

            return { practiceScore, arenaScore, contestScore, totalScore };

        } catch (error) {
            console.error("Error calculating score for user", userId, error);
            throw error;
        }
    }
}
