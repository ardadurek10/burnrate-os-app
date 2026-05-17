import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BRNOS-TRL-${seg()}-${seg()}`;
}

async function sendTrialEmail(email, name, licenseKey, lang = 'tr') {
  const subject = lang === 'tr' ? '🔥 7 Günlük Ücretsiz Denemeniz Başladı!' : '🔥 Your 7-Day Free Trial Has Started!';
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#07070f;font-family:sans-serif">
<div style="max-width:520px;margin:0 auto;padding:48px 24px">
  <div style="text-align:center;margin-bottom:40px">
    <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:100px;padding:8px 20px">
      <div style="width:8px;height:8px;background:#7c3aed;border-radius:50%"></div>
      <span style="color:#a09ab8;font-size:13px">BURNRATE OS · DENEME</span>
    </div>
  </div>
  <div style="text-align:center;margin-bottom:40px">
    <h1 style="color:#f1f0ff;font-size:28px;font-weight:700;margin:0 0 12px">${lang === 'tr' ? '7 Günlük Denemeniz Başladı! 🎉' : 'Your 7-Day Trial Has Started! 🎉'}</h1>
    <p style="color:#a09ab8;font-size:16px;margin:0;line-height:1.6">${lang === 'tr' ? 'Pro özelliklerin tamamına 7 gün boyunca ücretsiz erişin.' : 'Get full access to all Pro features for 7 days, free.'}</p>
  </div>
  <div style="background:#0f0f1a;border:1px solid rgba(124,58,237,0.2);border-radius:16px;padding:28px;margin-bottom:28px;text-align:center">
    <p style="color:#5c5680;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px">${lang === 'tr' ? 'Lisans Anahtarınız' : 'Your License Key'}</p>
    <p style="color:#7c3aed;font-size:22px;font-weight:700;font-family:monospace;letter-spacing:3px;margin:0 0 16px">${licenseKey}</p>
    <p style="color:#5c5680;font-size:12px;margin:0">${lang === 'tr' ? 'Güvende tutun · Dashboard erişimi için kullanın' : 'Keep this safe · Used to access your dashboard'}</p>
  </div>
  <p style="color:#a09ab8;font-size:15px;line-height:1.7;margin:0 0 28px">
    ${lang === 'tr' ? `Merhaba ${name}, BurnRate OS Pro'ya hoş geldiniz. 7 günlük deneme süreniz bugün başladı.` : `Hey ${name}, welcome to BurnRate OS Pro. Your 7-day trial starts today.`}
  </p>
  <div style="text-align:center;margin-bottom:40px">
    <a href="https://app.burnrate-os.com/login" style="display:inline-block;background:#7c3aed;color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600">
      ${lang === 'tr' ? "Dashboard'ı Aç →" : 'Open Dashboard →'}
    </a>
  </div>
  <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px 20px;margin-bottom:32px">
    <p style="color:#5c5680;font-size:12px;margin:0 0 8px;text-transform:uppercase">${lang === 'tr' ? 'Giriş Bilgileri' : 'Login Details'}</p>
    <p style="color:#a09ab8;font-size:14px;margin:0">${lang === 'tr' ? 'E-posta:' : 'Email:'} <span style="color:#f1f0ff">${email}</span></p>
    <p style="color:#a09ab8;font-size:14px;margin:4px 0 0">${lang === 'tr' ? 'Lisans Anahtarı:' : 'License Key:'} <span style="color:#7c3aed;font-family:monospace">${licenseKey}</span></p>
  </div>
  <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:28px">
    <p style="color:#3d3a52;font-size:12px;margin:0">BurnRate OS · hello@burnrate-os.com</p>
    <p style="color:#3d3a52;font-size:12px;margin:4px 0 0">
      <a href="https://burnrate-os.com" style="color:#5c5680;text-decoration:none">burnrate-os.com</a>
      · ${lang === 'tr' ? '7 gün ücretsiz · Kart gerekmez' : '7 days free · No credit card required'}
    </p>
  </div>
</div>
</body>
</html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_9LCgbRzr_Nhd5NTWrTx6pv5M3z8VyLjYn',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BurnRate OS <hello@burnrate-os.com>',
      to: email,
      subject,
      html,
    }),
  });
}

export async function POST(req) {
  try {
    const { email, lang } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // Email zaten kayıtlı mı?
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(cleanEmail)}&select=id,is_trial,plan`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const existing = await checkRes.json();

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı.', redirect: '/login' }, { status: 400 });
    }

    // Yeni trial kullanıcısı oluştur
    const licenseKey = generateLicenseKey();
    const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const name = cleanEmail.split('@')[0];

    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: cleanEmail,
        name,
        license_key: licenseKey,
        plan: 'pro',
        is_trial: true,
        trial_expires_at: trialExpires,
        onboarded: false,
      }),
    });

    const newUser = await createRes.json();
    if (!newUser[0]) return NextResponse.json({ error: 'Hesap oluşturulamadı.' }, { status: 500 });

    // Mail gönder
    await sendTrialEmail(cleanEmail, name, licenseKey, lang);

    return NextResponse.json({ success: true, user: newUser[0] });
  } catch (err) {
    console.error('Trial error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
