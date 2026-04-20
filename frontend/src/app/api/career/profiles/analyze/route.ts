import { NextResponse } from 'next/server';
import { createMemoryProfile, findMemoryProfileByEmail, updateMemoryProfile } from '@/lib/memoryStore';
import { generateCareerSnapshot } from '@/lib/ai.service';

function normalizeList(input: unknown) {
  if (Array.isArray(input)) return input.map((item) => String(item).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function buildSnapshotInput(payload: Record<string, unknown>) {
  const resumeTextInput = String(payload.resumeText ?? '').trim();
  const resumeFileBase64 = payload.resumeFileBase64 ? String(payload.resumeFileBase64) : '';
  
  let finalResumeText = resumeTextInput;
  if (!resumeTextInput && resumeFileBase64) {
    finalResumeText = '[PDF file uploaded - please analyze based on user skills and target role]';
  }
  
  return {
    fullName: String(payload.fullName ?? '').trim(),
    email: String(payload.email ?? '').trim().toLowerCase(),
    targetRole: String(payload.targetRole ?? '').trim(),
    careerGoals: normalizeList(payload.careerGoals),
    skills: normalizeList(payload.skills),
    resumeText: finalResumeText,
    resumeFileName: payload.resumeFileName ? String(payload.resumeFileName) : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Analyze request body:', { ...body, resumeFileBase64: body.resumeFileBase64 ? '[BASE64_LENGTH:' + body.resumeFileBase64.length + ']' : undefined });
    const input = buildSnapshotInput(body);
    console.log('Built input:', { ...input, resumeText: input.resumeText ? '[TEXT_SET]' : '[EMPTY]' });

    if (!input.fullName) return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    if (!input.email) return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    if (!input.targetRole) return NextResponse.json({ success: false, error: 'Target role is required.' }, { status: 400 });
    if (!input.resumeText && !input.skills.length) {
      return NextResponse.json({ success: false, error: 'Provide resume text or list at least a few skills.' }, { status: 400 });
    }

    console.log('Calling generateCareerSnapshot...');
    const snapshot = await generateCareerSnapshot(input);
    console.log('Snapshot generated:', snapshot.aiProvider);
    const now = new Date().toISOString();

    const existing = findMemoryProfileByEmail(input.email);
    const nextRecord = {
      fullName: input.fullName,
      email: input.email,
      targetRole: input.targetRole,
      careerGoals: input.careerGoals,
      skills: input.skills,
      resumeText: input.resumeText,
      resumeFileName: input.resumeFileName,
      analysis: snapshot.analysis,
      skillGap: snapshot.skillGap,
      projects: snapshot.projects,
      interviewQuestions: snapshot.interviewQuestions,
      progress: snapshot.progress,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const saved = existing
      ? updateMemoryProfile(existing.id, (current) => ({ ...current, ...nextRecord }))!
      : createMemoryProfile(nextRecord);

    return NextResponse.json({ success: true, data: { profile: saved, meta: { aiProvider: snapshot.aiProvider, storage: 'memory' } } });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ success: false, error: 'Failed to analyze profile.' }, { status: 500 });
  }
}