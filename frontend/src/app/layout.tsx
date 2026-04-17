import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Life OS — AI-Powered Life Tracking',
  description:
    'Your personal AI productivity coach. Track goals, habits, and tasks with AI-driven insights and daily planning.',
  keywords: ['productivity', 'ai', 'goal tracking', 'habit tracker', 'life os'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
