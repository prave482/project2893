'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';

const publicRoutes = new Set(['/','/login','/signup']);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isPublicRoute, isReady, pathname, router]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
