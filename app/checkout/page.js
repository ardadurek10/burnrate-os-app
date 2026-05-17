'use client';
import { useState, useEffect } from 'react';

const PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 86,
    monthlyPriceId: 'price_1TY0OGJ2HRbR9W7W6F5O9Ezh',
    yearlyPriceId: 'price_1TY0eNJ2HRbR9W7WZBgzju7z',
    features: ['Genel Bakış Paneli', 'Harcama Analizi', 'Bakiye ve Gelir Takibi', 'Otomatik hoşgeldin e-postası'],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 19,
    yearlyPrice: 182,
    monthlyPriceId: 'price_1TY0MtJ2HRbR9W7WmkJ81NvB',
    yearlyPriceId: 'price_1TY0f6J2HRbR9W7WuqhPHun1',
    popular: true,
    features: ["Starter'daki her şey", 'Abonelik Takibi', '30 Günlük Meydan Okuma', 'Yapay Zeka Danışmanı', 'Canlı Yatırımlar'],
  },
  elite: {
    name: 'Elite',
    monthlyPrice: 39,
    yearlyPrice: 374,
    monthlyPriceId: 'price_1TY0OYJ2HRbR9W7WTlhJnqAQ',
    yearlyPriceId: 'price_1TY0fXJ2HRbR9W7WP8o1fhql',
    features: ["Pro'daki her şey", 'Canlı Yatırım Takibi', 'Aylık Özet + Puan', 'Yahoo Finance gerçek zamanlı', 'Öncelikli e-posta desteği'],
  },
};

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billing, setBilling] = useState('monthly');
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
if (params.get('trial_expired')) {
  const savedLang = localStorage.getItem('burnrate_lang') || 'tr';
  setError(savedLang === 'tr' ? '⏰ Deneme süreniz doldu. Devam etmek için bir plan seçin.' : '⏰ Your trial has expired. Choose a plan to continue.');
}
  }, []);

  async function handleCheckout() {
    if (!user) { window.location.href = '/login'; return; }
    setLoading(true);
    setError('');
    try {
      const plan = PLANS[selectedPlan];
      const priceId = billing === 'yearly' ? plan.yearlyPriceId : plan.monthlyPriceId;
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Bir hata oluştu');
    } catch { setError('Bağlantı hatası'); }
    setLoading(false);
  }

  const plan = PLANS[selectedPlan];
  const displayPrice = billing === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  const totalYearly = plan.yearlyPrice;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", padding: '0 20px 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>BurnRate OS</span>
        </div>
        <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none' }}>← Dashboard'a dön</a>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 12 }}>Planınızı seçin</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>İstediğiniz zaman iptal edin. Gizli ücret yok.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: 4, gap: 4 }}>
            <button onClick={() => setBilling('monthly')}
              style={{ padding: '10px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans', background: billing === 'monthly' ? '#7c3aed' : 'transparent', color: billing === 'monthly' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              Aylık
            </button>
            <button onClick={() => setBilling('yearly')}
              style={{ padding: '10px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans', background: billing === 'yearly' ? '#7c3aed' : 'transparent', color: billing === 'yearly' ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
              Yıllık
              <span style={{ background: billing === 'yearly' ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.15)', color: billing === 'yearly' ? '#fff' : '#6ee7b7', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>%20</span>
            </button>
          </div>
        </div>

        {canceled && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 20px', color: '#ef4444', marginBottom: 24, fontSize: 14, textAlign: 'center' }}>
            Ödeme iptal edildi. Tekrar deneyebilirsiniz.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {Object.entries(PLANS).map(([key, p]) => {
            const isSelected = selectedPlan === key;
            const price = billing === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
            return (
              <div key={key} onClick={() => setSelectedPlan(key)}
                style={{ position: 'relative', background: isSelected ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)', border: isSelected ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: p.popular ? '32px 24px 24px' : '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                {p.popular && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                    ⭐ En Popüler
                  </div>
                )}
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>{p.name.toUpperCase()}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 4 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 6 }}>$</span>
                  <span style={{ color: '#fff', fontSize: 52, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>{price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 8 }}>/ay</span>
                </div>
                {billing === 'yearly' && (
                  <div style={{ color: '#6ee7b7', fontSize: 12, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}>
                    Yıllık ${p.yearlyPrice} · %20 indirim
                  </div>
                )}
                {billing === 'monthly' && <div style={{ marginBottom: 16 }} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: isSelected ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: isSelected ? '#a855f7' : 'rgba(255,255,255,0.3)', fontSize: 11 }}>✓</span>
                      </div>
                      <span style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{plan.name} — {billing === 'yearly' ? 'Yıllık' : 'Aylık'}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4 }}>
              {billing === 'yearly' ? `$${totalYearly}/yıl · aylık $${displayPrice}` : `$${displayPrice}/ay`}
            </div>
          </div>
          {billing === 'yearly' && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '6px 12px', color: '#6ee7b7', fontSize: 12, fontWeight: 600 }}>
              ${plan.monthlyPrice * 12 - plan.yearlyPrice} tasarruf
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 20px', color: '#ef4444', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button onClick={handleCheckout} disabled={loading}
          style={{ width: '100%', background: loading ? '#6b21a8' : 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', border: 'none', borderRadius: 14, padding: '18px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans', transition: 'all 0.2s', marginBottom: 12 }}>
          {loading ? 'Yönlendiriliyor...' : `${plan.name} planı al — ${billing === 'yearly' ? `$${totalYearly}/yıl` : `$${plan.monthlyPrice}/ay`} →`}
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>🔒 Stripe tarafından güvenli şekilde işlenir</p>
        </div>
      </div>
    </div>
  );
}
