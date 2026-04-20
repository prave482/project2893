import { CareerProfileRecord } from './types';

const store = new Map<string, CareerProfileRecord>();

export function createMemoryProfile(data: Omit<CareerProfileRecord, 'id'>) {
  const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const profile: CareerProfileRecord = { ...data, id };
  store.set(id, profile);
  return profile;
}

export function findMemoryProfileById(id: string): CareerProfileRecord | null {
  return store.get(id) ?? null;
}

export function findMemoryProfileByEmail(email: string): CareerProfileRecord | null {
  for (const profile of store.values()) {
    if (profile.email === email) return profile;
  }
  return null;
}

export function updateMemoryProfile(id: string, updater: (current: CareerProfileRecord) => CareerProfileRecord): CareerProfileRecord | null {
  const current = store.get(id);
  if (!current) return null;
  const updated = updater(current);
  store.set(id, updated);
  return updated;
}
