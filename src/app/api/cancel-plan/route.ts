import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/cancel-plan
 * Cancel current subscription and revert to Free plan
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Get the FREE plan
    const freePlan = await prisma.plan.findUnique({
      where: { name: 'FREE' },
    });

    if (!freePlan) {
      return NextResponse.json({ error: 'Free plan not found' }, { status: 500 });
    }

    // Update subscription to FREE plan with expired status
    await prisma.subscription.update({
      where: { userId },
      data: {
        planId: freePlan.id,
        status: 'canceled',
        endDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully. You are now on the Free plan.',
    });
  } catch (error) {
    console.error('Cancel plan error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
