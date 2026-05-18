import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const plans = [
  {
    name: 'FREE',
    displayName: 'Free',
    description: 'Perfect for getting started with document creation',
    price: 0,
    currency: 'USD',
    pdfLimit: 10,
    templateLimit: 5,
    storageLimit: 10,
    features: JSON.stringify([
      '10 PDF downloads per month',
      '5 custom templates',
      '10 MB storage',
      'Basic document types',
      'Email support',
    ]),
    isPopular: false,
    isActive: true,
  },
  {
    name: 'PRO',
    displayName: 'Pro',
    description: 'Unlimited document creation with premium features',
    price: 30,
    currency: 'USDT',
    pdfLimit: 999999, // Effectively unlimited
    templateLimit: 999999,
    storageLimit: 1000,
    features: JSON.stringify([
      'Unlimited PDF downloads',
      'Unlimited custom templates',
      '1 GB storage',
      'All document types',
      'Priority support',
      'Custom branding',
      'API access',
    ]),
    isPopular: true,
    isActive: true,
  },
];

export async function GET() {
  try {
    console.log('Seeding plans...');

    const results = [];

    for (const plan of plans) {
      const existing = await prisma.plan.findUnique({
        where: { name: plan.name },
      });

      if (existing) {
        console.log(`Plan ${plan.name} already exists, updating...`);
        const updated = await prisma.plan.update({
          where: { name: plan.name },
          data: plan,
        });
        results.push({ action: 'updated', plan: updated });
      } else {
        console.log(`Creating plan ${plan.name}...`);
        const created = await prisma.plan.create({
          data: plan,
        });
        results.push({ action: 'created', plan: created });
      }
    }

    console.log('Seeding completed!');

    return NextResponse.json({
      success: true,
      message: 'Plans seeded successfully',
      results,
    });
  } catch (error) {
    console.error('Error seeding plans:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
