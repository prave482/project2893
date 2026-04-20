import { NextResponse } from 'next/server';
import { findMemoryProfileById, updateMemoryProfile } from '@/lib/memoryStore';
import { generateProjectsForProfile, buildProgressSnapshot } from '@/lib/ai.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findMemoryProfileById(id);
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });

    const generated = await generateProjectsForProfile({
      fullName: profile.fullName,
      targetRole: profile.targetRole,
      skills: profile.skills,
      careerGoals: profile.careerGoals,
      resumeText: profile.resumeText,
    });

    const progress = buildProgressSnapshot(
      profile.skillGap.missingSkills,
      generated.projects,
      profile.progress.completedSkills,
      profile.progress.completedProjects,
      profile.progress.weeklyGoal
    );

    const updated = updateMemoryProfile(id, (current) => ({
      ...current,
      projects: generated.projects,
      progress,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: { profile: updated, meta: { aiProvider: generated.aiProvider, storage: 'memory' } } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate projects.' }, { status: 500 });
  }
}