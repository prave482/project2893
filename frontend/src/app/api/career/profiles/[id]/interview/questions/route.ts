import { NextResponse } from 'next/server';
import { findMemoryProfileById, updateMemoryProfile } from '@/lib/memoryStore';
import { generateInterviewQuestionsForProfile } from '@/lib/ai.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findMemoryProfileById(id);
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });

    const generated = await generateInterviewQuestionsForProfile({
      fullName: profile.fullName,
      targetRole: profile.targetRole,
      skills: profile.skills,
      careerGoals: profile.careerGoals,
      resumeText: profile.resumeText,
    });

    const updated = updateMemoryProfile(id, (current) => ({
      ...current,
      interviewQuestions: generated.interviewQuestions,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: { profile: updated, meta: { aiProvider: generated.aiProvider, storage: 'memory' } } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate interview questions.' }, { status: 500 });
  }
}