import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * POST /api/seed
 * Seeds the database with initial data (plans, templates)
 * This should be called once after deployment
 */
export async function POST() {
  try {
    // Seed Plans
    const plans = await Promise.all([
      prisma.plan.upsert({
        where: { name: 'FREE' },
        update: {},
        create: {
          name: 'FREE',
          displayName: 'Free',
          description: 'Perfect for getting started',
          price: 0,
          currency: 'USD',
          pdfLimit: 10,
          templateLimit: 5,
          storageLimit: 10,
          features: JSON.stringify([
            '10 PDFs per month',
            '5 custom templates',
            '10MB storage',
            'Basic support',
          ]),
          isPopular: false,
        },
      }),
      prisma.plan.upsert({
        where: { name: 'STARTER' },
        update: {},
        create: {
          name: 'STARTER',
          displayName: 'Starter',
          description: 'For individuals and small teams',
          price: 9.99,
          currency: 'USD',
          pdfLimit: 50,
          templateLimit: 20,
          storageLimit: 100,
          features: JSON.stringify([
            '50 PDFs per month',
            '20 custom templates',
            '100MB storage',
            'Email support',
            'Custom branding',
          ]),
          isPopular: false,
        },
      }),
      prisma.plan.upsert({
        where: { name: 'PRO' },
        update: {},
        create: {
          name: 'PRO',
          displayName: 'Pro',
          description: 'For growing businesses',
          price: 29.99,
          currency: 'USD',
          pdfLimit: 200,
          templateLimit: 100,
          storageLimit: 500,
          features: JSON.stringify([
            '200 PDFs per month',
            '100 custom templates',
            '500MB storage',
            'Priority support',
            'Custom branding',
            'API access',
            'Team collaboration',
          ]),
          isPopular: true,
        },
      }),
      prisma.plan.upsert({
        where: { name: 'ENTERPRISE' },
        update: {},
        create: {
          name: 'ENTERPRISE',
          displayName: 'Enterprise',
          description: 'For large organizations',
          price: 99.99,
          currency: 'USD',
          pdfLimit: -1, // Unlimited
          templateLimit: -1,
          storageLimit: 10000,
          features: JSON.stringify([
            'Unlimited PDFs',
            'Unlimited templates',
            '10GB storage',
            '24/7 dedicated support',
            'Custom branding',
            'API access',
            'Team collaboration',
            'SSO integration',
            'Custom integrations',
            'SLA guarantee',
          ]),
          isPopular: false,
        },
      }),
    ]);

    // Seed Default Templates
    const templates = await Promise.all([
      prisma.template.upsert({
        where: { id: 'template_invoice_1' },
        update: {},
        create: {
          id: 'template_invoice_1',
          name: 'Professional Invoice',
          description: 'Clean invoice template with payment terms',
          category: 'INVOICE',
          type: 'INVOICE',
          schema: JSON.stringify({
            fields: ['invoiceNumber', 'date', 'dueDate', 'client', 'items', 'notes'],
          }),
          layout: JSON.stringify({
            header: { logo: true, companyInfo: true },
            body: ['invoiceDetails', 'clientInfo', 'itemsTable', 'totals'],
            footer: ['notes', 'paymentTerms'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          downloads: 8900,
          uses: 15000,
          rating: 4.9,
          ratingCount: 450,
          tags: 'invoice,billing,payment,professional',
        },
      }),
      prisma.template.upsert({
        where: { id: 'template_expense_1' },
        update: {},
        create: {
          id: 'template_expense_1',
          name: 'Expense Report',
          description: 'Monthly expense tracking template',
          category: 'EXPENSE',
          type: 'EXPENSE_REPORT',
          schema: JSON.stringify({
            fields: ['reportPeriod', 'employee', 'expenses', 'total'],
          }),
          layout: JSON.stringify({
            header: { title: true, period: true },
            body: ['employeeInfo', 'expensesTable', 'summary'],
            footer: ['approvals', 'notes'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          downloads: 1250,
          uses: 3200,
          rating: 4.8,
          ratingCount: 180,
          tags: 'expense,report,tracking,monthly',
        },
      }),
      prisma.template.upsert({
        where: { id: 'template_salary_1' },
        update: {},
        create: {
          id: 'template_salary_1',
          name: 'Salary Slip',
          description: 'Employee payroll document',
          category: 'SALARY',
          type: 'SALARY_SLIP',
          schema: JSON.stringify({
            fields: ['month', 'year', 'employee', 'earnings', 'deductions', 'netPay'],
          }),
          layout: JSON.stringify({
            header: { companyLogo: true, monthYear: true },
            body: ['employeeDetails', 'earnings', 'deductions', 'netPay'],
            footer: ['notes'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          downloads: 5600,
          uses: 12000,
          rating: 4.8,
          ratingCount: 320,
          tags: 'salary,payroll,payslip,employee',
        },
      }),
      prisma.template.upsert({
        where: { id: 'template_proposal_1' },
        update: {},
        create: {
          id: 'template_proposal_1',
          name: 'Business Proposal',
          description: 'Professional business proposal',
          category: 'PROPOSAL',
          type: 'BUSINESS_PROPOSAL',
          schema: JSON.stringify({
            fields: ['title', 'client', 'executiveSummary', 'scope', 'timeline', 'pricing'],
          }),
          layout: JSON.stringify({
            header: { coverPage: true },
            body: ['executiveSummary', 'scope', 'timeline', 'pricing', 'terms'],
            footer: ['signature'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          isPremium: true,
          downloads: 3500,
          uses: 6800,
          rating: 4.7,
          ratingCount: 210,
          tags: 'proposal,business,professional,pitch',
        },
      }),
      prisma.template.upsert({
        where: { id: 'template_receipt_1' },
        update: {},
        create: {
          id: 'template_receipt_1',
          name: 'Payment Receipt',
          description: 'Payment confirmation document',
          category: 'RECEIPT',
          type: 'RECEIPT',
          schema: JSON.stringify({
            fields: ['receiptNumber', 'date', 'payer', 'amount', 'paymentMethod', 'purpose'],
          }),
          layout: JSON.stringify({
            header: { logo: true, receiptNumber: true },
            body: ['paymentDetails', 'amount', 'method'],
            footer: ['signature', 'terms'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          downloads: 4500,
          uses: 9500,
          rating: 4.7,
          ratingCount: 280,
          tags: 'receipt,payment,confirmation,money',
        },
      }),
      prisma.template.upsert({
        where: { id: 'template_contract_1' },
        update: {},
        create: {
          id: 'template_contract_1',
          name: 'Service Contract',
          description: 'Professional service agreement',
          category: 'CONTRACT',
          type: 'SERVICE_AGREEMENT',
          schema: JSON.stringify({
            fields: ['parties', 'scope', 'duration', 'payment', 'terms', 'signatures'],
          }),
          layout: JSON.stringify({
            header: { title: true },
            body: ['parties', 'scope', 'duration', 'payment', 'terms'],
            footer: ['signatures', 'witnesses'],
          }),
          isPublic: true,
          isDefault: true,
          isSystem: true,
          isPremium: true,
          downloads: 2800,
          uses: 5200,
          rating: 4.8,
          ratingCount: 150,
          tags: 'contract,agreement,service,legal',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        plans: plans.length,
        templates: templates.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
