'use client';
import { useState } from 'react';
import { supabaseQuery } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await supabaseQuery('users', {
        email: email.toLowerCase().trim(),
        license_key: licenseKey.trim(),
      });

      console.log('API response:', data);

      if (!data || data.length === 0) {
        setError('Geçersiz e-posta veya lisans anahtarı.');
        setLoading(false);
        return;
      }

      const user = data[0];
      console.log('User found:', user);
      alert('Kullanıcı bulundu: ' + user.email + ' ID: ' + user.id);
      localStorage.setItem('burnrate_user', JSON.stringify(user));
      window.location.replace(window.location.origin + '/dashboard');
    } catch (err) {
      console.log('Error:', err);
      setError('Bağlantı hatası: ' + err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            🔥
          </div>
          <h1 className="text-2xl font-bold text-white">BurnRate OS</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Finansal komuta merkezine hoş geldin
          </p>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sen@example.com"
                required
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                Lisans Anahtarı
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="BRNOS-XXXX-XXXX-XXXX"
                required
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Giriş yapılıyor...' : 'Panele Gir →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
