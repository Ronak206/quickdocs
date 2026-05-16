import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      database: 'unknown',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
    },
  };

  // Test database connection
  try {
    await prisma.$connect();
    await prisma.user.count();
    checks.checks.database = 'connected';
  } catch (error) {
    checks.checks.database = 'error';
    checks.status = 'error';
    console.error('Database connection error:', error);
  }

  const statusCode = checks.status === 'ok' ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
