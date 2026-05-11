import { supabaseInsert } from '../../lib/supabase'

// ─── PLAN CONFIG ────────────────────────────────────────────────────────────
const PLANS = {
  // Whop plan ID'lerini buraya ekle (Whop dashboard → Plans → Plan ID)
  'plan_starter_id': 'starter',   // ← Whop'taki Starter plan ID'si
  'plan_pro_id':     'pro',       // ← Whop'taki Pro plan ID'si
  'plan_elite_id':   'elite',     // ← Whop'taki Elite plan ID'si
}

const PLAN_META = {
  starter: {
    name: 'Starter',
    prefix: 'STR',
    color: '#06b6d4',
    emoji: '🚀',
    price: '$9/mo',
    features: ['Overview Dashboard', 'Spending Analytics', 'Balance & Income Tracker'],
    subject: 'Welcome to BurnRate OS Starter 🚀',
    headline: 'Your journey starts here.',
    subline: 'You now have access to your core financial command center.',
  },
  pro: {
    name: 'Pro',
    prefix: 'PRO',
    color: '#7c3aed',
    emoji: '💜',
    price: '$19/mo',
    features: ['Everything in Starter', 'Subscription Tracker + Auto-labels', '30-Day Challenge', 'AI Financial Advisor (Claude)'],
    subject: 'BurnRate OS Pro activated 💜',
    headline: 'Unlock your full potential.',
    subline: 'AI advisor, subscription audit, and 30-day challenge — all yours.',
  },
  elite: {
    name: 'Elite',
    prefix: 'ELT',
    color: '#f59e0b',
    emoji: '⚡',
    price: '$39/mo',
    features: ['Everything in Pro', 'Live Investment Tracker', 'Monthly Summary Score (A/B/C/D)', 'Priority Support + Early Access'],
    subject: 'BurnRate OS Elite activated ⚡',
    headline: 'You\'re running the full OS.',
    subline: 'Live investments, monthly scores, priority support — the complete stack.',
  },
}

// ─── LICENSE KEY GENERATOR ───────────────────────────────────────────────────
function generateLicenseKey(plan = 'pro') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  const prefix = PLAN_META[plan]?.prefix || 'PRO'
  return `BRNOS-${prefix}-${segment()}-${segment()}`
}

// ─── DETECT PLAN FROM WEBHOOK ────────────────────────────────────────────────
function detectPlan(data) {
  // Whop webhook'ta plan bilgisi farklı field'larda gelebilir
  const planId =
    data?.plan?.id ||
    data?.product?.id ||
    data?.membership?.plan?.id ||
    data?.plan_id ||
    ''

  // Direkt eşleşme
  if (PLANS[planId]) return PLANS[planId]

  // Plan adından tespit (fallback)
  const planName = (
    data?.plan?.name ||
    data?.product?.name ||
    data?.membership?.plan?.name ||
    ''
  ).toLowerCase()

  if (planName.includes('elite')) return 'elite'
  if (planName.includes('starter')) return 'starter'
  if (planName.includes('pro')) return 'pro'

  // Fiyattan tespit (son fallback)
  const price = data?.plan?.price || data?.price || 0
  if (price >= 39) return 'elite'
  if (price >= 19) return 'pro'
  if (price >= 9) return 'starter'

  return 'pro' // varsayılan
}

