 'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Bot, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = login({ email: email.trim(), password });
    if (!result.ok) {
      toast.error(result.message ?? 'Login failed');
      return;
    }

    toast.success('Logged in');
    router.push('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-panel auth-panel--feature">
          <div className="hero-badge">
            <Bot size={14} />
            <span>Secure access to your planner and AI coach</span>
          </div>
          <h1 className="auth-title">Welcome back to Life OS</h1>
          <p className="auth-description">
            Sign in to continue planning your week, tracking progress, and asking the AI coach for focused next steps.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Open your dashboard and current streaks instantly</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Continue AI chat sessions and productivity recommendations</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Access planner, goals, and habits from one account</span>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form glass-card">
          <div className="auth-form-header">
            <div className="auth-form-icon">
              <LockKeyhole size={18} />
            </div>
            <h2>Login</h2>
            <p>Use your email and password to enter the workspace.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              <span>Email</span>
              <div className="auth-input-wrap">
                <Mail size={16} />
                <input
                  className="input-field auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-label">
              <span>Password</span>
              <div className="auth-input-wrap">
                <LockKeyhole size={16} />
                <input
                  className="input-field auth-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="hero-primary auth-submit">Login</button>
          </form>

          <div className="auth-footer">
            <span>Don&apos;t have an account?</span>
            <Link href="/signup">
              Create one <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
