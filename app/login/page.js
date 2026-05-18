'use client'
import { useState, useEffect } from 'react'
import { supabaseQuery } from '../lib/supabase'

const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif"
const MONO = "'DM Mono',monospace"

const PLAN_META = {
  starter: { name:'Starter', color:'#06b6d4', emoji:'🚀', desc_en:'Overview, Spending, Balance', desc_tr:'Genel Bakış, Harcama, Bakiye' },
  pro:     { name:'Pro',     color:'#7c3aed', emoji:'💜', desc_en:'AI Advisor, Subscriptions, Goals', desc_tr:'Yapay Zeka, Abonelikler, Hedefler' },
  elite:   { name:'Elite',   color:'#f59e0b', emoji:'⚡', desc_en:'Investments, Summary, Priority Support', desc_tr:'Yatırımlar, Özet, Öncelikli Destek' },
}

function FlameLogo({ size=40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lf" x1="0.2" y1="1" x2="0.2" y2="0">
          <stop offset="0%" stopColor="#ef4444"/><stop offset="40%" stopColor="#f59e0b"/>
          <stop offset="85%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#c4b5fd"/>
        </linearGradient>
        <linearGradient id="lb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111120"/><stop offset="100%" stopColor="#0a0a0f"/>
        </linearGradient>
        <linearGradient id="lbd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
        <clipPath id="lsq"><rect x="0" y="0" width="100" height="100" rx="22"/></clipPath>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#lb)"/>
      <rect x="0" y="0" width="100" height="100" rx="22" fill="none" stroke="url(#lbd)" strokeWidth="1.5"/>
      <g clipPath="url(#lsq)" opacity="0.12">
        <line x1="0" y1="25" x2="100" y2="25" stroke="#7c3aed" strokeWidth="0.8"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#7c3aed" strokeWidth="0.8"/>
        <line x1="0" y1="75" x2="100" y2="75" stroke="#7c3aed" strokeWidth="0.8"/>
        <line x1="25" y1="0" x2="25" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
        <line x1="50" y1="0" x2="50" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
        <line x1="75" y1="0" x2="75" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
      </g>
      <path d="M50 88 C32 88 18 76 19 62 C20 52 28 46 27 36 C27 27 22 20 20 12 C32 20 37 31 36 42 C42 30 44 14 39 2 C54 14 58 32 55 48 C61 36 63 18 58 4 C74 20 77 44 71 60 C77 48 79 32 74 18 C88 36 90 60 82 74 C80 62 80 48 76 36 C86 52 85 74 76 84 C68 90 58 88 50 88Z" fill="url(#lf)"/>
      <path d="M50 80 C36 80 28 70 29 60 C30 52 36 47 35 38 C35 30 32 24 30 17 C40 25 43 35 41 45 C47 35 48 22 44 12 C56 22 58 38 54 52 C59 42 60 28 56 18 C66 32 67 50 62 62 C66 54 67 42 63 34 C70 46 69 62 63 72 C57 80 50 80 50 80Z" fill="#fff" opacity="0.07"/>
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode]             = useState('login') // 'login' | 'trial'
  const [email, setEmail]           = useState('')
  const [trialEmail, setTrialEmail] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [userData, setUserData]     = useState(null)
  const [trialDone, setTrialDone]   = useState(false)
  const [lang, setLang]             = useState('tr')
  useEffect(() => {
  const saved = localStorage.getItem('burnrate_lang')
  if (saved) setLang(saved)
  const params = new URLSearchParams(window.location.search)
  if (params.get('mode') === 'trial') setMode('trial')
  
  // V2.1 geliştirme modu — erişim kodu kontrolü
  const accessGranted = localStorage.getItem('burnrate_access')
  if (accessGranted !== 'ardadurek10') {
    const code = prompt('Erişim kodu:')
    if (code !== 'ardadurek10') {
      window.location.href = 'https://burnrate-os.com'
    } else {
      localStorage.setItem('burnrate_access', 'ardadurek10')
    }
  }
}, [])
  const TR = lang === 'tr'

  function changeLang(l) {
    setLang(l)
    if (typeof window !== 'undefined') localStorage.setItem('burnrate_lang', l)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await supabaseQuery('users', {
        email: email.toLowerCase().trim(),
        license_key: licenseKey.trim()
      })
      if (!data || data.length === 0) {
        setError(TR ? 'Geçersiz e-posta veya lisans anahtarı.' : 'Invalid email or license key.')
        setLoading(false); return
      }
      const user = data[0]

      // Check if trial expired
      if (user.is_trial && user.trial_expires_at) {
  const expires = new Date(user.trial_expires_at)
  if (expires < new Date()) {
    localStorage.setItem('burnrate_user', JSON.stringify(user))
    window.location.href = '/checkout?plan=pro&trial_expired=true'
    return
  }
}

      localStorage.setItem('burnrate_user', JSON.stringify(user))
      setUserData(user); setSuccess(true)
      setTimeout(() => { window.location.replace(window.location.origin + '/dashboard') }, 1800)
    } catch {
      setError(TR ? 'Bağlantı hatası.' : 'Connection error.')
      setLoading(false)
    }
  }

  async function handleTrial(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trialEmail, lang })
      })
      const data = await res.json()

      if (data.error) {
        if (data.redirect === '/login') {
          setError(TR ? 'Bu e-posta zaten kayıtlı. Giriş yapın.' : 'Email already registered. Sign in instead.')
          setMode('login'); setEmail(trialEmail)
        } else {
          setError(data.error)
        }
        setLoading(false); return
      }

      if (data.success) {
        // Auto login
        const user = data.user
        localStorage.setItem('burnrate_user', JSON.stringify(user))
        setUserData(user); setTrialDone(true)
        setTimeout(() => { window.location.replace(window.location.origin + '/dashboard') }, 2200)
      }
    } catch {
      setError(TR ? 'Bağlantı hatası.' : 'Connection error.')
      setLoading(false)
    }
  }

  const plan = userData?.plan || 'pro'
  const planMeta = PLAN_META[plan] || PLAN_META.pro

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:FONT,position:'relative',overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input::placeholder{color:rgba(255,255,255,0.2)}
        input:focus{border-color:rgba(124,58,237,0.5)!important;box-shadow:0 0 0 3px rgba(124,58,237,0.1)}
      `}</style>

      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.04) 1px,transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}></div>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.08) 0%,transparent 60%)',pointerEvents:'none'}}></div>

      {/* LANG TOGGLE */}
      <div style={{position:'fixed',top:'20px',right:'20px',display:'flex',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'8px',overflow:'hidden',zIndex:10}}>
        {['en','tr'].map(l=>(
          <button key={l} onClick={()=>changeLang(l)}
            style={{padding:'6px 14px',fontSize:'12px',fontFamily:MONO,fontWeight:500,color:lang===l?'#fff':'rgba(255,255,255,0.35)',background:lang===l?'#7c3aed':'transparent',border:'none',cursor:'pointer',transition:'all 0.2s'}}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{width:'100%',maxWidth:'420px',position:'relative',zIndex:1}}>

        {/* LOGO */}
        <div style={{textAlign:'center',marginBottom:'32px',animation:'fadeUp 0.6s ease both'}}>
          <a href="https://burnrate-os.com" style={{textDecoration:'none'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
              <FlameLogo size={44} />
              <div style={{textAlign:'left'}}>
                <div style={{color:'#f5f5f7',fontSize:'18px',fontWeight:700,letterSpacing:'-0.3px',fontFamily:FONT}}>BurnRate OS</div>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>{TR?'komuta merkezi':'command center'}</div>
              </div>
            </div>
          </a>
        </div>

        {/* SUCCESS STATE - Login */}
        {success && (
          <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${planMeta.color}44`,borderRadius:'20px',padding:'36px',textAlign:'center',animation:'scaleIn 0.4s ease'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>{planMeta.emoji}</div>
            <div style={{fontFamily:MONO,fontSize:'11px',color:planMeta.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px'}}>{planMeta.name} {userData?.is_trial?(TR?'Deneme':'Trial'):''}</div>
            <h2 style={{color:'#f1f0ff',fontSize:'22px',fontWeight:700,margin:'0 0 8px',fontFamily:FONT}}>{TR?'Hoş geldiniz! 👋':'Welcome back! 👋'}</h2>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT,marginTop:'20px'}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${planMeta.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
              {TR?'Panele yönlendiriliyorsunuz...':'Redirecting to dashboard...'}
            </div>
          </div>
        )}

        {/* SUCCESS STATE - Trial */}
        {trialDone && (
          <div style={{background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.3)',borderRadius:'20px',padding:'36px',textAlign:'center',animation:'scaleIn 0.4s ease'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>🎉</div>
            <h2 style={{color:'#f1f0ff',fontSize:'22px',fontWeight:700,margin:'0 0 12px',fontFamily:FONT}}>{TR?'Denemeniz Başladı!':'Trial Started!'}</h2>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'14px',margin:'0 0 8px',fontFamily:FONT}}>{TR?'7 günlük ücretsiz Pro erişimi aktif.':'7-day free Pro access activated.'}</p>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',margin:'0 0 24px',fontFamily:FONT}}>{TR?'Lisans anahtarı e-postanıza gönderildi.':'License key sent to your email.'}</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',border:'2px solid #7c3aed',borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
              {TR?'Panele yönlendiriliyorsunuz...':'Redirecting to dashboard...'}
            </div>
          </div>
        )}

        {/* MAIN FORM */}
        {!success && !trialDone && (
          <>
            {/* MODE TABS */}
            <div style={{display:'flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'4px',marginBottom:'24px',animation:'fadeUp 0.6s 0.05s ease both'}}>
              <button onClick={()=>{setMode('trial');setError('')}}
                style={{flex:1,padding:'10px',borderRadius:'9px',fontSize:'13px',fontWeight:600,background:mode==='trial'?'linear-gradient(135deg,#7c3aed,#4c1d95)':'transparent',color:mode==='trial'?'#fff':'rgba(255,255,255,0.4)',border:'none',cursor:'pointer',transition:'all 0.2s',fontFamily:FONT}}>
                {TR?'🎁 Ücretsiz Dene':'🎁 Free Trial'}
              </button>
              <button onClick={()=>{setMode('login');setError('')}}
                style={{flex:1,padding:'10px',borderRadius:'9px',fontSize:'13px',fontWeight:500,background:mode==='login'?'rgba(255,255,255,0.08)':'transparent',color:mode==='login'?'#f5f5f7':'rgba(255,255,255,0.4)',border:'none',cursor:'pointer',transition:'all 0.2s',fontFamily:FONT}}>
                {TR?'Giriş Yap':'Sign In'}
              </button>
            </div>

            {/* TRIAL MODE */}
            {mode==='trial' && (
              <div style={{animation:'fadeUp 0.3s ease both'}}>
                {/* Trial badge */}
                <div style={{display:'flex',alignItems:'center',gap:'10px',background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:'12px',padding:'14px 16px',marginBottom:'20px'}}>
                  <span style={{fontSize:'20px'}}>🎁</span>
                  <div>
                    <div style={{color:'#c4b5fd',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{TR?'7 Gün Ücretsiz — Kart Gerekmez':'7 Days Free — No Credit Card'}</div>
                    <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',fontFamily:FONT,marginTop:'2px'}}>{TR?'Pro özelliklerin tamamına erişim':'Full access to all Pro features'}</div>
                  </div>
                </div>

                {error && (
                  <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'12px 16px',marginBottom:'16px',color:'#fca5a5',fontSize:'13px',fontFamily:FONT,display:'flex',gap:'8px'}}>
                    <span>⚠️</span><span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleTrial}>
                  <div style={{marginBottom:'20px'}}>
                    <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{TR?'E-Posta Adresiniz':'Your Email Address'}</label>
                    <input type="email" value={trialEmail} onChange={e=>setTrialEmail(e.target.value)} placeholder={TR?'ornek@email.com':'you@example.com'} required
                      style={{width:'100%',padding:'13px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',fontFamily:FONT,transition:'all 0.2s'}}/>
                    <p style={{color:'rgba(255,255,255,0.25)',fontSize:'11px',margin:'8px 0 0',fontFamily:FONT}}>{TR?'Lisans anahtarı bu adrese gönderilecek.':'License key will be sent to this address.'}</p>
                  </div>
                  <button type="submit" disabled={loading}
                    style={{width:'100%',padding:'15px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',fontSize:'15px',fontWeight:700,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,fontFamily:FONT,boxShadow:'0 0 40px rgba(124,58,237,0.35)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    {loading?(<><div style={{width:'16px',height:'16px',borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite'}}></div>{TR?'Hesap oluşturuluyor...':'Creating account...'}</>):(TR?'7 Günlük Denemeyi Başlat →':'Start 7-Day Free Trial →')}
                  </button>
                </form>

                <div style={{display:'flex',gap:'16px',marginTop:'16px',justifyContent:'center'}}>
                  {[TR?'✓ Kart gerekmez':'✓ No credit card',TR?'✓ Anında erişim':'✓ Instant access',TR?'✓ İstediğin zaman iptal':'✓ Cancel anytime'].map((item,i)=>(
                    <span key={i} style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontFamily:FONT}}>{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* LOGIN MODE */}
            {mode==='login' && (
              <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'28px',animation:'fadeUp 0.3s ease both',backdropFilter:'blur(10px)'}}>
                {error && (
                  <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'12px 16px',marginBottom:'16px',color:'#fca5a5',fontSize:'13px',fontFamily:FONT,display:'flex',gap:'8px'}}>
                    <span>⚠️</span><span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleLogin}>
                  <div style={{marginBottom:'14px'}}>
                    <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{TR?'E-Posta':'Email'}</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={TR?'ornek@email.com':'you@example.com'} required
                      style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',fontFamily:FONT,transition:'all 0.2s'}}/>
                  </div>
                  <div style={{marginBottom:'20px'}}>
                    <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>{TR?'Lisans Anahtarı':'License Key'}</label>
                    <input type="text" value={licenseKey} onChange={e=>{const raw=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"");const parts=[raw.slice(0,5),raw.slice(5,8),raw.slice(8,12),raw.slice(12,16)].filter(Boolean);setLicenseKey(parts.join("-"))}} placeholder="BRNOS-XXX-XXXX-XXXX" required
                      style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#a78bfa',fontSize:'14px',outline:'none',fontFamily:MONO,letterSpacing:'1px',transition:'all 0.2s'}}/>
                  </div>
                  <button type="submit" disabled={loading}
                    style={{width:'100%',padding:'13px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',fontSize:'15px',fontWeight:600,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,fontFamily:FONT,boxShadow:'0 0 30px rgba(124,58,237,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                    {loading?(<><div style={{width:'16px',height:'16px',borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite'}}></div>{TR?'Giriş yapılıyor...':'Signing in...'}</>):(TR?'Panele Giriş →':'Access Dashboard →')}
                  </button>
                </form>
                <div style={{marginTop:'16px',padding:'12px',borderRadius:'10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',textAlign:'center'}}>
                  <p style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',margin:0,lineHeight:'1.6',fontFamily:FONT}}>
                    {TR?'Lisans anahtarı satın alma sonrası e-posta ile gönderildi.':'License key was emailed after purchase.'}
                  </p>
                  <a href='mailto:hello@burnrate-os.com?subject=License%20Key%20Help' style={{display:'inline-block',marginTop:'8px',color:'rgba(124,58,237,0.7)',fontSize:'12px',fontFamily:FONT,textDecoration:'none'}}>{TR?'🔑 Anahtarımı kaybettim →':'🔑 Lost my key →'}</a>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{textAlign:'center',marginTop:'24px',animation:'fadeUp 0.6s 0.2s ease both'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'12px'}}>
            <a href="https://burnrate-os.com" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>
              {TR?'← Siteye dön':'← Back to site'}
            </a>
            <span style={{color:'rgba(255,255,255,0.08)'}}>·</span>
           <a href="https://burnrate-os.com/#pricing" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>
              {TR?'Plan satın al →':'Get a plan →'}
            </a>
          </div>
          <p style={{color:'rgba(255,255,255,0.08)',fontSize:'11px',margin:0,fontFamily:MONO}}>burnrate-os.com · Stop the leak.</p>
        </div>

      </div>
    </div>
  )
}
