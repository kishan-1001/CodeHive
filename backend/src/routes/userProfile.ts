import express from 'express';
import { pool } from '../config/db';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename: user-id-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

const router = express.Router();

/**
 * @route GET /api/profile/coding-profiles
 * @desc Get user's connected coding profiles
 * @access Private
 */
router.get('/coding-profiles', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        const query = `
      SELECT p.name, p.slug, upp.username, upp.profile_url, upp.is_verified as verified
      FROM platforms p
      LEFT JOIN user_platform_profiles upp 
        ON p.id = upp.platform_id AND upp.user_id = $1
      ORDER BY p.id
    `;

        const { rows } = await pool.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching coding profiles:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /api/profile/coding-profiles
 * @desc Update user's coding profiles (usernames)
 * @access Private
 */
router.post('/coding-profiles', authenticateToken, async (req: any, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.user.id;
        const { profiles } = req.body; // Expecting { leetcode: "handle", codeforces: "handle", ... }

        // platform slugs map to names or inputs
        // We assume the frontend sends data keyed by platform slug or name.
        // Let's rely on slugs.

        // 1. Get all valid platforms
        const platformsRes = await client.query('SELECT id, slug FROM platforms');
        const platformsMap = new Map(); // slug -> id
        platformsRes.rows.forEach(p => platformsMap.set(p.slug.toLowerCase(), p.id));

        const updates = [];

        for (const [platformKey, username] of Object.entries(profiles)) {
            const platformId = platformsMap.get(platformKey.toLowerCase());

            if (!platformId) continue; // Skip invalid platforms

            if (!username || (typeof username === 'string' && username.trim() === '')) {
                // If username is empty, we might want to delete the profile or set to null?
                // For now, let's treat empty string as "remove profile" or just skip upsert if we want to keep history?
                // User request "enter his... credential", implies setting it.
                // Let's assume empty string means DELETE/NULL or just don't insert.
                // Actually, easiest is to allow clearing.

                // If username is empty string, let's remove the entry or set username to null.
                // Let's delete the row for cleanliness if it exists.
                await client.query(
                    `DELETE FROM user_platform_profiles WHERE user_id = $1 AND platform_id = $2`,
                    [userId, platformId]
                );
                continue;
            }

            // Upsert
            // If username changes, we should reset verification status to ensure integrity.
            // But if it is the same username, verification should stay.
            // Ideally we check if username changed. 
            // Simple approach: Always reset verified if we are running this update? 
            // Or use a more complex query using DO UPDATE WHERE ...
            // Let's just reset is_verified to false if the username is different. 
            // Actually, for simplicity and security, if the user explicitly saves/updates the form, 
            // we assume they might be correcting a typo or changing accounts.
            // Let's set is_verified = false always on update, forcing re-verification for the new/same name?
            // No, that's annoying if just resaving.
            // Better: 
            // DO UPDATE SET
            //   is_verified = (CASE WHEN user_platform_profiles.username = EXCLUDED.username THEN user_platform_profiles.is_verified ELSE false END),
            //   username = EXCLUDED.username,
            //   verification_token = (CASE WHEN user_platform_profiles.username = EXCLUDED.username THEN user_platform_profiles.verification_token ELSE NULL END)

            const query = `
                INSERT INTO user_platform_profiles (user_id, platform_id, username, created_at, is_verified)
                VALUES ($1, $2, $3, NOW(), false)
                ON CONFLICT (user_id, platform_id)
                DO UPDATE SET 
                  is_verified = (CASE WHEN user_platform_profiles.username = EXCLUDED.username THEN user_platform_profiles.is_verified ELSE false END),
                  verification_token = (CASE WHEN user_platform_profiles.username = EXCLUDED.username THEN user_platform_profiles.verification_token ELSE NULL END),
                  username = EXCLUDED.username
            `;
            updates.push(client.query(query, [userId, platformId, username.toString().trim()]));
        }

        await Promise.all(updates);
        await client.query('COMMIT');

        res.json({ message: 'Profiles updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating coding profiles:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
});

/**
 * @route GET /api/profile/stats
 * @desc Get user's problem solving statistics (Total vs Solved by Difficulty)
 * @access Private
 */
router.get('/stats', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Total Problems Count per Difficulty
        const totalProblemsRes = await pool.query(`
            SELECT 
                difficulty, 
                COUNT(*) as count 
            FROM problems 
            GROUP BY difficulty
        `);

        const totalStats = {
            Easy: 0,
            Medium: 0,
            Hard: 0
        };

        totalProblemsRes.rows.forEach(row => {
            if (row.difficulty in totalStats) {
                (totalStats as any)[row.difficulty] = parseInt(row.count);
            }
        });

        // 2. Get User's Solved Problems Count per Difficulty
        // Count distinct problem_id for 'AC' verdict
        const solvedProblemsRes = await pool.query(`
            SELECT 
                p.difficulty, 
                COUNT(DISTINCT s.problem_id) as count 
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = $1 AND s.verdict = 'AC'
            GROUP BY p.difficulty
        `, [userId]);

        const solvedStats = {
            Easy: 0,
            Medium: 0,
            Hard: 0
        };

        solvedProblemsRes.rows.forEach(row => {
            if (row.difficulty in solvedStats) {
                (solvedStats as any)[row.difficulty] = parseInt(row.count);
            }
        });

        // 3. Get Recent AC Submissions (From both regular submissions and contest submissions)
        const recentSubmissionsRes = await pool.query(`
            SELECT * FROM (
                SELECT 
                    s.id::text as id,
                    p.title as problem,
                    s.verdict as action,
                    s.created_at as time,
                    p.difficulty as type
                FROM submissions s
                JOIN problems p ON s.problem_id = p.id
                WHERE s.user_id = $1
                
                UNION ALL
                
                SELECT 
                    cs.id::text as id,
                    p.title as problem,
                    cs.verdict as action,
                    cs.submitted_at as time,
                    p.difficulty as type
                FROM contest_submissions cs
                JOIN problems p ON cs.problem_id = p.id
                WHERE cs.user_id = $1
            ) AS combined_submissions
            ORDER BY time DESC
            LIMIT 15
        `, [userId]);

        const recentSubmissions = recentSubmissionsRes.rows.map(row => ({
            id: row.id,
            action: row.action === 'AC' ? 'Solved' : 'Attempted', // Simple mapping
            problem: row.problem,
            time: row.time,
            type: row.type.toLowerCase() // 'easy', 'medium', 'hard'
        }));

        // 4. Get Submission Calendar (Heatmap Data - Aggregated from both tables)
        const calendarRes = await pool.query(`
            SELECT 
                TO_CHAR(time, 'YYYY-MM-DD') as day,
                COUNT(*) as value
            FROM (
                SELECT created_at as time FROM submissions WHERE user_id = $1
                UNION ALL
                SELECT submitted_at as time FROM contest_submissions WHERE user_id = $1
            ) as combined_activity
            GROUP BY day
        `, [userId]);

        const submissionCalendar = calendarRes.rows.map(row => ({
            date: row.day,
            count: parseInt(row.value)
        }));

        // 5. Aggregate for Response
        const response = {
            solved: {
                total: solvedStats.Easy + solvedStats.Medium + solvedStats.Hard,
                easy: solvedStats.Easy,
                medium: solvedStats.Medium,
                hard: solvedStats.Hard
            },
            totalQuestions: {
                total: totalStats.Easy + totalStats.Medium + totalStats.Hard,
                easy: totalStats.Easy,
                medium: totalStats.Medium,
                hard: totalStats.Hard
            },
            recentSubmissions,
            submissionCalendar
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route PUT /api/profile/update
 * @desc Update user profile details (name, bio, social_links)
 * @access Private
 */
router.put('/update', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { name, bio, social_links, avatar_url } = req.body;

        // Basic validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Update query
        await pool.query(`
            UPDATE users 
            SET name = $1, bio = $2, social_links = $3, avatar_url = $4
            WHERE id = $5
        `, [name, bio, JSON.stringify(social_links || {}), avatar_url, userId]);

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /api/profile/upload-avatar
 * @desc Upload user avatar
 * @access Private
 */
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req: any, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        // Construct public URL (assuming server runs on localhost:3001 or similar, we'll return relative path)
        // Ideally, frontend prepends API_BASE_URL or we return full URL if we know host.
        // For now, let's return a relative path that frontend can use. 
        // NOTE: Frontend treats this as a URL. We served 'uploads' at root level in app.ts? 
        // In app.ts: app.use('/uploads', express.static('uploads'));
        // So URL is /uploads/filename.

        // We need the base URL. For now, let's store the relative path '/uploads/filename' 
        // storing full URL might be better if we move to S3 later, but for local, relative is fine 
        // IF frontend handles it. 
        // Actually, userProfile.tsx uses <img src={user.avatar_url} />.
        // If we store '/uploads/foo.png', and frontend is on port 5173 and backend on 3001, 
        // <img src="/uploads/foo.png" /> will try to fetch from frontend dev server. 
        // We need to return the full URL including backend origin OR frontend needs to proxy.
        // Frontend proxy is setup for /api, not /uploads usually.
        // Let's assume we return the full URL relative to the server origin, 
        // and frontend might need to prepend backend URL if it's not on same origin.
        // Or better: Let's store the full URL if we can guess it, or just return the path 
        // and let frontend helper handle rendering.

        // Let's rely on a helper in frontend or just return the path with a note.
        // Actually, for simplicity in local dev, let's try to construct a full URL if possible, 
        // or just return `/uploads/${req.file.filename}` and ensure frontend prepends backend URL 
        // OR we add a proxy rule for /uploads in vite config (if it exists).

        // Simplest: store `/uploads/${req.file.filename}`. 
        // Frontend image source: if starts with http, use as is. If starts with /, prepend API_URL (minus /api).


        const avatarUrl = `/uploads/${req.file.filename}`;

        await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);

        res.json({
            message: 'Avatar uploaded successfully',
            avatar_url: avatarUrl
        });

    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /api/profile/coding-profiles/generate-key
 * @desc Generate a verification key for a platform
 * @access Private
 */
router.post('/coding-profiles/generate-key', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { platform } = req.body; // e.g., 'leetcode'

        if (!platform) {
            return res.status(400).json({ error: 'Platform is required' });
        }

        // Get platform ID
        const platformRes = await pool.query('SELECT id FROM platforms WHERE slug = $1', [platform.toLowerCase()]);
        if (platformRes.rows.length === 0) {
            return res.status(404).json({ error: 'Platform not found' });
        }
        const platformId = platformRes.rows[0].id;

        // Check if an unverified token already exists to prevent rotation
        const existing = await pool.query(
            'SELECT verification_token, is_verified FROM user_platform_profiles WHERE user_id = $1 AND platform_id = $2',
            [userId, platformId]
        );

        let verificationToken;

        if (existing.rows.length > 0 && !existing.rows[0].is_verified && existing.rows[0].verification_token) {
            // Reuse existing token
            verificationToken = existing.rows[0].verification_token;
        } else {
            // Generate a random key
            const uniqueSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
            verificationToken = `CodeHive-VERIFY-${uniqueSuffix}`;

            // Upsert verification token
            await pool.query(`
                INSERT INTO user_platform_profiles (user_id, platform_id, verification_token, is_verified)
                VALUES ($1, $2, $3, false)
                ON CONFLICT (user_id, platform_id)
                DO UPDATE SET 
                verification_token = $3,
                is_verified = false
            `, [userId, platformId, verificationToken]);
        }

        res.json({ verification_token: verificationToken });
    } catch (error) {
        console.error('Error generating verification key:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route POST /api/profile/coding-profiles/verify
 * @desc Verify a platform profile by checking bio for key
 * @access Private
 */
router.post('/coding-profiles/verify', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { platform } = req.body;

        if (!platform) {
            return res.status(400).json({ error: 'Platform is required' });
        }

        // Get platform details and user's profile
        const query = `
            SELECT upp.username, upp.verification_token, p.id as platform_id
            FROM user_platform_profiles upp
            JOIN platforms p ON upp.platform_id = p.id
            WHERE upp.user_id = $1 AND p.slug = $2
        `;
        const result = await pool.query(query, [userId, platform.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not linked' });
        }

        const { username, verification_token, platform_id } = result.rows[0];

        if (!verification_token) {
            return res.status(400).json({ error: 'No verification key generated' });
        }

        if (!username) {
            return res.status(400).json({ success: false, error: 'Please save your username first before verifying.' });
        }

        // Verify Logic (This would ideally be in a service)
        // We need to fetch the profile and check for the token
        const VerificationService = require('../services/verificationService').default;
        const verificationResult = await VerificationService.verifyProfile(platform, username, verification_token);

        if (verificationResult.success) {
            await pool.query(`
                UPDATE user_platform_profiles 
                SET is_verified = true, verification_token = NULL 
                WHERE user_id = $1 AND platform_id = $2
            `, [userId, platform_id]);

            // Sync Global Score immediately
            const GlobalLeaderboardService = require('../services/globalLeaderboard').GlobalLeaderboardService;
            await GlobalLeaderboardService.updateUserGlobalScore(userId);

            res.json({ success: true, message: 'Profile verified successfully!' });
        } else {
            res.status(400).json({ success: false, error: verificationResult.error || 'Verification failed.' });
        }

    } catch (error) {
        console.error('Error verifying profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route DELETE /api/profile/coding-profiles/:platform
 * @desc Delete/Unverify a profile
 * @access Private
 */
router.delete('/coding-profiles/:platform', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const platformSlug = req.params.platform;

        // Get platform ID
        const platformRes = await pool.query('SELECT id FROM platforms WHERE slug = $1', [platformSlug.toLowerCase()]);
        if (platformRes.rows.length === 0) {
            return res.status(404).json({ error: 'Platform not found' });
        }
        const platformId = platformRes.rows[0].id;

        await pool.query(`
            DELETE FROM user_platform_profiles 
            WHERE user_id = $1 AND platform_id = $2
        `, [userId, platformId]);

        // Sync Global Score immediately (removes points)
        const GlobalLeaderboardService = require('../services/globalLeaderboard').GlobalLeaderboardService;
        await GlobalLeaderboardService.updateUserGlobalScore(userId);

        res.json({ success: true, message: 'Profile unverified and removed.' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * @route GET /api/profile/activity
 * @desc Get user's paginated submission activity
 * @access Private
 */
router.get('/activity', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // 1. Get Total Activity Count
        const countRes = await pool.query(`
            SELECT COUNT(*) 
            FROM (
                SELECT id FROM submissions WHERE user_id = $1
                UNION ALL
                SELECT id FROM contest_submissions WHERE user_id = $1
            ) as total_activity
        `, [userId]);

        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        // 2. Get Paginated Activity
        const activityRes = await pool.query(`
            SELECT * FROM (
                SELECT 
                    s.id::text as id,
                    p.title as problem,
                    s.verdict as action,
                    s.created_at as time,
                    p.difficulty as type
                FROM submissions s
                JOIN problems p ON s.problem_id = p.id
                WHERE s.user_id = $1
                
                UNION ALL
                
                SELECT 
                    cs.id::text as id,
                    p.title as problem,
                    cs.verdict as action,
                    cs.submitted_at as time,
                    p.difficulty as type
                FROM contest_submissions cs
                JOIN problems p ON cs.problem_id = p.id
                WHERE cs.user_id = $1
            ) AS combined_submissions
            ORDER BY time DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        const submissions = activityRes.rows.map(row => ({
            id: row.id,
            action: row.action === 'AC' ? 'Solved' : 'Attempted',
            problem: row.problem,
            time: row.time,
            type: row.type.toLowerCase()
        }));

        res.json({
            submissions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
