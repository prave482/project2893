'use client';
import { motion } from 'framer-motion';
import {
  Flame, CheckCircle2, Circle, Loader2, Sparkles,
  Target, TrendingUp, Activity, RefreshCw,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import api from '@/lib/api';

const categoryColors: Record<string, string> = {
  health: '#10b981', work: '#6366f1', personal: '#8b5cf6', finance: '#f59e0b',
};

const priorityColors: Record<string, string> = {
  high: '#f43f5e', medium: '#f59e0b', low: '#6366f1',
};

function fadeProps(i: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.08, duration: 0.45 },
  };
}

export default function DashboardPage() {
  const { data, isLoading, refetch } = useDashboard();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);

  async function fetchInsight() {
    setInsightLoading(true);
    try {
      const res = await api.post('/api/ai/recommend');
      const d = res.data.data;
      setAiInsight(d.action || d.raw || JSON.stringify(d));
    } catch {
      setAiInsight('Could not reach AI. Check your backend connection.');
    } finally {
      setInsightLoading(false);
    }
  }

  const chartData = (data?.goalsProgress ?? []).map((g, i) => ({
    name: g.title,
    value: g.progress,
    fill: Object.values(categoryColors)[i % 4],
  }));

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            Good{' '}
            <span className="gradient-text">
              {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </span>{' '}
            👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn-ghost" onClick={() => refetch()}>
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', padding: 40 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading dashboard...
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Current Streak', value: `${data?.streak ?? 0} days`,                              icon: <Flame size={22} color="#f59e0b" />,        accent: '#f59e0b' },
              { label: 'Tasks Done',     value: `${data?.taskStats.done ?? 0} / ${data?.taskStats.total ?? 0}`, icon: <CheckCircle2 size={22} color="#10b981" />, accent: '#10b981' },
              { label: 'Active Goals',   value: data?.goalsProgress.length ?? 0,                           icon: <Target size={22} color="#6366f1" />,        accent: '#6366f1' },
              { label: 'Habits Today',   value: `${data?.habitStats.checkedInToday ?? 0} / ${data?.habitStats.total ?? 0}`, icon: <Activity size={22} color="#8b5cf6" />, accent: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div key={stat.label} {...fadeProps(i)} className="glass-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {stat.label}
                  </span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${stat.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Today's Focus */}
            <motion.div {...fadeProps(4)} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <TrendingUp size={16} color="#6366f1" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Today&apos;s Focus</span>
              </div>
              {(data?.todaysFocus ?? []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No tasks for today. Create some in the Planner!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(data?.todaysFocus ?? []).map((task) => (
                    <div key={task._id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      background: 'rgba(15,23,42,0.5)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <Circle size={16} color={priorityColors[task.priority] ?? '#6366f1'} />
                      <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{task.title}</span>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Goals Progress Rings */}
            <motion.div {...fadeProps(5)} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Target size={16} color="#8b5cf6" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Goals Progress</span>
              </div>
              {chartData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Add goals to see progress rings.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={chartData}>
                      <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(30,41,59,0.4)' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {chartData.map((g) => (
                      <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.fill }} />
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{g.name} ({g.value}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* AI Insight */}
          <motion.div {...fadeProps(6)} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="#8b5cf6" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Insight</span>
              </div>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={fetchInsight}>
                {insightLoading
                  ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Sparkles size={14} />}
                {insightLoading ? 'Thinking...' : 'What should I do now?'}
              </button>
            </div>
            {aiInsight ? (
              <div style={{
                padding: '14px 16px', background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))',
                border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, fontSize: 14,
                color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                {aiInsight}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Click &quot;What should I do now?&quot; to get a personalized AI recommendation based on your goals and tasks.
              </p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
