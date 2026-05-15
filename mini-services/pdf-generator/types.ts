/**
 * Type definitions for PDF Generator Service
 * Following Interface Segregation Principle (ISP)
 */

// Document Types
export enum DocumentType {
  // Expense Types
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  EXPENSE_CLAIM = 'EXPENSE_CLAIM',
  TRAVEL_EXPENSE = 'TRAVEL_EXPENSE',
  MONTHLY_EXPENSE = 'MONTHLY_EXPENSE',
  
  // Tender Types
  TENDER_DOCUMENT = 'TENDER_DOCUMENT',
  TENDER_PROPOSAL = 'TENDER_PROPOSAL',
  BID_DOCUMENT = 'BID_DOCUMENT',
  TENDER_EVALUATION = 'TENDER_EVALUATION',
  RFP_DOCUMENT = 'RFP_DOCUMENT',
  
  // Proposal Types
  BUSINESS_PROPOSAL = 'BUSINESS_PROPOSAL',
  PROJECT_PROPOSAL = 'PROJECT_PROPOSAL',
  SALES_PROPOSAL = 'SALES_PROPOSAL',
  PARTNERSHIP_PROPOSAL = 'PARTNERSHIP_PROPOSAL',
  GRANT_PROPOSAL = 'GRANT_PROPOSAL',
  
  // Salary Types
  SALARY_SLIP = 'SALARY_SLIP',
  SALARY_CERTIFICATE = 'SALARY_CERTIFICATE',
  PAYROLL_REPORT = 'PAYROLL_REPORT',
  SALARY_INCREMENT = 'SALARY_INCREMENT',
  OFFER_LETTER = 'OFFER_LETTER',
  
  // Invoice & Receipt
  INVOICE = 'INVOICE',
  PROFORMA_INVOICE = 'PROFORMA_INVOICE',
  RECEIPT = 'RECEIPT',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  
  // Contract & Agreement
  CONTRACT = 'CONTRACT',
  AGREEMENT = 'AGREEMENT',
  NDA = 'NDA',
  SERVICE_AGREEMENT = 'SERVICE_AGREEMENT',
  
  // Other
  REPORT = 'REPORT',
  LETTER = 'LETTER',
  CERTIFICATE = 'CERTIFICATE',
  QUOTE = 'QUOTE',
  MEMO = 'MEMO',
  CUSTOM = 'CUSTOM',
}

// Template Category
export enum TemplateCategory {
  EXPENSE = 'EXPENSE',
  TENDER = 'TENDER',
  PROPOSAL = 'PROPOSAL',
  SALARY = 'SALARY',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  REPORT = 'REPORT',
  LETTER = 'LETTER',
  CERTIFICATE = 'CERTIFICATE',
  AGREEMENT = 'AGREEMENT',
  QUOTE = 'QUOTE',
  MEMO = 'MEMO',
  CUSTOM = 'CUSTOM',
}

// Company Information Interface
export interface ICompanyInfo {
  name: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

// Client/Customer Information Interface
export interface IClientInfo {
  name: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  taxId?: string;
}

// Document Item Interface
export interface IDocumentItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
  category?: string;
}

// Employee Information (for salary documents)
export interface IEmployeeInfo {
  name: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  bankAccount?: string;
  bankName?: string;
  panNumber?: string;
}

// Salary Components Interface
export interface ISalaryComponents {
  basic: number;
  hra?: number;
  conveyance?: number;
  medical?: number;
  specialAllowance?: number;
  lta?: number;
  bonus?: number;
  otherAllowances?: { name: string; amount: number }[];
  pf?: number;
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: { name: string; amount: number }[];
}

// Document Data Interface (main data structure)
export interface IDocumentData {
  // Core fields
  documentNumber?: string;
  title: string;
  date: string;
  type: DocumentType;
  
  // Company info
  company?: ICompanyInfo;
  
  // Client info
  client?: IClientInfo;
  
  // Items (for invoices, expenses, etc.)
  items?: IDocumentItem[];
  
  // Financials
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  currency?: string;
  
  // Salary specific
  employee?: IEmployeeInfo;
  salaryComponents?: ISalaryComponents;
  payPeriod?: { start: string; end: string };
  
  // Document specific
  validFrom?: string;
  validTo?: string;
  notes?: string;
  terms?: string[];
  
  // Custom fields
  customFields?: Record<string, any>;
}

// Generate Request Interface
export interface IGenerateRequest {
  type: DocumentType;
  data: IDocumentData;
  templateId?: string;
  options?: IGenerateOptions;
}

// Generate Options Interface
export interface IGenerateOptions {
  format?: 'pdf' | 'base64';
  quality?: 'low' | 'medium' | 'high';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  watermark?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  filename?: string;
}

// Generate Result Interface
export interface IGenerateResult {
  success: boolean;
  buffer?: ArrayBuffer;
  base64?: string;
  filename?: string;
  error?: string;
}

// Validation Result Interface
export interface IValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Template Schema Interface
export interface ITemplateSchema {
  id: string;
  name: string;
  type: DocumentType;
  category: TemplateCategory;
  fields: ITemplateField[];
  layout?: any;
  styling?: any;
}

// Template Field Interface
export interface ITemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'currency' | 'checkbox';
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
