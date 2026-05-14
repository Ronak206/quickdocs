/**
 * PDF Generator Class
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles PDF generation orchestration
 * - Open/Closed: Extensible via template renderers
 * - Liskov Substitution: Implements IGenerator interface
 * - Interface Segregation: Clean, focused public API
 * - Dependency Inversion: Depends on abstractions (TemplateRenderer)
 */

import type { 
  IGenerateRequest, 
  IGenerateResult, 
  IDocumentData, 
  IValidationResult,
  DocumentType 
} from '../types';
import TemplateRenderer from '../templates/TemplateRenderer';

// PDF generation constants
const PDF_OPTIONS = {
  pageSize: 'A4',
  pageMargins: [40, 60, 40, 60],
  defaultStyle: {
    fontSize: 10,
    font: 'Helvetica',
  },
};

class PDFGenerator {
  private templateRenderer: TemplateRenderer;

  constructor(templateRenderer: TemplateRenderer) {
    this.templateRenderer = templateRenderer;
  }

  /**
   * Generate PDF document
   */
  async generate(request: IGenerateRequest): Promise<IGenerateResult> {
    try {
      // Validate request
      const validation = this.validateDocumentData(request);
      if (!validation.valid) {
        return { 
          success: false, 
          error: `Validation failed: ${validation.errors?.join(', ')}` 
        };
      }

      // Get template content
      const templateContent = await this.templateRenderer.render(
        request.type, 
        request.data, 
        request.options
      );

      // Generate PDF using pdfmake-compatible structure
      const pdfDoc = this.createPdfDocument(templateContent, request.options);
      
      // Convert to buffer
      const buffer = await this.renderToBuffer(pdfDoc);

      return {
        success: true,
        buffer,
        filename: request.options?.filename || this.generateFilename(request.type, request.data),
      };
    } catch (error) {
      console.error('PDF Generation Error:', error);
      return {
        success: false,
        error: `Generation failed: ${String(error)}`,
      };
    }
  }

  /**
   * Generate preview (base64 encoded)
   */
  async generatePreview(request: IGenerateRequest): Promise<IGenerateResult> {
    const result = await this.generate(request);
    
    if (result.success && result.buffer) {
      const base64 = this.arrayBufferToBase64(result.buffer);
      return {
        success: true,
        base64,
        filename: result.filename,
      };
    }
    
    return result;
  }

  /**
   * Validate document data
   */
  validateDocumentData(request: IGenerateRequest): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!request.type) {
      errors.push('Document type is required');
    }

    if (!request.data) {
      errors.push('Document data is required');
      return { valid: false, errors };
    }

    if (!request.data.title) {
      errors.push('Document title is required');
    }

    if (!request.data.date) {
      warnings.push('Document date is missing, using current date');
    }

    // Type-specific validation
    this.validateByType(request.type, request.data, errors, warnings);

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Type-specific validation
   */
  private validateByType(
    type: DocumentType, 
    data: IDocumentData, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Invoice/Receipt validation
    if (['INVOICE', 'PROFORMA_INVOICE', 'RECEIPT', 'QUOTE'].includes(type)) {
      if (!data.client?.name) {
        errors.push('Client name is required for invoices/receipts');
      }
      if (!data.items || data.items.length === 0) {
        warnings.push('No items added to the document');
      }
    }

    // Salary validation
    if (['SALARY_SLIP', 'SALARY_CERTIFICATE', 'PAYROLL_REPORT'].includes(type)) {
      if (!data.employee?.name) {
        errors.push('Employee name is required for salary documents');
      }
      if (!data.salaryComponents) {
        warnings.push('Salary components not specified');
      }
    }

    // Expense validation
    if (['EXPENSE_REPORT', 'EXPENSE_CLAIM', 'TRAVEL_EXPENSE'].includes(type)) {
      if (!data.items || data.items.length === 0) {
        errors.push('Expense items are required');
      }
    }

    // Proposal validation
    if (['BUSINESS_PROPOSAL', 'PROJECT_PROPOSAL', 'SALES_PROPOSAL'].includes(type)) {
      if (!data.client?.name) {
        warnings.push('Client name is recommended for proposals');
      }
    }

    // Tender validation
    if (['TENDER_DOCUMENT', 'TENDER_PROPOSAL', 'BID_DOCUMENT'].includes(type)) {
      if (!data.company?.name) {
        errors.push('Company name is required for tender documents');
      }
    }
  }

  /**
   * Create PDF document structure
   */
  private createPdfDocument(content: any, options?: any): any {
    return {
      pageSize: options?.pageSize || PDF_OPTIONS.pageSize,
      pageMargins: PDF_OPTIONS.pageMargins,
      defaultStyle: PDF_OPTIONS.defaultStyle,
      ...content,
    };
  }

  /**
   * Render to buffer (simplified - would use pdfmake in production)
   */
  private async renderToBuffer(pdfDoc: any): Promise<ArrayBuffer> {
    // In production, this would use pdfmake to generate actual PDF
    // For now, return a placeholder buffer
    const jsonString = JSON.stringify(pdfDoc, null, 2);
    const encoder = new TextEncoder();
    return encoder.encode(jsonString).buffer as ArrayBuffer;
  }

  /**
   * Generate filename based on document type and data
   */
  private generateFilename(type: DocumentType, data: IDocumentData): string {
    const prefix = type.toLowerCase().replace(/_/g, '-');
    const docNum = data.documentNumber || Date.now().toString();
    const date = new Date().toISOString().split('T')[0];
    return `${prefix}_${docNum}_${date}.pdf`;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export default PDFGenerator;
