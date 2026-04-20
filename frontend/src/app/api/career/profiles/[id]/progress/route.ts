import { NextResponse } from 'next/server';
import { findMemoryProfileById, updateMemoryProfile } from '@/lib/memoryStore';
import { buildProgressSnapshot } from '@/lib/ai.service';

function normalizeList(input: unknown) {
  if (Array.isArray(input)) return input.map((item) => String(item).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findMemoryProfileById(id);
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });

    const body = await request.json();
    const completedSkills = normalizeList(body.completedSkills);
    const completedProjects = normalizeList(body.completedProjects);
    const weeklyGoal = String(body.weeklyGoal ?? profile.progress.weeklyGoal ?? '').trim();

    const progress = buildProgressSnapshot(
      profile.skillGap.missingSkills,
      profile.projects,
      completedSkills,
      completedProjects,
      weeklyGoal
    );

    const updated = updateMemoryProfile(id, (current) => ({
      ...current,
      progress,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: { profile: updated } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update progress.' }, { status: 500 });
  }
}