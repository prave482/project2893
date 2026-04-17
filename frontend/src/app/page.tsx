import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LockKeyhole,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const categories = [
  {
    title: 'Daily Planner',
    description: 'Schedule tasks, organize time blocks, and keep today visible without clutter.',
  },
  {
    title: 'Goal Tracking',
    description: 'Break goals into milestones and measure progress in a simple visual way.',
  },
  {
    title: 'Habit Building',
    description: 'Track consistency, maintain streaks, and stay accountable with daily check-ins.',
  },
];

const highlights = [
  { label: 'Tasks, goals, and habits in one place', icon: CheckCircle2 },
  { label: 'AI-assisted next-step recommendations', icon: Bot },
  { label: 'Clean dashboard for everyday use', icon: TrendingUp },
];

const appSections = [
  {
    title: 'Planner',
    description: 'Map your work week, create tasks quickly, and keep the backlog under control.',
    icon: CalendarDays,
    href: '/planner',
  },
  {
    title: 'Goals',
    description: 'Track milestones, update progress, and organize long-term outcomes clearly.',
    icon: Target,
    href: '/goals',
  },
  {
    title: 'Dashboard',
    description: 'See streaks, focus items, and progress snapshots in one polished view.',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
];

export default function Home() {
  return (
    <div className="landing-page">
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI powered productivity workspace</span>
          </div>

          <h1 className="hero-title">
            Organize your <span className="gradient-text">Life OS</span>
          </h1>

          <p className="hero-owner">Goals, habits, planner, and AI coach</p>

          <p className="hero-description">
            A focused personal productivity system that helps you plan your day, track long-term progress,
            build habits, and ask AI what to do next, all inside one clear workspace.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="hero-primary">
              Open Dashboard
            </Link>
            <Link href="/planner" className="hero-secondary">
              Start Planning
              <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="hero-secondary">
              Create Account
              <LockKeyhole size={16} />
            </Link>
          </div>

          <div className="hero-highlights">
            {highlights.map(({ label, icon: Icon }) => (
              <div key={label} className="hero-highlight">
                <Icon size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-showroom">
            <div className="showroom-light" />
            <div className="showroom-monitor showroom-monitor--left" />
            <div className="showroom-monitor showroom-monitor--right" />
            <div className="showroom-table">
              <div className="showroom-tray" />
              <div className="showroom-tools">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span key={index} className="showroom-tool" />
                ))}
              </div>
            </div>
            <div className="showroom-side-unit showroom-side-unit--left" />
            <div className="showroom-side-unit showroom-side-unit--right" />
          </div>

          <div className="hero-floating-card">
            <div className="hero-floating-number">4</div>
            <div className="hero-floating-label">Core productivity modules</div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section__header">
          <span className="landing-eyebrow">Features</span>
          <h2>Everything important stays visible and easy to act on</h2>
          <p>Use the same clean visual theme, but for your real product workflow instead of copied demo content.</p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.title} className="category-card glass-card">
              <div className="category-card__icon">
                <BadgeCheck size={20} />
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--split" id="planner">
        <div className="about-panel glass-card">
          <span className="landing-eyebrow">Planner</span>
          <h2>Website-style design on top, app data underneath</h2>
          <p>
            The homepage now uses the clean hero, airy spacing, rounded cards, and top-navigation style you wanted,
            while the actual functionality still belongs to your planner, goals, habits, dashboard, and AI coach.
          </p>
        </div>

        <div className="stats-panel">
          <div className="stats-card glass-card">
            <strong>Plan</strong>
            <span>Schedule tasks and time blocks</span>
          </div>
          <div className="stats-card glass-card">
            <strong>Track</strong>
            <span>Follow goals and habit streaks</span>
          </div>
          <div className="stats-card glass-card">
            <strong>Ask AI</strong>
            <span>Get suggestions for your next best action</span>
          </div>
        </div>
      </section>

      <section className="landing-section" id="dashboard-preview">
        <div className="landing-section__header">
          <span className="landing-eyebrow">App Sections</span>
          <h2>Jump straight into the part of the app you need</h2>
        </div>
        <div className="review-grid">
          {appSections.map((section) => {
            const Icon = section.icon;
            return (
            <article key={section.title} className="review-card glass-card">
              <div className="category-card__icon">
                <Icon size={20} />
              </div>
              <p>{section.description}</p>
              <strong>{section.title}</strong>
              <span><Link href={section.href}>Open {section.title}</Link></span>
            </article>
          );
          })}
        </div>
      </section>

      <section className="landing-section landing-section--cta" id="ai-coach">
        <div className="cta-card glass-card">
          <div>
            <span className="landing-eyebrow">AI Coach</span>
            <h2>Need help deciding what to work on next?</h2>
            <p>Use the AI coach to review progress, suggest priorities, and keep momentum without leaving the app.</p>
          </div>
          <div className="cta-actions" id="goals">
            <Link href="/ai-chat" className="hero-primary">Open AI Coach</Link>
            <Link href="/goals" className="hero-secondary">
              View Goals
              <ClipboardList size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="cta-card glass-card auth-cta-card">
          <div>
            <span className="landing-eyebrow">Account Access</span>
            <h2>Professional auth flow, ready for real backend wiring</h2>
            <p>
              The UI now includes dedicated login and sign up screens so the product feels complete and
              production-ready while we keep the design consistent with the rest of the site.
            </p>
          </div>
          <div className="cta-actions">
            <Link href="/login" className="hero-secondary">Login</Link>
            <Link href="/signup" className="hero-primary">Sign Up</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
