import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/templates/[id]
 * Get a single template by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check access: public or owned by user
    const session = await getServerSession(authOptions);
    if (!template.isPublic && template.creatorId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Fetch template error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Update a template
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check ownership
    const existing = await prisma.template.findUnique({
      where: { id },
      select: { creatorId: true, isSystem: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'System templates cannot be modified' },
        { status: 403 }
      );
    }

    if (existing.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, schema, layout, styling, tags, isPublic } = body;

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(schema && { schema: JSON.stringify(schema) }),
        ...(layout && { layout: JSON.stringify(layout) }),
        ...(styling !== undefined && { styling }),
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
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

    // Check ownership and system status
    const existing = await prisma.template.findUnique({
      where: { id },
      select: { creatorId: true, isSystem: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'System templates cannot be deleted' },
        { status: 403 }
      );
    }

    if (existing.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
