'use client';
import { useState, useEffect } from 'react';

const PLANS = {
  starter: {
    name: 'Starter',
    price: 9,
    color: '#a855f7',
    features: ['Genel Bakış Paneli', 'Harcama Analizi', 'Bakiye ve Gelir Takibi', 'Otomatik hoşgeldin e-postası'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    color: '#a855f7',
    popular: true,
    features: ['Starter\'daki her şey', 'Abonelik Takibi', '30 Günlük Meydan Okuma', 'Yapay Zeka Danışmanı', 'Canlı Yatırımlar'],
  },
  elite: {
    name: 'Elite',
    price: 39,
    color: '#22d3ee',
    features: ['Pro\'daki her şey', 'Canlı Yatırım Takibi', 'Aylık Özet + Puan', 'Yahoo Finance gerçek zamanlı', 'Öncelikli e-posta desteği'],
  },
};

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canceled, setCanceled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('burnrate_user');
    if (u) setUser(JSON.parse(u));
    const params = new URLSearchParams(window.location.search);
    if (params.get('plan')) setSelectedPlan(params.get('plan'));
    if (params.get('canceled')) setCanceled(true);
  }, []);

  async function handleCheckout() {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Bir hata oluştu');
      }
    } catch (err) {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0f14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>BurnRate OS</span>
      </div>

      <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
        Planınızı seçin
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 48, textAlign: 'center' }}>
        İstediğiniz zaman iptal edin. Gizli ücret yok.
      </p>

      {canceled && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          padding: '12px 20px',
          color: '#ef4444',
          marginBottom: 24,
          fontSize: 14,
        }}>
          Ödeme iptal edildi. Tekrar deneyebilirsiniz.
        </div>
      )}

      {/* Plan kartları */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            onClick={() => setSelectedPlan(key)}
            style={{
              width: 280,
              background: selectedPlan === key ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
              border: selectedPlan === key ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 28,
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#a855f7',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 16px',
                borderRadius: 20,
                whiteSpace: 'nowrap',
              }}>
                ⭐ En Popüler
              </div>
            )}
            <div style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>
              {plan.name.toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 20 }}>
              <span style={{ color: '#9ca3af', fontSize: 20 }}>$</span>
              <span style={{ color: '#fff', fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>/ay</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#a855f7', fontSize: 16 }}>✓</span>
                  <span style={{ color: '#d1d5db', fontSize: 14 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8,
          padding: '12px 20px',
          color: '#ef4444',
          marginBottom: 20,
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          background: loading ? '#6b21a8' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '16px 48px',
          fontSize: 16,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          marginBottom: 16,
        }}
      >
        {loading ? 'Yönlendiriliyor...' : `${PLANS[selectedPlan].name} planı al →`}
      </button>

      <p style={{ color: '#4b5563', fontSize: 13 }}>
        Ödeme Stripe tarafından güvenli şekilde işlenir
      </p>

      <div style={{ marginTop: 24 }}>
        <a href="/dashboard" style={{ color: '#6b7280', fontSize: 13, textDecoration: 'none' }}>
          ← Dashboard'a dön
        </a>
      </div>
    </div>
  );
}
