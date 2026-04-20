import { Router } from 'express';
import { getAiConfigStatus } from '../services/ai.service';
import { getDatabaseStatus } from '../utils/database';

const router = Router();

router.get('/', (_req, res) => {
  const ai = getAiConfigStatus();
  res.json({
    success: true,
    data: {
      status: 'ok',
      database: getDatabaseStatus(),
      ai,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
