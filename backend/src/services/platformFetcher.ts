import axios from 'axios';
import { load } from 'cheerio';
import { pool } from '../config/db';

export class PlatformFetcherService {

    static async fetchAndUpsertUserStats(userId: number) {
        const client = await pool.connect();
        try {
            // 1. Get user's platform handles
            const res = await client.query(`
        SELECT upp.id as user_platform_id, upp.username, p.name as platform_name, p.slug
        FROM user_platform_profiles upp
        JOIN platforms p ON upp.platform_id = p.id
        WHERE upp.user_id = $1
      `, [userId]);

            const profiles = res.rows;

            for (const profile of profiles) {
                if (!profile.username) continue;

                let stats = null;
                try {
                    switch (profile.slug.toLowerCase()) {
                        case 'leetcode':
                            stats = await this.fetchLeetCodeStats(profile.username);
                            break;
                        case 'codeforces':
                            stats = await this.fetchCodeForcesStats(profile.username);
                            break;
                        case 'codechef':
                            stats = await this.fetchCodeChefStats(profile.username);
                            break;
                        case 'geeksforgeeks':
                            stats = await this.fetchGeeksForGeeksStats(profile.username);
                            break;
                        case 'hackerrank':
                            stats = await this.fetchHackerRankStats(profile.username);
                            break;
                        default:
                            console.log(`Fetching not implemented for ${profile.slug}`);
                    }
                } catch (fetchErr) {
                    console.error(`Failed to fetch stats for ${profile.slug} user ${profile.username}`, fetchErr);
                }

                if (stats) {
                    console.log(`[Upsert] ${profile.slug} Stats:`, stats);
                    // Upsert into platform_stats_raw
                    await client.query(`
            INSERT INTO platform_stats_raw 
              (user_platform_id, problems_solved, easy_solved, medium_solved, hard_solved, rating, fetched_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (user_platform_id) DO UPDATE SET 
             problems_solved = EXCLUDED.problems_solved,
             easy_solved = EXCLUDED.easy_solved,
             medium_solved = EXCLUDED.medium_solved,
             hard_solved = EXCLUDED.hard_solved,
             rating = EXCLUDED.rating,
             fetched_at = NOW()
          `, [
                        profile.user_platform_id,
                        stats.problems_solved,
                        stats.easy_solved,
                        stats.medium_solved,
                        stats.hard_solved,
                        stats.rating
                    ]).catch(async (e) => {
                        console.error(`[Upsert Error] ${profile.slug}:`, e.message);
                        // Fallback logic for upsert
                        const check = await client.query('SELECT id FROM platform_stats_raw WHERE user_platform_id = $1', [profile.user_platform_id]);
                        if (check.rows.length > 0) {
                            await client.query(`
                    UPDATE platform_stats_raw SET
                    problems_solved = $2, easy_solved = $3, medium_solved = $4, hard_solved = $5, rating = $6, fetched_at = NOW()
                    WHERE user_platform_id = $1
                 `, [profile.user_platform_id, stats.problems_solved, stats.easy_solved, stats.medium_solved, stats.hard_solved, stats.rating]);
                        } else {
                            await client.query(`
                    INSERT INTO platform_stats_raw 
                    (user_platform_id, problems_solved, easy_solved, medium_solved, hard_solved, rating, fetched_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                 `, [profile.user_platform_id, stats.problems_solved, stats.easy_solved, stats.medium_solved, stats.hard_solved, stats.rating]);
                        }
                    });
                } else {
                    console.log(`[Upsert] No stats returned for ${profile.slug}`);
                }
            }

        } finally {
            client.release();
        }
    }

