type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
type GoalCategory = 'health' | 'work' | 'personal' | 'finance';
type HabitFrequency = 'daily' | 'weekly';
type MessageRole = 'user' | 'assistant' | 'system';

export interface MemoryTask {
  _id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  goalId?: string;
  scheduledAt?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryGoal {
  _id: string;
  title: string;
  description: string;
  category: GoalCategory;
  milestones: Array<{ title: string; completed: boolean }>;
  deadline?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryHabit {
  _id: string;
  title: string;
  frequency: HabitFrequency;
  streak: number;
  history: Array<{ date: string; completed: boolean }>;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryMessage {
  _id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sessionId: string;
}

const store = {
  tasks: [] as MemoryTask[],
  goals: [] as MemoryGoal[],
  habits: [] as MemoryHabit[],
  messages: [] as MemoryMessage[],
};

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function getMemoryTasks(filter?: { status?: unknown; goalId?: unknown }) {
  return store.tasks
    .filter((task) => {
      if (filter?.status && task.status !== filter.status) return false;
      if (filter?.goalId && task.goalId !== filter.goalId) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMemoryTaskById(id: string) {
  return store.tasks.find((task) => task._id === id) ?? null;
}

export function createMemoryTask(input: Partial<MemoryTask>) {
  const timestamp = nowIso();
  const task: MemoryTask = {
    _id: createId('task'),
    title: input.title?.trim() || 'Untitled task',
    priority: input.priority ?? 'medium',
    status: input.status ?? 'todo',
    goalId: input.goalId,
    scheduledAt: input.scheduledAt,
    duration: input.duration ?? 30,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.tasks.unshift(task);
  return task;
}

export function updateMemoryTask(id: string, input: Partial<MemoryTask>) {
  const task = getMemoryTaskById(id);
  if (!task) return null;
  Object.assign(task, input, { updatedAt: nowIso() });
  return task;
}

export function deleteMemoryTask(id: string) {
  const index = store.tasks.findIndex((task) => task._id === id);
  if (index === -1) return false;
  store.tasks.splice(index, 1);
  return true;
}

export function getMemoryGoals() {
  return [...store.goals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMemoryGoalById(id: string) {
  return store.goals.find((goal) => goal._id === id) ?? null;
}

export function createMemoryGoal(input: Partial<MemoryGoal>) {
  const timestamp = nowIso();
  const goal: MemoryGoal = {
    _id: createId('goal'),
    title: input.title?.trim() || 'Untitled goal',
    description: input.description ?? '',
    category: input.category ?? 'personal',
    milestones: input.milestones ?? [],
    deadline: input.deadline,
    progress: Math.min(100, Math.max(0, input.progress ?? 0)),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.goals.unshift(goal);
  return goal;
}

export function updateMemoryGoal(id: string, input: Partial<MemoryGoal>) {
  const goal = getMemoryGoalById(id);
  if (!goal) return null;
  Object.assign(goal, input, {
    progress: Math.min(100, Math.max(0, input.progress ?? goal.progress)),
    updatedAt: nowIso(),
  });
  return goal;
}

export function deleteMemoryGoal(id: string) {
  const index = store.goals.findIndex((goal) => goal._id === id);
  if (index === -1) return false;
  store.goals.splice(index, 1);
  return true;
}

export function getMemoryHabits() {
  return [...store.habits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMemoryHabitById(id: string) {
  return store.habits.find((habit) => habit._id === id) ?? null;
}

export function createMemoryHabit(input: Partial<MemoryHabit>) {
  const timestamp = nowIso();
  const habit: MemoryHabit = {
    _id: createId('habit'),
    title: input.title?.trim() || 'Untitled habit',
    frequency: input.frequency ?? 'daily',
    streak: input.streak ?? 0,
    history: input.history ?? [],
    color: input.color ?? '#6366f1',
    icon: input.icon ?? '✅',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.habits.unshift(habit);
  return habit;
}

export function updateMemoryHabit(id: string, input: Partial<MemoryHabit>) {
  const habit = getMemoryHabitById(id);
  if (!habit) return null;
  Object.assign(habit, input, { updatedAt: nowIso() });
  return habit;
}

export function deleteMemoryHabit(id: string) {
  const index = store.habits.findIndex((habit) => habit._id === id);
  if (index === -1) return false;
  store.habits.splice(index, 1);
  return true;
}

export function checkInMemoryHabit(id: string) {
  const habit = getMemoryHabitById(id);
  if (!habit) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const alreadyCheckedIn = habit.history.some((entry) => {
    const date = new Date(entry.date);
    date.setHours(0, 0, 0, 0);
    return entry.completed && date.getTime() === todayTime;
  });

  if (!alreadyCheckedIn) {
    habit.history.push({ date: today.toISOString(), completed: true });

    const sortedDates = habit.history
      .filter((entry) => entry.completed)
      .map((entry) => {
        const date = new Date(entry.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a);

    let streak = 0;
    let expected = todayTime;
    for (const timestamp of sortedDates) {
      if (timestamp === expected) {
        streak += 1;
        expected -= 86400000;
        continue;
      }
      if (timestamp < expected) break;
    }

    habit.streak = streak;
    habit.updatedAt = nowIso();
  }

  return habit;
}

export function getMemoryMessages(sessionId?: string) {
  return store.messages
    .filter((message) => !sessionId || message.sessionId === sessionId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function createMemoryMessage(input: Omit<MemoryMessage, '_id' | 'timestamp'> & { timestamp?: string }) {
  const message: MemoryMessage = {
    _id: createId('msg'),
    role: input.role,
    content: input.content,
    sessionId: input.sessionId,
    timestamp: input.timestamp ?? nowIso(),
  };
  store.messages.push(message);
  return message;
}
