import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if user already exists (email or username)
    // We can do this in one query or separate for better error messages
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    if (username) {
      const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    // Now including username in INSERT
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password, username, provider) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, username',
      [name, email, hashedPassword, username || null, 'local']
    );
    const user = userResult.rows[0];

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpHash = await bcrypt.hash(otp, saltRounds);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert OTP verification
    await pool.query(
      'INSERT INTO otp_verifications (user_id, email, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [user.id, email, otpHash, 'register', otpExpiresAt]
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

    res.status(201).json({
      message: 'Registration successful. Please check your email for OTP verification.',
      user: user
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
    const result = await pool.query('SELECT id, name, email, password, role FROM users WHERE email = $1', [email]);
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

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
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
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);

// Verify Token & Get User
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, name, email, username, avatar_url, role, bio, social_links, is_public, created_at FROM users WHERE id = $1',
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
