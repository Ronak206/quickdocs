/**
 * Template Renderer Class
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles template rendering
 * - Open/Closed: New document types can be added without modifying existing code
 * - Dependency Inversion: Renderers are strategy implementations
 */

import type { 
  DocumentType, 
  IDocumentData, 
  IGenerateOptions,
  TemplateCategory 
} from '../types';

// Document type to category mapping
const DOCUMENT_CATEGORY_MAP: Record<DocumentType, TemplateCategory> = {
  // Expense
  EXPENSE_REPORT: 'EXPENSE',
  EXPENSE_CLAIM: 'EXPENSE',
  TRAVEL_EXPENSE: 'EXPENSE',
  MONTHLY_EXPENSE: 'EXPENSE',
  
  // Tender
  TENDER_DOCUMENT: 'TENDER',
  TENDER_PROPOSAL: 'TENDER',
  BID_DOCUMENT: 'TENDER',
  TENDER_EVALUATION: 'TENDER',
  RFP_DOCUMENT: 'TENDER',
  
  // Proposal
  BUSINESS_PROPOSAL: 'PROPOSAL',
  PROJECT_PROPOSAL: 'PROPOSAL',
  SALES_PROPOSAL: 'PROPOSAL',
  PARTNERSHIP_PROPOSAL: 'PROPOSAL',
  GRANT_PROPOSAL: 'PROPOSAL',
  
  // Salary
  SALARY_SLIP: 'SALARY',
  SALARY_CERTIFICATE: 'SALARY',
  PAYROLL_REPORT: 'SALARY',
  SALARY_INCREMENT: 'SALARY',
  OFFER_LETTER: 'SALARY',
  
  // Invoice
  INVOICE: 'INVOICE',
  PROFORMA_INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  CREDIT_NOTE: 'INVOICE',
  DEBIT_NOTE: 'INVOICE',
  
  // Contract
  CONTRACT: 'CONTRACT',
  AGREEMENT: 'AGREEMENT',
  NDA: 'AGREEMENT',
  SERVICE_AGREEMENT: 'AGREEMENT',
  
  // Other
  REPORT: 'REPORT',
  LETTER: 'LETTER',
  CERTIFICATE: 'CERTIFICATE',
  QUOTE: 'QUOTE',
  MEMO: 'MEMO',
  CUSTOM: 'CUSTOM',
};

class TemplateRenderer {
  /**
   * Render document based on type
   */
  async render(
    type: DocumentType, 
    data: IDocumentData, 
    options?: IGenerateOptions
  ): Promise<any> {
    const category = DOCUMENT_CATEGORY_MAP[type];
    
    // Route to appropriate renderer based on category
    switch (category) {
      case 'EXPENSE':
        return this.renderExpenseDocument(type, data, options);
      case 'TENDER':
        return this.renderTenderDocument(type, data, options);
      case 'PROPOSAL':
        return this.renderProposalDocument(type, data, options);
      case 'SALARY':
        return this.renderSalaryDocument(type, data, options);
      case 'INVOICE':
        return this.renderInvoiceDocument(type, data, options);
      case 'RECEIPT':
        return this.renderReceiptDocument(type, data, options);
      case 'CONTRACT':
      case 'AGREEMENT':
        return this.renderContractDocument(type, data, options);
      case 'LETTER':
        return this.renderLetterDocument(type, data, options);
      case 'CERTIFICATE':
        return this.renderCertificateDocument(type, data, options);
      case 'REPORT':
        return this.renderReportDocument(type, data, options);
      case 'QUOTE':
        return this.renderQuoteDocument(type, data, options);
      case 'MEMO':
        return this.renderMemoDocument(type, data, options);
      default:
        return this.renderCustomDocument(type, data, options);
    }
  }

