'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Wallet, Sparkles, ArrowLeft } from 'lucide-react';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const planType = searchParams.get('plan') || 'TEST';
  const amount = searchParams.get('amount') || '0';
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
          setIsSuccess(true);
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        throw new Error(data.error || 'Payment failed');
      }
      
      // For free plans or already processed
      if (data.isFree || data.payment?.status === 'finished') {
        setIsSuccess(true);
        setTimeout(() => router.push('/'), 2000);
        return;
      }
      
      // For paid plans with invoice URL
      if (data.invoice_url) {
        window.open(data.invoice_url, '_blank');
      }
      
      setIsSuccess(true);
      setTimeout(() => router.push('/'), 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleBack = () => {
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-white/70">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-white/60 mb-6">
              Your {planType} plan has been activated. You now have unlimited PDF generation.
            </p>
            <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            {planType === 'TEST' ? (
              <Sparkles className="h-8 w-8 text-blue-500" />
            ) : (
              <Wallet className="h-8 w-8 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-white">
            QuickDocs {planType === 'TEST' ? 'Test' : 'Pro'} Plan
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
            {parseFloat(amount) === 0 && (
              <p className="text-blue-400 text-sm mt-2">Free for testing purposes</p>
            )}
          </div>
          
          {/* Plan Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Plan</span>
              <span className="text-white font-medium">{planType === 'TEST' ? 'Test (Demo)' : 'Pro'} Plan</span>
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
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              className={`w-full h-12 text-lg font-semibold ${
                planType === 'TEST' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
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
                  {parseFloat(amount) === 0 ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Complete Payment
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5 mr-2" />
                      Pay {amount} {currency}
                    </>
                  )}
                </>
              )}
            </Button>
            
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
              {parseFloat(amount) === 0 
                ? 'Demo payment for testing purposes'
                : 'Powered by NOWPayments'
              }
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
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
