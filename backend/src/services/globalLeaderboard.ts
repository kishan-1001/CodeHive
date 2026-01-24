import { pool } from '../config/db';

export class GlobalLeaderboardService {
    // Universal Scoring Algorithm Constants
    private static readonly WEIGHTS = {
        total_solved: 5,        // 5 points per problem solved (across all platforms)
        easy_solved: 2,         // +2 bonus for Easy
        medium_solved: 5,       // +5 bonus for Medium
        hard_solved: 10,        // +10 bonus for Hard
        contest_rating: 2,      // Rating * 2 (e.g., 1500 rating = 3000 points)
        ranking: 5000,          // Base pool for ranking inverse (Rank 1 gets more)
        reputation: 10          // 10 points per reputation/contribution point
    };

    /**
     * Calculates and updates the Universal Score for a user
     */
    static async updateUserGlobalScore(userId: number) {
        // Fetch aggregated stats from all platforms
        // MODIFIED: Only include stats from Verified profiles
        const result = await pool.query(`
            SELECT 
                SUM(psr.problems_solved) as total_solved,
                SUM(psr.easy_solved) as easy_solved,
                SUM(psr.medium_solved) as medium_solved,
                SUM(psr.hard_solved) as hard_solved,
                SUM(psr.hard_solved) as hard_solved,
                SUM(psr.rating) as total_rating,
                SUM(0) as total_reputation -- Placeholder if reputation not in platform_stats_raw yet
            FROM platform_stats_raw psr
            JOIN user_platform_profiles upp ON psr.user_platform_id = upp.id
            WHERE upp.user_id = $1 AND upp.is_verified = true
        `, [userId]);

        const stats = result.rows[0];
        if (!stats) return 0;

        // Scoring Formula
        let score = 0;
        score += (parseInt(stats.total_solved || 0) * this.WEIGHTS.total_solved);
        score += (parseInt(stats.easy_solved || 0) * this.WEIGHTS.easy_solved);
        score += (parseInt(stats.medium_solved || 0) * this.WEIGHTS.medium_solved);
        score += (parseInt(stats.hard_solved || 0) * this.WEIGHTS.hard_solved);
        score += (parseInt(stats.total_rating || 0) * this.WEIGHTS.contest_rating);
        score += (parseInt(stats.total_reputation || 0) * this.WEIGHTS.reputation);

        // Update the global_leaderboard table
        await pool.query(`
            INSERT INTO global_leaderboard (user_id, universal_score, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET universal_score = $2, updated_at = NOW()
        `, [userId, score]);

        return score;
    }

    /**
     * Get paginated leaderboard
     */
    static async getLeaderboard(limit = 20, offset = 0, search = '') {
        const result = await pool.query(`
            SELECT 
                gl.user_id,
                gl.universal_score,
                DENSE_RANK() OVER (ORDER BY gl.universal_score DESC) as rank,
                u.name,
                u.email,
                u.username,
                u.avatar_url,
                (
                    SELECT json_agg(json_build_object(
                        'platform', ups.platform,
                        'score', (
                            (ups.total_solved * ${this.WEIGHTS.total_solved}) +
                            (ups.contest_rating * ${this.WEIGHTS.contest_rating})
                        )
                    )) 
                    FROM user_platform_stats ups 
                    WHERE ups.user_id = gl.user_id
                ) as platform_details
            FROM global_leaderboard gl
            JOIN users u ON gl.user_id = u.id
            WHERE u.name ILIKE $3 OR u.email ILIKE $3
            ORDER BY gl.universal_score DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset, `%${search}%`]); // Note: Rank might be relative to page if not careful, but DENSE_RANK over full set is ignored by LIMIT

        // Correct Rank Calculation:
        // DENSE_RANK applies to the result set. For global offset, we might need a subquery or window function over all.
        // Better implementation for Rank with pagination:
        const rankResult = await pool.query(`
            WITH RankedUsers AS (
                SELECT 
                    gl.user_id,
                    gl.universal_score,
                    RANK() OVER (ORDER BY gl.universal_score DESC) as rank,
                    u.name,
                    u.email,
                    u.username,
                    u.avatar_url
                FROM global_leaderboard gl
                JOIN users u ON gl.user_id = u.id
            )
            SELECT 
                ru.*,
                (
                    SELECT json_agg(json_build_object(
                        'platform', p.name,
                        'score', (
                            (psr.problems_solved * ${this.WEIGHTS.total_solved}) + 
                            (psr.easy_solved * ${this.WEIGHTS.easy_solved}) +
                            (psr.medium_solved * ${this.WEIGHTS.medium_solved}) +
                            (psr.hard_solved * ${this.WEIGHTS.hard_solved}) +
                            (COALESCE(psr.rating, 0) * ${this.WEIGHTS.contest_rating})
                        )
                    )) 
                    FROM platform_stats_raw psr
                    JOIN user_platform_profiles upp ON psr.user_platform_id = upp.id
                    JOIN platforms p ON upp.platform_id = p.id
                    WHERE upp.user_id = ru.user_id AND upp.is_verified = true
                ) as platform_details
            FROM RankedUsers ru
            WHERE ru.name ILIKE $3 OR ru.email ILIKE $3
            ORDER BY ru.rank ASC
            LIMIT $1 OFFSET $2
        `, [limit, offset, `%${search}%`]);

        return rankResult.rows;
    }

    static async getLeaderboardCount(search = '') {
        const result = await pool.query(`
            SELECT COUNT(*) 
            FROM global_leaderboard gl
            JOIN users u ON gl.user_id = u.id
            WHERE u.name ILIKE $1 OR u.email ILIKE $1
        `, [`%${search}%`]);
        return parseInt(result.rows[0].count);
    }

    /**
     * Get Rank for a Specific User
     */
    static async getUserRank(userId: number) {
        const result = await pool.query(`
             WITH RankedUsers AS (
                SELECT 
                    gl.user_id,
                    gl.universal_score,
                    RANK() OVER (ORDER BY gl.universal_score DESC) as rank,
                    u.name,
                    u.email,
                    u.username,
                    u.avatar_url
                FROM global_leaderboard gl
                JOIN users u ON gl.user_id = u.id
            )
            SELECT 
                ru.*,
                (
                    SELECT json_agg(json_build_object(
                        'platform', p.name,
                        'score', (
                            (psr.problems_solved * ${this.WEIGHTS.total_solved}) + 
                            (psr.easy_solved * ${this.WEIGHTS.easy_solved}) +
                            (psr.medium_solved * ${this.WEIGHTS.medium_solved}) +
                            (psr.hard_solved * ${this.WEIGHTS.hard_solved}) +
                            (COALESCE(psr.rating, 0) * ${this.WEIGHTS.contest_rating})
                        )
                    )) 
                    FROM platform_stats_raw psr
                    JOIN user_platform_profiles upp ON psr.user_platform_id = upp.id
                    JOIN platforms p ON upp.platform_id = p.id
                    WHERE upp.user_id = ru.user_id AND upp.is_verified = true
                ) as platform_details
            FROM RankedUsers ru
            WHERE ru.user_id = $1
        `, [userId]);

        return result.rows[0];
    }
}
