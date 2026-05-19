import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/stats
 * Fetches dashboard statistics for the authenticated user
 * Following SOLID: Single Responsibility - only handles stats retrieval
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch all stats in parallel for performance
    const [
      documentsCount,
      templatesCount,
      categoriesCount,
      totalDownloads,
      currentUsage,
      subscription,
      downloadCount,
    ] = await Promise.all([
      // User's documents count
      prisma.document.count({
        where: { ownerId: userId, isArchived: false },
      }),
      
      // Templates count (public + user's own)
      prisma.template.count({
        where: {
          OR: [
            { isPublic: true },
            { creatorId: userId },
          ],
        },
      }),
      
      // Categories count (unique categories from templates)
      prisma.template.groupBy({
        by: ['category'],
        where: {
          OR: [
            { isPublic: true },
            { creatorId: userId },
          ],
        },
      }).then(result => result.length),
      
      // Total downloads across all templates
      prisma.template.aggregate({
        _sum: { downloads: true },
        where: { isPublic: true },
      }).then(result => result._sum.downloads || 0),
      
      // Current month usage
      prisma.usage.findUnique({
        where: {
          userId_month_year: {
            userId,
            month: currentMonth,
            year: currentYear,
          },
        },
      }),
      
      // User's subscription with plan details
      prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),

      // User's download count
      prisma.download.count({
        where: { userId },
      }),
    ]);

    // Calculate PDF limit
    const pdfLimit = subscription?.plan?.pdfLimit || 10;
    const pdfsUsed = currentUsage?.pdfCount || 0;
    const pdfsRemaining = Math.max(0, pdfLimit - pdfsUsed);

    // Plan info
    const plan = subscription?.plan?.name || 'FREE';
    const planDisplayName = subscription?.plan?.displayName || 'Free';

    return NextResponse.json({
      stats: {
        documents: documentsCount,
        templates: templatesCount,
        categories: categoriesCount,
        downloads: totalDownloads,
        userDownloads: downloadCount,
      },
      usage: {
        pdfsUsed,
        pdfLimit,
        pdfsRemaining,
        storageUsed: currentUsage?.storageUsed || 0,
        month: currentMonth,
        year: currentYear,
      },
      plan: {
        name: plan,
        displayName: planDisplayName,
        price: subscription?.plan?.price || 0,
        currency: subscription?.plan?.currency || 'USD',
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
