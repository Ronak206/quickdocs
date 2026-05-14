'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type DocumentCategory, type DocumentType, type Template, type GeneratedDocument } from '@/store/useAppStore';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Icons
import { 
  FileText, Receipt, IndianRupee, Briefcase, Users, Building2,
  Plus, Search, Download, Eye, Edit, Trash2, Copy, MoreHorizontal,
  FileSpreadsheet, CreditCard, FileCheck, Clock, TrendingUp,
  Layout, Globe, Settings, Menu, X, ChevronRight, FolderOpen,
  FilePlus2, Palette, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';

// ============================================
// MOCK DATA FOR DEMO
// ============================================

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tpl_expense_report',
    name: 'Monthly Expense Report',
    description: 'Track and report monthly business expenses with itemized breakdown',
    category: 'EXPENSE',
    type: 'EXPENSE_REPORT',
    isDefault: true,
    isPublic: true,
    tags: 'expense,report,monthly,business',
    version: 1,
    downloads: 1250,
    rating: 4.8,
    createdAt: '2024-01-15',
  },
  {
    id: 'tpl_travel_expense',
    name: 'Travel Expense Claim',
    description: 'Submit travel expenses with detailed trip information',
    category: 'EXPENSE',
    type: 'TRAVEL_EXPENSE',
    isDefault: true,
    isPublic: true,
    tags: 'travel,expense,claim,business trip',
    version: 1,
    downloads: 890,
    rating: 4.6,
    createdAt: '2024-01-20',
  },
  {
    id: 'tpl_tender_document',
    name: 'Official Tender Document',
    description: 'Professional tender document for procurement and bidding',
    category: 'TENDER',
    type: 'TENDER_DOCUMENT',
    isDefault: true,
    isPublic: true,
    isPremium: true,
    tags: 'tender,procurement,bid,government',
    version: 1,
    downloads: 2100,
    rating: 4.9,
    createdAt: '2024-01-10',
  },
  {
    id: 'tpl_business_proposal',
    name: 'Business Proposal',
    description: 'Professional business proposal with executive summary',
    category: 'PROPOSAL',
    type: 'BUSINESS_PROPOSAL',
    isDefault: true,
    isPublic: true,
    tags: 'proposal,business,sales,client',
    version: 1,
    downloads: 3500,
    rating: 4.7,
    createdAt: '2024-01-05',
  },
  {
    id: 'tpl_project_proposal',
    name: 'Project Proposal',
    description: 'Detailed project proposal with timeline and deliverables',
    category: 'PROPOSAL',
    type: 'PROJECT_PROPOSAL',
    isDefault: true,
    isPublic: true,
    tags: 'proposal,project,timeline,deliverables',
    version: 1,
    downloads: 1800,
    rating: 4.5,
    createdAt: '2024-01-12',
  },
  {
    id: 'tpl_salary_slip',
    name: 'Employee Salary Slip',
    description: 'Monthly salary slip with earnings and deductions breakdown',
    category: 'SALARY',
    type: 'SALARY_SLIP',
    isDefault: true,
    isPublic: true,
    tags: 'salary,payslip,payroll,employee',
    version: 1,
    downloads: 5600,
    rating: 4.8,
    createdAt: '2024-01-08',
  },
  {
    id: 'tpl_invoice',
    name: 'Professional Invoice',
    description: 'Clean and professional invoice template with payment terms',
    category: 'INVOICE',
    type: 'INVOICE',
    isDefault: true,
    isPublic: true,
    tags: 'invoice,billing,payment,business',
    version: 1,
    downloads: 8900,
    rating: 4.9,
    createdAt: '2024-01-01',
  },
  {
    id: 'tpl_proforma_invoice',
    name: 'Proforma Invoice',
    description: 'Preliminary invoice for quotations and advance billing',
    category: 'INVOICE',
    type: 'PROFORMA_INVOICE',
    isDefault: true,
    isPublic: true,
    tags: 'invoice,proforma,quotation,advance',
    version: 1,
    downloads: 3200,
    rating: 4.6,
    createdAt: '2024-01-18',
  },
  {
    id: 'tpl_receipt',
    name: 'Payment Receipt',
    description: 'Payment receipt with transaction details',
    category: 'RECEIPT',
    type: 'RECEIPT',
    isDefault: true,
    isPublic: true,
    tags: 'receipt,payment,confirmation,transaction',
    version: 1,
    downloads: 4500,
    rating: 4.7,
    createdAt: '2024-01-07',
  },
  {
    id: 'tpl_contract',
    name: 'Service Contract',
    description: 'Professional service contract agreement template',
    category: 'CONTRACT',
    type: 'CONTRACT',
    isDefault: true,
    isPublic: true,
    isPremium: true,
    tags: 'contract,agreement,service,legal',
    version: 1,
    downloads: 2800,
    rating: 4.8,
    createdAt: '2024-01-14',
  },
];

