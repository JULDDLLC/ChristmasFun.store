import { Link } from 'react-router-dom';
import { Snowflake, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <Snowflake className="w-16 h-16 text-sky-300/70 mx-auto mb-6" />
        <h1 className="text-6xl font-serif mb-4">404</h1>
        <h2 className="text-2xl font-serif text-white/90 mb-4">
          Lost in a snowstorm?
        </h2>
        <p className="text-white/70 mb-8 leading-relaxed">
          This page wandered off like a reindeer without its bells.
          Let's get you back to the Christmas magic.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-lg font-semibold shadow-lg shadow-amber-900/50 hover:scale-105 transition-transform"
        >
          <Home className="w-5 h-5" />
          Back to ChristmasFun.store
        </Link>
      </div>
    </div>
  );
}
