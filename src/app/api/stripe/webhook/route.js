import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err);
    return NextResponse.json(
      { error: 'Webhook signature failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planType } = session.metadata;
    const price = planType === 'yearly' ? 1000 : 500;

    const now = new Date();
    const endDate = new Date();
    if (planType === 'yearly') {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    try {
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planType,
          status: 'active',
          price_paid: price,
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          renewal_date: endDate.toISOString(),
          stripe_subscription_id: session.subscription,
        });

      if (error) throw error;
      console.log('Subscription activated for user:', userId);
    } catch (err) {
      console.error('Supabase insert error:', err);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', subscription.id);
  }

  return NextResponse.json({ received: true });
}