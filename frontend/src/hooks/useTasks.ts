'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  goalId?: string;
  scheduledAt?: string;
  duration?: number;
  createdAt: string;
}

export function useTasks(params?: { status?: string; goalId?: string }) {
  return useQuery<Task[]>({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const { data } = await api.get('/api/tasks', { params });
      return data.data;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Task>) => api.post('/api/tasks', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created!');
    },
    onError: () => toast.error('Failed to create task'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Task> & { id: string }) =>
      api.put(`/api/tasks/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Failed to update task'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: () => toast.error('Failed to delete task'),
  });
}
