import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/downloads/[id]
 * Get a specific download with pdfData for re-download
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const download = await prisma.download.findFirst({
      where: { id, userId: session.user.id },
      select: { pdfData: true, title: true },
    });

    if (!download) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ pdfData: download.pdfData, title: download.title });
  } catch (error) {
    console.error('Re-download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/downloads/[id]
 * Delete a download record
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deletion
    const download = await prisma.download.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!download) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.download.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
