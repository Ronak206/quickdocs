'use client';

import { useState, useEffect } from 'react';
import TemplateBuilder from '@/components/builder/TemplateBuilder';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Icons
import { 
  FileText, Receipt, IndianRupee, Briefcase, Users, Building2,
  Plus, Search, Download, Eye, Edit, Trash2, Copy, MoreHorizontal,
  FileSpreadsheet, CreditCard, FileCheck, Clock, TrendingUp,
  Layout, Globe, Menu, X, ChevronRight, FolderOpen,
  FilePlus2, Palette, Sparkles, Printer
} from 'lucide-react';

// Types
type DocumentCategory = 'EXPENSE' | 'TENDER' | 'PROPOSAL' | 'SALARY' | 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'CUSTOM';
type DocumentType = 'INVOICE' | 'RECEIPT' | 'EXPENSE_REPORT' | 'SALARY_SLIP' | 'BUSINESS_PROPOSAL' | 'CONTRACT';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: DocumentCategory;
  type: DocumentType;
  downloads?: number;
  rating?: number;
  isPremium?: boolean;
}

interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: 'draft' | 'pending' | 'approved';
  createdAt: string;
  data: any;
}

// Mock Data
const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Professional Invoice', description: 'Clean invoice template with payment terms', category: 'INVOICE', type: 'INVOICE', downloads: 8900, rating: 4.9 },
  { id: '2', name: 'Expense Report', description: 'Monthly expense tracking template', category: 'EXPENSE', type: 'EXPENSE_REPORT', downloads: 1250, rating: 4.8 },
  { id: '3', name: 'Salary Slip', description: 'Employee payroll document', category: 'SALARY', type: 'SALARY_SLIP', downloads: 5600, rating: 4.8 },
  { id: '4', name: 'Business Proposal', description: 'Professional business proposal', category: 'PROPOSAL', type: 'BUSINESS_PROPOSAL', downloads: 3500, rating: 4.7, isPremium: true },
  { id: '5', name: 'Payment Receipt', description: 'Payment confirmation document', category: 'RECEIPT', type: 'RECEIPT', downloads: 4500, rating: 4.7 },
  { id: '6', name: 'Service Contract', description: 'Professional service agreement', category: 'CONTRACT', type: 'CONTRACT', downloads: 2800, rating: 4.8, isPremium: true },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', title: 'Invoice #INV-2024-001', type: 'INVOICE', status: 'approved', createdAt: '2024-03-15', data: {} },
  { id: 'd2', title: 'Salary Slip - March 2024', type: 'SALARY_SLIP', status: 'approved', createdAt: '2024-03-31', data: {} },
  { id: 'd3', title: 'Expense Report Q1', type: 'EXPENSE_REPORT', status: 'draft', createdAt: '2024-03-31', data: {} },
];

