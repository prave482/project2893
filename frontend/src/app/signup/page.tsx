 'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = signup({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (!result.ok) {
      toast.error(result.message ?? 'Sign up failed');
      return;
    }

    toast.success('Account created');
    router.push('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-panel auth-panel--feature">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Create your productivity workspace</span>
          </div>
          <h1 className="auth-title">Start planning with Life OS</h1>
          <p className="auth-description">
            Set up your account to organize goals, build habits, schedule tasks, and use AI support in one place.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Track long-term goals with clear milestone progress</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Build consistent habits with streak-based motivation</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Use AI support once your `OPENAI_API_KEY` is configured on the backend</span>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form glass-card">
          <div className="auth-form-header">
            <div className="auth-form-icon">
              <UserRound size={18} />
            </div>
            <h2>Sign Up</h2>
            <p>Create a new account to get started.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              <span>Full name</span>
              <div className="auth-input-wrap">
                <UserRound size={16} />
                <input
                  className="input-field auth-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </label>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="hero-primary auth-submit">Create Account</button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link href="/login">
              Login <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
