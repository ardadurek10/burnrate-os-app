import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=stripe_sub_id`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    const subId = data[0]?.stripe_sub_id;
    if (!subId) return NextResponse.json({ error: 'Aktif abonelik bulunamadı' }, { status: 404 });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancel error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
