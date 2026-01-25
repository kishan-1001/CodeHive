import { Router } from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Apply auth and admin check
router.use(authenticateToken, isAdmin);

// 1. List All Users
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, username, email, provider, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. Update User Role
router.put('/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // 'user' or 'admin'

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.json({ message: 'User role updated successfully' });
    } catch (err: any) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
