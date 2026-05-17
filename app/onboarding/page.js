'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'
const FONT = "'DM Sans',-apple-system,sans-serif"
const MONO = "'DM Mono',monospace"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ name: '', profession: '', monthly_income: '' })
  const [saving, setSaving] = useState(false)
  const [lang, setLang] = useState('tr')

  useEffect(() => {
    const u = localStorage.getItem('burnrate_user')
    if (!u) { window.location.href = '/login'; return }
    const parsed = JSON.parse(u)
    if (parsed.onboarded) { window.location.href = '/dashboard'; return }
    setUser(parsed)
    setForm(f => ({ ...f, name: parsed.name || '' }))
    const l = localStorage.getItem('burnrate_lang') || 'tr'
    setLang(l)
  }, [])

  async function finish() {
    if (!form.name || !form.profession) return
    setSaving(true)
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ name: form.name, profession: form.profession, monthly_income: parseFloat(form.monthly_income) || null, onboarded: true })
    })
    const updated = { ...user, name: form.name, onboarded: true }
    localStorage.setItem('burnrate_user', JSON.stringify(updated))
    window.location.href = '/dashboard'
  }

  const professions = lang === 'tr'
    ? ['Freelancer', 'Öğrenci', 'Girişimci', 'Çalışan', 'Serbest Meslek', 'Diğer']
    : ['Freelancer', 'Student', 'Entrepreneur', 'Employee', 'Self-employed', 'Other']

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.5s ease' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 12px #7c3aed' }} />
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>BurnRate OS</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 36 }}>
          
          {/* Steps */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? '#7c3aed' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
            ))}
          </div>

          {step === 1 && (
            <>
              <h2 style={{ color: '#f1f0ff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {lang === 'tr' ? '👋 Hoş geldiniz!' : '👋 Welcome!'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                {lang === 'tr' ? 'Sizi tanıyalım. Adınız nedir?' : "Let's get to know you. What's your name?"}
              </p>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  {lang === 'tr' ? 'Ad Soyad' : 'Full Name'}
                </div>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={lang === 'tr' ? 'Adınızı girin...' : 'Enter your name...'}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 14, outline: 'none', fontFamily: FONT }} />
              </div>
              <button onClick={() => form.name && setStep(2)} disabled={!form.name}
                style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, background: form.name ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(255,255,255,0.05)', color: form.name ? '#fff' : 'rgba(255,255,255,0.2)', border: 'none', cursor: form.name ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
                {lang === 'tr' ? 'Devam →' : 'Continue →'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ color: '#f1f0ff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {lang === 'tr' ? '💼 Ne iş yapıyorsunuz?' : '💼 What do you do?'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28 }}>
                {lang === 'tr' ? 'Yapay zeka danışmanı size daha iyi tavsiyeler verebilsin.' : 'This helps our AI advisor give you better advice.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {professions.map(p => (
                  <button key={p} onClick={() => setForm({ ...form, profession: p })}
                    style={{ padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: form.profession === p ? 600 : 400, background: form.profession === p ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', color: form.profession === p ? '#c4b5fd' : 'rgba(255,255,255,0.5)', border: form.profession === p ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: MONO, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  {lang === 'tr' ? 'Aylık Gelir Hedefi (₺) — İsteğe bağlı' : 'Monthly Income Target (₺) — Optional'}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>₺</span>
                  <input type="number" value={form.monthly_income} onChange={e => setForm({ ...form, monthly_income: e.target.value })}
                    placeholder="0"
                    style={{ width: '100%', padding: '12px 16px 12px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 14, outline: 'none', fontFamily: MONO }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)}
                  style={{ padding: '14px 20px', borderRadius: 12, fontSize: 14, background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: FONT }}>
                  ←
                </button>
                <button onClick={finish} disabled={!form.profession || saving}
                  style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, background: form.profession ? 'linear-gradient(135deg,#7c3aed,#4c1d95)' : 'rgba(255,255,255,0.05)', color: form.profession ? '#fff' : 'rgba(255,255,255,0.2)', border: 'none', cursor: form.profession ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
                  {saving ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (lang === 'tr' ? '🚀 Dashboard\'a Gir' : '🚀 Enter Dashboard')}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: FONT }}>
          {lang === 'tr' ? 'Bu bilgileri daha sonra ayarlardan değiştirebilirsiniz.' : 'You can change this later in settings.'}
        </p>
      </div>
    </div>
  )
}
