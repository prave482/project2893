import { Router, Request, Response } from 'express';
import Message from '../models/Message';
import Goal from '../models/Goal';
import Habit from '../models/Habit';
import Task from '../models/Task';
import { chatWithAI, generateDailyPlan, getRecommendation } from '../services/openai.service';
import { isDatabaseReady } from '../utils/database';
import {
  createMemoryMessage,
  getMemoryGoals,
  getMemoryHabits,
  getMemoryMessages,
  getMemoryTasks,
} from '../utils/memoryStore';

const router = Router();

async function getUserContext() {
  if (!isDatabaseReady()) {
    return {
      goals: getMemoryGoals(),
      habits: getMemoryHabits(),
      tasks: getMemoryTasks().filter((task) => task.status !== 'done'),
    };
  }

  const [goals, habits, tasks] = await Promise.all([
    Goal.find().lean(),
    Habit.find().lean(),
    Task.find({ status: { $ne: 'done' } }).lean(),
  ]);
  return { goals, habits, tasks };
}

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

    let messages: Array<{ role: 'user' | 'assistant'; content: string }> = [{ role: 'user', content: message }];

    if (isDatabaseReady()) {
      await Message.create({ role: 'user', content: message, sessionId });

      const history = await Message.find({ sessionId })
        .sort({ timestamp: 1 })
        .limit(20)
        .lean();

      messages = history
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    } else {
      createMemoryMessage({ role: 'user', content: message, sessionId });
      messages = getMemoryMessages(sessionId)
        .filter((m) => m.role !== 'system')
        .slice(-20)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    }

    const context = await getUserContext();
    const reply = await chatWithAI(messages, context);

    if (isDatabaseReady()) {
      await Message.create({ role: 'assistant', content: reply, sessionId });
    } else {
      createMemoryMessage({ role: 'assistant', content: reply, sessionId });
    }

    res.json({ success: true, data: { reply, sessionId } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'AI chat failed' });
  }
});

// GET /api/ai/history — Get chat history for a session
router.get('/history', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseReady()) {
      const sessionId = (req.query.sessionId as string) || 'default';
      return res.json({ success: true, data: getMemoryMessages(sessionId).slice(-100) });
    }

    const sessionId = (req.query.sessionId as string) || 'default';
    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// POST /api/ai/plan
router.post('/plan', async (_req: Request, res: Response) => {
  try {
    const context = await getUserContext();
    const planStr = await generateDailyPlan(context);
    let plan: unknown;
    try {
      plan = JSON.parse(planStr);
    } catch {
      plan = { raw: planStr };
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate plan' });
  }
});

// POST /api/ai/recommend
router.post('/recommend', async (_req: Request, res: Response) => {
  try {
    const context = await getUserContext();
    const recStr = await getRecommendation(context);
    let recommendation: unknown;
    try {
      recommendation = JSON.parse(recStr);
    } catch {
      recommendation = { raw: recStr };
    }
    res.json({ success: true, data: recommendation });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get recommendation' });
  }
});

export default router;
