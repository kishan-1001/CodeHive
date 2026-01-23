import { pool } from '../config/db';

const platforms = [
    { name: 'LeetCode', slug: 'leetcode', base_url: 'https://leetcode.com' },
    { name: 'CodeForces', slug: 'codeforces', base_url: 'https://codeforces.com' },
    { name: 'CodeChef', slug: 'codechef', base_url: 'https://www.codechef.com' },
    { name: 'GeeksForGeeks', slug: 'geeksforgeeks', base_url: 'https://www.geeksforgeeks.org' },
    { name: 'HackerRank', slug: 'hackerrank', base_url: 'https://www.hackerrank.com' }
];

async function seedPlatforms() {
    const client = await pool.connect();
    try {
        console.log('Seeding platforms...');

        // Check if table exists
        try {
            await client.query('SELECT count(*) FROM platforms');
        } catch (err: any) {
            if (err.code === '42P01') { // undefined_table
                console.log('Creating platforms table...');
                await client.query(`
                CREATE TABLE platforms (
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(50) UNIQUE NOT NULL,
                  slug VARCHAR(50) UNIQUE NOT NULL,
                  base_url TEXT NOT NULL
                );
            `);
            } else {
                throw err;
            }
        }

        // Check user_platform_profiles table
        try {
            await client.query('SELECT count(*) FROM user_platform_profiles');
        } catch (err: any) {
            if (err.code === '42P01') {
                console.log('Creating user_platform_profiles table...');
                await client.query(`
                CREATE TABLE user_platform_profiles (
                  id SERIAL PRIMARY KEY,
                  user_id INT NOT NULL,
                  platform_id INT NOT NULL,
                  username VARCHAR(100),
                  profile_url TEXT,
                  verified BOOLEAN DEFAULT false,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                  UNIQUE (user_id, platform_id),
                
                  FOREIGN KEY (user_id) REFERENCES users(id),
                  FOREIGN KEY (platform_id) REFERENCES platforms(id)
                );
             `);
            }
        }

        for (const p of platforms) {
            await client.query(`
        INSERT INTO platforms (name, slug, base_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
      `, [p.name, p.slug, p.base_url]);
        }
        console.log('Platforms seeded successfully.');
    } catch (error) {
        console.error('Error seeding platforms:', error);
    } finally {
        client.release();
        pool.end();
    }
}

seedPlatforms();
