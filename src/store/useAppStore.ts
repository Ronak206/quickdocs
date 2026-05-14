/**
 * Global State Management using Zustand
 */

import { create } from 'zustand';

// Document types
export type DocumentCategory = 
  | 'EXPENSE' | 'TENDER' | 'PROPOSAL' | 'SALARY' 
  | 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'REPORT' 
  | 'LETTER' | 'CERTIFICATE' | 'AGREEMENT' | 'QUOTE' | 'MEMO' | 'CUSTOM';

export type DocumentType =
  | 'EXPENSE_REPORT' | 'EXPENSE_CLAIM' | 'TRAVEL_EXPENSE' | 'MONTHLY_EXPENSE'
  | 'TENDER_DOCUMENT' | 'TENDER_PROPOSAL' | 'BID_DOCUMENT' | 'TENDER_EVALUATION' | 'RFP_DOCUMENT'
  | 'BUSINESS_PROPOSAL' | 'PROJECT_PROPOSAL' | 'SALES_PROPOSAL' | 'PARTNERSHIP_PROPOSAL' | 'GRANT_PROPOSAL'
  | 'SALARY_SLIP' | 'SALARY_CERTIFICATE' | 'PAYROLL_REPORT' | 'SALARY_INCREMENT' | 'OFFER_LETTER'
  | 'INVOICE' | 'PROFORMA_INVOICE' | 'RECEIPT' | 'CREDIT_NOTE' | 'DEBIT_NOTE'
  | 'CONTRACT' | 'AGREEMENT' | 'NDA' | 'SERVICE_AGREEMENT'
  | 'REPORT' | 'LETTER' | 'CERTIFICATE' | 'QUOTE' | 'MEMO' | 'CUSTOM';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  type: DocumentType;
  schema?: string;
  layout?: string;
  styling?: string;
  preview?: string;
  thumbnail?: string;
  isPublic?: boolean;
  isPremium?: boolean;
  isDefault?: boolean;
  source?: string;
  sourceName?: string;
  tags?: string;
  version?: number;
  downloads?: number;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface CompanyInfo {
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

export interface ClientInfo {
  name: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
}

export interface EmployeeInfo {
  name: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
}

export interface SalaryComponents {
  basic: number;
  hra?: number;
  conveyance?: number;
  medical?: number;
  specialAllowance?: number;
  lta?: number;
  bonus?: number;
  pf?: number;
  professionalTax?: number;
  incomeTax?: number;
  otherAllowances?: { name: string; amount: number }[];
  otherDeductions?: { name: string; amount: number }[];
}

export interface DocumentData {
  title: string;
  documentNumber?: string;
  date: string;
  type: DocumentType;
  company?: CompanyInfo;
  client?: ClientInfo;
  employee?: EmployeeInfo;
  items?: DocumentItem[];
  salaryComponents?: SalaryComponents;
  payPeriod?: { start: string; end: string };
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  notes?: string;
  terms?: string[];
  customFields?: Record<string, any>;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: DocumentType;
  data: DocumentData;
  templateId?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  pdfUrl?: string;
  createdAt: string;
}

// App state interface
interface AppState {
  // Current view
  currentView: 'dashboard' | 'create' | 'templates' | 'builder' | 'history';
  setCurrentView: (view: AppState['currentView']) => void;
  
  // Templates
  templates: Template[];
  selectedTemplate: Template | null;
  setTemplates: (templates: Template[]) => void;
  setSelectedTemplate: (template: Template | null) => void;
  
  // Document being created
  currentDocument: DocumentData | null;
  setCurrentDocument: (doc: DocumentData | null) => void;
  
  // Generated documents history
  documents: GeneratedDocument[];
  addDocument: (doc: GeneratedDocument) => void;
  
  // Company info (saved in local storage)
  companyInfo: CompanyInfo | null;
  setCompanyInfo: (info: CompanyInfo | null) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Category filter
  selectedCategory: DocumentCategory | null;
  setSelectedCategory: (category: DocumentCategory | null) => void;
  
  // Search query
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Current view
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Templates
  templates: [],
  selectedTemplate: null,
  setTemplates: (templates) => set({ templates }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  // Document being created
  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  
  // Generated documents history
  documents: [],
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  
  // Company info
  companyInfo: null,
  setCompanyInfo: (info) => set({ companyInfo: info }),
  
  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  // Category filter
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  // Search query
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
