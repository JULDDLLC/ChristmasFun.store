import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getProductByPriceId } from '../stripe-config';
import { Crown, Calendar, CreditCard } from 'lucide-react';

interface Subscription {
  subscription_status: string;
  price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

export const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('customer_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!subscription || subscription.subscription_status !== 'active') {
    return null;
  }

  const product = getProductByPriceId(subscription.price_id);
  const endDate = new Date(subscription.current_period_end * 1000);

  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center space-x-3">
        <Crown className="w-5 h-5 text-yellow-400" />
        <div className="flex-1">
          <h3 className="text-white font-medium">
            {product?.name || 'Active Subscription'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-white/70">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Renews {endDate.toLocaleDateString()}</span>
            </div>
            {subscription.cancel_at_period_end && (
              <div className="flex items-center space-x-1 text-orange-400">
                <CreditCard className="w-4 h-4" />
                <span>Cancels at period end</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};