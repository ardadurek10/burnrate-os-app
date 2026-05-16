import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, userId, email } = await req.json();
    if (!priceId) return NextResponse.json({ error: 'Geçersiz plan' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { user_id: userId },
      success_url: `https://burnrate-os-app.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://burnrate-os-app.vercel.app/checkout?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
