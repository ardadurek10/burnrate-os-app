'use client'
import { useState } from 'react'
import { supabaseQuery } from '../lib/supabase'

const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif"
const MONO = "'DM Mono',monospace"

const PLAN_META = {
  starter: { name: 'Starter', color: '#06b6d4', emoji: '🚀', desc: 'Overview, Spending, Balance' },
  pro:     { name: 'Pro',     color: '#7c3aed', emoji: '💜', desc: 'AI Advisor, Subscriptions, Goals' },
  elite:   { name: 'Elite',   color: '#f59e0b', emoji: '⚡', desc: 'Investments, Summary, Priority Support' },
}

function FlameLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lf" x1="0.2" y1="1" x2="0.2" y2="0">
          <stop offset="0%" stopColor="#ef4444"/>
          <stop offset="40%" stopColor="#f59e0b"/>
          <stop offset="85%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#c4b5fd"/>
        </linearGradient>
        <linearGradient id="lb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#111120"/>
          <stop offset="100%" stopColor="#0a0a0f"/>
        </linearGradient>
        <linearGradient id="lbd" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
        <clipPath id="lsq">
          <rect x="0" y="0" width="100" height="100" rx="22"/>
        </clipPath>
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
  const [email, setEmail]           = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [loggedIn, setLoggedIn]     = useState(false)
  const [userData, setUserData]     = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await supabaseQuery('users', {
        email: email.toLowerCase().trim(),
        license_key: licenseKey.trim()
      })
      if (!data || data.length === 0) {
        setError('Invalid email or license key. Check your purchase confirmation email.')
        setLoading(false)
        return
      }
      const user = data[0]
      localStorage.setItem('burnrate_user', JSON.stringify(user))
      setUserData(user)
      setLoggedIn(true)
      setTimeout(() => {
        window.location.replace(window.location.origin + '/dashboard')
      }, 1800)
    } catch(err) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const plan = userData?.plan || 'starter'
  const planMeta = PLAN_META[plan] || PLAN_META.starter

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:FONT,position:'relative',overflow:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      `}</style>

      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}></div>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',pointerEvents:'none'}}></div>

      <div style={{width:'100%',maxWidth:'420px',position:'relative',zIndex:1}}>

        {/* LOGO */}
        <div style={{textAlign:'center',marginBottom:'36px',animation:'fadeUp 0.6s ease both'}}>
          <a href="https://burnrate-os.com" style={{textDecoration:'none'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
              <FlameLogo size={44} />
              <div style={{textAlign:'left'}}>
                <div style={{color:'#f5f5f7',fontSize:'18px',fontWeight:700,letterSpacing:'-0.3px',fontFamily:FONT}}>BurnRate OS</div>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>command center</div>
              </div>
            </div>
          </a>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',margin:0,fontWeight:300}}>Sign in to your financial command center</p>
        </div>

        {/* SUCCESS STATE */}
        {loggedIn ? (
          <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${planMeta.color}44`,borderRadius:'20px',padding:'36px',textAlign:'center',animation:'scaleIn 0.4s ease'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>{planMeta.emoji}</div>
            <div style={{fontFamily:MONO,fontSize:'11px',color:planMeta.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px'}}>{planMeta.name} Plan</div>
            <h2 style={{color:'#f1f0ff',fontSize:'22px',fontWeight:700,margin:'0 0 8px',letterSpacing:'-0.03em',fontFamily:FONT}}>Welcome back! 👋</h2>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',margin:'0 0 24px',fontFamily:FONT,fontWeight:300}}>{planMeta.desc}</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${planMeta.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
              Redirecting to dashboard...
            </div>
          </div>
        ) : (
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'32px',animation:'fadeUp 0.6s 0.1s ease both',backdropFilter:'blur(10px)'}}>
            {error && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'12px 16px',marginBottom:'20px',color:'#fca5a5',fontSize:'13px',fontFamily:FONT,display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <span style={{flexShrink:0}}>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Email Address</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
                  style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',fontFamily:FONT,transition:'border-color 0.2s, box-shadow 0.2s'}}/>
              </div>
              <div style={{marginBottom:'24px'}}>
                <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>License Key</label>
                <input type="text" value={licenseKey} onChange={e=>setLicenseKey(e.target.value.toUpperCase())} placeholder="BRNOS-XXX-XXXX-XXXX" required
                  style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#a78bfa',fontSize:'14px',outline:'none',fontFamily:MONO,letterSpacing:'1px',transition:'border-color 0.2s, box-shadow 0.2s'}}/>
              </div>
              <button type="submit" disabled={loading}
                style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',fontSize:'15px',fontWeight:600,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 0.2s',fontFamily:FONT,boxShadow:'0 0 40px rgba(124,58,237,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                {loading ? (<><div style={{width:'16px',height:'16px',borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite'}}></div>Signing in...</>) : 'Access Dashboard →'}
              </button>
            </form>
            <div style={{marginTop:'20px',padding:'14px',borderRadius:'10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
              <p style={{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:'12px',margin:0,lineHeight:'1.6',fontFamily:FONT}}>
                Your license key was emailed after purchase.<br/>Check spam if you can't find it.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{textAlign:'center',marginTop:'28px',animation:'fadeUp 0.6s 0.2s ease both'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'14px'}}>
            <a href="https://burnrate-os.com" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>← Back to site</a>
            <span style={{color:'rgba(255,255,255,0.08)'}}>·</span>
            <a href="https://whop.com/burnrate-os" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>Get access →</a>
          </div>
          <p style={{color:'rgba(255,255,255,0.1)',fontSize:'11px',margin:0,fontFamily:MONO}}>burnrate-os.com · Stop the leak.</p>
        </div>

      </div>
    </div>
  )
}