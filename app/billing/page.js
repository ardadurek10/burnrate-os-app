'use client';
import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118';

const PLAN_NAMES = { starter: 'Starter', pro: 'Pro', elite: 'Elite' };
const PLAN_PRICES = { starter: 9, pro: 19, elite: 39 };
const PLAN_COLORS = { starter: '#a855f7', pro: '#a855f7', elite: '#22d3ee' };

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
    } catch (err) {
      setMessage('Bağlantı hatası');
    } finally {
      setCanceling(false);
    }
  }

  function handleUpgrade(plan) {
    window.location.href = `/checkout?plan=${plan}`;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentPlan = dbUser?.plan || 'starter';
  const expiresAt = dbUser?.plan_expires_at ? new Date(dbUser.plan_expires_at).toLocaleDateString('tr-TR') : null;

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', padding: '40px 20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>BurnRate OS</span>
        </div>

        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Fatura Yönetimi</h1>
        <p style={{ color: '#6b7280', marginBottom: 40 }}>Planınızı görüntüleyin ve yönetin.</p>

        {message && (
          <div style={{ background: message.startsWith('Hata') ? 'rgba(239,68,68,0.1)' : 'rgba(168,85,247,0.1)', border: `1px solid ${message.startsWith('Hata') ? 'rgba(239,68,68,0.3)' : 'rgba(168,85,247,0.3)'}`, borderRadius: 8, padding: '12px 20px', color: message.startsWith('Hata') ? '#ef4444' : '#a855f7', marginBottom: 24, fontSize: 14 }}>
            {message}
          </div>
        )}

        {/* Aktif plan kartı */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>AKTİF PLAN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{PLAN_NAMES[currentPlan]}</span>
                <span style={{ background: `${PLAN_COLORS[currentPlan]}20`, color: PLAN_COLORS[currentPlan], fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
                  AKTİF
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>${PLAN_PRICES[currentPlan]}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>/ay</div>
            </div>
          </div>

          {expiresAt && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <span style={{ color: '#6b7280', fontSize: 13 }}>Sonraki yenileme: </span>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{expiresAt}</span>
            </div>
          )}

          {dbUser?.stripe_sub_id && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: canceling ? 'not-allowed' : 'pointer', opacity: canceling ? 0.6 : 1 }}
            >
              {canceling ? 'İptal ediliyor...' : 'Aboneliği iptal et'}
            </button>
          )}
        </div>

        {/* Plan yükseltme */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 20 }}>PLAN DEĞİŞTİR</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(PLAN_NAMES).map(([key, name]) => (
              <button
                key={key}
                onClick={() => handleUpgrade(key)}
                disabled={key === currentPlan}
                style={{
                  flex: 1,
                  minWidth: 120,
                  background: key === currentPlan ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                  border: key === currentPlan ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: key === currentPlan ? 'default' : 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: key === currentPlan ? '#a855f7' : '#fff', fontWeight: 700, fontSize: 15 }}>{name}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>${PLAN_PRICES[key]}/ay</div>
                {key === currentPlan && <div style={{ color: '#a855f7', fontSize: 11, marginTop: 4 }}>Mevcut plan</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Hesap bilgileri */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28, marginBottom: 40 }}>
          <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 20 }}>HESAP BİLGİLERİ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'E-posta', value: user?.email },
              { label: 'Lisans anahtarı', value: dbUser?.license_key || '—' },
              { label: 'Stripe müşteri ID', value: dbUser?.stripe_customer_id || '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ color: '#6b7280', fontSize: 14 }}>{item.label}</span>
                <span style={{ color: '#fff', fontSize: 14, fontFamily: item.label === 'Lisans anahtarı' ? 'DM Mono, monospace' : 'inherit' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <a href="/dashboard" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>← Dashboard'a dön</a>
          <a href="mailto:hello@burnrate-os.com" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none', marginLeft: 'auto' }}>Destek: hello@burnrate-os.com</a>
        </div>
      </div>
    </div>
  );
}
