/**
 * Template Scraper Class
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles external template scraping
 * - Open/Closed: New sources can be added without modifying existing code
 */

interface IScrapeRequest {
  source?: string;
  category?: string;
  keywords?: string[];
  limit?: number;
}

interface IScrapeResult {
  success: boolean;
  templates?: any[];
  message?: string;
  error?: string;
}

// External template sources configuration
const TEMPLATE_SOURCES = {
  canva: {
    name: 'Canva',
    baseUrl: 'https://www.canva.com/templates/',
    categories: ['invoice', 'proposal', 'receipt', 'letter', 'certificate'],
  },
  smartsheet: {
    name: 'Smartsheet',
    baseUrl: 'https://www.smartsheet.com/content/templates',
    categories: ['project', 'budget', 'report', 'timeline'],
  },
  hubspot: {
    name: 'HubSpot',
    baseUrl: 'https://www.hubspot.com/templates',
    categories: ['business', 'marketing', 'sales'],
  },
  microsoft: {
    name: 'Microsoft Templates',
    baseUrl: 'https://create.microsoft.com/templates',
    categories: ['invoice', 'resume', 'letter', 'calendar', 'budget'],
  },
};

class TemplateScraper {
  /**
   * Scrape templates from external sources
   * Note: This is a simulated implementation
   * In production, this would use actual web scraping with cheerio/puppeteer
   */
  async scrape(request: IScrapeRequest): Promise<IScrapeResult> {
    const { source, category, keywords, limit = 10 } = request;

    try {
      // In production, this would fetch actual templates from external sources
      // For now, return simulated templates based on the request
      
      const templates = this.generateSimulatedTemplates(source, category, keywords, limit);

      return {
        success: true,
        templates,
        message: `Found ${templates.length} templates`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Scraping failed: ${String(error)}`,
      };
    }
  }

  /**
   * Generate simulated templates for demo purposes
   * In production, this would be replaced with actual scraping logic
   */
  private generateSimulatedTemplates(
    source?: string,
    category?: string,
    keywords?: string[],
    limit?: number
  ): any[] {
    const templates: any[] = [];
    const count = Math.min(limit || 10, 20);

    const categories = ['EXPENSE', 'TENDER', 'PROPOSAL', 'SALARY', 'INVOICE', 'RECEIPT', 'CONTRACT'];
    const types = {
      EXPENSE: ['EXPENSE_REPORT', 'EXPENSE_CLAIM', 'TRAVEL_EXPENSE'],
      TENDER: ['TENDER_DOCUMENT', 'TENDER_PROPOSAL', 'BID_DOCUMENT'],
      PROPOSAL: ['BUSINESS_PROPOSAL', 'PROJECT_PROPOSAL', 'SALES_PROPOSAL'],
      SALARY: ['SALARY_SLIP', 'SALARY_CERTIFICATE', 'PAYROLL_REPORT'],
      INVOICE: ['INVOICE', 'PROFORMA_INVOICE'],
      RECEIPT: ['RECEIPT'],
      CONTRACT: ['CONTRACT', 'AGREEMENT', 'NDA'],
    };

    const sourceName = source || 'external';

    for (let i = 0; i < count; i++) {
      const cat = category || categories[Math.floor(Math.random() * categories.length)];
      const catTypes = types[cat as keyof typeof types] || ['CUSTOM'];
      const type = catTypes[Math.floor(Math.random() * catTypes.length)];

      templates.push({
        id: `ext_${sourceName}_${Date.now()}_${i}`,
        name: `${this.getTemplateName(type)} - ${sourceName}`,
        description: `Professional ${type.toLowerCase().replace(/_/g, ' ')} template from ${sourceName}`,
        category: cat,
        type,
        source: sourceName,
        sourceName,
        isPublic: true,
        isPremium: Math.random() > 0.7,
        preview: `/templates/previews/${type.toLowerCase()}.png`,
        schema: JSON.stringify(this.getTemplateSchema(type)),
        tags: keywords?.join(',') || `${cat.toLowerCase()},${type.toLowerCase()}`,
        createdAt: new Date().toISOString(),
        version: 1,
        downloads: Math.floor(Math.random() * 1000),
        rating: (3 + Math.random() * 2).toFixed(1),
      });
    }

    return templates;
  }

  /**
   * Get template name from type
   */
  private getTemplateName(type: string): string {
    const names: Record<string, string> = {
      EXPENSE_REPORT: 'Monthly Expense Report',
      EXPENSE_CLAIM: 'Expense Claim Form',
      TRAVEL_EXPENSE: 'Travel Expense Sheet',
      TENDER_DOCUMENT: 'Official Tender Document',
      TENDER_PROPOSAL: 'Tender Proposal',
      BID_DOCUMENT: 'Bid Submission Document',
      BUSINESS_PROPOSAL: 'Business Proposal',
      PROJECT_PROPOSAL: 'Project Proposal',
      SALES_PROPOSAL: 'Sales Proposal',
      SALARY_SLIP: 'Employee Salary Slip',
      SALARY_CERTIFICATE: 'Salary Certificate',
      PAYROLL_REPORT: 'Payroll Report',
      INVOICE: 'Tax Invoice',
      PROFORMA_INVOICE: 'Proforma Invoice',
      RECEIPT: 'Payment Receipt',
      CONTRACT: 'Service Contract',
      AGREEMENT: 'Service Agreement',
      NDA: 'Non-Disclosure Agreement',
    };

    return names[type] || 'Professional Document';
  }

  /**
   * Get template schema for type
   */
  private getTemplateSchema(type: string): any {
    const schemas: Record<string, any> = {
      INVOICE: {
        fields: [
          { name: 'documentNumber', label: 'Invoice Number', type: 'text', required: true },
          { name: 'date', label: 'Invoice Date', type: 'date', required: true },
          { name: 'client', label: 'Bill To', type: 'client', required: true },
          { name: 'items', label: 'Line Items', type: 'items', required: true },
          { name: 'terms', label: 'Terms', type: 'textarea' },
        ]
      },
      SALARY_SLIP: {
        fields: [
          { name: 'employee', label: 'Employee Details', type: 'employee', required: true },
          { name: 'payPeriod', label: 'Pay Period', type: 'daterange', required: true },
          { name: 'salaryComponents', label: 'Salary Breakdown', type: 'salary' },
        ]
      },
      BUSINESS_PROPOSAL: {
        fields: [
          { name: 'title', label: 'Proposal Title', type: 'text', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'client', label: 'Client', type: 'client', required: true },
          { name: 'items', label: 'Deliverables', type: 'items' },
          { name: 'notes', label: 'Executive Summary', type: 'textarea' },
        ]
      },
      TENDER_DOCUMENT: {
        fields: [
          { name: 'title', label: 'Tender Title', type: 'text', required: true },
          { name: 'documentNumber', label: 'Reference Number', type: 'text', required: true },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'items', label: 'Requirements', type: 'items' },
          { name: 'terms', label: 'Terms', type: 'terms' },
        ]
      },
    };

    return schemas[type] || {
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'notes', label: 'Content', type: 'textarea' },
      ]
    };
  }

  /**
   * Search templates from external sources
   * Note: Simulated implementation
   */
  async searchExternal(query: string, source?: string): Promise<IScrapeResult> {
    const keywords = query.split(' ').filter(k => k.length > 2);
    
    return this.scrape({
      source,
      keywords,
      limit: 5,
    });
  }

  /**
   * Get available sources
   */
  getAvailableSources(): { id: string; name: string; url: string }[] {
    return Object.entries(TEMPLATE_SOURCES).map(([id, config]) => ({
      id,
      name: config.name,
      url: config.baseUrl,
    }));
  }
}

export default TemplateScraper;
