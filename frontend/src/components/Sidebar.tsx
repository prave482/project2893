'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  LogOut,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/#home', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#planner', label: 'Planner' },
  { href: '/#goals', label: 'Goals' },
  { href: '/#ai-coach', label: 'AI Coach' },
  { href: '/#dashboard-preview', label: 'Dashboard' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === '/';

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__brand">
          <div className="top-nav__logo">
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div className="top-nav__title">Life <span className="gradient-text">OS</span></div>
            <div className="top-nav__subtitle">AI powered life planning workspace</div>
          </div>
        </Link>

        <nav className="top-nav__links">
          {navItems.map(({ href, label }, index) => {
            const active = isHome && index === 0;
            return (
              <Link key={href} href={href} className={`top-nav__link ${active ? 'is-active' : ''}`}>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="top-nav__actions">
          <div className="top-nav__chip">
            <Sparkles size={15} />
            <span>Focus better with AI</span>
          </div>

          <Link href="/planner" className="top-nav__cart" aria-label="View cart and planner">
            <ClipboardList size={16} />
          </Link>

          <button
            onClick={toggleTheme}
            className="top-nav__theme-button"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <Link href="/login" className="top-nav__login">
            <span>Login</span>
            <ArrowRight size={15} />
          </Link>

          <Link href="/signup" className="top-nav__signup">
            <ShieldCheck size={15} />
            <span>Sign Up</span>
          </Link>

          {isAuthenticated && (
            <button onClick={logout} className="top-nav__logout" title={user?.email ?? 'Logout'}>
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}

          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="top-nav__menu-button"
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="top-nav__mobile-panel"
          >
            {navItems.map(({ href, label }, index) => {
              const active = isHome && index === 0;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`top-nav__mobile-link ${active ? 'is-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{label}</span>
                </Link>
              );
            })}
            <Link href="/dashboard" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={17} />
              <span>Open Dashboard</span>
            </Link>
            <Link href="/login" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <ShieldCheck size={17} />
              <span>Login</span>
            </Link>
            <Link href="/signup" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <Sparkles size={17} />
              <span>Sign Up</span>
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                className="top-nav__mobile-link top-nav__mobile-button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            )}
            <Link href="/goals" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <Target size={17} />
              <span>Goals</span>
            </Link>
            <Link href="/ai-chat" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <Bot size={17} />
              <span>AI Coach</span>
            </Link>
            <Link href="/planner" className="top-nav__mobile-link" onClick={() => setMenuOpen(false)}>
              <ClipboardList size={17} />
              <span>Planner</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
