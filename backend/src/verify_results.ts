import { Pool } from "pg";

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "CodeHive",
    password: "Kishan123@$",
    port: 5432,
});

async function run() {
    try {
        const contestId = 12; // From previous debug output
        const userId = 40;   // From previous debug output
        const problemId = 18; // From previous debug output

        console.log("Testing query with submitted_at...");
        const subRes = await pool.query(`
            SELECT verdict, code, language, runtime_ms
            FROM contest_submissions
            WHERE contest_id = $1 AND user_id = $2 AND problem_id = $3
            ORDER BY 
                CASE WHEN verdict = 'AC' THEN 1 ELSE 2 END,
                submitted_at DESC
            LIMIT 1
        `, [contestId, userId, problemId]);

        console.log("Result:", subRes.rows[0]);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
