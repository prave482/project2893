import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

import goalRoutes from './routes/goals';
import habitRoutes from './routes/habits';
import taskRoutes from './routes/tasks';
import aiRoutes from './routes/ai';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      message: 'AI Life OS Backend is running',
      aiConfigured: Boolean(process.env.OPENAI_API_KEY),
      databaseConnected: mongoose.connection.readyState === 1,
    },
  });
});

app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Error handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Server ────────────────────────────────────────────────────────
async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err);
      console.warn('⚠️  Running without database — data will not persist');
    }
  } else {
    console.warn('⚠️  MONGODB_URI not set — running without database');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start();
