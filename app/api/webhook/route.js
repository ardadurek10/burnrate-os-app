import { supabaseInsert } from '../../lib/supabase'

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `BRNOS-${segment()}-${segment()}-${segment()}`
}

async function sendWelcomeEmail(email, name, licenseKey) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_9LCgbRzr_Nhd5NTWrTx6pv5M3z8VyLjYn',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'BurnRate OS <onboarding@resend.dev>',
      to: 'ardadurek1@gmail.com',
      subject: '🔥 BurnRate OS — Lisans Anahtarın Hazır!',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;background:#08080e;color:#f0f0f8">
          <div style="text-align:center;margin-bottom:32px">
            <div style="width:60px;height:60px;background:#7c5cfc;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:28px">🔥</div>
            <h1 style="color:#f0f0f8;margin-top:16px">BurnRate OS</h1>
          </div>
          <p style="color:#8888aa">Merhaba ${name},</p>
          <p style="color:#8888aa">Satın aldığın için teşekkürler! Finansal komuta merkezin hazır.</p>
          <div style="background:#111118;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin:24px 0;text-align:center">
            <p style="color:#8888aa;font-size:12px;margin-bottom:8px">LİSANS ANAHTARIN</p>
            <p style="color:#7c5cfc;font-size:24px;font-weight:bold;font-family:monospace;letter-spacing:2px">${licenseKey}</p>
          </div>
          <div style="text-align:center;margin:32px 0">
            <a href="https://burnrate-os-app.vercel.app/login" style="background:#7c5cfc;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold">Panele Gir →</a>
          </div>
          <p style="color:#55556a;font-size:12px;text-align:center">E-posta: ${email} · BurnRate OS</p>
        </div>
      `
    })
  })
  return res.json()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'membership.went_valid') {
      const email = data?.user?.email || data?.email || 'test@whoptest.com'
      const name = data?.user?.name || data?.name || 'BurnRate Kullanıcısı'

      const licenseKey = generateLicenseKey()

      await supabaseInsert('users', {
        email: email.toLowerCase(),
        license_key: licenseKey,
        name: name,
        currency: 'USD'
      })

      await sendWelcomeEmail(email, name, licenseKey)

      return Response.json({ success: true, license_key: licenseKey })
    }

    return Response.json({ received: true })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}