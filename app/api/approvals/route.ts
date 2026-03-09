import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import type { Approval } from '@/lib/types';

// In-memory store for API (separate from Zustand client store)
const approvals: Approval[] = [];

export async function GET() {
  return NextResponse.json({ approvals });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const approval: Approval = {
      id: generateId('appr'),
      entityType: body.entityType || 'unknown',
      entityId: body.entityId || '',
      entityTitle: body.entityTitle || 'Untitled',
      stage: body.stage || 'Unknown Stage',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    approvals.push(approval);
    return NextResponse.json({ approval }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}
