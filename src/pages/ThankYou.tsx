import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Mail, Home, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  customer_email: string;
  product_type: string;
  product_id: string;
  status: string;
  download_links: string[];
  created_at: string;
}

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (fetchError) {
          console.error('Error fetching order:', fetchError);
          setError('Unable to retrieve your order details');
          setLoading(false);
          return;
        }

        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchOrder();

    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const getProductName = (productId: string) => {
    switch (productId) {
      case 'single_letter_99':
        return 'Single Santa Letter Design';
      case 'bundle_14_799':
        return 'Complete Bundle - All 14 Designs';
      case 'teacher_license_499':
        return 'Teacher License + All 14 Designs';
      case 'adult_coloring_499':
        return 'Adult Coloring Bundle - All 10 Designs';
      default:
        return 'Digital Product';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="snowflakes" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${Math.random() * 10 + 10}px`,
              }}
            >
              ❄
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-xl">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="snowflakes" aria-hidden="true">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${Math.random() * 10 + 10}px`,
              }}
            >
              ❄
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-md mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
            <p className="text-white text-xl mb-6">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="snowflakes" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 p-8 text-center border-b border-white/10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-amber-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">
                Thank You!
              </h1>
              <p className="text-xl text-white/80">
                Your order has been received
              </p>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-white/70">
                  <Mail className="w-5 h-5" />
                  <span>Confirmation sent to:</span>
                </div>
                <p className="text-2xl text-white font-semibold pl-8">
                  {order.customer_email}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  Your Purchase
                </h2>
                <div className="bg-white/5 rounded-2xl p-6">
                  <p className="text-xl text-white font-semibold mb-2">
                    {getProductName(order.product_id)}
                  </p>
                  <p className="text-white/60">
                    Order ID: {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              {order.status === 'completed' && order.download_links.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                    <Download className="w-6 h-6 text-amber-400" />
                    Your Downloads
                  </h2>
                  <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-2xl p-6 border border-amber-400/30">
                    <p className="text-white/80 mb-4">
                      Your files are ready! Click below to download your Santa letter designs.
                    </p>
                    <div className="space-y-3">
                      {order.download_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
                        >
                          <span className="text-white">
                            {link.includes('teacher-license')
                              ? 'Teacher License PDF'
                              : `Design ${link.match(/design-(\d+)/)?.[1] || index + 1}.pdf`
                            }
                          </span>
                          <Download className="w-5 h-5 text-amber-400 group-hover:translate-y-1 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-6">
                  <p className="text-amber-300 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-400 border-t-transparent" />
                    Processing your order... Download links will appear here shortly.
                  </p>
                </div>
              )}

              <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-semibold text-white">What's Next?</h3>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Check your email for your receipt and download links</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Print your designs on white cardstock for best results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Create magical Christmas memories!</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => navigate('/christmas')}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Return to Store
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-white/60 mt-8">
            Need help? Contact us at{' '}
            <a href="mailto:ChristmasMagicDesigns@juldd.com" className="text-amber-400 hover:text-amber-300">
              ChristmasMagicDesigns@juldd.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
