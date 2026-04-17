import { Router, Request, Response } from 'express';
import Habit from '../models/Habit';
import { isDatabaseReady } from '../utils/database';
import {
  checkInMemoryHabit,
  createMemoryHabit,
  deleteMemoryHabit,
  getMemoryHabitById,
  getMemoryHabits,
  updateMemoryHabit,
} from '../utils/memoryStore';

const router = Router();

// GET /api/habits
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ success: true, data: getMemoryHabits() });
    }

    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch habits' });
  }
});

// GET /api/habits/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const habit = getMemoryHabitById(req.params.id);
      if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
      return res.json({ success: true, data: habit });
    }

    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch habit' });
  }
});

// POST /api/habits
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const habit = createMemoryHabit(req.body);
      return res.status(201).json({ success: true, data: habit });
    }

    const habit = new Habit(req.body);
    await habit.save();
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create habit' });
  }
});

// PUT /api/habits/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const habit = updateMemoryHabit(req.params.id, req.body);
      if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
      return res.json({ success: true, data: habit });
    }

    const habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update habit' });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const deleted = deleteMemoryHabit(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Habit not found' });
      return res.json({ success: true, data: { message: 'Habit deleted' } });
    }

    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
    res.json({ success: true, data: { message: 'Habit deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete habit' });
  }
});

// PATCH /api/habits/:id/checkin — Mark today's check-in, update streak
router.patch('/:id/checkin', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const habit = checkInMemoryHabit(req.params.id);
      if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });
      return res.json({ success: true, data: habit });
    }

    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ success: false, error: 'Habit not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyCheckedIn = habit.history.some((entry) => {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() && entry.completed;
    });

    if (!alreadyCheckedIn) {
      habit.history.push({ date: today, completed: true });

      // Calculate streak — count consecutive days backwards
      const sortedDates = habit.history
        .filter((e) => e.completed)
        .map((e) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
        .sort((a, b) => b - a);

      let streak = 0;
      let expected = today.getTime();
      for (const ts of sortedDates) {
        if (ts === expected) {
          streak++;
          expected -= 86400000;
        } else break;
      }
      habit.streak = streak;

      await habit.save();
    }

    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to check in' });
  }
});

export default router;
