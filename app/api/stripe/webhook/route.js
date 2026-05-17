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
  'price_1TXp6PJ2HRbR9W7WLgZhODrP': 'starter',
  'price_1TXp7UJ2HRbR9W7WewHmzUXy': 'pro',
  'price_1TXp8yJ2HRbR9W7WEaMfGm9r': 'elite',
  'price_1TY0OGJ2HRbR9W7W6F5O9Ezh': 'starter',
  'price_1TY0eNJ2HRbR9W7WZBgzju7z': 'starter',
  'price_1TY0MtJ2HRbR9W7WmkJ81NvB': 'pro',
  'price_1TY0f6J2HRbR9W7WuqhPHun1': 'pro',
  'price_1TY0OYJ2HRbR9W7WTlhJnqAQ': 'elite',
  'price_1TY0fXJ2HRbR9W7WP8o1fhql': 'elite',
};

const PLAN_META = {
  starter: {
    name: 'Starter', prefix: 'STR', color: '#06b6d4', price: '$9/mo',
    subject: 'BurnRate OS Starter Plana Hoş Geldiniz 🚀',
    headline: 'Yolculuğunuz burada başlıyor.',
    subline: 'Temel finansal komuta merkezinize erişiminiz var.',
    features: ['Genel Bakış Paneli', 'Harcama Analizi', 'Bakiye ve Gelir Takibi'],
  },
  pro: {
    name: 'Pro', prefix: 'PRO', color: '#7c3aed', price: '$19/mo',
    subject: 'BurnRate OS Pro aktif edildi 💜',
    headline: 'Tüm potansiyelinizi ortaya çıkarın.',
    subline: 'AI danışman, abonelik denetimi ve 30 günlük meydan okuma — hepsi sizin.',
    features: ["Starter'daki her şey", 'Abonelik Takibi + Otomatik Etiketler', '30 Günlük Meydan Okuma', 'Yapay Zeka Danışmanı (Claude)'],
  },
  elite: {
    name: 'Elite', prefix: 'ELT', color: '#f59e0b', price: '$39/mo',
    subject: 'BurnRate OS Elite aktif edildi ⚡',
    headline: 'Tam OS deneyimini yaşıyorsunuz.',
    subline: 'Canlı yatırımlar, aylık puanlar, öncelikli destek — tam paket.',
    features: ["Pro'daki her şey", 'Canlı Yatırım Takibi', 'Aylık Özet Puanı (A/B/C/D)', 'Öncelikli Destek + Erken Erişim'],
  },
};

function generateLicenseKey(plan = 'pro') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const prefix = PLAN_META[plan]?.prefix || 'PRO';
  return `BRNOS-${prefix}-${seg()}-${seg()}`;
}

function buildEmailHtml(name, email, licenseKey, plan) {
  const meta = PLAN_META[plan];
  const featuresHtml = meta.features.map(f => `
    <tr><td style="padding:8px 0;color:#a09ab8;font-size:14px">
      <span style="color:${meta.color};margin-right:10px">✓</span>${f}
    </td></tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:sans-serif">
<div style="max-width:520px;margin:0 auto;padding:48px 24px">
  <div style="text-align:center;margin-bottom:40px">
    <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:8px 20px">
      <div style="width:8px;height:8px;background:${meta.color};border-radius:50%"></div>
      <span style="color:#a09ab8;font-size:13px">BURNRATE OS · ${meta.name.toUpperCase()}</span>
    </div>
  </div>
  <div style="text-align:center;margin-bottom:40px">
    <h1 style="color:#f1f0ff;font-size:28px;font-weight:700;margin:0 0 12px">${meta.headline}</h1>
    <p style="color:#a09ab8;font-size:16px;margin:0;line-height:1.6">${meta.subline}</p>
  </div>
  <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;margin-bottom:28px;text-align:center">
    <p style="color:#5c5680;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px">Lisans Anahtarınız</p>
    <p style="color:${meta.color};font-size:22px;font-weight:700;font-family:monospace;letter-spacing:3px;margin:0 0 16px">${licenseKey}</p>
    <p style="color:#5c5680;font-size:12px;margin:0">Güvende tutun · Dashboard erişimi için kullanın</p>
  </div>
  <p style="color:#a09ab8;font-size:15px;line-height:1.7;margin:0 0 28px">
    Merhaba ${name}, BurnRate OS'e hoş geldiniz <strong style="color:${meta.color}">${meta.name}</strong>. 
    Finansal komuta merkeziniz hazır. Giriş yapmak için e-posta ve lisans anahtarınızı kullanın.
  </p>
  <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:32px">
    <p style="color:#5c5680;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">Pakete dahil olanlar in ${meta.name}</p>
    <table style="width:100%;border-collapse:collapse">${featuresHtml}</table>
  </div>
  <div style="text-align:center;margin-bottom:40px">
    <a href="https://app.burnrate-os.com/login" style="display:inline-block;background:${meta.color};color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600">
      Dashboard'ı Aç →
    </a>
  </div>
  <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 20px;margin-bottom:32px">
    <p style="color:#5c5680;font-size:12px;margin:0 0 8px;text-transform:uppercase">Giriş Bilgileri</p>
    <p style="color:#a09ab8;font-size:14px;margin:0">Email: <span style="color:#f1f0ff">${name}</span></p>
    <p style="color:#a09ab8;font-size:14px;margin:4px 0 0">License Key: <span style="color:${meta.color};font-family:monospace">${licenseKey}</span></p>
  </div>
  <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:28px">
    <p style="color:#3d3a52;font-size:12px;margin:0">BurnRate OS · hello@burnrate-os.com</p>
    <p style="color:#3d3a52;font-size:12px;margin:4px 0 0">
      <a href="https://burnrate-os.com" style="color:#5c5680;text-decoration:none">burnrate-os.com</a>
      · ${meta.price} · Cancel anytime
    </p>
  </div>
</div>
</body>
</html>`;
}

async function sendWelcomeEmail(email, name, licenseKey, plan) {
  const meta = PLAN_META[plan];
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_9LCgbRzr_Nhd5NTWrTx6pv5M3z8VyLjYn',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BurnRate OS <hello@burnrate-os.com>',
      to: email,
      subject: meta.subject,
      html: buildEmailHtml(name, email, licenseKey, plan),
    }),
  });
}

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
        const licenseKey = generateLicenseKey(plan);

        await updateUser(userId, {
          stripe_customer_id: customerId,
          stripe_sub_id: subscriptionId,
          plan,
          plan_expires_at: expiresAt,
          license_key: licenseKey,
        });

        // Mail gönder
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        const name = customer.name || 'BurnRate User';
        await sendWelcomeEmail(email, name, licenseKey, plan);
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
