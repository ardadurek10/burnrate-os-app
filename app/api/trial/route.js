import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { email, lang } = await request.json()
    const TR = lang === 'tr'

    if (!email || !email.includes('@')) {
      return Response.json({
        error: TR ? 'Geçerli bir e-posta adresi girin.' : 'Please enter a valid email address.'
      }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .single()

    if (existing) {
      // Already has a paid plan
      if (!existing.is_trial) {
        return Response.json({
          error: TR
            ? 'Bu e-posta zaten kayıtlı. Giriş yapın.'
            : 'This email is already registered. Please sign in.',
          redirect: '/login'
        }, { status: 409 })
      }

      // Trial still active
      if (existing.trial_expires_at && new Date(existing.trial_expires_at) > new Date()) {
        return Response.json({
          success: true,
          user: existing,
          message: TR ? 'Deneme hesabınız aktif.' : 'Your trial is still active.'
        })
      }

      // Trial expired
      return Response.json({
        error: TR
          ? 'Deneme süreniz doldu. Lütfen bir plan satın alın.'
          : 'Your trial has expired. Please purchase a plan.',
        redirect: 'https://whop.com/burnrate-os'
      }, { status: 403 })
    }

    // Create trial user
    const trialExpires = new Date()
    trialExpires.setDate(trialExpires.getDate() + 7)

    const licenseKey = `BRNOS-TRIAL-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        plan: 'pro',
        billing: 'trial',
        license_key: licenseKey,
        is_trial: true,
        trial_expires_at: trialExpires.toISOString(),
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return Response.json({
        error: TR ? 'Hesap oluşturulamadı.' : 'Could not create account.'
      }, { status: 500 })
    }

    // Send welcome email via Resend
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'BurnRate OS <hello@burnrate-os.com>',
          to: cleanEmail,
          subject: TR ? '🔥 7 Günlük Ücretsiz Denemeniz Başladı!' : '🔥 Your 7-Day Free Trial Has Started!',
          html: TR ? `
            <div style="background:#0a0a0f;color:#f1f0ff;font-family:'DM Sans',sans-serif;padding:40px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid rgba(124,58,237,0.3)">
              <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px">🔥 BurnRate OS</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:32px">Finansal Komuta Merkeziniz</p>
              <h2 style="font-size:22px;margin-bottom:16px">7 Günlük Ücretsiz Denemeniz Başladı!</h2>
              <p style="color:rgba(255,255,255,0.7);line-height:1.7">Merhaba! BurnRate OS Pro'ya 7 günlük ücretsiz erişiminiz başladı. Deneme süreniz <strong style="color:#a78bfa">${trialExpires.toLocaleDateString('tr-TR')}</strong> tarihinde sona erecek.</p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;letter-spacing:1px">LİSANS ANAHTARI</p>
                <p style="margin:8px 0 0;color:#a78bfa;font-size:18px;font-family:monospace;font-weight:700">${licenseKey}</p>
              </div>
              <p style="color:rgba(255,255,255,0.6);font-size:13px">Bu anahtar ile <a href="https://burnrate-os-app.vercel.app/login" style="color:#a78bfa">burnrate-os-app.vercel.app/login</a> adresinden giriş yapabilirsiniz.</p>
              <a href="https://burnrate-os-app.vercel.app/login" style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:24px">Panele Git →</a>
            </div>
          ` : `
            <div style="background:#0a0a0f;color:#f1f0ff;font-family:'DM Sans',sans-serif;padding:40px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid rgba(124,58,237,0.3)">
              <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px">🔥 BurnRate OS</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:32px">Financial Command Center</p>
              <h2 style="font-size:22px;margin-bottom:16px">Your 7-Day Free Trial Has Started!</h2>
              <p style="color:rgba(255,255,255,0.7);line-height:1.7">Welcome! Your free access to BurnRate OS Pro has begun. Your trial expires on <strong style="color:#a78bfa">${trialExpires.toLocaleDateString('en-US', {month:'long',day:'numeric',year:'numeric'})}</strong>.</p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;letter-spacing:1px">LICENSE KEY</p>
                <p style="margin:8px 0 0;color:#a78bfa;font-size:18px;font-family:monospace;font-weight:700">${licenseKey}</p>
              </div>
              <p style="color:rgba(255,255,255,0.6);font-size:13px">Use this key to sign in at <a href="https://burnrate-os-app.vercel.app/login" style="color:#a78bfa">burnrate-os-app.vercel.app/login</a></p>
              <a href="https://burnrate-os-app.vercel.app/login" style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:24px">Go to Dashboard →</a>
            </div>
          `
        })
      })
    } catch (emailErr) {
      console.error('Email error:', emailErr)
      // Don't fail if email fails
    }

    return Response.json({ success: true, user: newUser })

  } catch (error) {
    return Response.json({ reply: 'Server error: ' + error.message }, { status: 500 })
  }
}