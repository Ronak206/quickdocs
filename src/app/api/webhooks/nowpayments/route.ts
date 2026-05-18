import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature, isPaymentSuccessful } from '@/lib/nowpayments';

/**
 * POST /api/webhooks/nowpayments
 * Handle NOWPayments IPN (Instant Payment Notification) webhooks
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    console.log('NOWPayments webhook received:', JSON.stringify(payload, null, 2));

    const {
      payment_id,
      payment_status,
      pay_address,
      price_amount,
      price_currency,
      pay_amount,
      actually_paid,
      pay_currency,
      order_id,
      order_description,
    } = payload;

    if (!payment_id || !order_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentId: payment_id },
          { orderId: order_id },
        ],
      },
    });

    if (!payment) {
      console.error('Payment not found for webhook:', payment_id, order_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mapPaymentStatus(payment_status),
        payCurrency: pay_currency,
        payAmount: pay_amount ? parseFloat(pay_amount) : null,
        actuallyPaid: actually_paid ? parseFloat(actually_paid) : null,
        paymentAddress: pay_address,
        webhookData: rawBody,
        paidAt: isPaymentSuccessful(payment_status) ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // If payment is successful, upgrade user to Pro
    if (isPaymentSuccessful(payment_status)) {
      await upgradeUserToPro(payment.userId);
      console.log(`User ${payment.userId} upgraded to Pro plan`);
    }

    return NextResponse.json({ 
      success: true, 
      payment: updatedPayment,
      status: payment_status 
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Map NOWPayments status to our PaymentStatus enum
 */
function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'waiting': 'waiting',
    'confirming': 'confirming',
    'confirmed': 'confirmed',
    'sending': 'sending',
    'partially_paid': 'partially_paid',
    'finished': 'finished',
    'failed': 'failed',
    'expired': 'expired',
    'refunded': 'refunded',
  };
  return statusMap[status] || 'pending';
}

/**
 * Upgrade user to Pro plan
 */
async function upgradeUserToPro(userId: string) {
  // Get PRO plan
  const proPlan = await prisma.plan.findUnique({
    where: { name: 'PRO' },
  });

  if (!proPlan) {
    throw new Error('Pro plan not found in database');
  }

  // Check if user has existing subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (existingSubscription) {
    // Update existing subscription to Pro
    await prisma.subscription.update({
      where: { userId },
      data: {
        planId: proPlan.id,
        status: 'active',
        startDate: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    // Create new subscription
    await prisma.subscription.create({
      data: {
        userId,
        planId: proPlan.id,
        status: 'active',
        startDate: new Date(),
      },
    });
  }

  // Create activity log
  await prisma.activity.create({
    data: {
      type: 'PLAN_UPGRADED',
      description: 'Upgraded to Pro plan via cryptocurrency payment',
      userId,
    },
  });
}

/**
 * GET /api/webhooks/nowpayments
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'NOWPayments webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
