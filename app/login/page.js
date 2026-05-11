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

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [loggedIn, setLoggedIn]   = useState(false)
  const [userData, setUserData]   = useState(null)

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

      // Plan göster, sonra yönlendir
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
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      `}</style>

      {/* BACKGROUND GRID */}
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',backgroundSize:'60px 60px',pointerEvents:'none'}}></div>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',pointerEvents:'none'}}></div>

      <div style={{width:'100%',maxWidth:'420px',position:'relative',zIndex:1}}>

        {/* LOGO */}
        <div style={{textAlign:'center',marginBottom:'36px',animation:'fadeUp 0.6s ease both'}}>
          <a href="https://burnrate-os.com" style={{textDecoration:'none'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
              <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',boxShadow:'0 0 30px rgba(124,58,237,0.4)'}}>🔥</div>
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
            <div style={{fontFamily:MONO,fontSize:'11px',color:planMeta.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px'}}>
              {planMeta.name} Plan
            </div>
            <h2 style={{color:'#f1f0ff',fontSize:'22px',fontWeight:700,margin:'0 0 8px',letterSpacing:'-0.03em',fontFamily:FONT}}>
              Welcome back! 👋
            </h2>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',margin:'0 0 24px',fontFamily:FONT,fontWeight:300}}>
              {planMeta.desc}
            </p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${planMeta.color}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
              Redirecting to dashboard...
            </div>
          </div>
        ) : (
          /* LOGIN FORM */
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'32px',animation:'fadeUp 0.6s 0.1s ease both',backdropFilter:'blur(10px)'}}>

            {error && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'12px',padding:'12px 16px',marginBottom:'20px',color:'#fca5a5',fontSize:'13px',fontFamily:FONT,display:'flex',gap:'10px',alignItems:'flex-start'}}>
                <span style={{flexShrink:0}}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* EMAIL */}
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',fontFamily:FONT,transition:'border-color 0.2s, box-shadow 0.2s'}}
                />
              </div>

              {/* LICENSE KEY */}
              <div style={{marginBottom:'24px'}}>
                <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>
                  License Key
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="BRNOS-XXX-XXXX-XXXX"
                  required
                  style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#a78bfa',fontSize:'14px',outline:'none',fontFamily:MONO,letterSpacing:'1px',transition:'border-color 0.2s, box-shadow 0.2s'}}
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',fontSize:'15px',fontWeight:600,border:'none',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,transition:'all 0.2s',fontFamily:FONT,boxShadow:'0 0 40px rgba(124,58,237,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
                {loading ? (
                  <>
                    <div style={{width:'16px',height:'16px',borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite'}}></div>
                    Signing in...
                  </>
                ) : 'Access Dashboard →'}
              </button>
            </form>

            {/* HINT */}
            <div style={{marginTop:'20px',padding:'14px',borderRadius:'10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
              <p style={{textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:'12px',margin:0,lineHeight:'1.6',fontFamily:FONT}}>
                Your license key was emailed after purchase.<br/>
                Check spam if you can't find it.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{textAlign:'center',marginTop:'28px',animation:'fadeUp 0.6s 0.2s ease both'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'14px'}}>
            <a href="https://burnrate-os.com" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT,transition:'color 0.2s'}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>
              ← Back to site
            </a>
            <span style={{color:'rgba(255,255,255,0.08)'}}>·</span>
            <a href="https://whop.com/burnrate-os" style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',textDecoration:'none',fontFamily:FONT,transition:'color 0.2s'}}
              onMouseEnter={e=>e.target.style.color='rgba(255,255,255,0.5)'}
              onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.2)'}>
              Get access →
            </a>
          </div>
          <p style={{color:'rgba(255,255,255,0.1)',fontSize:'11px',margin:0,fontFamily:MONO}}>
            burnrate-os.com · Stop the leak.
          </p>
        </div>

      </div>
    </div>
  )
}