const MOCK_CATEGORIES = [
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
];

const MOCK_DOCUMENTS: GeneratedDocument[] = [
  {
    id: 'doc_001',
    title: 'Invoice #INV-2024-001',
    type: 'INVOICE',
    data: {
      title: 'Invoice #INV-2024-001',
      documentNumber: 'INV-2024-001',
      date: '2024-03-15',
      type: 'INVOICE',
      client: { name: 'Acme Corporation', email: 'billing@acme.com', address: '123 Business St, New York, NY 10001' },
      items: [
        { name: 'Web Development Services', description: 'Frontend development', quantity: 40, unitPrice: 150, total: 6000 },
        { name: 'UI/UX Design', description: 'Mobile app design', quantity: 20, unitPrice: 200, total: 4000 },
        { name: 'API Integration', description: 'Payment gateway', quantity: 10, unitPrice: 175, total: 1750 },
      ],
      subtotal: 11750,
      taxAmount: 2115,
      total: 13865,
      currency: 'USD',
      notes: 'Payment due within 30 days. Thank you for your business!',
    },
    status: 'approved',
    createdAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'doc_002',
    title: 'Salary Slip - March 2024',
    type: 'SALARY_SLIP',
    data: {
      title: 'Salary Slip - March 2024',
      date: '2024-03-31',
      type: 'SALARY_SLIP',
      employee: { name: 'John Smith', employeeId: 'EMP001', department: 'Engineering', designation: 'Senior Developer' },
      payPeriod: { start: '2024-03-01', end: '2024-03-31' },
      salaryComponents: {
        basic: 5000,
        hra: 1500,
        conveyance: 300,
        medical: 500,
        specialAllowance: 700,
        pf: 600,
        professionalTax: 200,
      },
    },
    status: 'approved',
    createdAt: '2024-03-31T18:00:00Z',
  },
  {
    id: 'doc_003',
    title: 'Business Proposal - Tech Solutions',
    type: 'BUSINESS_PROPOSAL',
    data: {
      title: 'Business Proposal - Tech Solutions',
      documentNumber: 'PROP-2024-015',
      date: '2024-03-20',
      type: 'BUSINESS_PROPOSAL',
      client: { name: 'Tech Solutions Inc.', company: 'Tech Solutions Inc.' },
      items: [
        { name: 'Software Development', quantity: 1, unitPrice: 25000, total: 25000 },
        { name: 'Training & Support', quantity: 1, unitPrice: 5000, total: 5000 },
      ],
      total: 30000,
      currency: 'USD',
      notes: 'Comprehensive software development proposal for enterprise solution.',
    },
    status: 'pending',
    createdAt: '2024-03-20T14:15:00Z',
  },
  {
    id: 'doc_004',
    title: 'Expense Report - Q1 2024',
    type: 'EXPENSE_REPORT',
    data: {
      title: 'Expense Report - Q1 2024',
      documentNumber: 'EXP-Q1-2024',
      date: '2024-03-31',
      type: 'EXPENSE_REPORT',
      items: [
        { name: 'Office Supplies', quantity: 1, unitPrice: 450, total: 450 },
        { name: 'Travel Expenses', quantity: 1, unitPrice: 1200, total: 1200 },
        { name: 'Software Licenses', quantity: 1, unitPrice: 890, total: 890 },
        { name: 'Team Lunch', quantity: 1, unitPrice: 275, total: 275 },
      ],
      total: 2815,
      currency: 'USD',
      notes: 'Quarterly expense summary for Q1 2024.',
    },
    status: 'draft',
    createdAt: '2024-03-31T09:00:00Z',
  },
];

