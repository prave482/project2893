'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Flame, Check, Trash2, Loader2, Activity, X } from 'lucide-react';
import { useHabits, useCreateHabit, useDeleteHabit, useCheckinHabit, Habit } from '@/hooks/useHabits';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];
const ICONS = ['✅', '💪', '📚', '🏃', '💧', '🧘', '🌙', '⚡', '🎯', '🥗'];

function getLast53Sundays(): Date[] {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() - 52 * 7);
  sunday.setHours(0, 0, 0, 0);
  return Array.from({ length: 53 * 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function HabitHeatmap({ habit }: { habit: Habit }) {
  const allDays = getLast53Sundays();
  const completedSet = new Set(
    habit.history.filter((e) => e.completed).map((e) => new Date(e.date).toDateString())
  );

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(53, 14px)', gridTemplateRows: 'repeat(7, 14px)', gap: 2 }}>
        {allDays.map((d, i) => {
          const completed = completedSet.has(d.toDateString());
          const isToday = isSameDay(d, new Date());
          const isAfterToday = d > new Date();
          return (
            <div
              key={i}
              title={d.toLocaleDateString()}
              style={{
                width: 14, height: 14, borderRadius: 3,
                background: isAfterToday
                  ? 'transparent'
                  : completed
                  ? habit.color
                  : 'rgba(30,41,59,0.8)',
                outline: isToday ? `2px solid ${habit.color}` : 'none',
                outlineOffset: 1,
                opacity: isAfterToday ? 0 : 1,
                transition: 'all 0.15s ease',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { data: habits = [], isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const checkin = useCheckinHabit();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', frequency: 'daily' as Habit['frequency'],
    color: COLORS[0], icon: ICONS[0],
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    createHabit.mutate(form, { onSuccess: () => { setShowModal(false); setForm({ title: '', frequency: 'daily', color: COLORS[0], icon: ICONS[0] }); } });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isCheckedInToday(habit: Habit) {
    return habit.history.some((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() && e.completed;
    });
  }

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Habits</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Build consistency with daily tracking</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Habit</button>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 32 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading habits...
        </div>
      ) : habits.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card"
          style={{ padding: 48, textAlign: 'center' }}>
          <Activity size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 20 }}>No habits yet. Start tracking your first habit!</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Habit</button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {habits.map((habit, i) => {
            const checkedToday = isCheckedInToday(habit);
            return (
              <motion.div key={habit._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card" style={{ padding: 24 }}>
                {/* Habit header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, fontSize: 20,
                      background: `${habit.color}18`,
                      border: `1px solid ${habit.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {habit.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{habit.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{habit.frequency}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Flame size={13} color="#f59e0b" />
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{habit.streak}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => !checkedToday && checkin.mutate(habit._id)}
                      disabled={checkedToday || checkin.isPending}
                      style={{
                        padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        background: checkedToday ? 'rgba(16,185,129,0.15)' : `${habit.color}20`,
                        border: `1px solid ${checkedToday ? 'rgba(16,185,129,0.3)' : `${habit.color}40`}`,
                        color: checkedToday ? '#10b981' : habit.color,
                        cursor: checkedToday ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: 'inherit', transition: 'all 0.2s ease',
                      }}>
                      <Check size={13} />
                      {checkedToday ? 'Done!' : "Check In"}
                    </button>
                    <button onClick={() => deleteHabit.mutate(habit._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Heatmap */}
                <HabitHeatmap habit={habit} />

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Total check-ins</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {habit.history.filter((e) => e.completed).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>This week</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {habit.history.filter((e) => {
                        const d = new Date(e.date);
                        const dayOfWeek = new Date().getDay();
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - dayOfWeek);
                        weekStart.setHours(0, 0, 0, 0);
                        return e.completed && d >= weekStart;
                      }).length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Best streak</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{habit.streak}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>New Habit</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input className="input-field" placeholder="Habit name..." value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Frequency</label>
                  <select className="input-field" value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as Habit['frequency'] })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ICONS.map((icon) => (
                      <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                        style={{
                          width: 38, height: 38, borderRadius: 8, fontSize: 18, cursor: 'pointer',
                          background: form.icon === icon ? 'rgba(99,102,241,0.2)' : 'rgba(15,23,42,0.5)',
                          border: `1px solid ${form.icon === icon ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)'}`,
                        }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                        style={{
                          width: 28, height: 28, borderRadius: '50%', background: color, cursor: 'pointer',
                          border: `3px solid ${form.color === color ? 'white' : 'transparent'}`,
                        }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={createHabit.isPending}>
                    {createHabit.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                    Create Habit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
