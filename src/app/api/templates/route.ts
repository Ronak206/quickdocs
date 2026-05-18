import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/templates
 * Get all public templates and user's custom templates
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');

    // Build filter
    const where: any = {
      OR: [
        { isPublic: true },
        ...(session?.user?.id ? [{ creatorId: session.user.id }] : []),
      ],
    };

    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { downloads: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        type: true,
        preview: true,
        thumbnail: true,
        isPublic: true,
        isPremium: true,
        isDefault: true,
        isSystem: true,
        downloads: true,
        uses: true,
        rating: true,
        ratingCount: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new custom template
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category, type, schema, layout, styling, tags } = body;

    if (!name || !category || !type) {
      return NextResponse.json(
        { error: 'Name, category, and type are required' },
        { status: 400 }
      );
    }

    // Check template limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true },
    });

    const userTemplates = await prisma.template.count({
      where: { creatorId: session.user.id },
    });

    const templateLimit = subscription?.plan?.templateLimit ?? 5;
    if (templateLimit !== -1 && userTemplates >= templateLimit) {
      return NextResponse.json(
        { error: 'Template limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        type,
        schema: JSON.stringify(schema || {}),
        layout: JSON.stringify(layout || {}),
        styling: styling || null,
        tags: tags || null,
        isPublic: false,
        isDefault: false,
        isSystem: false,
        creatorId: session.user.id,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