// ─── EMAIL TEMPLATE ──────────────────────────────────────────────────────────
function buildEmailHtml(name, licenseKey, plan) {
  const meta = PLAN_META[plan]
  const featuresHtml = meta.features
    .map(f => `
      <tr>
        <td style="padding:8px 0;color:#a09ab8;font-size:14px">
          <span style="color:${meta.color};margin-right:10px">✓</span>${f}
        </td>
      </tr>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:'DM Sans',sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:48px 24px">

    <!-- HEADER -->
    <div style="text-align:center;margin-bottom:40px">
      <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:8px 20px">
        <div style="width:8px;height:8px;background:${meta.color};border-radius:50%"></div>
        <span style="color:#a09ab8;font-size:13px;letter-spacing:0.05em">BURNRATE OS · ${meta.name.toUpperCase()}</span>
      </div>
    </div>

    <!-- HERO -->
    <div style="text-align:center;margin-bottom:40px">
      <div style="font-size:48px;margin-bottom:16px">${meta.emoji}</div>
      <h1 style="color:#f1f0ff;font-size:28px;font-weight:700;margin:0 0 12px;letter-spacing:-0.02em">${meta.headline}</h1>
      <p style="color:#a09ab8;font-size:16px;margin:0;line-height:1.6;font-weight:300">${meta.subline}</p>
    </div>

    <!-- LICENSE KEY -->
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;margin-bottom:28px;text-align:center">
      <p style="color:#5c5680;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px">Your License Key</p>
      <p style="color:${meta.color};font-size:22px;font-weight:700;font-family:'DM Mono',monospace;letter-spacing:3px;margin:0 0 16px">${licenseKey}</p>
      <p style="color:#5c5680;font-size:12px;margin:0">Keep this safe · Used to access your dashboard</p>
    </div>

    <!-- GREETING -->
    <p style="color:#a09ab8;font-size:15px;line-height:1.7;margin:0 0 28px">
      Hey ${name}, welcome to BurnRate OS <strong style="color:${meta.color}">${meta.name}</strong>. 
      Your financial command center is ready. Use your email and license key to log in.
    </p>

    <!-- FEATURES -->
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px 24px;margin-bottom:32px">
      <p style="color:#5c5680;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px">What's included in ${meta.name}</p>
      <table style="width:100%;border-collapse:collapse">
        ${featuresHtml}
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:40px">
      <a href="https://burnrate-os.com/login" 
         style="display:inline-block;background:${meta.color};color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:-0.01em">
        Open Dashboard →
      </a>
    </div>

    <!-- LOGIN REMINDER -->
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 20px;margin-bottom:32px">
      <p style="color:#5c5680;font-size:12px;margin:0 0 8px;letter-spacing:0.05em;text-transform:uppercase">Login Details</p>
      <p style="color:#a09ab8;font-size:14px;margin:0">Email: <span style="color:#f1f0ff">${'[your email]'}</span></p>
      <p style="color:#a09ab8;font-size:14px;margin:4px 0 0">License Key: <span style="color:${meta.color};font-family:monospace">${licenseKey}</span></p>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:28px">
      <p style="color:#3d3a52;font-size:12px;margin:0 0 8px">BurnRate OS · hello@burnrate-os.com</p>
      <p style="color:#3d3a52;font-size:12px;margin:0">
        <a href="https://burnrate-os.com" style="color:#5c5680;text-decoration:none">burnrate-os.com</a>
        · ${meta.price} · Cancel anytime on Whop
      </p>
    </div>

  </div>
</body>
</html>`
}

// ─── SEND EMAIL ──────────────────────────────────────────────────────────────
async function sendWelcomeEmail(email, name, licenseKey, plan) {
  const meta = PLAN_META[plan]

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_9LCgbRzr_Nhd5NTWrTx6pv5M3z8VyLjYn',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BurnRate OS <hello@burnrate-os.com>',
      to: email,
      subject: meta.subject,
      html: buildEmailHtml(name, licenseKey, plan),
    }),
  })

  return res.json()
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { action, data } = body

    // Webhook imzasını logla (debug için)
    console.log('[Webhook] action:', action)
    console.log('[Webhook] data keys:', Object.keys(data || {}))
    console.log('[Webhook] full data:', JSON.stringify(data, null, 2))

    if (action === 'membership.went_valid') {
      const email = (
        data?.user?.email ||
        data?.email ||
        data?.membership?.user?.email ||
        'ardadurek1@gmail.com'
      ).toLowerCase()

      const name =
        data?.user?.name ||
        data?.name ||
        data?.membership?.user?.name ||
        'BurnRate User'

      // Plan tespiti
      const plan = detectPlan(data)
      const licenseKey = generateLicenseKey(plan)

      console.log(`[Webhook] New ${plan} member: ${email} → ${licenseKey}`)

      // Supabase'e kaydet
      await supabaseInsert('users', {
        email,
        license_key: licenseKey,
        name,
        plan,               // 'starter' | 'pro' | 'elite'
        billing: 'monthly', // şimdilik monthly, ilerisi için
        currency: 'USD',
      })

      // Plana özel mail gönder
      const emailResult = await sendWelcomeEmail(email, name, licenseKey, plan)
      console.log('[Webhook] Email result:', emailResult)

      return Response.json({
        success: true,
        plan,
        license_key: licenseKey,
      })
    }

    // membership.went_invalid → plan iptal edildi
    if (action === 'membership.went_invalid') {
      const email = (
        data?.user?.email ||
        data?.email ||
        ''
      ).toLowerCase()

      if (email) {
        console.log(`[Webhook] Membership cancelled: ${email}`)
        // İleride: users tablosunda plan → 'cancelled' yap
      }

      return Response.json({ received: true, action })
    }

    return Response.json({ received: true, action })

  } catch (error) {
    console.error('[Webhook] Error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}