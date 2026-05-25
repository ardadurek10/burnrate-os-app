export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch(err) {
    return NextResponse.json({error:'Webhook error: '+err.message},{status:400})
  }

  if(event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, plan, billing } = session.metadata || {}
    if(userId && plan) {
      await supabase.from('users').update({
        plan: plan,
        billing: billing,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan_updated_at: new Date().toISOString()
      }).eq('id', userId)
    }
  }

  if(event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const { userId } = subscription.metadata || {}
    if(userId) {
      await supabase.from('users').update({
        plan: 'starter',
        stripe_subscription_id: null
      }).eq('id', userId)
    }
  }

  if(event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    const customerId = invoice.customer
    const { data: userData } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).single()
    if(userData) {
      await supabase.from('users').update({ payment_failed: true }).eq('id', userData.id)
    }
  }

  return NextResponse.json({received: true})
}
