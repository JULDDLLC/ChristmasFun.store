import React from 'react';
import { CheckCircle2, Home } from 'lucide-react';

const ThankYouPage: React.FC = () => {
  let sessionId = '';
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    sessionId = params.get('session_id') || '';
  }

  const shortId =
    sessionId.length > 10 ? sessionId.slice(-10) : sessionId || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-300" />
          </div>
        </div>

        <h1 className="text-3xl font-serif font-semibold">
          Thank you for your purchase
        </h1>

        <p className="text-white/80 text-sm leading-relaxed">
          Your order has been received and is being processed.
          <br />
          You’ll receive download links for your Christmas designs by email.
        </p>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/50">
            Order reference
          </p>
          <p className="font-mono text-sm text-amber-200 break-all">
            {shortId}
          </p>
          {sessionId && (
            <p className="text-[11px] text-white/40 break-all">
              Full session id:
              <br />
              <span className="font-mono">{sessionId}</span>
            </p>
          )}
        </div>

        <p className="text-white/60 text-xs">
          If the email doesn’t appear, check spam/promotions or reach out to{' '}
          <span className="font-semibold text-amber-200">
            support@juldd.com
          </span>.
        </p>

        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
