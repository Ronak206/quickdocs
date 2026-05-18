import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the TEST plan
    const testPlan = await prisma.plan.findUnique({
      where: { name: 'TEST' },
    });

    if (!testPlan) {
      return NextResponse.json(
        { error: 'TEST plan not found. Please run /api/seed-plans first.' },
        { status: 404 }
      );
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSubscription) {
      // Update existing subscription to TEST plan
      const updated = await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          planId: testPlan.id,
          status: 'active',
          startDate: new Date(),
          endDate: null,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'Activated TEST plan successfully!',
        subscription: updated,
      });
    }

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: testPlan.id,
        status: 'active',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Activated TEST plan successfully!',
      subscription,
    });
  } catch (error) {
    console.error('Error activating TEST plan:', error);
    return NextResponse.json(
      { error: 'Failed to activate TEST plan' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy browser testing
export async function GET() {
  return POST();
}
