/**
 * Template Processor Class
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles template processing and validation
 * - Open/Closed: Can add new validation rules without modifying existing code
 */

interface ITemplateField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface ITemplateInput {
  name: string;
  description?: string;
  category: string;
  type: string;
  schema?: string;
  layout?: string;
  styling?: string;
  tags?: string;
  isPublic?: boolean;
  isPremium?: boolean;
}

interface IProcessedTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  schema: string;
  layout?: string;
  styling?: string;
  tags?: string;
  isPublic: boolean;
  isPremium: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface IProcessResult {
  template?: IProcessedTemplate;
  errors?: string[];
}

class TemplateProcessor {
  private validCategories = [
    'EXPENSE', 'TENDER', 'PROPOSAL', 'SALARY', 'INVOICE', 
    'RECEIPT', 'CONTRACT', 'REPORT', 'LETTER', 'CERTIFICATE',
    'AGREEMENT', 'QUOTE', 'MEMO', 'CUSTOM'
  ];

  private validTypes = [
    'EXPENSE_REPORT', 'EXPENSE_CLAIM', 'TRAVEL_EXPENSE', 'MONTHLY_EXPENSE',
    'TENDER_DOCUMENT', 'TENDER_PROPOSAL', 'BID_DOCUMENT', 'TENDER_EVALUATION', 'RFP_DOCUMENT',
    'BUSINESS_PROPOSAL', 'PROJECT_PROPOSAL', 'SALES_PROPOSAL', 'PARTNERSHIP_PROPOSAL', 'GRANT_PROPOSAL',
    'SALARY_SLIP', 'SALARY_CERTIFICATE', 'PAYROLL_REPORT', 'SALARY_INCREMENT', 'OFFER_LETTER',
    'INVOICE', 'PROFORMA_INVOICE', 'RECEIPT', 'CREDIT_NOTE', 'DEBIT_NOTE',
    'CONTRACT', 'AGREEMENT', 'NDA', 'SERVICE_AGREEMENT',
    'REPORT', 'LETTER', 'CERTIFICATE', 'QUOTE', 'MEMO', 'CUSTOM'
  ];

  private validFieldTypes = [
    'text', 'number', 'email', 'phone', 'date', 'datetime',
    'textarea', 'select', 'radio', 'checkbox', 'currency',
    'percentage', 'file', 'image', 'signature', 'company',
    'address', 'items', 'client', 'employee', 'salary', 'terms', 'daterange'
  ];

  /**
   * Process and validate a template
   */
  processTemplate(input: ITemplateInput): IProcessResult {
    const errors: string[] = [];

    // Validate required fields
    if (!input.name || input.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!input.category) {
      errors.push('Category is required');
    } else if (!this.validCategories.includes(input.category)) {
      errors.push(`Invalid category. Valid categories: ${this.validCategories.join(', ')}`);
    }

    if (!input.type) {
      errors.push('Document type is required');
    } else if (!this.validTypes.includes(input.type)) {
      errors.push(`Invalid document type. Valid types: ${this.validTypes.join(', ')}`);
    }

    // Validate schema if provided
    if (input.schema) {
      const schemaErrors = this.validateSchema(input.schema);
      errors.push(...schemaErrors);
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return { errors };
    }

    // Create processed template
    const template: IProcessedTemplate = {
      id: this.generateId(),
      name: input.name.trim(),
      description: input.description?.trim(),
      category: input.category,
      type: input.type,
      schema: input.schema || this.getDefaultSchema(input.type),
      layout: input.layout,
      styling: input.styling,
      tags: input.tags,
      isPublic: input.isPublic ?? true,
      isPremium: input.isPremium ?? false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { template };
  }

  /**
   * Validate template schema
   */
  private validateSchema(schemaString: string): string[] {
    const errors: string[] = [];

    try {
      const schema = JSON.parse(schemaString);

      if (!schema.fields || !Array.isArray(schema.fields)) {
        errors.push('Schema must contain a "fields" array');
        return errors;
      }

      schema.fields.forEach((field: ITemplateField, index: number) => {
        const fieldErrors = this.validateField(field, index);
        errors.push(...fieldErrors);
      });

    } catch (e) {
      errors.push('Invalid JSON format for schema');
    }

    return errors;
  }

  /**
   * Validate individual field
   */
  private validateField(field: ITemplateField, index: number): string[] {
    const errors: string[] = [];
    const prefix = `Field ${index + 1}`;

    if (!field.name) {
      errors.push(`${prefix}: name is required`);
    }

    if (!field.label) {
      errors.push(`${prefix}: label is required`);
    }

    if (!field.type) {
      errors.push(`${prefix}: type is required`);
    } else if (!this.validFieldTypes.includes(field.type)) {
      errors.push(`${prefix}: invalid type "${field.type}"`);
    }

    // Validate options for select/radio types
    if (['select', 'radio'].includes(field.type)) {
      if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
        errors.push(`${prefix}: ${field.type} type requires options array`);
      }
    }

    return errors;
  }

  /**
   * Get default schema for document type
   */
  private getDefaultSchema(type: string): string {
    const defaultSchemas: Record<string, any> = {
      EXPENSE_REPORT: {
        fields: [
          { name: 'title', label: 'Report Title', type: 'text', required: true },
          { name: 'date', label: 'Report Date', type: 'date', required: true },
          { name: 'items', label: 'Expense Items', type: 'items', required: true },
          { name: 'notes', label: 'Notes', type: 'textarea' },
        ]
      },
      INVOICE: {
        fields: [
          { name: 'documentNumber', label: 'Invoice Number', type: 'text', required: true },
          { name: 'date', label: 'Invoice Date', type: 'date', required: true },
          { name: 'client', label: 'Client', type: 'client', required: true },
          { name: 'items', label: 'Invoice Items', type: 'items', required: true },
          { name: 'terms', label: 'Payment Terms', type: 'textarea' },
        ]
      },
      SALARY_SLIP: {
        fields: [
          { name: 'employee', label: 'Employee', type: 'employee', required: true },
          { name: 'payPeriod', label: 'Pay Period', type: 'daterange', required: true },
          { name: 'salaryComponents', label: 'Salary Details', type: 'salary' },
        ]
      },
      BUSINESS_PROPOSAL: {
        fields: [
          { name: 'title', label: 'Proposal Title', type: 'text', required: true },
          { name: 'documentNumber', label: 'Proposal Number', type: 'text' },
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'client', label: 'Client', type: 'client', required: true },
          { name: 'items', label: 'Proposal Items', type: 'items' },
          { name: 'notes', label: 'Executive Summary', type: 'textarea' },
        ]
      },
      TENDER_DOCUMENT: {
        fields: [
          { name: 'title', label: 'Tender Title', type: 'text', required: true },
          { name: 'documentNumber', label: 'Tender Reference', type: 'text', required: true },
          { name: 'date', label: 'Publication Date', type: 'date', required: true },
          { name: 'validTo', label: 'Validity End Date', type: 'date' },
          { name: 'items', label: 'Items/Services', type: 'items' },
          { name: 'terms', label: 'Terms', type: 'terms' },
        ]
      },
    };

    return JSON.stringify(defaultSchemas[type] || {
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'notes', label: 'Content', type: 'textarea' },
      ]
    });
  }

  /**
   * Generate unique template ID
   */
  private generateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export default TemplateProcessor;
