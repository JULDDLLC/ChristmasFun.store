import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionStatus } from './SubscriptionStatus';
import { CartButton } from './CartButton';
import { CartDrawer } from './CartDrawer';
import { User, LogOut, ShoppingBag } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white">
            MyApp
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-white/80 hover:text-white transition-colors flex items-center space-x-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Products</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <CartButton onClick={() => setIsCartOpen(true)} />

            {user ? (
              <>
                <div className="hidden md:block">
                  <SubscriptionStatus />
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth"
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};