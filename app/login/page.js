'use client'
import { useState } from 'react'
import { supabaseQuery } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        setError('Invalid email or license key. Please check your purchase confirmation.')
        setLoading(false)
        return
      }

      localStorage.setItem('burnrate_user', JSON.stringify(data[0]))
      window.location.replace(window.location.origin + '/dashboard')

    } catch(err) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:'SF Pro Display,-apple-system,BlinkMacSystemFont,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>

        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px',margin:'0 auto 20px'}}>🔥</div>
          <h1 style={{color:'#f5f5f7',fontSize:'26px',fontWeight:600,letterSpacing:'-0.5px',margin:'0 0 8px'}}>BurnRate OS</h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',margin:0}}>Sign in to your financial command center</p>
        </div>

        <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'20px',padding:'32px'}}>

          {error && (
            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',color:'#fca5a5',fontSize:'13px'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:'SF Mono,monospace',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              />
            </div>

            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:'SF Mono,monospace',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>License Key</label>
              <input
                type="text"
                value={licenseKey}
                onChange={e => setLicenseKey(e.target.value)}
                placeholder="BRNOS-XXXX-XXXX-XXXX"
                required
                style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{width:'100%',padding:'13px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',fontSize:'14px',fontWeight:600,border:'none',cursor:'pointer',opacity:loading?0.6:1,transition:'opacity 0.2s'}}>
              {loading ? 'Signing in...' : 'Access Dashboard →'}
            </button>
          </form>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:'12px',marginTop:'20px',lineHeight:'1.5'}}>
            Your license key was sent to your email after purchase.<br/>
            Check your spam folder if you can't find it.
          </p>
        </div>

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.15)',fontSize:'11px',marginTop:'24px',fontFamily:'SF Mono,monospace'}}>
          BurnRate OS · Stop the leak.
        </p>
      </div>
    </div>
  )
}