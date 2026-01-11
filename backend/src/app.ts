import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import executeRoutes from './routes/execute';
import postsRoutes from './routes/posts';
import problemsRoutes from './routes/problems';
import submitRoutes from './routes/submit';
import passwordResetRoutes from './routes/passwordReset';

import session from 'express-session';
import passport from 'passport';
import './config/passport';

const app = express();

// Middleware
app.use(cors());
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
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/submit', submitRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
