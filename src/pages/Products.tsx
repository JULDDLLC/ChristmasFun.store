import React from 'react';
import { STRIPE_PRODUCTS, getSubscriptionProducts, getOneTimeProducts } from '../stripe-config';
import { ProductCard } from '../components/ProductCard';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Zap } from 'lucide-react';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const subscriptionProducts = getSubscriptionProducts();
  const oneTimeProducts = getOneTimeProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Our Products
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover our collection of innovative tools and digital products designed to enhance your productivity and creativity.
          </p>
        </div>

        {user && (
          <div className="mb-8">
            <SubscriptionStatus />
          </div>
        )}

        {/* Subscription Products */}
        <div className="mb-16">
          <div className="flex items-center space-x-3 mb-8">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Subscriptions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* One-time Products */}
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <ShoppingBag className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">One-time Purchases</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};