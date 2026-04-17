'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardData {
  todaysFocus: Array<{
    _id: string; title: string; priority: string; status: string;
  }>;
  streak: number;
  goalsProgress: Array<{
    _id: string; title: string; category: string; progress: number; deadline?: string;
  }>;
  habitStats: { total: number; checkedInToday: number };
  taskStats: { total: number; done: number; inProgress: number; todo: number };
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard');
      return data.data;
    },
    refetchInterval: 60_000,
  });
}
