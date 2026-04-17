import { Router, Request, Response } from 'express';
import Goal from '../models/Goal';
import Habit from '../models/Habit';
import Task from '../models/Task';
import { isDatabaseReady } from '../utils/database';
import { getMemoryGoals, getMemoryHabits, getMemoryTasks } from '../utils/memoryStore';

const router = Router();

// GET /api/dashboard — Aggregated stats
router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isDatabaseReady()) {
      const goals = getMemoryGoals();
      const habits = getMemoryHabits();
      const tasks = getMemoryTasks();

      const todaysTasks = tasks
        .filter((t) => {
          if (t.status === 'done') return false;
          if (!t.scheduledAt) return t.status === 'todo';
          const d = new Date(t.scheduledAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime();
        })
        .slice(0, 3);

      const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

      const habitsCheckedIn = habits.filter((h) =>
        h.history.some((e) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === today.getTime() && e.completed;
        })
      ).length;

      return res.json({
        success: true,
        data: {
          todaysFocus: todaysTasks,
          streak: maxStreak,
          goalsProgress: goals.map((g) => ({
            _id: g._id,
            title: g.title,
            category: g.category,
            progress: g.progress,
            deadline: g.deadline,
          })),
          habitStats: { total: habits.length, checkedInToday: habitsCheckedIn },
          taskStats: {
            total: tasks.length,
            done: tasks.filter((t) => t.status === 'done').length,
            inProgress: tasks.filter((t) => t.status === 'in-progress').length,
            todo: tasks.filter((t) => t.status === 'todo').length,
          },
        },
      });
    }

    const [goals, habits, tasks] = await Promise.all([
      Goal.find().lean(),
      Habit.find().lean(),
      Task.find().lean(),
    ]);

    // Today's tasks (scheduled for today or unscheduled todos)
    const todaysTasks = tasks
      .filter((t) => {
        if (t.status === 'done') return false;
        if (!t.scheduledAt) return t.status === 'todo';
        const d = new Date(t.scheduledAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      })
      .slice(0, 3);

    // Best streak across habits
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

    // Goals progress
    const goalsProgress = goals.map((g) => ({
      _id: g._id,
      title: g.title,
      category: g.category,
      progress: g.progress,
      deadline: g.deadline,
    }));

    // Habit check-in stats for today
    const habitsCheckedIn = habits.filter((h) =>
      h.history.some((e: { date: Date; completed: boolean }) => {
        const d = new Date(e.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime() && e.completed;
      })
    ).length;

    // Task completion stats
    const taskStats = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
    };

    res.json({
      success: true,
      data: {
        todaysFocus: todaysTasks,
        streak: maxStreak,
        goalsProgress,
        habitStats: {
          total: habits.length,
          checkedInToday: habitsCheckedIn,
        },
        taskStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load dashboard' });
  }
});

export default router;
