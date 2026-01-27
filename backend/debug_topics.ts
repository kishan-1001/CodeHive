
import { pool } from './src/config/db';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        console.log("Running query...");
        const res = await pool.query(`
            SELECT 
                t.name, 
                COUNT(DISTINCT pt.problem_id) as total_problems
            FROM topics t
            LEFT JOIN problem_topics pt ON t.id = pt.topic_id
            GROUP BY t.id, t.name
            ORDER BY t.name
    `);
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
