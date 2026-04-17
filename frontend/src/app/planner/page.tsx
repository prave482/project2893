'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Loader2, CalendarDays } from 'lucide-react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, Task } from '@/hooks/useTasks';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am–8pm

const priorityColors: Record<string, string> = {
  high: '#f43f5e', medium: '#f59e0b', low: '#6366f1',
};

function getWeekDates(): Date[] {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function isSameDay(d1: Date, d2: Date) {
  return d1.toDateString() === d2.toDateString();
}

export default function PlannerPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', priority: 'medium' as Task['priority'],
    scheduledAt: new Date().toISOString().slice(0, 16), duration: 60,
  });

  const weekDates = getWeekDates();
  const today = new Date();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    createTask.mutate({ ...form, status: 'todo' }, { onSuccess: () => { setShowForm(false); setForm({ title: '', priority: 'medium', scheduledAt: new Date().toISOString().slice(0, 16), duration: 60 }); } });
  }

  function toggleStatus(task: Task) {
    const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
    updateTask.mutate({ id: task._id, status: next });
  }

  const scheduledTasks = tasks.filter((t) => t.scheduledAt);
  const unscheduled = tasks.filter((t) => !t.scheduledAt && t.status !== 'done');

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Planner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Weekly view — schedule and manage your tasks</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Task
        </button>
      </motion.div>

      {/* Week Strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 8 }}>
        {weekDates.map((d, i) => {
          const isToday = isSameDay(d, today);
          const dayTasks = scheduledTasks.filter((t) => t.scheduledAt && isSameDay(new Date(t.scheduledAt), d));
          return (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 10,
              background: isToday ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
              border: isToday ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
            }}>
              <div style={{ fontSize: 11, color: isToday ? '#6366f1' : 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>
                {DAYS[d.getDay()]}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 6 }}>
                {d.getDate()}
              </div>
              {dayTasks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {dayTasks.slice(0, 3).map((t) => (
                    <div key={t._id} style={{ width: 5, height: 5, borderRadius: '50%', background: priorityColors[t.priority] }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Time grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card" style={{ padding: 20, overflowY: 'auto', maxHeight: '60vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <CalendarDays size={15} color="#6366f1" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Time Blocks — Today</span>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading...
            </div>
          ) : (
            HOURS.map((h) => {
              const hrTasks = scheduledTasks.filter((t) => {
                if (!t.scheduledAt) return false;
                const d = new Date(t.scheduledAt);
                return isSameDay(d, today) && d.getHours() === h;
              });
              return (
                <div key={h} style={{ display: 'flex', gap: 12, marginBottom: 4, minHeight: 44, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, fontSize: 11, color: 'var(--text-muted)', paddingTop: 12, flexShrink: 0 }}>
                    {h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`}
                  </div>
                  <div style={{ flex: 1, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 6 }}>
                    {hrTasks.map((t) => (
                      <div key={t._id} style={{
                        padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                        background: `${priorityColors[t.priority]}18`,
                        border: `1px solid ${priorityColors[t.priority]}25`,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <button onClick={() => toggleStatus(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          {t.status === 'done'
                            ? <CheckCircle2 size={14} color="#10b981" />
                            : <Circle size={14} color={priorityColors[t.priority]} />}
                        </button>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1,
                          textDecoration: t.status === 'done' ? 'line-through' : 'none',
                          opacity: t.status === 'done' ? 0.5 : 1 }}>
                          {t.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} /> {t.duration}m
                        </span>
                        <button onClick={() => deleteTask.mutate(t._id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

        {/* Unscheduled backlog */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Backlog</div>
          {unscheduled.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All tasks are scheduled! 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unscheduled.map((t) => (
                <div key={t._id} style={{
                  padding: '10px 12px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(15,23,42,0.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColors[t.priority], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{t.title}</span>
                    <button onClick={() => deleteTask.mutate(t._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    {(['todo', 'in-progress', 'done'] as const).map((s) => (
                      <button key={s} onClick={() => updateTask.mutate({ id: t._id, status: s })}
                        style={{
                          padding: '2px 8px', borderRadius: 100, fontSize: 11, cursor: 'pointer',
                          background: t.status === s ? 'rgba(99,102,241,0.2)' : 'transparent',
                          color: t.status === s ? '#6366f1' : 'var(--text-muted)',
                          border: `1px solid ${t.status === s ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                          fontFamily: 'inherit',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Task Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Create Task</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input className="input-field" placeholder="Task title..." value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Priority</label>
                  <select className="input-field" value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Duration (min)</label>
                  <input className="input-field" type="number" min={5} step={5} value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Schedule at</label>
                <input className="input-field" type="datetime-local" value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createTask.isPending}>
                  {createTask.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
