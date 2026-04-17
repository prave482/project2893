import { Router, Request, Response } from 'express';
import Goal from '../models/Goal';
import { isDatabaseReady } from '../utils/database';
import {
  createMemoryGoal,
  deleteMemoryGoal,
  getMemoryGoalById,
  getMemoryGoals,
  updateMemoryGoal,
} from '../utils/memoryStore';

const router = Router();

// GET /api/goals
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ success: true, data: getMemoryGoals() });
    }

    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

// GET /api/goals/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const goal = getMemoryGoalById(req.params.id);
      if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
      return res.json({ success: true, data: goal });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch goal' });
  }
});

// POST /api/goals
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const goal = createMemoryGoal(req.body);
      return res.status(201).json({ success: true, data: goal });
    }

    const goal = new Goal(req.body);
    await goal.save();
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const goal = updateMemoryGoal(req.params.id, req.body);
      if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
      return res.json({ success: true, data: goal });
    }

    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const deleted = deleteMemoryGoal(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Goal not found' });
      return res.json({ success: true, data: { message: 'Goal deleted' } });
    }

    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
    res.json({ success: true, data: { message: 'Goal deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete goal' });
  }
});

export default router;
