import React, { useState } from 'react'
import { StripeProduct } from '../../stripe-config'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

interface ProductCardProps {
  product: StripeProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePurchase = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to make a purchase' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setMessage({ type: 'error', text: 'Please log in to continue' })
        return
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/products`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to start checkout process' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-gray-500 ml-1">
            {product.currency.toUpperCase()}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 ml-1">/month</span>
          )}
        </div>
        <div className="mt-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.mode === 'subscription' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {product.mode === 'subscription' ? 'Subscription' : 'One-time Purchase'}
          </span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? 'Processing...' : `${product.mode === 'subscription' ? 'Subscribe' : 'Buy Now'}`}
      </button>
    </div>
  )
}