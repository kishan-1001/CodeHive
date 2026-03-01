import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import './config/passport';

import authRoutes from './routes/auth';
import executeRoutes from './routes/execute';
import postsRoutes from './routes/posts';
import problemsRoutes from './routes/problems';
import submitRoutes from './routes/submit';
import submissionsRoutes from './routes/submissions';
import passwordResetRoutes from './routes/passwordReset';
import arenaRoutes from './routes/arena';
import aiRoutes from './routes/ai';
import careerRoutes from './routes/career';
import adminProblemsRoutes from './routes/adminProblems';
import adminTestCasesRoutes from './routes/adminTestCases';
import adminTemplatesRoutes from './routes/adminTemplates';
import adminContestsRoutes from './routes/adminContests';
import adminUsersRoutes from './routes/adminUsers';
import adminStatsRoutes from './routes/adminStats';
import contactRoutes from './routes/contact';
import contestsRoutes from './routes/contests';
import leaderboardRoutes from './routes/leaderboard';
import userProfileRoutes from './routes/userProfile';
import roomRoutes from './routes/room';

import helmet from 'helmet';
import { xssSanitize } from './middleware/security';
import rateLimit from 'express-rate-limit';

const app = express();

// --- Rate Limiters ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const executeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Code execution rate limit exceeded. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "https://*", "wss://*"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'https://codehive.vercel.app',
  'http://localhost:5173',
  'https://mycodehive.in',
  'https://www.mycodehive.in',
  'https://code-hive-iota.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(xssSanitize);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/uploads', express.static('uploads'));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', authLimiter, passwordResetRoutes);
app.use('/api/execute', executeLimiter, executeRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submit', submitRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/career', careerRoutes); // Career Routes
app.use('/api/contact', contactRoutes); // Contact Routes
app.use('/api/admin/problems', adminProblemsRoutes); // Admin Routes
app.use('/api/admin', adminTestCasesRoutes); // Admin Test Case Routes
app.use('/api/admin', adminTemplatesRoutes); // Admin Template Routes
app.use('/api/admin/contests', adminContestsRoutes); // Admin Contest Routes
app.use('/api/admin/users', adminUsersRoutes); // Admin User Routes
app.use('/api/admin/stats', adminStatsRoutes); // Admin Stats Routes
app.use('/api/contests', contestsRoutes); // Public Contest Routes
app.use('/api/leaderboard', leaderboardRoutes); // Leaderboard Routes
app.use('/api/profile', userProfileRoutes); // User Profile Routes
app.use('/api/rooms', roomRoutes); // HiveBattles Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
