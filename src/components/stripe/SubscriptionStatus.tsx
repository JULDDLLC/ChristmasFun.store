import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscription, loading, activeSubscriptionPlan } = useSubscription()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-gray-400 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Subscription Status</p>
            <p className="font-medium text-gray-900">No active subscription</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
      case 'trialing':
        return <Clock className="w-5 h-5 text-blue-500 mr-2" />
      case 'past_due':
      case 'canceled':
      case 'unpaid':
        return <XCircle className="w-5 h-5 text-red-500 mr-2" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500 mr-2" />
    }
  }

  const getStatusColor = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return 'text-green-700'
      case 'trialing':
        return 'text-blue-700'
      case 'past_due':
      case 'canceled':
      case 'unpaid':
        return 'text-red-700'
      default:
        return 'text-yellow-700'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        {getStatusIcon()}
        <div>
          <p className="text-sm text-gray-500">Subscription Status</p>
          <p className={`font-medium capitalize ${getStatusColor()}`}>
            {subscription.subscription_status.replace('_', ' ')}
          </p>
        </div>
      </div>

      {activeSubscriptionPlan && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="font-medium text-gray-900">{activeSubscriptionPlan}</p>
        </div>
      )}

      {subscription.current_period_end && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on
          </p>
          <p className="font-medium text-gray-900">
            {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
          </p>
        </div>
      )}

      {subscription.payment_method_brand && subscription.payment_method_last4 && (
        <div>
          <p className="text-sm text-gray-500">Payment Method</p>
          <p className="font-medium text-gray-900">
            {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
          </p>
        </div>
      )}
    </div>
  )
}