const CATEGORIES = [
  { id: 'INVOICE', name: 'Invoice', icon: Receipt, color: 'bg-cyan-500' },
  { id: 'EXPENSE', name: 'Expense', icon: IndianRupee, color: 'bg-orange-500' },
  { id: 'SALARY', name: 'Salary', icon: Users, color: 'bg-green-500' },
  { id: 'PROPOSAL', name: 'Proposal', icon: FileText, color: 'bg-purple-500' },
  { id: 'RECEIPT', name: 'Receipt', icon: CreditCard, color: 'bg-teal-500' },
  { id: 'CONTRACT', name: 'Contract', icon: FileCheck, color: 'bg-red-500' },
];

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'templates' | 'builder' | 'history'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [templates] = useState<Template[]>(MOCK_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  // Current document being created
  const [currentDoc, setCurrentDoc] = useState<any>({
    title: '',
    type: 'INVOICE',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    client: { name: '', email: '', address: '' },
    items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    currency: 'USD',
  });

  // Load company info from localStorage (initial state)
  const [companyInfo, setCompanyInfoState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('companyInfo');
      if (saved) return JSON.parse(saved);
    }
    return { name: 'Your Company', email: 'contact@company.com', phone: '+1 555-123-4567' };
  });
  
  const setCompanyInfo = (info: any) => {
    localStorage.setItem('companyInfo', JSON.stringify(info));
    setCompanyInfoState(info);
  };

  // Calculate totals
  const subtotal = currentDoc.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;

  // Generate document
  const generateDocument = () => {
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: currentDoc.title || `New ${currentDoc.type}`,
      type: currentDoc.type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      data: currentDoc,
    };
    setDocuments([newDoc, ...documents]);
    toast.success('Document created successfully!');
    setCurrentView('history');
  };

  // Add item
  const addItem = () => {
    setCurrentDoc({
      ...currentDoc,
      items: [...currentDoc.items, { name: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  // Update item
  const updateItem = (index: number, field: string, value: any) => {
    const items = [...currentDoc.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].total = (items[index].quantity || 0) * (items[index].unitPrice || 0);
    }
    setCurrentDoc({ ...currentDoc, items });
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className={`bg-background border-r transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-14'} flex flex-col h-screen sticky top-0`}>
      <div className="p-3 border-b flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-bold">QuickDocs</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="p-2 space-y-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'create', label: 'Create Document', icon: FilePlus2 },
          { id: 'templates', label: 'Templates', icon: FolderOpen },
          { id: 'builder', label: 'Template Builder', icon: Palette },
          { id: 'history', label: 'History', icon: Clock },
        ].map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentView(item.id as any)}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {sidebarOpen && item.label}
          </Button>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="p-3 border-t mt-auto">
          <p className="text-xs text-muted-foreground mb-2">Categories</p>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start mb-1"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <cat.icon className="h-3 w-3 mr-2" />
              {cat.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Generate professional PDF documents</p>
        </div>
        <Button onClick={() => setCurrentView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Documents', value: documents.length, icon: FileText },
          { label: 'Templates', value: templates.length, icon: Layout },
          { label: 'Categories', value: CATEGORIES.length, icon: FolderOpen },
          { label: 'Downloads', value: '36.5K', icon: Download },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground absolute right-4 top-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Create */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Create</CardTitle>
          <CardDescription>Choose a document type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentView('templates');
                }}
              >
                <div className={`p-2 rounded-lg ${cat.color} text-white`}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-xs">{cat.name}</span>
              </Button>
            ))}
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
          <div className="space-y-2">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => setCurrentView('history')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <Badge variant="outline">{doc.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render create form
  const renderCreateForm = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Document</h1>
          <p className="text-muted-foreground">Fill in the details</p>
        </div>
        <Button variant="outline" onClick={() => setCurrentView('dashboard')}>Back</Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Document Info */}
          <Card>
            <CardHeader><CardTitle>Document Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Type</Label>
                  <Select value={currentDoc.type} onValueChange={(val) => setCurrentDoc({ ...currentDoc, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="RECEIPT">Receipt</SelectItem>
                      <SelectItem value="EXPENSE_REPORT">Expense Report</SelectItem>
                      <SelectItem value="SALARY_SLIP">Salary Slip</SelectItem>
                      <SelectItem value="BUSINESS_PROPOSAL">Proposal</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Document Number</Label>
                  <Input placeholder="INV-001" value={currentDoc.documentNumber} onChange={(e) => setCurrentDoc({ ...currentDoc, documentNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input placeholder="Document title" value={currentDoc.title} onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={currentDoc.date} onChange={(e) => setCurrentDoc({ ...currentDoc, date: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input placeholder="Client name" value={currentDoc.client.name} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, name: e.target.value } })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="client@email.com" value={currentDoc.client.email} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, email: e.target.value } })} />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea placeholder="Address" value={currentDoc.client.address} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, address: e.target.value } })} />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentDoc.items.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label className="text-xs">Name</Label>
                      <Input value={item.name} placeholder="Item name" onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Price</Label>
                      <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input disabled value={item.total.toFixed(2)} className="bg-muted" />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setCurrentDoc({ ...currentDoc, items: currentDoc.items.filter((_: any, idx: number) => idx !== i) })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{currentDoc.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <Button className="w-full" size="lg" onClick={generateDocument} disabled={!currentDoc.title}>
                <Printer className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Your Company</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Company" value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} />
              <Input placeholder="Email" value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Render templates
  const renderTemplates = () => {
    const filtered = templates.filter(t => !selectedCategory || t.category === selectedCategory);
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Choose a template or create your own</p>
          </div>
          <Button onClick={() => setCurrentView('builder')}>
            <Palette className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedCategory || 'all'} onValueChange={(val) => setSelectedCategory(val === 'all' ? null : val)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => {
              setCurrentDoc({ ...currentDoc, type: t.type, title: `New ${t.name}` });
              setCurrentView('create');
            }}>
              <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                <FileText className="h-10 w-10 text-primary/40" />
                {t.isPremium && <Badge className="absolute top-2 right-2" variant="secondary">Premium</Badge>}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.name}</CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline">{t.category}</Badge>
                  <span className="text-muted-foreground">{t.downloads?.toLocaleString()} downloads</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render history
  const renderHistory = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document History</h1>
          <p className="text-muted-foreground">View your generated documents</p>
        </div>
        <Button onClick={() => setCurrentView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted-foreground">{doc.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status === 'approved' ? 'default' : 'outline'}>{doc.status}</Badge>
                  <span className="text-sm text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Template builder uses its own layout
  if (currentView === 'builder') {
    return <TemplateBuilder onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {renderSidebar()}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'create' && renderCreateForm()}
        {currentView === 'templates' && renderTemplates()}
        {currentView === 'history' && renderHistory()}
      </main>
    </div>
  );
}