  /**
   * Render expense documents
   */
  private renderExpenseDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Document No: ${data.documentNumber || 'N/A'}`,
        style: 'subheader',
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      ...this.createExpenseItems(data),
      ...this.createTotals(data),
      ...(data.notes ? [{
        text: 'Notes:',
        style: 'sectionHeader',
        margin: [0, 20, 0, 5],
      }, {
        text: data.notes,
        style: 'notes',
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render tender documents
   */
  private renderTenderDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Tender Reference: ${data.documentNumber || 'N/A'}`,
        style: 'subheader',
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      ...(data.validFrom && data.validTo ? [{
        text: `Validity Period: ${this.formatDate(data.validFrom)} to ${this.formatDate(data.validTo)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      }] : []),
      ...this.createTenderDetails(data),
      ...this.createTotals(data),
      ...(data.terms && data.terms.length > 0 ? this.createTerms(data.terms) : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render proposal documents
   */
  private renderProposalDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Proposal Number: ${data.documentNumber || 'N/A'}`,
        style: 'subheader',
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      ...this.createClientInfo(data.client),
      ...this.createProposalItems(data),
      ...this.createTotals(data),
      ...(data.terms && data.terms.length > 0 ? this.createTerms(data.terms) : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render salary documents
   */
  private renderSalaryDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    if (type === 'SALARY_SLIP') {
      content.content = [
        ...this.createHeader(data, type),
        {
          text: 'SALARY SLIP',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 0, 10],
        },
        ...this.createEmployeeInfo(data.employee),
        ...(data.payPeriod ? [{
          text: `Pay Period: ${this.formatDate(data.payPeriod.start)} - ${this.formatDate(data.payPeriod.end)}`,
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        }] : []),
        ...this.createSalaryComponents(data.salaryComponents),
        ...this.createFooter(data),
      ];
    } else {
      content.content = [
        ...this.createHeader(data, type),
        {
          text: data.title,
          style: 'header',
          margin: [0, 20, 0, 10],
        },
        ...this.createEmployeeInfo(data.employee),
        ...this.createSalaryComponents(data.salaryComponents),
        ...this.createFooter(data),
      ];
    }

    return content;
  }

  /**
   * Render invoice documents
   */
  private renderInvoiceDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: type === 'PROFORMA_INVOICE' ? 'PROFORMA INVOICE' : 'INVOICE',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 10],
      },
      {
        columns: [
          {
            width: '*',
            text: `Invoice #: ${data.documentNumber || 'N/A'}`,
          },
          {
            width: '*',
            text: `Date: ${this.formatDate(data.date)}`,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      ...this.createClientInfo(data.client),
      ...this.createInvoiceItems(data),
      ...this.createTotals(data),
      ...(data.terms && data.terms.length > 0 ? this.createTerms(data.terms) : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render receipt documents
   */
  private renderReceiptDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: 'RECEIPT',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 10],
      },
      {
        columns: [
          {
            width: '*',
            text: `Receipt #: ${data.documentNumber || 'N/A'}`,
          },
          {
            width: '*',
            text: `Date: ${this.formatDate(data.date)}`,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      ...this.createClientInfo(data.client),
      {
        text: `Amount Received: ${this.formatCurrency(data.total || 0, data.currency)}`,
        style: 'total',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Payment for: ${data.title}`,
        style: 'subheader',
      },
      ...(data.notes ? [{
        text: data.notes,
        style: 'notes',
        margin: [0, 10, 0, 0],
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render contract documents
   */
  private renderContractDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 20],
      },
      {
        text: `Agreement Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      {
        text: 'PARTIES',
        style: 'sectionHeader',
      },
      ...this.createPartyInfo(data.company, 'First Party'),
      ...this.createPartyInfo(data.client, 'Second Party'),
      {
        text: 'TERMS AND CONDITIONS',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10],
      },
      ...(data.terms && data.terms.length > 0 ? 
        data.terms.map((term, i) => ({
          text: `${i + 1}. ${term}`,
          style: 'term',
          margin: [0, 5, 0, 5],
        })) : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render letter documents
   */
  private renderLetterDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: this.formatDate(data.date),
        margin: [0, 20, 0, 20],
      },
      ...(data.client ? [{
        text: data.client.name,
      }, ...(data.client.address ? [{
        text: data.client.address,
      }] : [])] : []),
      {
        text: '\n',
      },
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      ...(data.notes ? [{
        text: data.notes,
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render certificate documents
   */
  private renderCertificateDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: 'CERTIFICATE',
        style: 'header',
        alignment: 'center',
        fontSize: 24,
        margin: [0, 40, 0, 20],
      },
      {
        text: data.title,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 40],
      },
      {
        text: `This is to certify that ${data.client?.name || 'the recipient'} has successfully completed the requirements.`,
        alignment: 'center',
        margin: [0, 0, 0, 40],
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        alignment: 'center',
      },
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render report documents
   */
  private renderReportDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Report Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      ...this.createExpenseItems(data),
      ...this.createTotals(data),
      ...(data.notes ? [{
        text: 'Summary:',
        style: 'sectionHeader',
        margin: [0, 20, 0, 5],
      }, {
        text: data.notes,
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render quote documents
   */
  private renderQuoteDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: 'QUOTATION',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 10],
      },
      {
        columns: [
          {
            width: '*',
            text: `Quote #: ${data.documentNumber || 'N/A'}`,
          },
          {
            width: '*',
            text: `Date: ${this.formatDate(data.date)}`,
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 20],
      },
      ...(data.validTo ? [{
        text: `Valid Until: ${this.formatDate(data.validTo)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      }] : []),
      ...this.createClientInfo(data.client),
      ...this.createInvoiceItems(data),
      ...this.createTotals(data),
      ...(data.terms && data.terms.length > 0 ? this.createTerms(data.terms) : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render memo documents
   */
  private renderMemoDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: 'MEMORANDUM',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      {
        text: data.title,
        style: 'sectionHeader',
        margin: [0, 0, 0, 10],
      },
      ...(data.notes ? [{
        text: data.notes,
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  /**
   * Render custom documents
   */
  private renderCustomDocument(type: DocumentType, data: IDocumentData, options?: IGenerateOptions): any {
    const content = this.createBaseDocument(data);
    
    content.content = [
      ...this.createHeader(data, type),
      {
        text: data.title,
        style: 'header',
        margin: [0, 20, 0, 10],
      },
      {
        text: `Date: ${this.formatDate(data.date)}`,
        style: 'subheader',
        margin: [0, 0, 0, 20],
      },
      ...this.createCustomFields(data.customFields),
      ...(data.notes ? [{
        text: data.notes,
      }] : []),
      ...this.createFooter(data),
    ];

    return content;
  }

  // ============================================
  // Helper Methods
  // ============================================

  private createBaseDocument(data: IDocumentData): any {
    return {
      info: {
        title: data.title,
        author: data.company?.name || 'DocuForge Pro',
        subject: data.type,
        creator: 'DocuForge Pro PDF Generator',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 12,
          color: '#666666',
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        total: {
          fontSize: 14,
          bold: true,
        },
        notes: {
          fontSize: 10,
          italics: true,
          color: '#666666',
        },
        term: {
          fontSize: 10,
        },
      },
    };
  }

  private createHeader(data: IDocumentData, type: DocumentType): any[] {
    if (!data.company) return [];
    
    return [{
      columns: [
        {
          width: '*',
          stack: [
            { text: data.company.name, style: 'header' },
            ...(data.company.address ? [{ text: data.company.address, fontSize: 10 }] : []),
            ...(data.company.phone ? [{ text: `Phone: ${data.company.phone}`, fontSize: 10 }] : []),
            ...(data.company.email ? [{ text: `Email: ${data.company.email}`, fontSize: 10 }] : []),
          ],
        },
        {
          width: 'auto',
          text: type,
          alignment: 'right',
          fontSize: 10,
          color: '#999999',
        },
      ],
      margin: [0, 0, 0, 20],
    }];
  }

  private createFooter(data: IDocumentData): any[] {
    return [{
      text: `Generated by DocuForge Pro on ${new Date().toLocaleDateString()}`,
      fontSize: 8,
      color: '#999999',
      alignment: 'center',
      margin: [0, 30, 0, 0],
    }];
  }

  private createExpenseItems(data: IDocumentData): any[] {
    if (!data.items || data.items.length === 0) return [];
    
    return [{
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto'],
        body: [
          ['Description', 'Quantity', 'Unit Price', 'Amount'],
          ...data.items.map(item => [
            item.name,
            item.quantity.toString(),
            this.formatCurrency(item.unitPrice, data.currency),
            this.formatCurrency(item.total, data.currency),
          ]),
        ],
      },
      margin: [0, 10, 0, 10],
    }];
  }

  private createInvoiceItems(data: IDocumentData): any[] {
    if (!data.items || data.items.length === 0) return [];
    
    return [{
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['Item', 'Quantity', 'Unit Price', 'Tax', 'Total'],
          ...data.items.map(item => [
            item.name + (item.description ? `\n${item.description}` : ''),
            item.quantity.toString(),
            this.formatCurrency(item.unitPrice, data.currency),
            item.taxRate ? `${item.taxRate}%` : '-',
            this.formatCurrency(item.total, data.currency),
          ]),
        ],
      },
      margin: [0, 10, 0, 10],
    }];
  }

  private createProposalItems(data: IDocumentData): any[] {
    return this.createInvoiceItems(data);
  }

  private createTenderDetails(data: IDocumentData): any[] {
    const items: any[] = [];
    
    if (data.client) {
      items.push({
        text: 'CLIENT DETAILS',
        style: 'sectionHeader',
      });
      items.push(...this.createClientInfo(data.client));
    }
    
    if (data.items && data.items.length > 0) {
      items.push({
        text: 'ITEMS/SERVICES',
        style: 'sectionHeader',
        margin: [0, 20, 0, 10],
      });
      items.push(...this.createExpenseItems(data));
    }
    
    return items;
  }

  private createTotals(data: IDocumentData): any[] {
    if (!data.total) return [];
    
    return [{
      columns: [
        {
          width: '*',
          text: '',
        },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto'],
            body: [
              ...(data.subtotal ? [['Subtotal', this.formatCurrency(data.subtotal, data.currency)]] : []),
              ...(data.taxAmount ? [['Tax', this.formatCurrency(data.taxAmount, data.currency)]] : []),
              ['Total', { text: this.formatCurrency(data.total, data.currency), bold: true }],
            ],
          },
        },
      ],
      margin: [0, 10, 0, 10],
    }];
  }

  private createClientInfo(client?: any): any[] {
    if (!client) return [];
    
    return [{
      text: 'BILL TO',
      style: 'sectionHeader',
    }, {
      text: client.name,
      bold: true,
    }, ...(client.address ? [{
      text: client.address,
    }] : []), ...(client.email ? [{
      text: `Email: ${client.email}`,
    }] : []), {
      text: '',
      margin: [0, 0, 0, 20],
    }];
  }

  private createEmployeeInfo(employee?: any): any[] {
    if (!employee) return [];
    
    return [{
      table: {
        widths: ['*', '*'],
        body: [
          ['Employee Name', employee.name || '-'],
          ['Employee ID', employee.employeeId || '-'],
          ['Department', employee.department || '-'],
          ['Designation', employee.designation || '-'],
          ...(employee.joiningDate ? [['Joining Date', this.formatDate(employee.joiningDate)]] : []),
        ],
      },
      margin: [0, 10, 0, 20],
    }];
  }

  private createSalaryComponents(salary?: any): any[] {
    if (!salary) return [];
    
    const earnings: [string, string][] = [
      ['Basic Salary', this.formatCurrency(salary.basic || 0)],
    ];
    if (salary.hra) earnings.push(['HRA', this.formatCurrency(salary.hra)]);
    if (salary.conveyance) earnings.push(['Conveyance', this.formatCurrency(salary.conveyance)]);
    if (salary.medical) earnings.push(['Medical', this.formatCurrency(salary.medical)]);
    if (salary.specialAllowance) earnings.push(['Special Allowance', this.formatCurrency(salary.specialAllowance)]);
    if (salary.lta) earnings.push(['LTA', this.formatCurrency(salary.lta)]);
    if (salary.bonus) earnings.push(['Bonus', this.formatCurrency(salary.bonus)]);
    if (salary.otherAllowances) {
      salary.otherAllowances.forEach((a: any) => earnings.push([a.name, this.formatCurrency(a.amount)]));
    }
    
    const deductions: [string, string][] = [];
    if (salary.pf) deductions.push(['PF', this.formatCurrency(salary.pf)]);
    if (salary.professionalTax) deductions.push(['Professional Tax', this.formatCurrency(salary.professionalTax)]);
    if (salary.incomeTax) deductions.push(['Income Tax', this.formatCurrency(salary.incomeTax)]);
    if (salary.otherDeductions) {
      salary.otherDeductions.forEach((d: any) => deductions.push([d.name, this.formatCurrency(d.amount)]));
    }
    
    const totalEarnings = earnings.reduce((sum, [, amount]) => sum + parseFloat(amount.replace(/[^0-9.-]+/g, '')), 0);
    const totalDeductions = deductions.reduce((sum, [, amount]) => sum + parseFloat(amount.replace(/[^0-9.-]+/g, '')), 0);
    const netSalary = totalEarnings - totalDeductions;
    
    return [{
      columns: [
        {
          width: '*',
          stack: [
            { text: 'EARNINGS', style: 'sectionHeader' },
            {
              table: {
                widths: ['*', 'auto'],
                body: [...earnings, [{ text: 'Total Earnings', bold: true }, { text: this.formatCurrency(totalEarnings), bold: true }]],
              },
            },
          ],
        },
        {
          width: '*',
          stack: [
            { text: 'DEDUCTIONS', style: 'sectionHeader' },
            {
              table: {
                widths: ['*', 'auto'],
                body: deductions.length > 0 ? [...deductions, [{ text: 'Total Deductions', bold: true }, { text: this.formatCurrency(totalDeductions), bold: true }]] : [['No Deductions', '-']],
              },
            },
          ],
        },
      ],
    }, {
      text: `NET SALARY: ${this.formatCurrency(netSalary)}`,
      style: 'total',
      alignment: 'center',
      margin: [0, 20, 0, 10],
    }];
  }

  private createTerms(terms: string[]): any[] {
    return [{
      text: 'TERMS AND CONDITIONS',
      style: 'sectionHeader',
      margin: [0, 20, 0, 10],
    }, ...terms.map((term, i) => ({
      text: `${i + 1}. ${term}`,
      style: 'term',
      margin: [0, 5, 0, 5],
    }))];
  }

  private createPartyInfo(party?: any, label?: string): any[] {
    if (!party) return [];
    
    return [{
      text: label || 'Party',
      style: 'sectionHeader',
      margin: [0, 10, 0, 5],
    }, {
      text: party.name,
      bold: true,
    }, ...(party.address ? [{
      text: party.address,
    }] : []), {
      text: '',
      margin: [0, 0, 0, 10],
    }];
  }

  private createCustomFields(fields?: Record<string, any>): any[] {
    if (!fields) return [];
    
    return Object.entries(fields).map(([key, value]) => ({
      text: `${key}: ${value}`,
      margin: [0, 5, 0, 5],
    }));
  }

  private formatDate(date: string | Date): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  private formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

export default TemplateRenderer;