    // --- LeetCode Fetcher ---
    private static async fetchLeetCodeStats(username: string) {
        // LeetCode GraphQL API
        const query = `
      query userProblems($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
          }
        }
        userContestRanking(username: $username) {
            rating
        }
      }
    `;

        try {
            const response = await axios.post('https://leetcode.com/graphql', {
                query,
                variables: { username }
            });

            const data = response.data.data;
            if (!data.matchedUser) return null;

            const ac = data.matchedUser.submitStats.acSubmissionNum;
            const easy = ac.find((x: any) => x.difficulty === 'Easy')?.count || 0;
            const medium = ac.find((x: any) => x.difficulty === 'Medium')?.count || 0;
            const hard = ac.find((x: any) => x.difficulty === 'Hard')?.count || 0;
            const total = ac.find((x: any) => x.difficulty === 'All')?.count || 0;

            const rating = data.userContestRanking?.rating ? Math.round(data.userContestRanking.rating) : 0;

            return {
                problems_solved: total,
                easy_solved: easy,
                medium_solved: medium,
                hard_solved: hard,
                rating: rating,
            };

        } catch (error) {
            //   console.error('LeetCode fetch error:', error);
            throw error;
        }
    }

    // --- CodeForces Fetcher ---
    private static async fetchCodeForcesStats(username: string) {
        try {
            // 1. Get rating
            const infoRes = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`);
            if (infoRes.data.status !== 'OK') return null;

            const user = infoRes.data.result[0];
            const rating = user.rating || 0;

            // 2. Get solved count
            const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=5000`);
            let solvedCount = 0;
            let easy = 0, medium = 0, hard = 0;

            if (statusRes.data.status === 'OK') {
                const submissions = statusRes.data.result;
                const solvedProblems = new Set<string>();

                submissions.forEach((sub: any) => {
                    if (sub.verdict === 'OK' && sub.problem) {
                        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
                        if (!solvedProblems.has(problemId)) {
                            solvedProblems.add(problemId);

                            // Heuristic for difficulty
                            const r = sub.problem.rating;
                            if (r) {
                                if (r < 1200) easy++;
                                else if (r < 1600) medium++;
                                else hard++;
                            } else {
                                const idx = sub.problem.index.charAt(0);
                                if (idx === 'A' || idx === 'B') easy++;
                                else if (idx === 'C' || idx === 'D') medium++;
                                else hard++;
                            }
                        }
                    }
                });
                solvedCount = solvedProblems.size;
            }

            return {
                problems_solved: solvedCount,
                easy_solved: easy,
                medium_solved: medium,
                hard_solved: hard,
                rating: rating
            };

        } catch (error) {
            console.error('CodeForces fetch error:', error);
            // Return null or partial if failing
            return { problems_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0, rating: 0 };
        }
    }

    // --- CodeChef Fetcher ---
    private static async fetchCodeChefStats(username: string) {
        try {
            const response = await axios.get(`https://www.codechef.com/users/${username}`);
            const $ = load(response.data);

            // Rating
            const ratingStr = $('.rating-number').text();
            const rating = parseInt(ratingStr, 10) || 0;

            // Solved: "Fully Solved (150)"
            let total = 0;
            const fullySolvedText = $('h5:contains("Fully Solved")').text();
            const match = fullySolvedText.match(/\((\d+)\)/);
            if (match) {
                total = parseInt(match[1], 10);
            }

            return {
                problems_solved: total,
                easy_solved: 0,
                medium_solved: 0,
                hard_solved: 0,
                rating: rating
            };
        } catch (error) {
            console.error('CodeChef fetch error using scraping:', error);
            return { problems_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0, rating: 0 };
        }
    }

    // --- GeeksForGeeks Fetcher ---
    private static async fetchGeeksForGeeksStats(username: string) {
        try {
            console.log(`[GFG] Fetching for ${username}...`);
            // GFG Profile: https://www.geeksforgeeks.org/user/{username}/
            // Use headers to mimic browser
            const response = await axios.get(`https://www.geeksforgeeks.org/user/${username}/`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = response.data;
            const $ = load(html);

            let rating = 0;
            let problemsSolved = 0;

            // Strategy 1: Next.js __NEXT_DATA__ (Pages Router)
            const nextDataScript = $('#__NEXT_DATA__').html();
            if (nextDataScript) {
                try {
                    const json = JSON.parse(nextDataScript);
                    const userInfo = json.props?.pageProps?.userInfo;
                    if (userInfo) {
                        rating = userInfo.score || userInfo.pod_score || 0;
                        problemsSolved = userInfo.total_problems_solved || 0;
                        console.log(`[GFG] Found via NEXT_DATA: Solved=${problemsSolved}, Score=${rating}`);
                    }
                } catch (e) { /* ignore */ }
            }

            // Strategy 2: Regex for Next.js App Router query with robustness for escaped quotes
            if (problemsSolved === 0) {
                const solvedRegex = /(?:\\)?["']total_problems_solved(?:\\)?["']:\s*(\d+)/g;
                const solvedMatches = [...html.matchAll(solvedRegex)];
                console.log(`[GFG Debug] Solved Matches:`, solvedMatches.map(m => m[1]));

                if (solvedMatches.length > 0) {
                    const values = solvedMatches.map((m: any) => parseInt(m[1], 10));
                    problemsSolved = Math.max(...values);
                }

                const scoreRegex = /(?:\\)?["']score(?:\\)?["']:\s*(\d+)/g;
                const scoreMatches = [...html.matchAll(scoreRegex)];
                console.log(`[GFG Debug] Score Matches:`, scoreMatches.map(m => m[1]));

                if (scoreMatches.length > 0) {
                    const values = scoreMatches.map((m: any) => parseInt(m[1], 10));
                    rating = Math.max(...values);
                }
            }

            // Strategy 3: HTML selectors (fallback)
            if (problemsSolved === 0) {
                const scoreText = $('.codingscore_value').text() || $('.score_card_value').text();
                rating = parseInt(scoreText, 10) || rating;
            }

            return {
                problems_solved: problemsSolved,
                easy_solved: 0,
                medium_solved: 0,
                hard_solved: 0,
                rating: rating
            };

        } catch (error) {
            console.error('GFG fetch error:', error);
            // Don't throw, return 0
            return { problems_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0, rating: 0 };
        }
    }

    // --- HackerRank Fetcher ---
    private static async fetchHackerRankStats(username: string) {
        try {
            console.log(`[HR] Fetching for ${username}...`);
            const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const data = response.data;
            if (!data || !data.model) return null;

            const model = data.model;
            // Handle null badges
            let badgesCount = (model.badges && Array.isArray(model.badges)) ? model.badges.length : 0;

            let rating = 0;
            try {
                const eloRes = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/scores_elo`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (eloRes.data && Array.isArray(eloRes.data)) {
                    const algo = eloRes.data.find((x: any) => x.contest_slug === 'algorithm' || x.category === 'algorithms');
                    if (algo) {
                        rating = Math.round(algo.practice_rating || algo.rating || 0);
                    }
                }
            } catch (e) {
                // ignore
            }

            // Fallback: Use recent challenges to calculate a "pseudo-solved" count if we have no other data
            // or just always augment.
            let solvedCount = 0;
            try {
                const recentRes = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/recent_challenges?limit=100`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 5000
                });
                if (recentRes.data && recentRes.data.models) {
                    const unique = new Set();
                    recentRes.data.models.forEach((m: any) => unique.add(m.ch_slug));
                    solvedCount = unique.size;
                    console.log(`[HR] Found ${solvedCount} unique recent challenges`);
                }
            } catch (e) {
                console.log('[HR] Recent challenges fetch failed');
            }

            return {
                problems_solved: solvedCount,
                easy_solved: 0,
                medium_solved: 0,
                hard_solved: 0,
                rating: rating > 0 ? rating : (badgesCount * 50)
            };

        } catch (error) {
            console.error('HackerRank fetch error:', error);
            return { problems_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0, rating: 0 };
        }
    }
}
