
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Add parent_id to comments if not exists
        console.log('Checking parent_id column...');
        const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'comments' AND column_name = 'parent_id';
    `);

        if (checkColumn.rows.length === 0) {
            console.log('Adding parent_id column to comments table...');
            await client.query(`
        ALTER TABLE comments 
        ADD COLUMN parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
      `);
        } else {
            console.log('parent_id column already exists.');
        }

        // 2. Create comment_likes table
        console.log('Creating comment_likes table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, comment_id)
      );
    `);

        await client.query('COMMIT');
        console.log('Migration successful!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
