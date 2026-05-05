'use client';
import { useState, useEffect } from 'react';
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [subs, setSubs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem('burnrate_user');
      if (!u || u === 'undefined' || u === 'null') {
        window.location.href = '/login';
        return;
      }
      const parsed = JSON.parse(u);
      if (!parsed || !parsed.id) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      setUser(parsed);
      loadData(parsed.id);
    } catch (e) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  async function loadData(userId) {
    const [s, e, i] = await Promise.all([
      supabaseQuery('subscriptions', { user_id: userId }),
      supabaseQuery('expenses', { user_id: userId }),
      supabaseQuery('income', { user_id: userId }),
    ]);
    setSubs(Array.isArray(s) ? s : []);
    setExpenses(Array.isArray(e) ? e : []);
    setIncome(Array.isArray(i) ? i : []);
  }

  if (!user)
    return (
      <div className="min-h-screen bg-[#08080e] flex items-center justify-center">
        <div className="text-white text-sm">Yükleniyor...</div>
      </div>
    );

  const totalIncome = income.reduce((a, i) => a + Number(i.amount), 0);
  const totalExp = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const totalSubs = subs.reduce((a, s) => a + Number(s.cost), 0);
  const netBal = totalIncome - totalExp - totalSubs;
  const deadSubs = subs.filter((s) => s.status === 'dead');

  return (
    <div className="min-h-screen bg-[#08080e] flex">
      <div className="w-56 bg-[#111118] border-r border-white/10 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm">
            🔥
          </div>
          <div>
            <div className="text-white font-bold text-sm">BurnRate OS</div>
            <div className="text-gray-500 text-xs">command center</div>
          </div>
        </div>
        {[
          { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
          { id: 'subscriptions', icon: '⚔️', label: 'Subscriptions' },
          { id: 'spending', icon: '🩸', label: 'Harcamalar' },
          { id: 'balance', icon: '📡', label: 'Bakiye' },
          { id: 'ai', icon: '🤖', label: 'AI Danışman' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-all ${
              page === item.id
                ? 'bg-purple-600/20 text-white border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="text-gray-400 text-xs mb-2">
            {user.name || user.email}
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Çıkış yap
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {page === 'dashboard' && (
          <DashboardPage
            netBal={netBal}
            totalSubs={totalSubs}
            totalExp={totalExp}
            deadSubs={deadSubs}
            subs={subs}
            expenses={expenses}
            totalIncome={totalIncome}
          />
        )}
        {page === 'subscriptions' && (
          <SubsPage
            subs={subs}
            userId={user.id}
            onRefresh={() => loadData(user.id)}
          />
        )}
        {page === 'spending' && (
          <SpendingPage
            expenses={expenses}
            userId={user.id}
            onRefresh={() => loadData(user.id)}
          />
        )}
        {page === 'balance' && (
          <BalancePage
            income={income}
            totalIncome={totalIncome}
            totalExp={totalExp}
            totalSubs={totalSubs}
            netBal={netBal}
            userId={user.id}
            onRefresh={() => loadData(user.id)}
          />
        )}
        {page === 'ai' && (
          <AIPage user={user} subs={subs} expenses={expenses} income={income} />
        )}
      </div>
    </div>
  );
}

function DashboardPage({
  netBal,
  totalSubs,
  totalExp,
  deadSubs,
  subs,
  expenses,
  totalIncome,
}) {
  const sr =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExp - totalSubs) / totalIncome) * 100)
      : 0;
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm">Finansal komuta merkezin</p>
      </div>
      {deadSubs.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="text-red-400 font-bold text-sm">
              {deadSubs.length} ölü subscription tespit edildi
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {deadSubs.map((s) => s.name).join(', ')} — aylık $
              {deadSubs.reduce((a, s) => a + Number(s.cost), 0).toFixed(2)}{' '}
              israf
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Net Bakiye',
            value: `$${Math.abs(netBal).toFixed(2)}`,
            color: netBal >= 0 ? 'text-green-400' : 'text-red-400',
          },
          {
            label: 'Aylık Burn',
            value: `$${(totalExp + totalSubs).toFixed(2)}`,
            color: 'text-red-400',
          },
          { label: 'Aktif Sub', value: subs.length, color: 'text-amber-400' },
          {
            label: 'Tasarruf Oranı',
            value: `${sr}%`,
            color:
              sr >= 30
                ? 'text-green-400'
                : sr >= 15
                ? 'text-amber-400'
                : 'text-red-400',
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-[#111118] border border-white/10 rounded-xl p-4"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {s.label}
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="font-bold text-sm text-white mb-3">
            ⚔️ Son Subscriptionlar
          </div>
          {subs.length === 0 ? (
            <div className="text-gray-500 text-sm">Henüz subscription yok</div>
          ) : (
            subs.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center py-2 border-b border-white/5"
              >
                <div className="text-sm text-white">{s.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-sm font-mono">
                    ${Number(s.cost).toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'dead'
                        ? 'bg-red-500/20 text-red-400'
                        : s.status === 'warn'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="font-bold text-sm text-white mb-3">
            🩸 Son Harcamalar
          </div>
          {expenses.length === 0 ? (
            <div className="text-gray-500 text-sm">Henüz harcama yok</div>
          ) : (
            expenses.slice(0, 4).map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center py-2 border-b border-white/5"
              >
                <div className="text-sm text-white">{e.description}</div>
                <span className="text-red-400 text-sm font-mono">
                  -${Number(e.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SubsPage({ subs, userId, onRefresh }) {
  const [form, setForm] = useState({
    name: '',
    cost: '',
    category: 'SaaS / Tools',
    days_since_used: '0',
    notes: '',
  });
  const [adding, setAdding] = useState(false);

  async function addSub() {
    if (!form.name || !form.cost) return;
    const days = parseInt(form.days_since_used) || 0;
    const status =
      days === 0 ? 'keep' : days < 30 ? 'keep' : days < 60 ? 'warn' : 'dead';
    await supabaseInsert('subscriptions', {
      ...form,
      cost: parseFloat(form.cost),
      days_since_used: days,
      status,
      user_id: userId,
    });
    setForm({
      name: '',
      cost: '',
      category: 'SaaS / Tools',
      days_since_used: '0',
      notes: '',
    });
    setAdding(false);
    onRefresh();
  }

  async function deleteSub(id) {
    await supabaseDelete('subscriptions', id);
    onRefresh();
  }

  const total = subs.reduce((a, s) => a + Number(s.cost), 0);
  const dead = subs.filter((s) => s.status === 'dead');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">
            ⚔️ Subscription Guillotine
          </h1>
          <p className="text-gray-400 text-sm">
            Her recurring charge'ı takip et.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Ekle
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">
            Toplam Aylık
          </div>
          <div className="text-2xl font-bold text-red-400">
            ${total.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">Ölü Tool</div>
          <div className="text-2xl font-bold text-red-400">{dead.length}</div>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">Tutulacak</div>
          <div className="text-2xl font-bold text-green-400">
            {subs.filter((s) => s.status === 'keep').length}
          </div>
        </div>
      </div>
      {adding && (
        <div className="bg-[#111118] border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Servis Adı
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Shopify, Claude Pro..."
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Aylık Maliyet ($)
              </label>
              <input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="29.00"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Son Kullanım (gün önce)
              </label>
              <input
                type="number"
                value={form.days_since_used}
                onChange={(e) =>
                  setForm({ ...form, days_since_used: e.target.value })
                }
                placeholder="0 = bugün"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              >
                {[
                  'SaaS / Tools',
                  'AI Tools',
                  'Marketing',
                  'Storage',
                  'Design',
                  'Productivity',
                  'Other',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setAdding(false)}
              className="text-gray-400 text-sm px-4 py-2"
            >
              İptal
            </button>
            <button
              onClick={addSub}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
      <div className="bg-[#111118] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Servis
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Maliyet
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Durum
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-500 text-sm p-8"
                >
                  Henüz subscription eklenmedi
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="border-b border-white/5">
                  <td className="p-4 text-sm text-white font-medium">
                    {s.name}
                  </td>
                  <td className="p-4 text-sm text-red-400 font-mono">
                    ${Number(s.cost).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        s.status === 'dead'
                          ? 'bg-red-500/20 text-red-400'
                          : s.status === 'warn'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteSub(s.id)}
                      className="text-xs text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1 rounded-lg"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpendingPage({ expenses, userId, onRefresh }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'impulse',
    expense_date: '',
  });
  const [adding, setAdding] = useState(false);

  async function addExpense() {
    if (!form.description || !form.amount) return;
    await supabaseInsert('expenses', {
      ...form,
      amount: parseFloat(form.amount),
      user_id: userId,
    });
    setForm({
      description: '',
      amount: '',
      category: 'impulse',
      expense_date: '',
    });
    setAdding(false);
    onRefresh();
  }

  async function deleteExp(id) {
    await supabaseDelete('expenses', id);
    onRefresh();
  }

  const total = expenses.reduce((a, e) => a + Number(e.amount), 0);
  const leaks = expenses.filter(
    (e) => e.category === 'impulse' || e.category === 'food'
  );
  const leakAmt = leaks.reduce((a, e) => a + Number(e.amount), 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🩸 Günlük Harcamalar</h1>
          <p className="text-gray-400 text-sm">
            İmpuls alımları ve leakları takip et.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Ekle
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">Toplam</div>
          <div className="text-2xl font-bold text-red-400">
            ${total.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">Leak</div>
          <div className="text-2xl font-bold text-red-400">
            ${leakAmt.toFixed(2)}
          </div>
        </div>
        <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase mb-2">İşlem</div>
          <div className="text-2xl font-bold text-purple-400">
            {expenses.length}
          </div>
        </div>
      </div>
      {adding && (
        <div className="bg-[#111118] border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Açıklama
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Gece siparişi..."
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Tutar ($)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="impulse">Impulse / Leak</option>
                <option value="food">Yemek & Teslimat</option>
                <option value="transport">Ulaşım</option>
                <option value="business">İş</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Tarih
              </label>
              <input
                value={form.expense_date}
                onChange={(e) =>
                  setForm({ ...form, expense_date: e.target.value })
                }
                placeholder="5 Mayıs"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setAdding(false)}
              className="text-gray-400 text-sm px-4 py-2"
            >
              İptal
            </button>
            <button
              onClick={addExpense}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
      <div className="bg-[#111118] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Açıklama
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Tutar
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Kategori
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Tarih
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 text-sm p-8"
                >
                  Henüz harcama eklenmedi
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="p-4 text-sm text-white font-medium">
                    {e.description}
                  </td>
                  <td className="p-4 text-sm text-red-400 font-mono">
                    -${Number(e.amount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        e.category === 'impulse' || e.category === 'food'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {e.expense_date || '—'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteExp(e.id)}
                      className="text-xs text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1 rounded-lg"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BalancePage({
  income,
  totalIncome,
  totalExp,
  totalSubs,
  netBal,
  userId,
  onRefresh,
}) {
  const [form, setForm] = useState({ source: '', amount: '', income_date: '' });
  const [adding, setAdding] = useState(false);

  async function addIncome() {
    if (!form.source || !form.amount) return;
    await supabaseInsert('income', {
      ...form,
      amount: parseFloat(form.amount),
      user_id: userId,
    });
    setForm({ source: '', amount: '', income_date: '' });
    setAdding(false);
    onRefresh();
  }

  async function deleteInc(id) {
    await supabaseDelete('income', id);
    onRefresh();
  }

  const sr =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExp - totalSubs) / totalIncome) * 100)
      : 0;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">📡 Bakiye & Tasarruf</h1>
          <p className="text-gray-400 text-sm">
            Gelirini takip et, net pozisyonunu gör.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
        >
          + Gelir Ekle
        </button>
      </div>
      <div className="bg-[#111118] border border-purple-500/25 rounded-xl p-6 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Net Bakiye
        </div>
        <div
          className={`text-5xl font-bold mb-1 ${
            netBal >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          ${Math.abs(netBal).toFixed(2)}
        </div>
        <div className="text-gray-400 text-sm">
          {netBal >= 0 ? 'Bu ay net pozitifsin' : 'Harcama gelirden fazla'}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div>
            <div className="text-xs text-gray-500 mb-1">Toplam Gelir</div>
            <div className="text-green-400 font-bold">
              ${totalIncome.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Toplam Gider</div>
            <div className="text-red-400 font-bold">
              ${(totalExp + totalSubs).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Tasarruf Oranı</div>
            <div
              className={`font-bold ${
                sr >= 30
                  ? 'text-green-400'
                  : sr >= 15
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {sr}%
            </div>
          </div>
        </div>
      </div>
      {adding && (
        <div className="bg-[#111118] border border-purple-500/30 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Kaynak
              </label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Freelance, Ürün satışı..."
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Tutar ($)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1 block">
                Tarih
              </label>
              <input
                value={form.income_date}
                onChange={(e) =>
                  setForm({ ...form, income_date: e.target.value })
                }
                placeholder="5 Mayıs"
                className="w-full bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setAdding(false)}
              className="text-gray-400 text-sm px-4 py-2"
            >
              İptal
            </button>
            <button
              onClick={addIncome}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
      <div className="bg-[#111118] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Kaynak
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Tutar
              </th>
              <th className="text-left text-xs text-gray-500 uppercase p-4">
                Tarih
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {income.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-500 text-sm p-8"
                >
                  Henüz gelir eklenmedi
                </td>
              </tr>
            ) : (
              income.map((i) => (
                <tr key={i.id} className="border-b border-white/5">
                  <td className="p-4 text-sm text-white font-medium">
                    {i.source}
                  </td>
                  <td className="p-4 text-sm text-green-400 font-mono">
                    +${Number(i.amount).toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {i.income_date || '—'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteInc(i.id)}
                      className="text-xs text-gray-500 hover:text-red-400 border border-white/10 px-3 py-1 rounded-lg"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function AIPage({ user, subs, expenses, income }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Ben senin finansal danışmanınım. Harcamalar, subscriptionlar veya tasarruf hedeflerin hakkında soru sorabilirsin.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const context = `Subscriptionlar: ${subs.map(s => s.name + ' $' + s.cost + '/ay durum:' + s.status).join(', ') || 'yok'}. Harcamalar: ${expenses.map(e => e.description + ' $' + e.amount).join(', ') || 'yok'}. Gelir: ${income.map(i => i.source + ' $' + i.amount).join(', ') || 'yok'}.`

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Bir hata oluştu.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bağlantı hatası. Tekrar dene.' }])
    }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">🤖 AI Finansal Danışman</h1>
        <p className="text-gray-400 text-sm">Verilerini analiz edip kişisel tavsiyeler ver.</p>
      </div>
      <div className="bg-[#111118] border border-white/10 rounded-xl overflow-hidden">
        <div className="h-96 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-xs p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-purple-600/20 border border-purple-500/30 self-end text-white' : 'bg-[#1c1c2a] border border-white/10 self-start text-gray-300'}`}>
              {m.text}
            </div>
          ))}
          {loading && <div className="bg-[#1c1c2a] border border-white/10 self-start p-3 rounded-xl text-sm text-gray-400">Düşünüyor...</div>}
        </div>
        <div className="border-t border-white/10 p-3 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Hangi subscriptionı kesmeliyim?"
            className="flex-1 bg-[#1c1c2a] border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
          />
          <button onClick={sendMessage} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">↑</button>
        </div>
      </div>
    </div>
  )
}