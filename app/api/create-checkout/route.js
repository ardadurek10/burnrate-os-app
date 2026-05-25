import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY,
  starter_yearly: process.env.STRIPE_STARTER_YEARLY,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRO_YEARLY,
  elite_monthly: process.env.STRIPE_ELITE_MONTHLY,
  elite_yearly: process.env.STRIPE_ELITE_YEARLY,
}

export async function POST(req) {
  try {
    const { plan, billing, userId, email } = await req.json()
    const key = `${plan}_${billing}`
    const priceId = PRICE_IDS[key]
    if(!priceId) return NextResponse.json({error:'Invalid plan'},{status:400})

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.burnrate-os.com'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.burnrate-os.com'}/dashboard?canceled=true`,
      customer_email: email,
      metadata: { userId, plan, billing },
      subscription_data: { metadata: { userId, plan, billing } }
    })

    return NextResponse.json({ url: session.url })
  } catch(error) {
    return NextResponse.json({error: error.message},{status:500})
  }
}
