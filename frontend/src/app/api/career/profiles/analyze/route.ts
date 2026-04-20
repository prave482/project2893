import { NextResponse } from 'next/server';
import { createMemoryProfile, findMemoryProfileByEmail, findMemoryProfileById, updateMemoryProfile } from '@/lib/memoryStore';
import { generateCareerSnapshot, generateInterviewQuestionsForProfile, generateProjectsForProfile, evaluateInterviewAnswer, buildProgressSnapshot } from '@/lib/ai.service';
import { CareerProfileRecord } from '@/lib/types';

function normalizeList(input: unknown) {
  if (Array.isArray(input)) return input.map((item) => String(item).trim()).filter(Boolean);
  if (typeof input === 'string') return input.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function buildSnapshotInput(payload: Record<string, unknown>) {
  return {
    fullName: String(payload.fullName ?? '').trim(),
    email: String(payload.email ?? '').trim().toLowerCase(),
    targetRole: String(payload.targetRole ?? '').trim(),
    careerGoals: normalizeList(payload.careerGoals),
    skills: normalizeList(payload.skills),
    resumeText: String(payload.resumeText ?? '').trim(),
    resumeFileName: payload.resumeFileName ? String(payload.resumeFileName) : undefined,
  };
}

function serializeProfile(doc: any): CareerProfileRecord {
  return {
    id: String(doc._id ?? doc.id),
    fullName: doc.fullName,
    email: doc.email,
    targetRole: doc.targetRole,
    careerGoals: doc.careerGoals ?? [],
    skills: doc.skills ?? [],
    resumeText: doc.resumeText ?? '',
    resumeFileName: doc.resumeFileName,
    analysis: doc.analysis,
    skillGap: doc.skillGap,
    projects: doc.projects ?? [],
    interviewQuestions: doc.interviewQuestions ?? [],
    progress: doc.progress,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = buildSnapshotInput(body);

    if (!input.fullName) return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    if (!input.email) return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    if (!input.targetRole) return NextResponse.json({ success: false, error: 'Target role is required.' }, { status: 400 });
    if (!input.resumeText && !input.skills.length) {
      return NextResponse.json({ success: false, error: 'Provide a resume or list at least a few skills.' }, { status: 400 });
    }

    const snapshot = await generateCareerSnapshot(input);
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