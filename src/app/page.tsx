'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TemplateService, PDFService } from '@/lib/services/api';

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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Icons
import { 
  FileText, Receipt, IndianRupee, Briefcase, Users, Building2,
  Plus, Search, Download, Eye, Edit, Trash2, Copy, MoreHorizontal,
  FileSpreadsheet, CreditCard, FileCheck, Clock, TrendingUp,
  Layout, Globe, Settings, Menu, X, ChevronRight, FolderOpen,
  FilePlus2, Palette, Sparkles
} from 'lucide-react';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [newDocDialogOpen, setNewDocDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [documentFormData, setDocumentFormData] = useState<any>({});

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    loadCompanyInfo();
  }, []);

  const fetchTemplates = async () => {
    try {
      const result = await TemplateService.getTemplates();
      if (result.templates) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await TemplateService.getCategories();
      if (result.categories) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const loadCompanyInfo = () => {
    const saved = localStorage.getItem('companyInfo');
    if (saved) {
      setCompanyInfo(JSON.parse(saved));
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

  // Generate document
  const generateDocument = async () => {
    if (!currentDocument) return;

    setIsLoading(true);
    try {
      const result = await PDFService.generatePDF({
        type: currentDocument.type,
        data: {
          ...currentDocument,
          company: companyInfo,
        },
        options: {
          format: 'pdf',
          filename: `${currentDocument.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        }
      });

      if (result.success && result.buffer) {
        // Download the PDF
        const blob = new Blob([result.buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentDocument.title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Add to history
        addDocument({
          id: `doc_${Date.now()}`,
          title: currentDocument.title,
          type: currentDocument.type,
          data: currentDocument,
          status: 'draft',
          createdAt: new Date().toISOString(),
        });

        toast.success('Document generated successfully!');
        setCurrentView('history');
      } else {
        toast.error(result.error || 'Failed to generate document');
      }
    } catch (error) {
      toast.error('Failed to generate document');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new document from template
  const createFromTemplate = (template: any) => {
    setSelectedTemplate(template);
    setCurrentDocument({
      title: `New ${template.name}`,
      type: template.type,
      date: new Date().toISOString().split('T')[0],
      items: [],
      currency: 'USD',
    });
    setCurrentView('create');
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className={`bg-background border-r transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
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
              setCurrentDocument(null);
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
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.id] || FileText;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id as any)}
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
        <Button onClick={() => setCurrentView('create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Available</CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5+</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Create */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Create</CardTitle>
          <CardDescription>Choose a document type to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {['EXPENSE', 'TENDER', 'PROPOSAL', 'SALARY', 'INVOICE', 'RECEIPT', 'CONTRACT'].map((cat) => {
              const Icon = categoryIcons[cat] || FileText;
              return (
                <Button
                  key={cat}
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => {
                    setSelectedCategory(cat as any);
                    setCurrentView('templates');
                  }}
                >
                  <div className={`p-2 rounded-lg ${categoryColors[cat]} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs">{cat}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
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
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[doc.type.split('_')[0]] || 'bg-gray-500'} text-white`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.status}</Badge>
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
  const renderCreateDocument = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Document</h1>
          <p className="text-muted-foreground">Fill in the details to generate your document</p>
        </div>
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
                    onValueChange={(val) => setCurrentDocument({ ...currentDocument, type: val as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="RECEIPT">Receipt</SelectItem>
                      <SelectItem value="EXPENSE_REPORT">Expense Report</SelectItem>
                      <SelectItem value="SALARY_SLIP">Salary Slip</SelectItem>
                      <SelectItem value="BUSINESS_PROPOSAL">Business Proposal</SelectItem>
                      <SelectItem value="TENDER_DOCUMENT">Tender Document</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="LETTER">Letter</SelectItem>
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
                <Label>Title</Label>
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
                    items: [...(currentDocument?.items || []), { name: '', quantity: 1, unitPrice: 0, total: 0 }]
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {currentDocument?.items && currentDocument.items.length > 0 ? (
                <div className="space-y-3">
                  {currentDocument.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label className="text-xs">Name</Label>
                        <Input 
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...currentDocument.items];
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
                            const newItems = [...currentDocument.items];
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
                            const newItems = [...currentDocument.items];
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
                        />
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const newItems = currentDocument.items.filter((_, i) => i !== index);
                            setCurrentDocument({ ...currentDocument, items: newItems });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
                <span>{currentDocument?.items?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {(currentDocument?.items || []).reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>
                  {currentDocument?.currency || 'USD'} {(currentDocument?.items || []).reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
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
              <Button variant="outline" className="w-full" onClick={() => setCurrentDocument(null)}>
                Clear Form
              </Button>
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Company</CardTitle>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

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
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory || ''} onValueChange={(val) => setSelectedCategory(val as any || null)}>
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
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className={`h-32 ${categoryColors[template.category]} flex items-center justify-center`}>
                <Icon className="h-12 w-12 text-white/80" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  {template.isPremium && (
                    <Badge variant="secondary" className="text-xs">Premium</Badge>
                  )}
                </div>
                <CardDescription className="text-sm line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => createFromTemplate(template)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>Build your own document template with custom fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input placeholder="My Custom Template" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
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
            
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              <Layout className="h-8 w-8 mx-auto mb-2" />
              <p>No fields added yet</p>
              <p className="text-sm">Click "Add Field" to start building your template</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
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
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
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
                    <Badge variant="outline">{doc.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