// Document type icons mapping
const categoryIcons: Record<string, any> = {
  EXPENSE: IndianRupee,
  TENDER: Briefcase,
  PROPOSAL: FileText,
  SALARY: Users,
  INVOICE: Receipt,
  RECEIPT: CreditCard,
  CONTRACT: FileCheck,
  REPORT: FileSpreadsheet,
  LETTER: FileText,
  CERTIFICATE: FileCheck,
  AGREEMENT: FileCheck,
  QUOTE: FileText,
  MEMO: FileText,
  CUSTOM: Layout,
};

const categoryColors: Record<string, string> = {
  EXPENSE: 'bg-orange-500',
  TENDER: 'bg-blue-500',
  PROPOSAL: 'bg-purple-500',
  SALARY: 'bg-green-500',
  INVOICE: 'bg-cyan-500',
  RECEIPT: 'bg-teal-500',
  CONTRACT: 'bg-red-500',
  REPORT: 'bg-yellow-500',
  LETTER: 'bg-pink-500',
  CERTIFICATE: 'bg-amber-500',
  AGREEMENT: 'bg-rose-500',
  QUOTE: 'bg-indigo-500',
  MEMO: 'bg-gray-500',
  CUSTOM: 'bg-slate-500',
};

export default function Dashboard() {
  const {
    currentView, setCurrentView,
    templates, setTemplates,
    selectedTemplate, setSelectedTemplate,
    currentDocument, setCurrentDocument,
    documents, addDocument,
    companyInfo, setCompanyInfo,
    isLoading, setIsLoading,
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery
  } = useAppStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [servicesHealthy, setServicesHealthy] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    setTemplates(MOCK_TEMPLATES);
    // Add mock documents to history
    MOCK_DOCUMENTS.forEach(doc => {
      if (!documents.find(d => d.id === doc.id)) {
        addDocument(doc);
      }
    });
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = () => {
    const saved = localStorage.getItem('companyInfo');
    if (saved) {
      setCompanyInfo(JSON.parse(saved));
    } else {
      // Set default company info for demo
      const defaultCompany = {
        name: 'Your Company Name',
        email: 'contact@yourcompany.com',
        phone: '+1 (555) 123-4567',
        address: '456 Business Ave, Suite 100',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        website: 'www.yourcompany.com',
      };
      localStorage.setItem('companyInfo', JSON.stringify(defaultCompany));
      setCompanyInfo(defaultCompany);
    }
  };

  const saveCompanyInfo = (info: any) => {
    localStorage.setItem('companyInfo', JSON.stringify(info));
    setCompanyInfo(info);
  };

  // Filter templates
  const filteredTemplates = templates.filter(t => {
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate document (simulated)
  const generateDocument = async () => {
    if (!currentDocument) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Add to history
      addDocument({
        id: `doc_${Date.now()}`,
        title: currentDocument.title,
        type: currentDocument.type,
        data: {
          ...currentDocument,
          company: companyInfo,
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
      });

      toast.success('Document generated successfully!', {
        description: `${currentDocument.title} has been created.`
      });
      
      setCurrentView('history');
    } catch (error) {
      toast.error('Failed to generate document');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new document from template
  const createFromTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentDocument({
      title: `New ${template.name}`,
      type: template.type,
      date: new Date().toISOString().split('T')[0],
      items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
      currency: 'USD',
    });
    setCurrentView('create');
    toast.success(`Creating document from "${template.name}"`);
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className={`bg-background border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col h-screen sticky top-0`}>
      <div className="p-4 border-b flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">DocuForge</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          <Button
            variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('dashboard')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Dashboard'}
          </Button>
          <Button
            variant={currentView === 'create' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setCurrentDocument({
                title: '',
                type: 'INVOICE',
                date: new Date().toISOString().split('T')[0],
                items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
                currency: 'USD',
              });
              setCurrentView('create');
            }}
          >
            <FilePlus2 className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Create Document'}
          </Button>
          <Button
            variant={currentView === 'templates' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('templates')}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Templates'}
          </Button>
          <Button
            variant={currentView === 'builder' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('builder')}
          >
            <Palette className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Template Builder'}
          </Button>
          <Button
            variant={currentView === 'history' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView('history')}
          >
            <Clock className="h-4 w-4 mr-2" />
            {sidebarOpen && 'History'}
          </Button>
        </nav>

        {sidebarOpen && (
          <>
            <Separator className="my-2" />
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <div className="space-y-1">
                {categories.slice(0, 7).map((cat) => {
                  const Icon = categoryIcons[cat.id] || FileText;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id as DocumentCategory)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {cat.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Generate professional documents in minutes</p>
        </div>
        <Button onClick={() => {
          setCurrentDocument({
            title: '',
            type: 'INVOICE',
            date: new Date().toISOString().split('T')[0],
            items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
            currency: 'USD',
          });
          setCurrentView('create');
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Available</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">10 default templates</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Document categories</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36.5K</div>
            <p className="text-xs text-muted-foreground">Template downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Create */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Create</CardTitle>
          <CardDescription>Choose a document type to get started instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {['EXPENSE', 'TENDER', 'PROPOSAL', 'SALARY', 'INVOICE', 'RECEIPT', 'CONTRACT'].map((cat) => {
              const Icon = categoryIcons[cat] || FileText;
              return (
                <Button
                  key={cat}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 hover:shadow-md transition-all"
                  onClick={() => {
                    setSelectedCategory(cat as DocumentCategory);
                    setCurrentView('templates');
                  }}
                >
                  <div className={`p-2 rounded-lg ${categoryColors[cat]} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('history')}>
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents created yet</p>
              <Button variant="link" onClick={() => setCurrentView('create')}>
                Create your first document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.slice(0, 5).map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setCurrentDocument(doc.data);
                    setCurrentView('create');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[doc.type.split('_')[0]] || 'bg-gray-500'} text-white`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'pending' ? 'secondary' : 'outline'}>
                      {doc.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render create document form
  const renderCreateDocument = () => {
    const items = currentDocument?.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxRate = 0.18; // 18% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Document</h1>
            <p className="text-muted-foreground">Fill in the details to generate your document</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select 
                      value={currentDocument?.type || ''} 
                      onValueChange={(val) => setCurrentDocument({ ...currentDocument, type: val as DocumentType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INVOICE">Invoice</SelectItem>
                        <SelectItem value="PROFORMA_INVOICE">Proforma Invoice</SelectItem>
                        <SelectItem value="RECEIPT">Receipt</SelectItem>
                        <SelectItem value="EXPENSE_REPORT">Expense Report</SelectItem>
                        <SelectItem value="TRAVEL_EXPENSE">Travel Expense</SelectItem>
                        <SelectItem value="SALARY_SLIP">Salary Slip</SelectItem>
                        <SelectItem value="BUSINESS_PROPOSAL">Business Proposal</SelectItem>
                        <SelectItem value="PROJECT_PROPOSAL">Project Proposal</SelectItem>
                        <SelectItem value="TENDER_DOCUMENT">Tender Document</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="LETTER">Letter</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Document Number</Label>
                    <Input 
                      placeholder="INV-001"
                      value={currentDocument?.documentNumber || ''}
                      onChange={(e) => setCurrentDocument({ ...currentDocument, documentNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input 
                    placeholder="Document title"
                    value={currentDocument?.title || ''}
                    onChange={(e) => setCurrentDocument({ ...currentDocument, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input 
                      type="date"
                      value={currentDocument?.date || ''}
                      onChange={(e) => setCurrentDocument({ ...currentDocument, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={currentDocument?.currency || 'USD'} 
                      onValueChange={(val) => setCurrentDocument({ ...currentDocument, currency: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client / Recipient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      placeholder="Client name"
                      value={currentDocument?.client?.name || ''}
                      onChange={(e) => setCurrentDocument({ 
                        ...currentDocument, 
                        client: { ...currentDocument?.client, name: e.target.value } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="client@email.com"
                      value={currentDocument?.client?.email || ''}
                      onChange={(e) => setCurrentDocument({ 
                        ...currentDocument, 
                        client: { ...currentDocument?.client, email: e.target.value } 
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea 
                    placeholder="Client address"
                    value={currentDocument?.client?.address || ''}
                    onChange={(e) => setCurrentDocument({ 
                      ...currentDocument, 
                      client: { ...currentDocument?.client, address: e.target.value } 
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setCurrentDocument({
                      ...currentDocument,
                      items: [...items, { name: '', quantity: 1, unitPrice: 0, total: 0 }]
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label className="text-xs">Name</Label>
                          <Input 
                            value={item.name}
                            placeholder="Item name"
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index] = { ...newItems[index], name: e.target.value };
                              setCurrentDocument({ ...currentDocument, items: newItems });
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Qty</Label>
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              const qty = parseFloat(e.target.value) || 0;
                              newItems[index] = { 
                                ...newItems[index], 
                                quantity: qty,
                                total: qty * newItems[index].unitPrice
                              };
                              setCurrentDocument({ ...currentDocument, items: newItems });
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Price</Label>
                          <Input 
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...items];
                              const price = parseFloat(e.target.value) || 0;
                              newItems[index] = { 
                                ...newItems[index], 
                                unitPrice: price,
                                total: newItems[index].quantity * price
                              };
                              setCurrentDocument({ ...currentDocument, items: newItems });
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Total</Label>
                          <Input 
                            disabled
                            value={item.total.toFixed(2)}
                            className="bg-muted"
                          />
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              const newItems = items.filter((_, i) => i !== index);
                              setCurrentDocument({ ...currentDocument, items: newItems });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No items added. Click "Add Item" to start.</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    placeholder="Additional notes..."
                    value={currentDocument?.notes || ''}
                    onChange={(e) => setCurrentDocument({ ...currentDocument, notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{currentDocument?.currency || 'USD'} {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span>{currentDocument?.currency || 'USD'} {taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{currentDocument?.currency || 'USD'} {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={generateDocument}
                  disabled={isLoading || !currentDocument?.title}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </CardContent>
            </Card>

            {/* Company Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Your Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input 
                  placeholder="Company name"
                  value={companyInfo?.name || ''}
                  onChange={(e) => saveCompanyInfo({ ...companyInfo, name: e.target.value })}
                />
                <Input 
                  placeholder="Email"
                  value={companyInfo?.email || ''}
                  onChange={(e) => saveCompanyInfo({ ...companyInfo, email: e.target.value })}
                />
                <Input 
                  placeholder="Phone"
                  value={companyInfo?.phone || ''}
                  onChange={(e) => saveCompanyInfo({ ...companyInfo, phone: e.target.value })}
                />
                <Input 
                  placeholder="Address"
                  value={companyInfo?.address || ''}
                  onChange={(e) => saveCompanyInfo({ ...companyInfo, address: e.target.value })}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render templates
  const renderTemplates = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Choose from professional templates or create your own</p>
        </div>
        <Button onClick={() => setCurrentView('builder')}>
          <Palette className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory || ''} onValueChange={(val) => setSelectedCategory((val || null) as DocumentCategory | null)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = categoryIcons[template.category] || FileText;
          return (
            <Card 
              key={template.id} 
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => createFromTemplate(template)}
            >
              <div className={`h-32 ${categoryColors[template.category]} flex items-center justify-center relative`}>
                <Icon className="h-12 w-12 text-white/80" />
                {template.isPremium && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    Premium
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <Sparkles className="h-3 w-3 fill-current" />
                    {template.rating}
                  </div>
                </div>
                <CardDescription className="text-sm line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <span className="text-xs text-muted-foreground">{template.downloads?.toLocaleString()} downloads</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No templates found</p>
          <Button variant="link" onClick={() => setSearchQuery('')}>Clear search</Button>
        </div>
      )}
    </div>
  );

  // Render template builder
  const renderBuilder = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Builder</h1>
          <p className="text-muted-foreground">Create custom templates from scratch</p>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('templates')}>
          Back to Templates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>Build your own document template with custom fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input placeholder="My Custom Template" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe your template..." />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Template Fields</h4>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <Layout className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">No fields added yet</p>
              <p className="text-sm">Click "Add Field" to start building your template</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCurrentView('templates')}>Cancel</Button>
            <Button>
              <Sparkles className="h-4 w-4 mr-1" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render history
  const renderHistory = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document History</h1>
          <p className="text-muted-foreground">View and manage your generated documents</p>
        </div>
        <Button onClick={() => {
          setCurrentDocument({
            title: '',
            type: 'INVOICE',
            date: new Date().toISOString().split('T')[0],
            items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
            currency: 'USD',
          });
          setCurrentView('create');
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents generated yet</p>
              <Button variant="link" onClick={() => setCurrentView('create')}>
                Create your first document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setCurrentDocument(doc.data);
                    setCurrentView('create');
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${categoryColors[doc.type.split('_')[0]] || 'bg-gray-500'} text-white`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'pending' ? 'secondary' : 'outline'}>
                      {doc.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'create':
        return renderCreateDocument();
      case 'templates':
        return renderTemplates();
      case 'builder':
        return renderBuilder();
      case 'history':
        return renderHistory();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {renderSidebar()}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
