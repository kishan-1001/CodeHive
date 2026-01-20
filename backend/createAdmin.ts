
import { pool } from './src/config/db';
import bcrypt from 'bcrypt';

async function createAdmin() {
    const email = 'admin@test.com';
    const password = 'password123';
    const name = 'Admin User';
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('User already exists, updating role...');
            await pool.query('UPDATE users SET role = $1, password = $2 WHERE email = $3', [role, hashedPassword, email]);
        } else {
            console.log('Creating new admin user...');
            await pool.query(
                'INSERT INTO users (name, email, password, role, provider, is_verified) VALUES ($1, $2, $3, $4, $5, $6)',
                [name, email, hashedPassword, role, 'local', true]
            );
        }
        console.log('Admin user ready: admin@test.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
