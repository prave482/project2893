import { Router, Request, Response } from 'express';
import Task from '../models/Task';
import { isDatabaseReady } from '../utils/database';
import {
  createMemoryTask,
  deleteMemoryTask,
  getMemoryTaskById,
  getMemoryTasks,
  updateMemoryTask,
} from '../utils/memoryStore';

const router = Router();

// GET /api/tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      return res.json({ success: true, data: getMemoryTasks(req.query) });
    }

    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.goalId) filter.goalId = req.query.goalId;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const task = getMemoryTaskById(req.params.id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      return res.json({ success: true, data: task });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
});

// POST /api/tasks
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const task = createMemoryTask(req.body);
      return res.status(201).json({ success: true, data: task });
    }

    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const task = updateMemoryTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
      return res.json({ success: true, data: task });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const deleted = deleteMemoryTask(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
      return res.json({ success: true, data: { message: 'Task deleted' } });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

export default router;
