import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/downloads
 * Save a PDF download to the database
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    // Check usage and PDF limit
    const usage = await prisma.usage.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const pdfLimit = subscription?.plan?.pdfLimit ?? 10;
    const pdfsUsed = usage?.pdfCount ?? 0;

    // Check if PDF limit is reached (skip for unlimited plans with -1)
    if (pdfLimit !== -1 && pdfsUsed >= pdfLimit) {
      return NextResponse.json(
        { error: 'PDF limit reached for this month' },
        { status: 403 }
      );
    }

    const { title, fileSize, pdfData } = await req.json();

    if (!pdfData) {
      return NextResponse.json({ error: 'No PDF data provided' }, { status: 400 });
    }

    // Create download record
    const download = await prisma.download.create({
      data: {
        userId,
        title: title || 'Untitled Document',
        fileSize: fileSize || 0,
        pdfData,
      },
    });

    // Update usage stats
    await prisma.usage.upsert({
      where: {
        userId_month_year: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: {
        pdfCount: { increment: 1 },
        storageUsed: { increment: Math.ceil(fileSize / 1024) },
      },
      create: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        pdfCount: 1,
        storageUsed: Math.ceil(fileSize / 1024),
      },
    });

    return NextResponse.json({ success: true, downloadId: download.id });
  } catch (error) {
    console.error('Download save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/downloads
 * Get all downloads for the current user (without pdfData for performance)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const downloads = await prisma.download.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ downloads });
  } catch (error) {
    console.error('Fetch downloads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
