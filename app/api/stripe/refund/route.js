import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

export async function POST(req) {
  try {
    const { userId } = await req.json();

    // Kullanıcıyı al
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    const user = data[0];

    if (!user?.stripe_sub_id) {
      return NextResponse.json({ error: 'Aktif abonelik bulunamadı.' }, { status: 400 });
    }

    // 7 gün kontrolü
    const subscription = await stripe.subscriptions.retrieve(user.stripe_sub_id);
    const createdAt = new Date(subscription.start_date * 1000);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    if (daysDiff > 7) {
      return NextResponse.json({ error: '7 günlük iade süresi dolmuş.' }, { status: 400 });
    }

    // Son ödemeyi bul
    const invoices = await stripe.invoices.list({ subscription: user.stripe_sub_id, limit: 1 });
    const lastInvoice = invoices.data[0];

    if (!lastInvoice?.payment_intent) {
      return NextResponse.json({ error: 'Ödeme bulunamadı.' }, { status: 400 });
    }

    // İade yap
    await stripe.refunds.create({ payment_intent: lastInvoice.payment_intent });

    // Aboneliği iptal et
    await stripe.subscriptions.cancel(user.stripe_sub_id);

    // Supabase güncelle
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ plan: 'starter', stripe_sub_id: null, plan_expires_at: null }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Refund error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
