import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });

    // Kullanıcıyı al
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const userData = await userRes.json();
    const user = userData[0];

    // Stripe aboneliği iptal et
    if (user?.stripe_sub_id) {
      try {
        await stripe.subscriptions.cancel(user.stripe_sub_id);
      } catch (e) {
        console.log('Stripe cancel error (ignored):', e.message);
      }
    }

    // Tüm verileri sil
    await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/expenses?user_id=eq.${userId}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/income?user_id=eq.${userId}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/investments?user_id=eq.${userId}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
    ]);

    // Kullanıcıyı sil
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
