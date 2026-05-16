'use client';
import { useState, useEffect } from 'react';

export default function SuccessPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('burnrate_user');
    if (u) setUser(JSON.parse(u));
    setTimeout(() => setLoading(false), 3000);
  }, []);

  const items = [
    { icon: '🔑', title: 'Lisans anahtarı', desc: 'E-posta kutunuzu kontrol edin' },
    { icon: '⚡', title: 'Anında erişim', desc: "Dashboard'ınız hazır" },
    { icon: '🛡️', title: 'Güvenli ödeme', desc: 'Stripe tarafından işlendi' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 48 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7' }} />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>BurnRate OS</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, border: '3px solid rgba(168,85,247,0.2)', borderTop: '3px solid #a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>Ödemeniz doğrulanıyor...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', maxWidth: 480, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(168,85,247,0.12)', border: '2px solid rgba(168,85,247,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 32, color: '#a855f7' }}>✓</div>

          <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Hoş geldiniz! 🎉</h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 12 }}>
            Ödemeniz başarıyla tamamlandı. Hesabınız aktifleştirildi.
          </p>

          {user?.email && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 40 }}>
              Lisans anahtarınız <strong style={{ color: '#a855f7' }}>{user.email}</strong> adresine gönderildi.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36, textAlign: 'left' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => window.location.href = '/dashboard'}
            style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%', marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
            Dashboard'a git →
          </button>

          <a href="mailto:hello@burnrate-os.com" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textDecoration: 'none' }}>
            Sorun mu var? hello@burnrate-os.com
          </a>
        </div>
      )}
    </div>
  );
}
