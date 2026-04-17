'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface HabitEntry { date: string; completed: boolean; }
export interface Habit {
  _id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  history: HabitEntry[];
  color: string;
  icon: string;
  createdAt: string;
}

export function useHabits() {
  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data } = await api.get('/api/habits');
      return data.data;
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Habit>) => api.post('/api/habits', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit created!');
    },
    onError: () => toast.error('Failed to create habit'),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/habits/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      toast.success('Habit removed');
    },
    onError: () => toast.error('Failed to delete habit'),
  });
}

export function useCheckinHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/habits/${id}/checkin`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Checked in! 🔥');
    },
    onError: () => toast.error('Check-in failed'),
  });
}
