import React from 'react'
import { AuthGuard } from '../components/auth/AuthGuard'
import { SubscriptionStatus } from '../components/stripe/SubscriptionStatus'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { ShoppingBag, User, LogOut } from 'lucide-react'

export function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={signOut}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Account</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-medium text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Subscription Status */}
            <SubscriptionStatus />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Browse Products
                </Link>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.email?.split('@')[0]}!
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your account, view your subscriptions, and explore our products from your dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Secure Payments</h3>
                <p className="text-blue-700 text-sm">
                  All transactions are processed securely through Stripe
                </p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">Instant Access</h3>
                <p className="text-green-700 text-sm">
                  Get immediate access to your purchases and subscriptions
                </p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 mb-2">24/7 Support</h3>
                <p className="text-purple-700 text-sm">
                  Our support team is here to help whenever you need assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}