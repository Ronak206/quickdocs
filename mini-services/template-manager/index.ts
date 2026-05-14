/**
 * Template Manager Service
 * Port: 3002
 * 
 * Microservice for template management following SOLID principles
 * - CRUD operations for templates
 * - Template marketplace integration
 * - External template scraping
 */

import TemplateProcessor from './processors/TemplateProcessor';
import TemplateScraper from './scrapers/TemplateScraper';

// Service configuration
const PORT = 3002;

// Initialize services
const templateProcessor = new TemplateProcessor();
const templateScraper = new TemplateScraper();

// In-memory template store (would use database in production)
const templateStore: Map<string, any> = new Map();

// Initialize with default templates
initializeDefaultTemplates();

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
        service: 'template-manager',
        port: PORT,
        templateCount: templateStore.size,
        timestamp: new Date().toISOString()
      }, { headers: corsHeaders });
    }

    // Route: List all templates
    if (path === '/api/templates' && method === 'GET') {
      const category = url.searchParams.get('category');
      const type = url.searchParams.get('type');
      const search = url.searchParams.get('search');
      
      let templates = Array.from(templateStore.values());
      
      // Filter by category
      if (category) {
        templates = templates.filter(t => t.category === category);
      }
      
      // Filter by type
      if (type) {
        templates = templates.filter(t => t.type === type);
      }
      
      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tags?.toLowerCase().includes(searchLower)
        );
      }
      
      return Response.json({ 
        templates,
        total: templates.length,
      }, { headers: corsHeaders });
    }

    // Route: Get single template
    if (path.startsWith('/api/templates/') && method === 'GET') {
      const id = path.split('/').pop();
      const template = templateStore.get(id);
      
      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
      }
      
      return Response.json({ template }, { headers: corsHeaders });
    }

    // Route: Create template
    if (path === '/api/templates' && method === 'POST') {
      const body = await request.json();
      const result = templateProcessor.processTemplate(body);
      
      if (result.errors && result.errors.length > 0) {
        return Response.json({ errors: result.errors }, { status: 400, headers: corsHeaders });
      }
      
      templateStore.set(result.template.id, result.template);
      
      return Response.json({ 
        template: result.template,
        message: 'Template created successfully' 
      }, { headers: corsHeaders });
    }

    // Route: Update template
    if (path.startsWith('/api/templates/') && method === 'PUT') {
      const id = path.split('/').pop();
      const existingTemplate = templateStore.get(id);
      
      if (!existingTemplate) {
        return Response.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
      }
      
      const body = await request.json();
      const updatedTemplate = {
        ...existingTemplate,
        ...body,
        id, // Preserve ID
        updatedAt: new Date().toISOString(),
        version: (existingTemplate.version || 1) + 1,
      };
      
      templateStore.set(id, updatedTemplate);
      
      return Response.json({ 
        template: updatedTemplate,
        message: 'Template updated successfully' 
      }, { headers: corsHeaders });
    }

    // Route: Delete template
    if (path.startsWith('/api/templates/') && method === 'DELETE') {
      const id = path.split('/').pop();
      
      if (!templateStore.has(id)) {
        return Response.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
      }
      
      templateStore.delete(id);
      
      return Response.json({ message: 'Template deleted successfully' }, { headers: corsHeaders });
    }

    // Route: Duplicate template
    if (path.startsWith('/api/templates/') && path.endsWith('/duplicate') && method === 'POST') {
      const id = path.split('/')[3];
      const existingTemplate = templateStore.get(id);
      
      if (!existingTemplate) {
        return Response.json({ error: 'Template not found' }, { status: 404, headers: corsHeaders });
      }
      
      const newId = generateId();
      const duplicatedTemplate = {
        ...existingTemplate,
        id: newId,
        name: `${existingTemplate.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        isDefault: false,
      };
      
      templateStore.set(newId, duplicatedTemplate);
      
      return Response.json({ 
        template: duplicatedTemplate,
        message: 'Template duplicated successfully' 
      }, { headers: corsHeaders });
    }

    // Route: Get template categories
    if (path === '/api/categories' && method === 'GET') {
      return Response.json({
        categories: [
          { id: 'EXPENSE', name: 'Expense', description: 'Expense reports, claims, and travel expenses' },
          { id: 'TENDER', name: 'Tender', description: 'Tender documents, bids, and RFPs' },
          { id: 'PROPOSAL', name: 'Proposal', description: 'Business, project, and sales proposals' },
          { id: 'SALARY', name: 'Salary', description: 'Salary slips, certificates, and payroll reports' },
          { id: 'INVOICE', name: 'Invoice', description: 'Invoices and proforma invoices' },
          { id: 'RECEIPT', name: 'Receipt', description: 'Receipts and payment confirmations' },
          { id: 'CONTRACT', name: 'Contract', description: 'Contracts and service agreements' },
          { id: 'REPORT', name: 'Report', description: 'Reports and summaries' },
          { id: 'LETTER', name: 'Letter', description: 'Business letters and correspondence' },
          { id: 'CERTIFICATE', name: 'Certificate', description: 'Certificates and awards' },
          { id: 'AGREEMENT', name: 'Agreement', description: 'Agreements and NDAs' },
          { id: 'QUOTE', name: 'Quote', description: 'Quotations and estimates' },
          { id: 'MEMO', name: 'Memo', description: 'Memos and internal communications' },
          { id: 'CUSTOM', name: 'Custom', description: 'Custom document templates' },
        ]
      }, { headers: corsHeaders });
    }

    // Route: Scrape external templates
    if (path === '/api/scrape' && method === 'POST') {
      const body = await request.json();
      const result = await templateScraper.scrape(body);
      
      if (result.templates) {
        result.templates.forEach((t: any) => {
          templateStore.set(t.id, t);
        });
      }
      
      return Response.json(result, { headers: corsHeaders });
    }

    // Route: Get popular external template sources
    if (path === '/api/sources' && method === 'GET') {
      return Response.json({
        sources: [
          { 
            id: 'canva', 
            name: 'Canva', 
            url: 'https://www.canva.com/templates/',
            description: 'Wide variety of professional document templates'
          },
          { 
            id: 'smartsheet', 
            name: 'Smartsheet', 
            url: 'https://www.smartsheet.com/content/templates',
            description: 'Business and project management templates'
          },
          { 
            id: 'hubspot', 
            name: 'HubSpot', 
            url: 'https://www.hubspot.com/templates',
            description: 'Marketing and sales document templates'
          },
          { 
            id: 'microsoft', 
            name: 'Microsoft Templates', 
            url: 'https://create.microsoft.com/templates',
            description: 'Office document templates'
          },
          { 
            id: 'zoho', 
            name: 'Zoho', 
            url: 'https://www.zoho.com/invoices/templates/',
            description: 'Invoice and business templates'
          },
        ]
      }, { headers: corsHeaders });
    }

    // Route: Get template field types
    if (path === '/api/field-types' && method === 'GET') {
      return Response.json({
        fieldTypes: [
          { id: 'text', name: 'Text', description: 'Single line text input' },
          { id: 'number', name: 'Number', description: 'Numeric input' },
          { id: 'email', name: 'Email', description: 'Email address input' },
          { id: 'phone', name: 'Phone', description: 'Phone number input' },
          { id: 'date', name: 'Date', description: 'Date picker' },
          { id: 'datetime', name: 'Date & Time', description: 'Date and time picker' },
          { id: 'textarea', name: 'Text Area', description: 'Multi-line text input' },
          { id: 'select', name: 'Dropdown', description: 'Dropdown selection' },
          { id: 'radio', name: 'Radio', description: 'Radio button selection' },
          { id: 'checkbox', name: 'Checkbox', description: 'Checkbox input' },
          { id: 'currency', name: 'Currency', description: 'Currency/monetary input' },
          { id: 'percentage', name: 'Percentage', description: 'Percentage input' },
          { id: 'file', name: 'File', description: 'File upload' },
          { id: 'image', name: 'Image', description: 'Image upload' },
          { id: 'signature', name: 'Signature', description: 'Digital signature field' },
          { id: 'company', name: 'Company Info', description: 'Company information block' },
          { id: 'address', name: 'Address', description: 'Address input block' },
        ]
      }, { headers: corsHeaders });
    }

    // 404 for unknown routes
    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Template Manager Error:', error);
    return Response.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Initialize default templates
function initializeDefaultTemplates() {
  const defaultTemplates = [
    // Expense Templates
    {
      id: 'tpl_expense_report',
      name: 'Standard Expense Report',
      description: 'Monthly expense report for business expenses',
      category: 'EXPENSE',
      type: 'EXPENSE_REPORT',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Report Title', type: 'text', required: true },
          { name: 'date', label: 'Report Date', type: 'date', required: true },
          { name: 'department', label: 'Department', type: 'text' },
          { name: 'items', label: 'Expense Items', type: 'items' },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]
      }),
      tags: 'expense,report,monthly',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    {
      id: 'tpl_travel_expense',
      name: 'Travel Expense Claim',
      description: 'Travel expense claim form for business trips',
      category: 'EXPENSE',
      type: 'TRAVEL_EXPENSE',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Trip Purpose', type: 'text', required: true },
          { name: 'date', label: 'Trip Date', type: 'date', required: true },
          { name: 'destination', label: 'Destination', type: 'text', required: true },
          { name: 'items', label: 'Expense Items', type: 'items' },
          { name: 'notes', label: 'Additional Notes', type: 'textarea' },
        ]
      }),
      tags: 'travel,expense,claim',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Tender Templates
    {
      id: 'tpl_tender_document',
      name: 'Standard Tender Document',
      description: 'Official tender document for procurement',
      category: 'TENDER',
      type: 'TENDER_DOCUMENT',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Tender Title', type: 'text', required: true },
          { name: 'documentNumber', label: 'Tender Reference', type: 'text', required: true },
          { name: 'date', label: 'Publication Date', type: 'date', required: true },
          { name: 'validFrom', label: 'Validity Start', type: 'date' },
          { name: 'validTo', label: 'Validity End', type: 'date' },
          { name: 'items', label: 'Items/Services', type: 'items' },
          { name: 'terms', label: 'Terms & Conditions', type: 'textarea' },
        ]
      }),
      tags: 'tender,procurement,bid',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Proposal Templates
    {
      id: 'tpl_business_proposal',
      name: 'Business Proposal',
      description: 'Professional business proposal template',
      category: 'PROPOSAL',
      type: 'BUSINESS_PROPOSAL',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Proposal Title', type: 'text', required: true },
          { name: 'documentNumber', label: 'Proposal Number', type: 'text' },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'client', label: 'Client Information', type: 'client' },
          { name: 'items', label: 'Proposal Items', type: 'items' },
          { name: 'terms', label: 'Terms', type: 'textarea' },
          { name: 'notes', label: 'Executive Summary', type: 'textarea' },
        ]
      }),
      tags: 'proposal,business,sales',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Salary Templates
    {
      id: 'tpl_salary_slip',
      name: 'Salary Slip',
      description: 'Monthly salary slip template',
      category: 'SALARY',
      type: 'SALARY_SLIP',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'employee', label: 'Employee Information', type: 'employee', required: true },
          { name: 'payPeriod', label: 'Pay Period', type: 'daterange', required: true },
          { name: 'salaryComponents', label: 'Salary Components', type: 'salary' },
        ]
      }),
      tags: 'salary,payslip,payroll',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Invoice Templates
    {
      id: 'tpl_invoice',
      name: 'Standard Invoice',
      description: 'Professional invoice template',
      category: 'INVOICE',
      type: 'INVOICE',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'documentNumber', label: 'Invoice Number', type: 'text', required: true },
          { name: 'date', label: 'Invoice Date', type: 'date', required: true },
          { name: 'client', label: 'Client Information', type: 'client', required: true },
          { name: 'items', label: 'Invoice Items', type: 'items', required: true },
          { name: 'terms', label: 'Payment Terms', type: 'textarea' },
        ]
      }),
      tags: 'invoice,billing,payment',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Receipt Templates
    {
      id: 'tpl_receipt',
      name: 'Payment Receipt',
      description: 'Payment receipt template',
      category: 'RECEIPT',
      type: 'RECEIPT',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'documentNumber', label: 'Receipt Number', type: 'text', required: true },
          { name: 'date', label: 'Receipt Date', type: 'date', required: true },
          { name: 'client', label: 'Received From', type: 'client', required: true },
          { name: 'total', label: 'Amount', type: 'currency', required: true },
          { name: 'notes', label: 'Payment For', type: 'textarea' },
        ]
      }),
      tags: 'receipt,payment,confirmation',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Contract Templates
    {
      id: 'tpl_contract',
      name: 'Service Contract',
      description: 'Professional service contract template',
      category: 'CONTRACT',
      type: 'CONTRACT',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Contract Title', type: 'text', required: true },
          { name: 'date', label: 'Agreement Date', type: 'date', required: true },
          { name: 'company', label: 'First Party', type: 'company', required: true },
          { name: 'client', label: 'Second Party', type: 'client', required: true },
          { name: 'terms', label: 'Terms & Conditions', type: 'terms', required: true },
        ]
      }),
      tags: 'contract,agreement,service',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Letter Templates
    {
      id: 'tpl_business_letter',
      name: 'Business Letter',
      description: 'Standard business letter template',
      category: 'LETTER',
      type: 'LETTER',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Subject', type: 'text', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'client', label: 'Recipient', type: 'client' },
          { name: 'notes', label: 'Body', type: 'textarea', required: true },
        ]
      }),
      tags: 'letter,correspondence,business',
      createdAt: new Date().toISOString(),
      version: 1,
    },
    
    // Certificate Templates
    {
      id: 'tpl_certificate',
      name: 'Certificate Template',
      description: 'Professional certificate template',
      category: 'CERTIFICATE',
      type: 'CERTIFICATE',
      isDefault: true,
      isPublic: true,
      schema: JSON.stringify({
        fields: [
          { name: 'title', label: 'Certificate Title', type: 'text', required: true },
          { name: 'date', label: 'Issue Date', type: 'date', required: true },
          { name: 'client', label: 'Recipient', type: 'client', required: true },
          { name: 'notes', label: 'Description', type: 'textarea' },
        ]
      }),
      tags: 'certificate,award,achievement',
      createdAt: new Date().toISOString(),
      version: 1,
    },
  ];

  defaultTemplates.forEach(template => {
    templateStore.set(template.id, template);
  });

  console.log(`Initialized ${defaultTemplates.length} default templates`);
}

// Generate unique ID
function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Start server
console.log(`📋 Template Manager Service starting on port ${PORT}...`);

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(`✅ Template Manager Service running at http://localhost:${PORT}`);
console.log(`   - Health: http://localhost:${PORT}/health`);
console.log(`   - Templates: http://localhost:${PORT}/api/templates`);
console.log(`   - Categories: http://localhost:${PORT}/api/categories`);
