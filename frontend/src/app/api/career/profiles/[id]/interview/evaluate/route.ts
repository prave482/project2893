import { NextResponse } from 'next/server';
import { findMemoryProfileById } from '@/lib/memoryStore';
import { evaluateInterviewAnswer } from '@/lib/ai.service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findMemoryProfileById(id);
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });

    const body = await request.json();
    const question = String(body.question ?? '').trim();
    const answer = String(body.answer ?? '').trim();

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: 'Question and answer are required.' }, { status: 400 });
    }

    const feedback = await evaluateInterviewAnswer({
      targetRole: profile.targetRole,
      question,
      answer,
    });

    return NextResponse.json({ success: true, data: { feedback } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to evaluate answer.' }, { status: 500 });
  }
}