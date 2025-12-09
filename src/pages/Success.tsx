import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';

export const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you might want to verify the session
      // For now, we'll just show a success message
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-white/80">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </div>

          {sessionId && (
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-white/70 mb-1">Session ID:</p>
              <p className="text-white font-mono text-xs break-all">{sessionId}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            
            <Link
              to="/products"
              className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-white/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse More Products</span>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-white/60">
              You will receive a confirmation email shortly with your purchase details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};