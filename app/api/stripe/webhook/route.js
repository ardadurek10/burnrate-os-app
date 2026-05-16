import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

const PRICE_TO_PLAN = {
  'price_1TXetvJ2HRbR9W7W9tNUtDw7': 'starter',
  'price_1TXewBJ2HRbR9W7WSX1xWJJk': 'pro',
  'price_1TXex9J2HRbR9W7WlY2hRRZV': 'elite',
};

async function updateUser(userId, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify(data),
  });
}

async function getUserByCustomerId(customerId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?stripe_customer_id=eq.${customerId}&select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
  const data = await res.json();
  return data[0];
}

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        if (!userId) break;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'starter';
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        await updateUser(userId, { stripe_customer_id: customerId, stripe_sub_id: subscriptionId, plan, plan_expires_at: expiresAt });
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const user = await getUserByCustomerId(invoice.customer);
        if (!user) break;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const priceId = subscription.items.data[0].price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'starter';
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        await updateUser(user.id, { plan, plan_expires_at: expiresAt });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await getUserByCustomerId(subscription.customer);
        if (!user) break;
        await updateUser(user.id, { plan: 'starter', stripe_sub_id: null, plan_expires_at: null });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const user = await getUserByCustomerId(subscription.customer);
        if (!user) break;
        const priceId = subscription.items.data[0].price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'starter';
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        await updateUser(user.id, { plan, plan_expires_at: expiresAt });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
  return NextResponse.json({ received: true });
}
