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
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }

    // Check if user already exists
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`,
      { headers }
    )
    const existing = await checkRes.json()

    if (existing && existing.length > 0) {
      const user = existing[0]

      if (!user.is_trial) {
        return Response.json({
          error: TR ? 'Bu e-posta zaten kayıtlı. Giriş yapın.' : 'This email is already registered. Please sign in.',
          redirect: '/login'
        }, { status: 409 })
      }

      if (user.trial_expires_at && new Date(user.trial_expires_at) > new Date()) {
        return Response.json({ success: true, user })
      }

      return Response.json({
        error: TR ? 'Deneme süreniz doldu. Lütfen bir plan satın alın.' : 'Your trial has expired. Please purchase a plan.',
        redirect: 'https://whop.com/burnrate-os'
      }, { status: 403 })
    }

    // Create trial user
    const trialExpires = new Date()
    trialExpires.setDate(trialExpires.getDate() + 7)

    const rand = () => Math.random().toString(36).substring(2,6).toUpperCase()
    const licenseKey = `BRNOS-TRIAL-${rand()}-${rand()}`
    const userName = cleanEmail.split('@')[0]

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        email: cleanEmail,
        name: userName,
        plan: 'pro',
        billing: 'trial',
        license_key: licenseKey,
        is_trial: true,
        trial_expires_at: trialExpires.toISOString(),
      })
    })

    const newUsers = await insertRes.json()
    if (!insertRes.ok) {
      return Response.json({ error: TR ? 'Hesap oluşturulamadı.' : 'Could not create account.' }, { status: 500 })
    }
    const newUser = Array.isArray(newUsers) ? newUsers[0] : newUsers

    // Send welcome email
    try {
      const expireStr = TR
        ? trialExpires.toLocaleDateString('tr-TR')
        : trialExpires.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

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
            <div style="background:#0a0a0f;color:#f1f0ff;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid rgba(124,58,237,0.3)">
              <img src="https://burnrate-os.com/logo.svg" width="64" height="64" style="border-radius:16px;margin-bottom:16px;display:block" alt="BurnRate OS"/>
              <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px">BurnRate OS</h1>
              <h2 style="font-size:20px;margin-bottom:16px">7 Günlük Ücretsiz Denemeniz Başladı!</h2>
              <p style="color:rgba(255,255,255,0.7);line-height:1.7">Deneme süreniz <strong style="color:#a78bfa">${expireStr}</strong> tarihinde sona erecek.</p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px">LİSANS ANAHTARI</p>
                <p style="margin:8px 0 0;color:#a78bfa;font-size:18px;font-family:monospace;font-weight:700">${licenseKey}</p>
              </div>
              <p style="color:rgba(255,255,255,0.6);font-size:13px">E-posta: <strong>${cleanEmail}</strong></p>
              <a href="https://burnrate-os-app.vercel.app/login" style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:24px">Panele Git →</a>
            </div>
          ` : `
            <div style="background:#0a0a0f;color:#f1f0ff;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid rgba(124,58,237,0.3)">
              <img src="https://burnrate-os.com/logo.svg" width="64" height="64" style="border-radius:16px;margin-bottom:16px;display:block" alt="BurnRate OS"/>
              <h1 style="color:#a78bfa;font-size:28px;margin-bottom:8px">BurnRate OS</h1>
              <h2 style="font-size:20px;margin-bottom:16px">Your 7-Day Free Trial Has Started!</h2>
              <p style="color:rgba(255,255,255,0.7);line-height:1.7">Your trial expires on <strong style="color:#a78bfa">${expireStr}</strong>.</p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px">LICENSE KEY</p>
                <p style="margin:8px 0 0;color:#a78bfa;font-size:18px;font-family:monospace;font-weight:700">${licenseKey}</p>
              </div>
              <p style="color:rgba(255,255,255,0.6);font-size:13px">Email: <strong>${cleanEmail}</strong></p>
              <a href="https://burnrate-os-app.vercel.app/login" style="display:block;background:#7c3aed;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:24px">Go to Dashboard →</a>
            </div>
          `
        })
      })
    } catch (emailErr) {
      console.error('Email error:', emailErr)
    }

    return Response.json({ success: true, user: newUser })

  } catch (error) {
    return Response.json({ error: 'Server error: ' + error.message }, { status: 500 })
  }
}