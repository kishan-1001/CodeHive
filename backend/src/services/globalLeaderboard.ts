import { pool } from '../config/db';

interface PlatformStats {
    platform_name: string;
    problems_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
    rating: number;
}

export class GlobalLeaderboardService {
    /**
     * Normalize score based on platform-specific formulas
     */
    private static normalizeScore(stats: PlatformStats): number {
        const { platform_name, easy_solved, medium_solved, hard_solved, rating, problems_solved } = stats;

        // Default safe values
        const easy = easy_solved || 0;
        const medium = medium_solved || 0;
        const hard = hard_solved || 0;
        const safeRating = rating || 0;
        const total = problems_solved || (easy + medium + hard) || 0;

        switch (platform_name.toLowerCase()) {
            case 'leetcode':
                // Formula: (easy * 1) + (medium * 2) + (hard * 3) + (contest_rating / 100)
                return (easy * 1) + (medium * 2) + (hard * 3) + (safeRating / 100);

            case 'codeforces':
                // Formula: (easy * 1) + (medium * 2) + (hard * 3) + (contest_rating / 100)
                // Note: CodeForces "medium/hard" definition depends on how data is ingested, strictly following formula provided.
                return (easy * 1) + (medium * 2) + (hard * 3) + (safeRating / 100);

            case 'codechef':
                // Formula: (rating / 25) + (problems_solved / 10)
                return (safeRating / 25) + (total / 10);

            case 'geeksforgeeks':
                // Heuristic: (total_solved * 1.5) + (rating / 20)
                return (total * 1.5) + (safeRating / 20);

            case 'hackerrank':
                // Heuristic: (total_solved * 5) + (rating / 50)
                return (total * 5) + (safeRating / 50);

            default:
                // Generic fallback
                return total * 1;
        }
    }

    /**
     * Recalculate and update the Universal Score for a specific user
     */
    static async updateUserGlobalScore(userId: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Fetch all raw stats for the user
            const res = await client.query(`
        SELECT 
          psr.*,
          p.name as platform_name,
          p.id as platform_id
        FROM platform_stats_raw psr
        JOIN user_platform_profiles upp ON psr.user_platform_id = upp.id
        JOIN platforms p ON upp.platform_id = p.id
        WHERE upp.user_id = $1
      `, [userId]);

            const platformsStats = res.rows;
            let totalUniversalScore = 0;

            // 2. Remove stale scores (platforms disconnected by user/not in the current active list)
            const activePlatformIds = platformsStats.map((s: any) => s.platform_id);
            if (activePlatformIds.length > 0) {
                await client.query(`
                    DELETE FROM platform_scores 
                    WHERE user_id = $1 AND platform_id NOT IN (${activePlatformIds.join(',')})
                 `, [userId]);
            } else {
                // If no active platforms, clear all scores
                await client.query(`
                    DELETE FROM platform_scores 
                    WHERE user_id = $1
                 `, [userId]);
            }

            // 3. Calculate and Upsert Normalized Scores
            for (const stat of platformsStats) {
                const normalizedScore = this.normalizeScore({
                    platform_name: stat.platform_name,
                    problems_solved: stat.problems_solved,
                    easy_solved: stat.easy_solved,
                    medium_solved: stat.medium_solved,
                    hard_solved: stat.hard_solved,
                    rating: stat.rating
                });

                // Store result in platform_scores
                await client.query(`
          INSERT INTO platform_scores (user_id, platform_id, normalized_score, calculated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (user_id, platform_id)
          DO UPDATE SET 
            normalized_score = $3,
            calculated_at = NOW()
        `, [userId, stat.platform_id, normalizedScore]);

                totalUniversalScore += normalizedScore;
            }

            // 4. Update Universal Leaderboard Table
            await client.query(`
        INSERT INTO universal_leaderboard (user_id, universal_score, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          universal_score = $2,
          updated_at = NOW()
      `, [userId, totalUniversalScore]);

            await client.query('COMMIT');
            return totalUniversalScore;

        } catch (e) {
            await client.query('ROLLBACK');
            console.error(`Failed to update global score for user ${userId}`, e);
            throw e;
        } finally {
            client.release();
        }
    }

    /**
     * Get the global leaderboard page
     */
    static async getLeaderboard(limit = 100, offset = 0) {
        const res = await pool.query(`
      SELECT 
        ul.user_id,
        ul.universal_score,
        ul.rank,
        u.name,
        u.email,
        u.avatar_url,
        json_agg(json_build_object(
          'platform', p.name,
          'score', ps.normalized_score
        )) as platform_details
      FROM universal_leaderboard ul
      JOIN users u ON ul.user_id = u.id
      LEFT JOIN platform_scores ps ON ul.user_id = ps.user_id
      LEFT JOIN platforms p ON ps.platform_id = p.id
      GROUP BY ul.user_id, u.id
      ORDER BY ul.universal_score DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

        // Recalculate rank on the fly if needed, or trust the stored rank
        // For now we map index+1 as rank since we are ordering by score DESC
        return res.rows.map((row, index) => ({
            ...row,
            rank: offset + index + 1
        }));
    }
}
