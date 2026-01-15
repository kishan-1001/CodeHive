
import { pool } from '../src/config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        await client.query('BEGIN');

        // Add new columns
        const columns = [
            'runtime_ms INT',
            'memory_kb INT',
            'time_complexity_static VARCHAR(50)',
            'space_complexity_static VARCHAR(50)',
            'time_complexity_ml VARCHAR(50)',
            'space_complexity_ml VARCHAR(50)',
            'ml_confidence NUMERIC(5,2)',
            "complexity_source VARCHAR(20) CHECK (complexity_source IN ('static', 'ml', 'unknown'))"
        ];

        for (const col of columns) {
            try {
                await client.query(`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ${col}`);
                console.log(`Added column: ${col.split(' ')[0]}`);
            } catch (e) {
                console.log(`Column might already exist or error: ${col.split(' ')[0]}`, e);
            }
        }

        // Update verdict constraint
        try {
            await client.query(`ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_verdict_check`);
            await client.query(`ALTER TABLE submissions ADD CONSTRAINT submissions_verdict_check CHECK (verdict IN ('AC', 'WA', 'TLE', 'MLE', 'RE', 'CE'))`);
            console.log('Updated verdict check constraint.');
        } catch (e) {
            console.error('Error updating constraint:', e);
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
