import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInvoice, createPayment } from '@/lib/nowpayments';

// Pro plan price (30 USDT)
const PRO_PLAN_PRICE = 30;
const PRO_PLAN_CURRENCY = 'USDT';

// Webhook URL for NOWPayments
const WEBHOOK_URL = process.env.NOWPAYMENTS_WEBHOOK_URL || 'https://quickdocs-smoky.vercel.app/api/webhooks/nowpayments';

/**
 * POST /api/payments
 * Create a payment for Pro plan upgrade
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { pay_currency = 'usdttrc20' } = await req.json().catch(() => ({}));

    // Check if user already has Pro plan
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (existingSubscription?.plan?.name === 'PRO') {
      return NextResponse.json({ 
        error: 'You already have a Pro plan',
        isPro: true 
      }, { status: 400 });
    }

    // Check if there's a pending payment
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'waiting', 'confirming', 'confirmed', 'sending'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (pendingPayment) {
      // Return existing pending payment
      return NextResponse.json({
        payment: pendingPayment,
        message: 'You have a pending payment',
      });
    }

    // Generate unique order ID
    const orderId = `quickdocs-pro-${userId}-${Date.now()}`;

    // Get the PRO plan from database
    const proPlan = await prisma.plan.findUnique({
      where: { name: 'PRO' },
    });

    if (!proPlan) {
      return NextResponse.json({ error: 'Pro plan not found' }, { status: 500 });
    }

    // Create payment with NOWPayments
    const paymentData = {
      price_amount: PRO_PLAN_PRICE,
      price_currency: 'usd',
      pay_currency: pay_currency,
      order_id: orderId,
      order_description: `QuickDocs Pro Plan - ${session.user.email}`,
      ipn_callback_url: WEBHOOK_URL,
      success_url: `${process.env.NEXTAUTH_URL || 'https://quickdocs-smoky.vercel.app'}/?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://quickdocs-smoky.vercel.app'}/?payment=cancelled`,
    };

    let nowpaymentsResponse;
    
    try {
      // Try invoice first (hosted payment page)
      nowpaymentsResponse = await createInvoice({
        price_amount: paymentData.price_amount,
        price_currency: paymentData.price_currency,
        order_id: paymentData.order_id,
        order_description: paymentData.order_description,
        ipn_callback_url: paymentData.ipn_callback_url,
        success_url: paymentData.success_url,
        cancel_url: paymentData.cancel_url,
      });
    } catch (invoiceError) {
      console.log('Invoice creation failed, trying direct payment:', invoiceError);
      // Fall back to direct payment
      nowpaymentsResponse = await createPayment(paymentData);
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId,
        paymentId: nowpaymentsResponse.id || nowpaymentsResponse.payment_id || `pay-${Date.now()}`,
        invoiceId: nowpaymentsResponse.invoice_url ? nowpaymentsResponse.id : null,
        orderId,
        amount: PRO_PLAN_PRICE,
        payCurrency: pay_currency,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      invoice_url: nowpaymentsResponse.invoice_url,
      pay_address: nowpaymentsResponse.pay_address,
      pay_amount: nowpaymentsResponse.pay_amount,
      pay_currency: nowpaymentsResponse.pay_currency,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments
 * Get payment status for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the latest payment
    const payment = await prisma.payment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Get subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    return NextResponse.json({
      payment,
      subscription,
      isPro: subscription?.plan?.name === 'PRO',
    });
  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
