import { NextRequest, NextResponse } from 'next/server';

// In-memory store shared with parent route (simplified for demo)
// In production this would be a database

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, actor, notes } = body;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // In a real app, we'd update the database here
    return NextResponse.json({
      id,
      status,
      actor,
      notes,
      resolvedAt: status !== 'pending' ? new Date().toISOString() : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update approval' }, { status: 500 });
  }
}
