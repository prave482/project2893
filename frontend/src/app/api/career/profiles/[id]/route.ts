import { NextResponse } from 'next/server';
import { findMemoryProfileById } from '@/lib/memoryStore';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = findMemoryProfileById(id);
    if (!profile) return NextResponse.json({ success: false, error: 'Profile not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: { profile } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch profile.' }, { status: 500 });
  }
}