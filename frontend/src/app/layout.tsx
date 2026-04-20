import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'AI Career Copilot',
  description:
    'Upload a resume or add your skills to get AI-powered career analysis, project ideas, mock interviews, and progress tracking.',
  keywords: ['career copilot', 'resume analyzer', 'skill gap analysis', 'mock interview', 'openai'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
