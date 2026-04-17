'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Pencil, Trash2, CheckSquare, Square, Loader2, Target, X } from 'lucide-react';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, Goal } from '@/hooks/useGoals';

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  health:   { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  text: '#10b981' },
  work:     { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  text: '#6366f1' },
  personal: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', text: '#8b5cf6' },
  finance:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
};

type FormState = {
  title: string; description: string; category: Goal['category'];
  deadline: string; progress: number;
  milestones: Array<{ title: string; completed: boolean }>;
};

const emptyForm: FormState = {
  title: '', description: '', category: 'personal', deadline: '', progress: 0, milestones: [],
};

export default function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [newMilestone, setNewMilestone] = useState('');

  function openCreate() { setEditing(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(g: Goal) {
    setEditing(g);
    setForm({
      title: g.title, description: g.description, category: g.category,
      deadline: g.deadline ? g.deadline.slice(0, 10) : '', progress: g.progress,
      milestones: g.milestones,
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditing(null); setForm(emptyForm); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined };
    if (editing) {
      updateGoal.mutate({ id: editing._id, ...payload }, { onSuccess: closeModal });
    } else {
      createGoal.mutate(payload, { onSuccess: closeModal });
    }
  }

  function addMilestone() {
    if (!newMilestone.trim()) return;
    setForm({ ...form, milestones: [...form.milestones, { title: newMilestone, completed: false }] });
    setNewMilestone('');
  }
  function removeMilestone(i: number) {
    setForm({ ...form, milestones: form.milestones.filter((_, idx) => idx !== i) });
  }

  const grouped: Record<string, Goal[]> = { health: [], work: [], personal: [], finance: [] };
  goals.forEach((g) => { grouped[g.category]?.push(g); });

  return (
    <div style={{ padding: '32px', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Goals</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Track your milestones and measure progress</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} /> New Goal</button>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', padding: 32 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading goals...
        </div>
      ) : goals.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card"
          style={{ padding: 48, textAlign: 'center' }}>
          <Target size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 20 }}>No goals yet. Set your first goal to get started!</p>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Create Goal</button>
        </motion.div>
      ) : (
        Object.entries(grouped).map(([cat, catGoals]) =>
          catGoals.length === 0 ? null : (
            <div key={cat} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColors[cat].text }} />
                <span className="section-title" style={{ margin: 0 }}>{cat}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({catGoals.length})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {catGoals.map((goal, i) => {
                  const c = categoryColors[goal.category];
                  const totalM = goal.milestones.length;
                  const doneM = goal.milestones.filter((m) => m.completed).length;
                  return (
                    <motion.div key={goal._id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-card"
                      style={{ padding: 22, background: c.bg, borderColor: c.border }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <span className={`badge badge-${goal.category}`} style={{ marginBottom: 8, display: 'inline-flex' }}>{goal.category}</span>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{goal.title}</h3>
                          {goal.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{goal.description}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                          <button onClick={() => openEdit(goal)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteGoal.mutate(goal._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{goal.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${goal.progress}%`, background: c.text }} />
                        </div>
                      </div>

                      {/* Milestones */}
                      {totalM > 0 && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                            Milestones: {doneM}/{totalM}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {goal.milestones.slice(0, 3).map((m, mi) => (
                              <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: m.completed ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                                {m.completed ? <CheckSquare size={12} color="#10b981" /> : <Square size={12} color="var(--text-muted)" />}
                                <span style={{ textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</span>
                              </div>
                            ))}
                            {totalM > 3 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{totalM - 3} more</span>}
                          </div>
                        </div>
                      )}

                      {goal.deadline && (
                        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                          🗓 {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
        )
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div className="modal-content" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {editing ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input className="input-field" placeholder="Goal title..." value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea className="input-field" placeholder="Description (optional)..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Category</label>
                    <select className="input-field" value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value as Goal['category'] })}>
                      <option value="health">Health</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="finance">Finance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Deadline</label>
                    <input className="input-field" type="date" value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Progress: {form.progress}%
                  </label>
                  <input type="range" min={0} max={100} value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: '#6366f1' }} />
                </div>
                {/* Milestones */}
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Milestones</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="input-field" placeholder="Add milestone..." value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
                      style={{ flex: 1 }} />
                    <button type="button" className="btn-ghost" onClick={addMilestone} style={{ padding: '10px 14px' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {form.milestones.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(15,23,42,0.5)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{m.title}</span>
                        <button type="button" onClick={() => removeMilestone(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                  <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={createGoal.isPending || updateGoal.isPending}>
                    {(createGoal.isPending || updateGoal.isPending)
                      ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Plus size={14} />}
                    {editing ? 'Update Goal' : 'Create Goal'}
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
