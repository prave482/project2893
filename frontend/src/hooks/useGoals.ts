'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface Milestone { title: string; completed: boolean; }
export interface Goal {
  _id: string;
  title: string;
  description: string;
  category: 'health' | 'work' | 'personal' | 'finance';
  milestones: Milestone[];
  deadline?: string;
  progress: number;
  createdAt: string;
}

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data } = await api.get('/api/goals');
      return data.data;
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Goal>) => api.post('/api/goals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created!');
    },
    onError: () => toast.error('Failed to create goal'),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Goal> & { id: string }) =>
      api.put(`/api/goals/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated!');
    },
    onError: () => toast.error('Failed to update goal'),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: () => toast.error('Failed to delete goal'),
  });
}
