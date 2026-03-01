import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { emailService } from '../services/emailService';

const router = Router();

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Generate OTP
    const otp = emailService.generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert OTP verification for forgot password
    await pool.query(
      'INSERT INTO otp_verifications (user_id, email, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [user.id, email, otpHash, 'forgot_password', otpExpiresAt]
    );

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Log the request
    console.log(`Password reset OTP sent to ${email}`);

    res.json({
      message: 'Password reset OTP sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify Forgot Password OTP
router.post('/verify-forgot-password-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP verification record
    const otpResult = await pool.query(
      'SELECT id, user_id, otp_hash, expires_at FROM otp_verifications WHERE email = $1 AND purpose = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, 'forgot_password']
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

    res.json({
      message: 'OTP verified successfully. You can now reset your password.',
    });
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the most recent used OTP for this email and purpose
    const otpResult = await pool.query(
      'SELECT id, user_id FROM otp_verifications WHERE email = $1 AND purpose = $2 AND used = true AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, 'forgot_password']
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: 'OTP verification expired or invalid' });
    }

    const otpRecord = otpResult.rows[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, otpRecord.user_id]
    );

    // Invalidate all OTPs for this user and purpose (for security)
    await pool.query(
      'UPDATE otp_verifications SET used = true WHERE user_id = $1 AND purpose = $2',
      [otpRecord.user_id, 'forgot_password']
    );

    // Get user details for JWT
    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [otpRecord.user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(500).json({ message: 'User not found after password reset' });
    }

    const user = userResult.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('SERVER CONFIG ERROR: JWT_SECRET is missing.');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Password reset successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
