import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {user && (
          <div className="mb-8">
            <SubscriptionStatus />
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to the Future
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
            Discover innovative tools and digital products designed to enhance your productivity, creativity, and digital experience.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Innovative Solutions</h3>
            <p className="text-white/70">
              Cutting-edge tools designed to solve real-world problems and enhance your workflow.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-white/70">
              Optimized for performance and speed, ensuring you get things done efficiently.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-white/70">
              Your data and privacy are our top priority with enterprise-grade security.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already transformed their digital experience with our products.
          </p>
          {!user && (
            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-white/20"
            >
              <span>Sign Up Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};