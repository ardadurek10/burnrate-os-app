'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

const PLAN_NAMES = { starter: 'Starter', pro: 'Pro', elite: 'Elite' };
const PLAN_PRICES = { starter: 9, pro: 19, elite: 39 };
const PLAN_COLORS = { starter: '#06b6d4', pro: '#a855f7', elite: '#f59e0b' };

export default function BillingPage() {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('burnrate_user');
    if (!u) { window.location.href = '/login'; return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    fetchDbUser(parsed.id);
  }, []);

  async function fetchDbUser(userId) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    if (data[0]) setDbUser(data[0]);
    setLoading(false);
  }

  async function handleCancel() {
    if (!confirm('Aboneliğinizi iptal etmek istediğinizden emin misiniz?')) return;
    setCanceling(true);
    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Aboneliğiniz iptal edildi. Dönem sonuna kadar erişiminiz devam eder.');
        fetchDbUser(user.id);
      } else {
        setMessage('Hata: ' + (data.error || 'Bir sorun oluştu'));
      }
    } catch { setMessage('Bağlantı hatası'); }
    setCanceling(false);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const currentPlan = dbUser?.plan || 'starter';
  const expiresAt = dbUser?.plan_expires_at ? new Date(dbUser.plan_expires_at).toLocaleDateString('tr-TR') : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '40px 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>BurnRate OS</span>
        </div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Fatura Yönetimi</h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 36, fontSize: 14 }}>Planınızı görüntüleyin ve yönetin.</p>

        {message && (
          <div style={{ background: message.startsWith('Hata') ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)', border: `1px solid ${message.startsWith('Hata') ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`, borderRadius: 10, padding: '12px 18px', color: message.startsWith('Hata') ? '#ef4444' : '#c4b5fd', marginBottom: 24, fontSize: 14 }}>
            {message}
          </div>
        )}

        {/* AKTİF PLAN */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 16 }}>AKTİF PLAN</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{PLAN_NAMES[currentPlan]}</span>
              <span style={{ background: `${PLAN_COLORS[currentPlan]}20`, color: PLAN_COLORS[currentPlan], fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>AKTİF</span>
            </div>
            <span style={{ color: PLAN_COLORS[currentPlan], fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>${PLAN_PRICES[currentPlan]}/ay</span>
          </div>
          {expiresAt && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>Sonraki yenileme: </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{expiresAt}</span>
            </div>
          )}
          {dbUser?.stripe_sub_id && (
            <button onClick={handleCancel} disabled={canceling}
              style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: canceling ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: canceling ? 0.6 : 1 }}>
              {canceling ? 'İptal ediliyor...' : 'Aboneliği İptal Et'}
            </button>
          )}
        </div>

        {/* PLAN DEĞİŞTİR */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 16 }}>PLAN DEĞİŞTİR</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.entries(PLAN_NAMES).map(([key, name]) => (
              <div key={key} onClick={() => key !== currentPlan && (window.location.href = `/checkout?plan=${key}`)}
                style={{ flex: 1, padding: '14px 12px', borderRadius: 12, background: key === currentPlan ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)', border: key === currentPlan ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.07)', cursor: key === currentPlan ? 'default' : 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ color: key === currentPlan ? '#c4b5fd' : '#fff', fontWeight: 700, fontSize: 14 }}>{name}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>${PLAN_PRICES[key]}/ay</div>
                {key === currentPlan && <div style={{ color: '#a855f7', fontSize: 10, marginTop: 4 }}>✓ Mevcut</div>}
              </div>
            ))}
          </div>
        </div>

        {/* HESAP BİLGİLERİ */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, marginBottom: 40 }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 16 }}>HESAP BİLGİLERİ</div>
          {[
            { label: 'E-posta', value: user?.email },
            { label: 'Lisans anahtarı', value: dbUser?.license_key || '—', mono: true },
            { label: 'Stripe müşteri ID', value: dbUser?.stripe_customer_id || '—', mono: true },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{item.label}</span>
              <span style={{ color: '#fff', fontSize: 13, fontFamily: item.mono ? "'DM Mono', monospace" : 'inherit', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textDecoration: 'none' }}>← Dashboard'a dön</a>
          <a href="mailto:hello@burnrate-os.com" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textDecoration: 'none' }}>Destek: hello@burnrate-os.com</a>
        </div>
      </div>
    </div>
  );
}
