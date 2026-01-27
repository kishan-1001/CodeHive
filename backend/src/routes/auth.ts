import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import fs from 'fs';
import path from 'path';
import { LeaderboardService } from '../services/leaderboardService';
import { GlobalLeaderboardService } from '../services/globalLeaderboard';
import { PlatformFetcherService } from '../services/platformFetcher';

const router = Router();

// Helper to trigger background refresh
const triggerLeaderboardRefresh = (userId: number) => {
  // Fire and forget - don't await
  (async () => {
    try {
      console.log(`[Background] Refreshing leaderboards for user ${userId}`);
      // Internal stats (Fast)
      await LeaderboardService.calculateUserScore(userId);

      // Global stats (Slow - External fetch)
      await PlatformFetcherService.fetchAndUpsertUserStats(userId);
      await GlobalLeaderboardService.updateUserGlobalScore(userId);
      console.log(`[Background] Leaderboard refresh complete for user ${userId}`);
    } catch (err) {
      console.error(`[Background] Error refreshing leaderboards for user ${userId}:`, err);
    }
  })();
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check for disposable email
    try {
      const emailDomain = email.split('@')[1];
      const configPath = path.join(__dirname, '../config/disposable_emails.json');
      const data = fs.readFileSync(configPath, 'utf8');
      const disposableEmails = JSON.parse(data);

      if (disposableEmails.includes(emailDomain)) {
        return res.status(400).json({
          message: "Nice try! 🎭 But we don't accept burner emails here. Please use a real email address to join the hive! 🐝"
        });
      }
    } catch (err) {
      console.error('Error checking disposable email:', err);
      // Proceed if check fails (fail open) or handle error
    }

    // Check if user already exists (email or username)
    // We can do this in one query or separate for better error messages
    const existingEmail = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    let userId: number;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (existingEmail.rows.length > 0) {
      const existingUser = existingEmail.rows[0];
      if (existingUser.is_verified) {
        return res.status(400).json({ message: 'User with this email already exists' });
      } else {
        // User exists but is NOT verified. We treat this as a retry.
        // We update the existing record with new details (in case they changed name/password)
        console.log(`Unverified user ${email} re-registering. Updating details.`);

        // Update user
        await pool.query(
          'UPDATE users SET name = $1, password = $2, username = $3 WHERE id = $4',
          [name, hashedPassword, username || null, existingUser.id]
        );
        userId = existingUser.id;
      }
    } else {
      // New user
      if (username) {
        const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUsername.rows.length > 0) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
      }

      // Insert user
      const userResult = await pool.query(
        'INSERT INTO users (name, email, password, username, provider, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [name, email, hashedPassword, username || null, 'local', false]
      );
      userId = userResult.rows[0].id;
    }

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpHash = await bcrypt.hash(otp, saltRounds);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert OTP verification
    await pool.query(
      'INSERT INTO otp_verifications (user_id, email, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, otpHash, 'register', otpExpiresAt]
    );

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail registration if email fails, but log it
    }

    // Log the request
    console.log(`OTP sent to ${email} for registration`);

    // Trigger initial leaderboard setup (empty stats but good to init)
    triggerLeaderboardRefresh(userId);

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP verification.',
      user: { id: userId, name, email, username }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP verification record
    const otpResult = await pool.query(
      'SELECT id, user_id, otp_hash, expires_at FROM otp_verifications WHERE email = $1 AND purpose = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, 'register']
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const otpRecord = otpResult.rows[0];

    // Check if OTP matches
    const isValidOTP = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!isValidOTP) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE otp_verifications SET used = true WHERE id = $1',
      [otpRecord.id]
    );

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = true WHERE id = $1',
      [otpRecord.user_id]
    );

    // Find user
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [otpRecord.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Trigger refresh on successful verification
    triggerLeaderboardRefresh(user.id);

    res.json({
      message: 'Account verified successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT id, name, email, password, role, is_verified FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user has password (local login)
    if (!user.password) {
      return res.status(400).json({ message: 'Please use OAuth login for this account' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check verification status
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Trigger refresh on login
    triggerLeaderboardRefresh(user.id);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google Auth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const user = req.user as any;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Trigger refresh on OAuth login
    triggerLeaderboardRefresh(user.id);

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// GitHub Auth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const user = req.user as any;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Trigger refresh on GitHub login
    triggerLeaderboardRefresh(user.id);

    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
);

// Verify Token & Get User
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, name, email, username, avatar_url, role, bio, social_links, is_public, views_count, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
