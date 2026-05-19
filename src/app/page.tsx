'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import TemplateBuilder from '@/components/builder/TemplateBuilder';
import DownloadHistory from '@/components/DownloadHistory';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Icons
import { 
  FileText, Receipt, IndianRupee, Users, Building2,
  Plus, Search, Download, Eye, Edit, Trash2, Copy, MoreHorizontal,
  FileSpreadsheet, CreditCard, FileCheck, Clock, TrendingUp,
  Layout, Globe, Menu, X, ChevronRight, FolderOpen,
  FilePlus2, Palette, Printer, LogOut, Loader2, Settings,
  ZoomIn, ZoomOut, Save, RotateCcw, Zap, RefreshCw, Check, ExternalLink, Wallet
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
  isPublic?: boolean;
  isSystem?: boolean;
  creatorId?: string;
}

interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  status: string;
  createdAt: string;
  totalAmount?: number;
  currency?: string;
}

interface DashboardStats {
  documents: number;
  templates: number;
  categories: number;
  downloads: number;
}

interface UsageInfo {
  pdfsUsed: number;
  pdfLimit: number;
  pdfsRemaining: number;
  storageUsed: number;
}

interface PlanInfo {
  name: string;
  displayName: string;
  price: number;
  currency: string;
}

const CATEGORIES = [
  { id: 'INVOICE', name: 'Invoice', icon: Receipt, color: 'bg-cyan-500' },
  { id: 'EXPENSE', name: 'Expense', icon: IndianRupee, color: 'bg-orange-500' },
  { id: 'SALARY', name: 'Salary', icon: Users, color: 'bg-green-500' },
  { id: 'PROPOSAL', name: 'Proposal', icon: FileText, color: 'bg-purple-500' },
  { id: 'RECEIPT', name: 'Receipt', icon: CreditCard, color: 'bg-teal-500' },
  { id: 'CONTRACT', name: 'Contract', icon: FileCheck, color: 'bg-red-500' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // All state at the top level
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'templates' | 'builder' | 'history' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Preview state
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showPreview, setShowPreview] = useState(true);
  
  // Selected template for builder
  const [selectedTemplateForBuilder, setSelectedTemplateForBuilder] = useState<Template | null>(null);
  
  // API data state
  const [stats, setStats] = useState<DashboardStats>({ documents: 0, templates: 0, categories: 0, downloads: 0 });
  const [usage, setUsage] = useState<UsageInfo>({ pdfsUsed: 0, pdfLimit: 10, pdfsRemaining: 10, storageUsed: 0 });
  const [plan, setPlan] = useState<PlanInfo>({ name: 'FREE', displayName: 'Free', price: 0, currency: 'USD' });
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  // Downloads history state
  const [downloadHistory, setDownloadHistory] = useState<{ id: string; title: string; fileSize: number; createdAt: string }[]>([]);
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null);
  
  // Payment state
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);

  // Current document being created
  const [currentDoc, setCurrentDoc] = useState<any>({
    title: '',
    type: 'INVOICE',
    documentNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    client: { name: '', email: '', address: '', phone: '' },
    items: [{ name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    terms: 'Payment is due within 30 days',
    currency: 'USD',
    taxRate: 18,
  });

  // Company info from localStorage
  const [companyInfo, setCompanyInfoState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('companyInfo');
      if (saved) return JSON.parse(saved);
    }
    return { name: 'Your Company', email: 'contact@company.com', phone: '+1 555-123-4567', address: '', taxId: '' };
  });
  
  const setCompanyInfo = (info: any) => {
    localStorage.setItem('companyInfo', JSON.stringify(info));
    setCompanyInfoState(info);
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, docsRes, templatesRes, downloadsRes, paymentRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/documents?limit=10'),
        fetch('/api/templates'),
        fetch('/api/downloads'),
        fetch('/api/payments'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setUsage(statsData.usage);
        setPlan(statsData.plan);
        setIsPro(statsData.plan?.name === 'PRO');
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates ?? []);
      }

      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json();
        setDownloadHistory(downloadsData.downloads ?? []);
      }
      
      if (paymentRes.ok) {
        const paymentDataRes = await paymentRes.json();
        if (paymentDataRes.payment) {
          setPaymentData(paymentDataRes.payment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle upgrade to Pro - creates NOWPayments invoice and redirects
  const handleUpgradeToPro = async () => {
    try {
      toast.loading('Creating payment invoice...', { id: 'payment-loading' });
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pay_currency: 'usdttrc20', 
          plan_type: 'PRO' 
        }),
      });
      
      const data = await response.json();
      toast.dismiss('payment-loading');
      
      if (!response.ok) {
        if (data.isPro) {
          toast.success('You already have a Pro plan!');
          fetchData();
          return;
        }
        throw new Error(data.error || 'Failed to create payment');
      }
      
      // If we have a pending payment, show info
      if (data.message === 'You have a pending payment' && data.payment) {
        toast.info('You have a pending payment. Checking status...');
        // Could show payment status here
        return;
      }
      
      // Redirect to NOWPayments invoice URL in new tab
      if (data.invoice_url) {
        toast.success('Opening NOWPayments payment page...');
        window.open(data.invoice_url, '_blank');
        // Show info to user
        toast.info('Complete your payment in the new tab, then check your status.');
      } else if (data.pay_address) {
        // Direct payment - show address
        toast.success('Payment address generated!');
        router.push(`/payment?status=address&address=${data.pay_address}&amount=${data.pay_amount}&currency=${data.pay_currency}`);
      } else {
        throw new Error('No payment URL received from NOWPayments');
      }
      
    } catch (error) {
      toast.dismiss('payment-loading');
      console.error('Upgrade error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payment');
    }
  };

  // Handle cancel plan
  const handleCancelPlan = async () => {
    try {
      const response = await fetch('/api/cancel-plan', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel plan');
      }

      toast.success('Plan canceled. You are now on the Free plan.');
      fetchData();
    } catch (error) {
      console.error('Cancel plan error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel plan');
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      
      if (data.isPro) {
        toast.success('Payment confirmed! You are now a Pro user!');
        fetchData();
        return true;
      }
      
      if (data.payment) {
        setPaymentData(data.payment);
        if (data.payment.status === 'finished') {
          toast.success('Payment confirmed! Upgrading your account...');
          fetchData();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Payment status check error:', error);
      return false;
    }
  };

  // Handle redownload
  const handleRedownload = async (id: string, title: string) => {
    setRedownloadingId(id);
    try {
      const res = await fetch(`/api/downloads/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const { pdfData } = await res.json();
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Re-download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setRedownloadingId(null);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router, fetchData]);

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // Calculate totals
  const subtotal = currentDoc.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const taxAmount = subtotal * (currentDoc.taxRate / 100);
  const total = subtotal + taxAmount;

  // Generate document
  const generateDocument = async () => {
    if (!currentDoc.title) {
      toast.error('Please enter a document title');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentDoc.title,
          type: currentDoc.type,
          documentNumber: currentDoc.documentNumber,
          data: currentDoc,
          items: currentDoc.items,
          totalAmount: total,
          currency: currentDoc.currency,
          notes: currentDoc.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'PDF limit reached') {
          toast.error(result.message || 'PDF limit reached. Please upgrade your plan.');
        } else {
          toast.error(result.error || 'Failed to create document');
        }
        return;
      }

      toast.success('Document created successfully!');
      fetchData();
      setCurrentView('history');
      resetForm();
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const resetForm = () => {
    setCurrentDoc({
      title: '',
      type: 'INVOICE',
      documentNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      client: { name: '', email: '', address: '', phone: '' },
      items: [{ name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
      notes: '',
      terms: 'Payment is due within 30 days',
      currency: 'USD',
      taxRate: 18,
    });
  };

  // Add item
  const addItem = () => {
    setCurrentDoc({
      ...currentDoc,
      items: [...currentDoc.items, { name: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
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

  // Format number with suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Render document preview
  const renderDocumentPreview = () => {
    const currencySymbol = CURRENCY_SYMBOLS[currentDoc.currency] || '$';
    
    return (
      <div 
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        style={{ 
          transform: `scale(${previewZoom / 100})`,
          transformOrigin: 'top center',
          width: '210mm',
          minHeight: '297mm',
        }}
      >
        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyInfo.name || 'Your Company'}</h1>
              <p className="text-sm text-gray-500">{companyInfo.email}</p>
              <p className="text-sm text-gray-500">{companyInfo.phone}</p>
              <p className="text-sm text-gray-500">{companyInfo.address}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900">{currentDoc.type}</h2>
              <p className="text-sm text-gray-500">#{currentDoc.documentNumber || 'DOC-001'}</p>
            </div>
          </div>
        </div>

        {/* Client & Date Info */}
        <div className="p-8 border-b">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
              <p className="font-medium">{currentDoc.client.name || 'Client Name'}</p>
              <p className="text-sm text-gray-500">{currentDoc.client.email}</p>
              <p className="text-sm text-gray-500">{currentDoc.client.address}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-gray-500">Date: </span>
                <span className="font-medium">{currentDoc.date || new Date().toLocaleDateString()}</span>
              </div>
              {currentDoc.dueDate && (
                <div className="mb-2">
                  <span className="text-sm text-gray-500">Due Date: </span>
                  <span className="font-medium">{currentDoc.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-semibold text-gray-500">Description</th>
                <th className="text-center py-3 text-sm font-semibold text-gray-500 w-20">Qty</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-500 w-24">Price</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-500 w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentDoc.items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3">
                    <div className="font-medium">{item.name || 'Item'}</div>
                    {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                  </td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-3 font-medium">{currencySymbol}{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Tax ({currentDoc.taxRate}%)</span>
                <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {currentDoc.notes && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{currentDoc.notes}</p>
            </div>
          )}

          {/* Terms */}
          {currentDoc.terms && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Terms & Conditions</h4>
              <p className="text-sm text-gray-600">{currentDoc.terms}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className={`bg-background border-r transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-14'} flex flex-col h-screen sticky top-0 overflow-hidden`}>
      {/* Header - Fixed */}
      <div className="p-3 border-b flex items-center justify-between shrink-0">
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

      {/* Scrollable Content Area with visible scrollbar */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
        <nav className="p-2 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'create', label: 'Create Document', icon: FilePlus2 },
            { id: 'templates', label: 'Templates', icon: FolderOpen },
            { id: 'builder', label: 'Template Builder', icon: Palette },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                if (item.id === 'builder') {
                  setSelectedTemplateForBuilder(null);
                }
                setCurrentView(item.id as any);
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {sidebarOpen && item.label}
            </Button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-3 border-t mx-2 mt-2">
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

      {/* User Profile & Logout - Fixed at bottom */}
      <div className="p-3 border-t shrink-0 bg-background">
        {/* Plan Badge - Only when sidebar open */}
        {sidebarOpen && (
          <>
            <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{plan.displayName}</span>
              </div>
              {plan.price > 0 && (
                <span className="text-xs text-muted-foreground">${plan.price}/mo</span>
              )}
            </div>
            
            {/* Usage Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">PDFs this month</span>
                {isPro || usage.pdfLimit === -1 ? (
                  <span className="text-green-600 font-medium">{usage.pdfsUsed} generated</span>
                ) : (
                  <span>{usage.pdfsUsed}/{usage.pdfLimit}</span>
                )}
              </div>
              {!isPro && usage.pdfLimit > 0 && (
                <Progress value={(usage.pdfsUsed / usage.pdfLimit) * 100} className="h-1.5" />
              )}
            </div>
          </>
        )}
        
        {/* User Dropdown - Always visible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.avatar || undefined} />
                <AvatarFallback>
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0 ml-2 text-left">
                  <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCurrentView('settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Documents', value: stats.documents, icon: FileText },
          { label: 'Templates', value: stats.templates, icon: Layout },
          { label: 'Categories', value: stats.categories || CATEGORIES.length, icon: FolderOpen },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground absolute right-4 top-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Monthly Usage
          </CardTitle>
          <CardDescription>
            {usage.pdfLimit === -1 
              ? 'Unlimited PDF generation with your plan'
              : `${usage.pdfsRemaining} PDFs remaining this month`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usage.pdfLimit > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usage.pdfsUsed} of {usage.pdfLimit} PDFs used</span>
                <span className="text-muted-foreground">{Math.round((usage.pdfsUsed / usage.pdfLimit) * 100)}%</span>
              </div>
              <Progress value={(usage.pdfsUsed / usage.pdfLimit) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

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
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No documents yet</p>
              <p className="text-sm">Create your first document to get started</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Download History */}
      <DownloadHistory />
    </div>
  );

  // Render create form with preview
  const renderCreateForm = () => (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentView('dashboard')}>
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Create Document</h1>
            <p className="text-sm text-muted-foreground">Fill in the details and preview in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetForm}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-1" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button size="sm" onClick={generateDocument} disabled={!currentDoc.title || usage.pdfsRemaining <= 0}>
            <Save className="h-4 w-4 mr-1" />
            Save Document
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-[400px] border-r overflow-auto bg-muted/30">
          <Tabs defaultValue="document" className="w-full">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="document" className="flex-1">Document</TabsTrigger>
              <TabsTrigger value="client" className="flex-1">Client</TabsTrigger>
              <TabsTrigger value="items" className="flex-1">Items</TabsTrigger>
              <TabsTrigger value="company" className="flex-1">Company</TabsTrigger>
            </TabsList>

            <TabsContent value="document" className="p-4 space-y-4">
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Document title" value={currentDoc.title} onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Document Number</Label>
                  <Input placeholder="INV-001" value={currentDoc.documentNumber} onChange={(e) => setCurrentDoc({ ...currentDoc, documentNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currentDoc.currency} onValueChange={(val) => setCurrentDoc({ ...currentDoc, currency: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={currentDoc.date} onChange={(e) => setCurrentDoc({ ...currentDoc, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={currentDoc.dueDate} onChange={(e) => setCurrentDoc({ ...currentDoc, dueDate: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={currentDoc.taxRate} onChange={(e) => setCurrentDoc({ ...currentDoc, taxRate: parseFloat(e.target.value) || 0 })} />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes..." value={currentDoc.notes} onChange={(e) => setCurrentDoc({ ...currentDoc, notes: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea placeholder="Payment terms..." value={currentDoc.terms} onChange={(e) => setCurrentDoc({ ...currentDoc, terms: e.target.value })} />
              </div>
            </TabsContent>

            <TabsContent value="client" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input placeholder="Client name" value={currentDoc.client.name} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, name: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="client@email.com" value={currentDoc.client.email} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, email: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 555-123-4567" value={currentDoc.client.phone} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, phone: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea placeholder="Client address" value={currentDoc.client.address} onChange={(e) => setCurrentDoc({ ...currentDoc, client: { ...currentDoc.client, address: e.target.value } })} />
              </div>
            </TabsContent>

            <TabsContent value="items" className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {currentDoc.items.map((item: any, i: number) => (
                <Card key={i} className="p-3">
                  <div className="space-y-2">
                    <Input placeholder="Item name" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} />
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input disabled value={item.total.toFixed(2)} className="bg-muted" />
                      </div>
                    </div>
                    {currentDoc.items.length > 1 && (
                      <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => setCurrentDoc({ ...currentDoc, items: currentDoc.items.filter((_: any, idx: number) => idx !== i) })}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}

              {/* Summary */}
              <Card className="p-4 bg-primary/5">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{CURRENCY_SYMBOLS[currentDoc.currency] || '$'}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({currentDoc.taxRate}%)</span>
                    <span>{CURRENCY_SYMBOLS[currentDoc.currency] || '$'}{taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{CURRENCY_SYMBOLS[currentDoc.currency] || '$'}{total.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Company" value={companyInfo.name} onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="Email" value={companyInfo.email} onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="Phone" value={companyInfo.phone} onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea placeholder="Address" value={companyInfo.address} onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input placeholder="Tax ID" value={companyInfo.taxId} onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Preview */}
        {showPreview && (
          <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
            {/* Zoom Controls */}
            <div className="p-3 border-b bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setPreviewZoom(Math.max(25, previewZoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-16 text-center">{previewZoom}%</span>
                <Button variant="outline" size="icon" onClick={() => setPreviewZoom(Math.min(200, previewZoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Slider
                value={[previewZoom]}
                onValueChange={([val]) => setPreviewZoom(val)}
                min={25}
                max={200}
                step={25}
                className="w-48"
              />
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>

            {/* Preview Canvas */}
            <ScrollArea className="flex-1 p-8">
              <div className="flex justify-center">
                {renderDocumentPreview()}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );

  // Render templates
  const renderTemplates = () => {
    const filtered = templates.filter(t => !selectedCategory || t.category === selectedCategory);
    
    const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string, templateName: string) => {
      e.stopPropagation();
      
      if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
        return;
      }
      
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to delete template');
          return;
        }
        
        toast.success('Template deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete template');
      }
    };
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground">Choose a template or create your own</p>
          </div>
          <Button onClick={() => { setSelectedTemplateForBuilder(null); setCurrentView('builder'); }}>
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

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-3 opacity-50" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm">Create your first template to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map((t) => (
              <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative" onClick={() => {
                setSelectedTemplateForBuilder(t);
                setCurrentView('builder');
              }}>
                <div className="h-28 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                  <FileText className="h-10 w-10 text-primary/40" />
                  {t.isPremium && <Badge className="absolute top-2 right-2" variant="secondary">Premium</Badge>}
                  {!t.isSystem && t.creatorId && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteTemplate(e, t.id, t.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline">{t.category}</Badge>
                    <span className="text-muted-foreground">{t.downloads?.toLocaleString() ?? 0} downloads</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render history
  const renderHistory = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Download History</h1>
          <p className="text-muted-foreground">View and re-download your generated PDFs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCurrentView('builder')}>
            <Plus className="h-4 w-4 mr-2" />
            Create PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {downloadHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No downloads yet</p>
              <p className="text-sm">Generate PDFs in the template builder to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloadHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatSize(item.fileSize)} · {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRedownload(item.id, item.title)}
                    disabled={redownloadingId === item.id}
                  >
                    {redownloadingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    {redownloadingId === item.id ? 'Downloading...' : 'Download'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Render settings
  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session?.user?.avatar || undefined} />
                <AvatarFallback className="text-xl">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPro && <Badge className="bg-green-500">PRO</Badge>}
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${isPro ? 'bg-green-500/10 border border-green-500/20' : 'bg-primary/5'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{plan.displayName} Plan</p>
                  {isPro && <Check className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPro || usage.pdfLimit === -1 
                    ? `${usage.pdfsUsed} PDFs generated` 
                    : `${usage.pdfLimit} PDFs per month`
                  }
                </p>
              </div>
              {!isPro && (
                <div className="text-right">
                  <span className="text-2xl font-bold">30<span className="text-sm font-normal"> USDT</span></span>
                  <p className="text-xs text-muted-foreground">one-time payment</p>
                </div>
              )}
            </div>
            
            {!isPro ? (
              <div className="space-y-3">
                <Button className="w-full" onClick={handleUpgradeToPro}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    You have unlimited PDF generation with your Pro plan
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={handleCancelPlan}
                >
                  Cancel Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Template builder uses its own layout
  if (currentView === 'builder') {
    return <TemplateBuilder 
      onBack={() => { setSelectedTemplateForBuilder(null); setCurrentView('dashboard'); }} 
      onTemplateSaved={() => { fetchData(); }}
      initialTemplate={selectedTemplateForBuilder} 
    />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {renderSidebar()}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'create' && renderCreateForm()}
        {currentView === 'templates' && renderTemplates()}
        {currentView === 'history' && renderHistory()}
        {currentView === 'settings' && renderSettings()}
      </main>
    </div>
  );
}
