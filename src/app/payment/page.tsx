'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Wallet, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const planType = searchParams.get('plan') || 'PRO';
  const amount = searchParams.get('amount') || '30';
  const currency = searchParams.get('currency') || 'USDT';
  
  useEffect(() => {
    // Simulate loading payment details
    setTimeout(() => setIsLoading(false), 1000);
  }, []);
  
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pay_currency: 'usdttrc20', 
          plan_type: planType 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.isPro) {
          toast.success('You already have a Pro plan!');
          setTimeout(() => router.push('/'), 1500);
          return;
        }
        throw new Error(data.error || 'Payment failed');
      }
      
      // If we got an invoice URL, redirect to NOWPayments
      if (data.invoice_url) {
        setInvoiceUrl(data.invoice_url);
        setPaymentStarted(true);
        // Open NOWPayments in new tab
        window.open(data.invoice_url, '_blank');
        toast.success('Payment page opened! Complete your payment in the new tab.');
      } else if (data.pay_address) {
        // Direct payment - show address
        setPaymentStarted(true);
        toast.success('Payment address generated! Check the payment details.');
      } else {
        throw new Error('Failed to create payment - no invoice URL received');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBack = () => {
    router.push('/');
  };
  
  const handleCheckStatus = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      
      if (data.isPro) {
        toast.success('Payment confirmed! Your Pro plan is now active!');
        setTimeout(() => router.push('/'), 1500);
      } else {
        toast.info('Payment not confirmed yet. Please complete your payment.');
      }
    } catch (err) {
      toast.error('Failed to check payment status');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          <p className="text-white/70">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-white">
            QuickDocs Pro Plan
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Amount Display */}
          <div className="text-center py-6 border-y border-white/10">
            <p className="text-white/60 text-sm mb-2">Amount to pay</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-bold text-white">{amount}</span>
              <span className="text-2xl text-white/60">{currency}</span>
            </div>
            <p className="text-green-400 text-sm mt-2">One-time payment • Lifetime access</p>
          </div>
          
          {/* Plan Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Plan</span>
              <span className="text-white font-medium">Pro Plan</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">PDF Limit</span>
              <span className="text-white font-medium">Unlimited</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Storage</span>
              <span className="text-white font-medium">1 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Support</span>
              <span className="text-white font-medium">Priority</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Payment Method</span>
              <span className="text-white font-medium">Cryptocurrency (USDT TRC20)</span>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Payment Started Info */}
          {paymentStarted && invoiceUrl && (
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
              <p className="text-green-400 text-sm text-center mb-3">
                Payment page opened in a new tab. Complete your payment there.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(invoiceUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Payment Page Again
              </Button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {!paymentStarted ? (
              <Button 
                className="w-full h-12 text-lg font-semibold bg-green-500 hover:bg-green-600"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Pay {amount} {currency}
                  </>
                )}
              </Button>
            ) : (
              <Button 
                className="w-full h-12 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
                onClick={handleCheckStatus}
              >
                <Check className="h-5 w-5 mr-2" />
                Check Payment Status
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="w-full text-white/60 hover:text-white hover:bg-white/10"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Powered by */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-white/40 text-xs">
              Secure payments powered by NOWPayments
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-green-500" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
