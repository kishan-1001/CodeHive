import rateLimit from 'express-rate-limit';

// Applied to login, verify-otp, forgot-password, reset-password
// Protects against brute-force attacks
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Applied to /api/execute to prevent compute abuse
export const executeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Code execution rate limit exceeded. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});
