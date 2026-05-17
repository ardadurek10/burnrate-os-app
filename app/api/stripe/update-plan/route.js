import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

const PRICE_IDS = {
  starter: 'price_1TXetvJ2HRbR9W7W9tNUtDw7',
  pro: 'price_1TXewBJ2HRbR9W7WSX1xWJJk',
  elite: 'price_1TXex9J2HRbR9W7WlY2hRRZV',
};

export async function POST(req) {
  try {
    const { userId, newPlan } = await req.json();

    if (!userId || !newPlan || !PRICE_IDS[newPlan]) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
    }

    // Supabase'den kullanıcıyı al
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=stripe_sub_id,plan`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    const user = data[0];

    if (!user?.stripe_sub_id) {
      // Stripe aboneliği yok, checkout'a yönlendir
      return NextResponse.json({ redirect: `/checkout?plan=${newPlan}` });
    }

    // Mevcut aboneliği al
    const subscription = await stripe.subscriptions.retrieve(user.stripe_sub_id);
    const subscriptionItemId = subscription.items.data[0].id;

    // Aboneliği güncelle (prorate)
    await stripe.subscriptions.update(user.stripe_sub_id, {
      items: [{ id: subscriptionItemId, price: PRICE_IDS[newPlan] }],
      proration_behavior: 'create_prorations',
    });

    // Supabase'i güncelle
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ plan: newPlan }),
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (err) {
    console.error('Update plan error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
