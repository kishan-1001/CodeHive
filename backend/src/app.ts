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

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://codehive.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/execute', executeRoutes);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
