/**
 * PDF Generator Service
 * Port: 3001
 * 
 * Core microservice for PDF document generation following SOLID principles
 */

import PDFGenerator from './generators/PDFGenerator';
import TemplateRenderer from './templates/TemplateRenderer';
import { DocumentType } from './types';

// Service configuration
const PORT = 3001;

// SOLID: Single Responsibility - Server handles only routing
// SOLID: Dependency Inversion - Dependencies injected via constructor

// Initialize services with dependency injection
const templateRenderer = new TemplateRenderer();
const pdfGenerator = new PDFGenerator(templateRenderer);

// Request handler
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Route: Health check
    if (path === '/health') {
      return Response.json({ 
        status: 'healthy', 
        service: 'pdf-generator',
        port: PORT,
        timestamp: new Date().toISOString()
      }, { headers: corsHeaders });
    }

    // Route: Generate PDF
    if (path === '/api/generate' && method === 'POST') {
      const body = await request.json();
      const result = await pdfGenerator.generate(body);
      
      if (result.success && result.buffer) {
        return new Response(result.buffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${result.filename || 'document.pdf'}"`,
          },
        });
      }
      
      return Response.json({ error: result.error }, { status: 400, headers: corsHeaders });
    }

    // Route: Preview PDF (returns base64)
    if (path === '/api/preview' && method === 'POST') {
      const body = await request.json();
      const result = await pdfGenerator.generatePreview(body);
      
      return Response.json(result, { headers: corsHeaders });
    }

    // Route: Get supported document types
    if (path === '/api/document-types' && method === 'GET') {
      return Response.json({
        types: Object.values(DocumentType),
        categories: {
          expense: ['EXPENSE_REPORT', 'EXPENSE_CLAIM', 'TRAVEL_EXPENSE', 'MONTHLY_EXPENSE'],
          tender: ['TENDER_DOCUMENT', 'TENDER_PROPOSAL', 'BID_DOCUMENT', 'TENDER_EVALUATION', 'RFP_DOCUMENT'],
          proposal: ['BUSINESS_PROPOSAL', 'PROJECT_PROPOSAL', 'SALES_PROPOSAL', 'PARTNERSHIP_PROPOSAL', 'GRANT_PROPOSAL'],
          salary: ['SALARY_SLIP', 'SALARY_CERTIFICATE', 'PAYROLL_REPORT', 'SALARY_INCREMENT', 'OFFER_LETTER'],
          invoice: ['INVOICE', 'PROFORMA_INVOICE', 'RECEIPT', 'CREDIT_NOTE', 'DEBIT_NOTE'],
          contract: ['CONTRACT', 'AGREEMENT', 'NDA', 'SERVICE_AGREEMENT'],
          other: ['REPORT', 'LETTER', 'CERTIFICATE', 'QUOTE', 'MEMO', 'CUSTOM']
        }
      }, { headers: corsHeaders });
    }

    // Route: Validate document data
    if (path === '/api/validate' && method === 'POST') {
      const body = await request.json();
      const result = await pdfGenerator.validateDocumentData(body);
      
      return Response.json(result, { headers: corsHeaders });
    }

    // 404 for unknown routes
    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('PDF Generator Error:', error);
    return Response.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Start server
console.log(`📄 PDF Generator Service starting on port ${PORT}...`);

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`✅ PDF Generator Service running at http://localhost:${PORT}`);
console.log(`   - Health: http://localhost:${PORT}/health`);
console.log(`   - Generate: POST http://localhost:${PORT}/api/generate`);
console.log(`   - Preview: POST http://localhost:${PORT}/api/preview`);
