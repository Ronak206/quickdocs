import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';
import CompressionService from '@/lib/services/compression';

/**
 * GET /api/documents
 * Fetches all documents for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      ownerId: session.user.id,
      isArchived: false,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          documentNumber: true,
          type: true,
          status: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          pdfGeneratedAt: true,
          pdfSize: true,
          template: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Creates a new document with compressed data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      documentNumber,
      type,
      data,
      templateId,
      items,
      totalAmount,
      currency,
      notes,
      tags,
    } = body;

    // Validate required fields
    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check PDF limit
    const [usage, subscription] = await Promise.all([
      prisma.usage.findUnique({
        where: {
          userId_month_year: { userId, month: currentMonth, year: currentYear },
        },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
    ]);

    const pdfLimit = subscription?.plan?.pdfLimit || 10;
    const currentPdfCount = usage?.pdfCount || 0;

    if (pdfLimit > 0 && currentPdfCount >= pdfLimit) {
      return NextResponse.json(
        {
          error: 'PDF limit reached',
          message: `You have reached your monthly limit of ${pdfLimit} PDFs. Please upgrade your plan.`,
          pdfLimit,
          pdfsUsed: currentPdfCount,
        },
        { status: 403 }
      );
    }

    // Compress document data
    const dataString = JSON.stringify(data || {});
    const compressed = CompressionService.compress(dataString);

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        documentNumber,
        type,
        data: compressed.data,
        dataHash: CompressionService.hash(dataString),
        compressedSize: compressed.compressedSize,
        templateId,
        ownerId: userId,
        status: 'draft',
        totalAmount,
        currency: currency || 'USD',
        notes,
        tags,
        items: items ? {
          create: items.map((item: any, index: number) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            total: item.total || 0,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
            order: index,
          })),
        } : undefined,
      },
      include: {
        items: true,
        template: {
          select: { id: true, name: true },
        },
      },
    });

    // Update usage count
    await prisma.usage.upsert({
      where: {
        userId_month_year: { userId, month: currentMonth, year: currentYear },
      },
      update: {
        pdfCount: { increment: 1 },
        storageUsed: { increment: compressed.compressedSize },
      },
      create: {
        userId,
        month: currentMonth,
        year: currentYear,
        pdfCount: 1,
        storageUsed: compressed.compressedSize,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'DOCUMENT_CREATED',
        description: `Created document: ${title}`,
        userId,
        documentId: document.id,
        metadata: JSON.stringify({ type, documentNumber }),
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        status: document.status,
        createdAt: document.createdAt,
        compressionRatio: compressed.compressionRatio.toFixed(2) + '%',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
