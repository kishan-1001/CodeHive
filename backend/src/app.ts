import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import executeRoutes from './routes/execute';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/execute', executeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
