'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, Wallet, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  
  // Get callback status from URL
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('payment');
  const address = searchParams.get('address');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  
  useEffect(() => {
    // Handle different payment states
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Activating your Pro plan...');
      // Check payment status
      checkPaymentAndUpdate();
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
    
    setTimeout(() => setIsLoading(false), 500);
  }, [paymentStatus]);
  
  const checkPaymentAndUpdate = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      
      if (data.isPro) {
        toast.success('Your Pro plan is now active!');
        setTimeout(() => router.push('/'), 2000);
      } else if (data.payment?.status === 'finished') {
        toast.success('Payment confirmed! Upgrading your account...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        toast.info('Payment is being processed. You will be notified once confirmed.');
      }
    } catch (error) {
      console.error('Payment check error:', error);
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleBack = () => {
    router.push('/');
  };
  
  const handleCheckStatus = async () => {
    await checkPaymentAndUpdate();
  };
  
  const handleTryAgain = () => {
    router.push('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-green-500" />
          <p className="text-white/70">Processing...</p>
        </div>
      </div>
    );
  }
  
  // Payment success callback from NOWPayments
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              {isChecking ? (
                <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
              ) : (
                <Check className="h-10 w-10 text-green-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-white/60 mb-6">
              Thank you for your payment. Your Pro plan is being activated.
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleCheckStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Payment cancelled callback from NOWPayments
  if (paymentStatus === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-10 w-10 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h2>
            <p className="text-white/60 mb-6">
              Your payment was cancelled. You can try again anytime.
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleTryAgain}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Try Again
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Direct crypto address payment (fallback)
  if (status === 'address' && address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <Wallet className="h-8 w-8 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">
              Send Payment
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-4 border-y border-white/10">
              <p className="text-white/60 text-sm mb-2">Amount to send</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-white">{amount || '30'}</span>
                <span className="text-xl text-white/60">{currency || 'USDT'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-white/60 text-sm">Send to this address:</p>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 break-all">
                <code className="text-green-400 text-sm">{address}</code>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success('Address copied to clipboard!');
                }}
              >
                Copy Address
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 text-sm text-center">
                Send exactly {amount} {currency} to the address above. Your Pro plan will be activated automatically once payment is confirmed.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-500 hover:bg-green-600"
                onClick={handleCheckStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Payment Status
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
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Default state - redirect to dashboard
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">QuickDocs Pro</h2>
          <p className="text-white/60 mb-6">
            Go to Settings to upgrade your plan with NOWPayments cryptocurrency payment.
          </p>
          
          <Button 
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
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
