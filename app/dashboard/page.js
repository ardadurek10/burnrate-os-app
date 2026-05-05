'use client'
import { useState, useEffect } from 'react'
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#8b5cf6', '#a78bfa', '#6d28d9', '#c4b5fd', '#4c1d95']

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [subs, setSubs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [investments, setInvestments] = useState([])

  useEffect(() => {
    try {
      const u = localStorage.getItem('burnrate_user')
      if (!u || u === 'undefined' || u === 'null') { window.location.href = '/login'; return }
      const parsed = JSON.parse(u)
      if (!parsed || !parsed.id) { localStorage.clear(); window.location.href = '/login'; return }
      setUser(parsed)
      loadData(parsed.id)
    } catch(e) { localStorage.clear(); window.location.href = '/login' }
  }, [])

  async function loadData(userId) {
    const [s, e, i] = await Promise.all([
      supabaseQuery('subscriptions', { user_id: userId }),
      supabaseQuery('expenses', { user_id: userId }),
      supabaseQuery('income', { user_id: userId }),
    ])
    setSubs(Array.isArray(s) ? s : [])
    setExpenses(Array.isArray(e) ? e : [])
    setIncome(Array.isArray(i) ? i : [])
    setInvestments([
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 2, buyPrice: 150, currentPrice: 189, type: 'stock' },
      { symbol: 'BTC', name: 'Bitcoin', shares: 0.01, buyPrice: 40000, currentPrice: 62000, type: 'crypto' },
    ])
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0a0a0f'}}>
      <div className="text-white text-sm" style={{fontFamily:'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'}}>Loading...</div>
    </div>
  )

  const totalIncome = income.reduce((a, i) => a + Number(i.amount), 0)
  const totalExp = expenses.reduce((a, e) => a + Number(e.amount), 0)
  const totalSubs = subs.reduce((a, s) => a + Number(s.cost), 0)
  const netBal = totalIncome - totalExp - totalSubs
  const deadSubs = subs.filter(s => s.status === 'dead')
  const totalInvestmentValue = investments.reduce((a, inv) => a + (inv.shares * inv.currentPrice), 0)
  const totalInvestmentCost = investments.reduce((a, inv) => a + (inv.shares * inv.buyPrice), 0)
  const investmentGain = totalInvestmentValue - totalInvestmentCost

  const navItems = [
    { id: 'dashboard', icon: '⚡', label: 'Overview' },
    { id: 'subscriptions', icon: '⚔️', label: 'Subscriptions' },
    { id: 'spending', icon: '💸', label: 'Spending' },
    { id: 'investments', icon: '📈', label: 'Investments' },
    { id: 'balance', icon: '💰', label: 'Balance' },
  ]

  return (
    <div className="min-h-screen flex" style={{background:'#0a0a0f', fontFamily:'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'}}>
      {/* SIDEBAR */}
      <div className="flex flex-col py-8 px-4" style={{width:'220px', background:'rgba(255,255,255,0.02)', borderRight:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)'}}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="flex items-center justify-center text-lg rounded-xl" style={{width:'36px', height:'36px', background:'linear-gradient(135deg, #7c3aed, #4c1d95)'}}>🔥</div>
          <div>
            <div className="font-semibold text-sm" style={{color:'#f5f5f7', letterSpacing:'-0.3px'}}>BurnRate OS</div>
            <div className="text-xs" style={{color:'rgba(255,255,255,0.35)', fontFamily:'SF Mono, monospace'}}>command center</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200"
              style={{
                background: page === item.id ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(76,29,149,0.15))' : 'transparent',
                color: page === item.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                border: page === item.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              }}>
              <span style={{fontSize:'15px'}}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* AI ADVISOR SPECIAL */}
        <div className="mt-4 mb-6">
          <button onClick={() => setPage('ai')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: page === 'ai' ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.1))',
              color: '#e9d5ff',
              border: '1px solid rgba(124,58,237,0.4)',
            }}>
            <span style={{fontSize:'16px'}}>🤖</span>
            <div className="text-left">
              <div style={{fontSize:'13px'}}>AI Advisor</div>
              <div style={{fontSize:'10px', color:'rgba(233,213,255,0.5)', fontFamily:'SF Mono, monospace'}}>powered by claude</div>
            </div>
          </button>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'16px'}}>
          <div className="px-2 mb-3">
            <div className="text-xs font-medium" style={{color:'#f5f5f7'}}>{user.name || 'User'}</div>
            <div className="text-xs" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>{user.email}</div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all"
            style={{color:'rgba(255,255,255,0.3)'}}>
            Sign out →
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {page === 'dashboard' && <OverviewPage netBal={netBal} totalSubs={totalSubs} totalExp={totalExp} deadSubs={deadSubs} subs={subs} expenses={expenses} totalIncome={totalIncome} investmentGain={investmentGain} totalInvestmentValue={totalInvestmentValue} />}
        {page === 'subscriptions' && <SubsPage subs={subs} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page === 'spending' && <SpendingPage expenses={expenses} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page === 'investments' && <InvestmentsPage investments={investments} setInvestments={setInvestments} />}
        {page === 'balance' && <BalancePage income={income} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page === 'ai' && <AIPage user={user} subs={subs} expenses={expenses} income={income} investments={investments} />}
      </div>
    </div>
  )
}

// ─── CARD COMPONENT ───
function Card({ children, className = '', style = {} }) {
  return (
    <div className={className} style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', ...style}}>
      {children}
    </div>
  )
}

// ─── STAT CARD ───
function StatCard({ label, value, sub, color = '#c4b5fd', icon }) {
  return (
    <Card style={{padding:'20px'}}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs uppercase tracking-widest" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>{label}</div>
        {icon && <span style={{fontSize:'18px', opacity:0.6}}>{icon}</span>}
      </div>
      <div className="text-2xl font-semibold" style={{color, letterSpacing:'-0.5px'}}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{color:'rgba(255,255,255,0.3)'}}>{sub}</div>}
    </Card>
  )
}

// ─── OVERVIEW PAGE ───
function OverviewPage({ netBal, totalSubs, totalExp, deadSubs, subs, expenses, totalIncome, investmentGain, totalInvestmentValue }) {
  const sr = totalIncome > 0 ? Math.round(((totalIncome - totalExp - totalSubs) / totalIncome) * 100) : 0

  const spendingData = [
    { name: 'Subscriptions', value: totalSubs, color: '#7c3aed' },
    { name: 'Expenses', value: totalExp, color: '#a78bfa' },
    { name: 'Saved', value: Math.max(0, netBal), color: '#4c1d95' },
  ].filter(d => d.value > 0)

  const barData = expenses.slice(-6).map(e => ({ name: e.description?.slice(0,8), amount: Number(e.amount) }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>Good morning ☀️</h1>
        <p className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Here's your financial snapshot for today.</p>
      </div>

      {deadSubs.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl mb-6" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
          <span>⚠️</span>
          <div>
            <div className="text-sm font-medium" style={{color:'#fca5a5'}}>Dead subscriptions detected</div>
            <div className="text-xs mt-0.5" style={{color:'rgba(255,255,255,0.4)'}}>
              {deadSubs.map(s => s.name).join(', ')} — wasting ${deadSubs.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Net Balance" value={`$${Math.abs(netBal).toFixed(0)}`} sub={netBal >= 0 ? '↑ Positive' : '↓ In the red'} color={netBal >= 0 ? '#86efac' : '#fca5a5'} icon="💰" />
        <StatCard label="Monthly Burn" value={`$${(totalExp+totalSubs).toFixed(0)}`} sub="expenses + subs" color="#fca5a5" icon="🔥" />
        <StatCard label="Savings Rate" value={`${sr}%`} sub={sr >= 30 ? 'Excellent' : sr >= 15 ? 'Good' : 'Needs work'} color={sr >= 30 ? '#86efac' : sr >= 15 ? '#fde68a' : '#fca5a5'} icon="📊" />
        <StatCard label="Portfolio" value={`$${totalInvestmentValue.toFixed(0)}`} sub={investmentGain >= 0 ? `+$${investmentGain.toFixed(0)} gain` : `-$${Math.abs(investmentGain).toFixed(0)} loss`} color={investmentGain >= 0 ? '#86efac' : '#fca5a5'} icon="📈" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Spending Breakdown</div>
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={spendingData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {spendingData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-44 flex items-center justify-center text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No data yet</div>}
          <div className="flex gap-4 justify-center mt-2">
            {spendingData.map((d,i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
                <div style={{width:'8px', height:'8px', borderRadius:'50%', background:d.color}}></div>
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Recent Expenses</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `$${v}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[4,4,0,0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#4c1d95" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-44 flex items-center justify-center text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No expenses yet</div>}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-3" style={{color:'rgba(255,255,255,0.6)'}}>⚔️ Top Subscriptions</div>
          {subs.length === 0 ? <div className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No subscriptions yet</div> :
            subs.slice(0,4).map(s => (
              <div key={s.id} className="flex justify-between items-center py-2.5" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div className="text-sm" style={{color:'#f5f5f7'}}>{s.name}</div>
                  <div className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>{s.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{color:'#fca5a5', fontFamily:'SF Mono, monospace'}}>${Number(s.cost).toFixed(2)}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: s.status==='dead' ? 'rgba(239,68,68,0.15)' : s.status==='warn' ? 'rgba(251,191,36,0.15)' : 'rgba(134,239,172,0.15)',
                    color: s.status==='dead' ? '#fca5a5' : s.status==='warn' ? '#fde68a' : '#86efac'
                  }}>{s.status}</span>
                </div>
              </div>
            ))}
        </Card>

        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-3" style={{color:'rgba(255,255,255,0.6)'}}>💸 Recent Spending</div>
          {expenses.length === 0 ? <div className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No expenses yet</div> :
            expenses.slice(0,4).map(e => (
              <div key={e.id} className="flex justify-between items-center py-2.5" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div className="text-sm" style={{color:'#f5f5f7'}}>{e.description}</div>
                  <div className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>{e.expense_date || '—'}</div>
                </div>
                <span className="text-sm font-medium" style={{color:'#fca5a5', fontFamily:'SF Mono, monospace'}}>-${Number(e.amount).toFixed(2)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}

// ─── SUBSCRIPTIONS PAGE ───
function SubsPage({ subs, userId, onRefresh }) {
  const [form, setForm] = useState({ name:'', cost:'', category:'SaaS / Tools', days_since_used:'0', notes:'' })
  const [adding, setAdding] = useState(false)

  async function addSub() {
    if (!form.name || !form.cost) return
    const days = parseInt(form.days_since_used) || 0
    const status = days === 0 ? 'keep' : days < 30 ? 'keep' : days < 60 ? 'warn' : 'dead'
    await supabaseInsert('subscriptions', { ...form, cost: parseFloat(form.cost), days_since_used: days, status, user_id: userId })
    setForm({ name:'', cost:'', category:'SaaS / Tools', days_since_used:'0', notes:'' })
    setAdding(false)
    onRefresh()
  }

  async function deleteSub(id) { await supabaseDelete('subscriptions', id); onRefresh() }

  const total = subs.reduce((a,s) => a + Number(s.cost), 0)
  const dead = subs.filter(s => s.status === 'dead')
  const deadWaste = dead.reduce((a,s) => a + Number(s.cost), 0)

  const categoryData = [...new Set(subs.map(s => s.category))].map(cat => ({
    name: cat, value: subs.filter(s => s.category === cat).reduce((a,s) => a+Number(s.cost), 0)
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>⚔️ Subscription Guillotine</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Track every recurring charge. Kill the dead ones.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>
          + Add Subscription
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Monthly Cost" value={`$${total.toFixed(2)}`} color="#fca5a5" icon="💸" />
        <StatCard label="Dead Tools" value={dead.length} sub={`$${deadWaste.toFixed(2)}/mo wasted`} color="#fca5a5" icon="💀" />
        <StatCard label="Worth Keeping" value={subs.filter(s=>s.status==='keep').length} color="#86efac" icon="✅" />
      </div>

      {adding && (
        <Card style={{padding:'24px', marginBottom:'20px', border:'1px solid rgba(124,58,237,0.3)'}}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Service Name</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Shopify, Claude Pro..." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Monthly Cost ($)</label>
              <input type="number" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} placeholder="29.00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Days Since Last Used</label>
              <input type="number" value={form.days_since_used} onChange={e=>setForm({...form,days_since_used:e.target.value})} placeholder="0 = used today" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}}>
                {['SaaS / Tools','AI Tools','Marketing','Storage','Design','Productivity','Other'].map(c=><option key={c} style={{background:'#1a1a2e'}}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-xl text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Cancel</button>
            <button onClick={addSub} className="px-4 py-2 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>Save</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <Card>
            <div className="p-6">
              <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>All Subscriptions</div>
              <table className="w-full">
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    {['Service','Cost/mo','Category','Last Used','Status',''].map(h => (
                      <th key={h} className="text-left pb-3 text-xs uppercase" style={{color:'rgba(255,255,255,0.25)', fontFamily:'SF Mono, monospace', fontSize:'10px', letterSpacing:'1px'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-sm" style={{color:'rgba(255,255,255,0.2)'}}>No subscriptions yet. Add your first one.</td></tr>
                  ) : subs.map(s => (
                    <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <td className="py-3.5 text-sm font-medium" style={{color:'#f5f5f7'}}>{s.name}</td>
                      <td className="py-3.5 text-sm font-medium" style={{color:'#fca5a5', fontFamily:'SF Mono, monospace'}}>${Number(s.cost).toFixed(2)}</td>
                      <td className="py-3.5"><span className="text-xs px-2 py-1 rounded-full" style={{background:'rgba(124,58,237,0.15)', color:'#c4b5fd'}}>{s.category}</span></td>
                      <td className="py-3.5 text-xs" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace'}}>{s.days_since_used === 0 ? 'Today' : `${s.days_since_used}d ago`}</td>
                      <td className="py-3.5"><span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                        background: s.status==='dead' ? 'rgba(239,68,68,0.15)' : s.status==='warn' ? 'rgba(251,191,36,0.15)' : 'rgba(134,239,172,0.15)',
                        color: s.status==='dead' ? '#fca5a5' : s.status==='warn' ? '#fde68a' : '#86efac'
                      }}>{s.status.toUpperCase()}</span></td>
                      <td className="py-3.5"><button onClick={()=>deleteSub(s.id)} className="text-xs px-3 py-1.5 rounded-lg transition-all" style={{color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)'}}>Kill</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>By Category</div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No data</div>}
        </Card>
      </div>
    </div>
  )
}

// ─── SPENDING PAGE ───
function SpendingPage({ expenses, userId, onRefresh }) {
  const [form, setForm] = useState({ description:'', amount:'', category:'impulse', expense_date:'' })
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')

  async function addExpense() {
    if (!form.description || !form.amount) return
    await supabaseInsert('expenses', { ...form, amount: parseFloat(form.amount), user_id: userId })
    setForm({ description:'', amount:'', category:'impulse', expense_date:'' })
    setAdding(false)
    onRefresh()
  }

  async function deleteExp(id) { await supabaseDelete('expenses', id); onRefresh() }

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter)
  const total = expenses.reduce((a,e) => a + Number(e.amount), 0)
  const leaks = expenses.filter(e => e.category === 'impulse' || e.category === 'food')
  const leakAmt = leaks.reduce((a,e) => a + Number(e.amount), 0)

  const areaData = expenses.slice(-7).map((e, i) => ({ day: `Day ${i+1}`, amount: Number(e.amount) }))

  const catColors = { impulse:'#fca5a5', food:'#fdba74', transport:'#fde68a', business:'#86efac', other:'#c4b5fd' }
  const catLabels = { impulse:'Impulse / Leak', food:'Food & Delivery', transport:'Transport', business:'Business', other:'Other' }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>💸 Daily Spending</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Track impulse buys and convenience leaks.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>
          + Log Expense
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Spent" value={`$${total.toFixed(2)}`} color="#fca5a5" icon="💸" />
        <StatCard label="Leak Amount" value={`$${leakAmt.toFixed(2)}`} sub={`${total > 0 ? Math.round(leakAmt/total*100) : 0}% of spending`} color="#fca5a5" icon="🩸" />
        <StatCard label="Transactions" value={expenses.length} color="#c4b5fd" icon="📋" />
        <StatCard label="Avg per Transaction" value={expenses.length > 0 ? `$${(total/expenses.length).toFixed(2)}` : '$0'} color="#fde68a" icon="📊" />
      </div>

      {adding && (
        <Card style={{padding:'24px', marginBottom:'20px', border:'1px solid rgba(124,58,237,0.3)'}}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Description</label>
              <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Late night delivery..." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Amount ($)</label>
              <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}}>
                <option value="impulse" style={{background:'#1a1a2e'}}>Impulse / Leak</option>
                <option value="food" style={{background:'#1a1a2e'}}>Food & Delivery</option>
                <option value="transport" style={{background:'#1a1a2e'}}>Transport</option>
                <option value="business" style={{background:'#1a1a2e'}}>Business</option>
                <option value="other" style={{background:'#1a1a2e'}}>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Date</label>
              <input value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})} placeholder="May 5" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-xl text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Cancel</button>
            <button onClick={addExpense} className="px-4 py-2 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>Save</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <Card style={{padding:'24px', marginBottom:'16px'}}>
            <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Spending Trend</div>
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `$${v}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
                  <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-40 flex items-center justify-center text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No data yet</div>}
          </Card>
        </div>

        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>By Category</div>
          {[...new Set(expenses.map(e => e.category))].map(cat => {
            const amt = expenses.filter(e => e.category === cat).reduce((a,e) => a+Number(e.amount), 0)
            const pct = total > 0 ? (amt/total*100) : 0
            return (
              <div key={cat} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{color:'rgba(255,255,255,0.5)'}}>{catLabels[cat] || cat}</span>
                  <span style={{color:catColors[cat] || '#c4b5fd', fontFamily:'SF Mono, monospace'}}>${amt.toFixed(2)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                  <div className="h-full rounded-full" style={{width:`${pct}%`, background:catColors[cat] || '#7c3aed'}}></div>
                </div>
              </div>
            )
          })}
          {expenses.length === 0 && <div className="text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No data yet</div>}
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium" style={{color:'rgba(255,255,255,0.6)'}}>Expense Log</div>
            <div className="flex gap-2">
              {['all','impulse','food','transport','business'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{
                  background: filter===f ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: filter===f ? '#c4b5fd' : 'rgba(255,255,255,0.3)',
                  border: filter===f ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent'
                }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {['Description','Amount','Category','Date',''].map(h => (
                  <th key={h} className="text-left pb-3 text-xs uppercase" style={{color:'rgba(255,255,255,0.25)', fontFamily:'SF Mono, monospace', fontSize:'10px', letterSpacing:'1px'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{color:'rgba(255,255,255,0.2)'}}>No expenses yet</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td className="py-3.5 text-sm font-medium" style={{color:'#f5f5f7'}}>{e.description}</td>
                  <td className="py-3.5 text-sm font-medium" style={{color:'#fca5a5', fontFamily:'SF Mono, monospace'}}>-${Number(e.amount).toFixed(2)}</td>
                  <td className="py-3.5"><span className="text-xs px-2 py-1 rounded-full" style={{background: e.category==='impulse'||e.category==='food' ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)', color: e.category==='impulse'||e.category==='food' ? '#fca5a5' : '#c4b5fd'}}>{catLabels[e.category] || e.category}</span></td>
                  <td className="py-3.5 text-xs" style={{color:'rgba(255,255,255,0.3)'}}>{e.expense_date || '—'}</td>
                  <td className="py-3.5"><button onClick={()=>deleteExp(e.id)} className="text-xs px-3 py-1.5 rounded-lg" style={{color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)'}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── INVESTMENTS PAGE ───
function InvestmentsPage({ investments, setInvestments }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ symbol:'', name:'', shares:'', buyPrice:'', currentPrice:'', type:'stock' })

  function addInvestment() {
    if (!form.symbol || !form.shares || !form.buyPrice || !form.currentPrice) return
    setInvestments([...investments, { ...form, shares: parseFloat(form.shares), buyPrice: parseFloat(form.buyPrice), currentPrice: parseFloat(form.currentPrice), id: Date.now() }])
    setForm({ symbol:'', name:'', shares:'', buyPrice:'', currentPrice:'', type:'stock' })
    setAdding(false)
  }

  function deleteInv(id) { setInvestments(investments.filter(i => i.id !== id)) }

  const totalValue = investments.reduce((a, inv) => a + (inv.shares * inv.currentPrice), 0)
  const totalCost = investments.reduce((a, inv) => a + (inv.shares * inv.buyPrice), 0)
  const totalGain = totalValue - totalCost
  const gainPct = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(2) : 0

  const portfolioData = investments.map(inv => ({
    name: inv.symbol,
    value: inv.shares * inv.currentPrice
  }))

  const performanceData = investments.map(inv => ({
    name: inv.symbol,
    cost: inv.shares * inv.buyPrice,
    value: inv.shares * inv.currentPrice,
    gain: ((inv.currentPrice - inv.buyPrice) / inv.buyPrice * 100).toFixed(1)
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>📈 Investments</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Track your stocks and crypto portfolio.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>
          + Add Investment
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Portfolio Value" value={`$${totalValue.toFixed(2)}`} color="#86efac" icon="💼" />
        <StatCard label="Total Cost" value={`$${totalCost.toFixed(2)}`} color="#c4b5fd" icon="💸" />
        <StatCard label="Total Gain/Loss" value={`${totalGain >= 0 ? '+' : ''}$${totalGain.toFixed(2)}`} sub={`${gainPct}%`} color={totalGain >= 0 ? '#86efac' : '#fca5a5'} icon={totalGain >= 0 ? '📈' : '📉'} />
        <StatCard label="Positions" value={investments.length} color="#fde68a" icon="🎯" />
      </div>

      {adding && (
        <Card style={{padding:'24px', marginBottom:'20px', border:'1px solid rgba(124,58,237,0.3)'}}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Symbol</label>
              <input value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value.toUpperCase()})} placeholder="AAPL / BTC" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Name</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Apple Inc." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}}>
                <option value="stock" style={{background:'#1a1a2e'}}>Stock</option>
                <option value="crypto" style={{background:'#1a1a2e'}}>Crypto</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Shares / Amount</label>
              <input type="number" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})} placeholder="2" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Buy Price ($)</label>
              <input type="number" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} placeholder="150.00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Current Price ($)</label>
              <input type="number" value={form.currentPrice} onChange={e=>setForm({...form,currentPrice:e.target.value})} placeholder="189.00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-xl text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Cancel</button>
            <button onClick={addInvestment} className="px-4 py-2 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>Add</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Portfolio Split</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={portfolioData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                {portfolioData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {portfolioData.map((d,i) => (
              <div key={i} className="flex justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div style={{width:'8px', height:'8px', borderRadius:'50%', background:COLORS[i % COLORS.length]}}></div>
                  <span style={{color:'rgba(255,255,255,0.5)'}}>{d.name}</span>
                </div>
                <span style={{color:'rgba(255,255,255,0.7)', fontFamily:'SF Mono, monospace'}}>${d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="col-span-2">
          <Card style={{padding:'24px', marginBottom:'16px'}}>
            <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Cost vs Value</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)', fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
                <Bar dataKey="cost" fill="rgba(124,58,237,0.4)" radius={[4,4,0,0]} name="Cost" />
                <Bar dataKey="value" fill="#7c3aed" radius={[4,4,0,0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>All Positions</div>
          <table className="w-full">
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {['Symbol','Name','Type','Shares','Buy Price','Current','Value','Gain/Loss',''].map(h => (
                  <th key={h} className="text-left pb-3 text-xs uppercase" style={{color:'rgba(255,255,255,0.25)', fontFamily:'SF Mono, monospace', fontSize:'10px', letterSpacing:'1px'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investments.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm" style={{color:'rgba(255,255,255,0.2)'}}>No investments yet. Add your first position.</td></tr>
              ) : investments.map((inv, i) => {
                const value = inv.shares * inv.currentPrice
                const cost = inv.shares * inv.buyPrice
                const gain = value - cost
                const gainP = ((gain/cost)*100).toFixed(1)
                return (
                  <tr key={inv.id || i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td className="py-3.5 font-semibold" style={{color:'#c4b5fd', fontFamily:'SF Mono, monospace'}}>{inv.symbol}</td>
                    <td className="py-3.5 text-sm" style={{color:'#f5f5f7'}}>{inv.name}</td>
                    <td className="py-3.5"><span className="text-xs px-2 py-1 rounded-full" style={{background: inv.type==='crypto' ? 'rgba(251,191,36,0.15)' : 'rgba(134,239,172,0.15)', color: inv.type==='crypto' ? '#fde68a' : '#86efac'}}>{inv.type}</span></td>
                    <td className="py-3.5 text-sm" style={{color:'rgba(255,255,255,0.5)', fontFamily:'SF Mono, monospace'}}>{inv.shares}</td>
                    <td className="py-3.5 text-sm" style={{color:'rgba(255,255,255,0.5)', fontFamily:'SF Mono, monospace'}}>${inv.buyPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-sm font-medium" style={{color:'#f5f5f7', fontFamily:'SF Mono, monospace'}}>${inv.currentPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-sm font-medium" style={{color:'#86efac', fontFamily:'SF Mono, monospace'}}>${value.toFixed(2)}</td>
                    <td className="py-3.5 text-sm font-medium" style={{color: gain >= 0 ? '#86efac' : '#fca5a5', fontFamily:'SF Mono, monospace'}}>{gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainP}%)</td>
                    <td className="py-3.5"><button onClick={()=>deleteInv(inv.id || i)} className="text-xs px-3 py-1.5 rounded-lg" style={{color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)'}}>×</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── BALANCE PAGE ───
function BalancePage({ income, totalIncome, totalExp, totalSubs, netBal, userId, onRefresh }) {
  const [form, setForm] = useState({ source:'', amount:'', income_date:'' })
  const [adding, setAdding] = useState(false)

  async function addIncome() {
    if (!form.source || !form.amount) return
    await supabaseInsert('income', { ...form, amount: parseFloat(form.amount), user_id: userId })
    setForm({ source:'', amount:'', income_date:'' })
    setAdding(false)
    onRefresh()
  }

  async function deleteInc(id) { await supabaseDelete('income', id); onRefresh() }

  const sr = totalIncome > 0 ? Math.round(((totalIncome - totalExp - totalSubs) / totalIncome) * 100) : 0
  const incomeData = income.map((i, idx) => ({ name: i.source?.slice(0,8) || `#${idx+1}`, amount: Number(i.amount) }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>💰 Balance & Savings</h1>
          <p className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Track income and your savings rate.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>
          + Log Income
        </button>
      </div>

      <Card style={{padding:'32px', marginBottom:'24px', background:'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(76,29,149,0.05))'}}>
        <div className="text-xs uppercase tracking-widest mb-2" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Net Balance</div>
        <div className="text-5xl font-semibold mb-2" style={{color: netBal >= 0 ? '#86efac' : '#fca5a5', letterSpacing:'-2px'}}>${Math.abs(netBal).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
        <div className="text-sm" style={{color:'rgba(255,255,255,0.4)'}}>{netBal >= 0 ? '↑ You are net positive this month' : '↓ Spending exceeds income'}</div>
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <div>
            <div className="text-xs mb-1" style={{color:'rgba(255,255,255,0.3)'}}>Total Income</div>
            <div className="text-lg font-semibold" style={{color:'#86efac', fontFamily:'SF Mono, monospace'}}>${totalIncome.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{color:'rgba(255,255,255,0.3)'}}>Total Expenses</div>
            <div className="text-lg font-semibold" style={{color:'#fca5a5', fontFamily:'SF Mono, monospace'}}>${(totalExp+totalSubs).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{color:'rgba(255,255,255,0.3)'}}>Savings Rate</div>
            <div className="text-lg font-semibold" style={{color: sr >= 30 ? '#86efac' : sr >= 15 ? '#fde68a' : '#fca5a5', fontFamily:'SF Mono, monospace'}}>{sr}%</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <Card style={{padding:'24px'}}>
            <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Income Sources</div>
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={incomeData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)', fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'rgba(255,255,255,0.3)', fontSize:10}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `$${v}`} contentStyle={{background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f5f5f7'}} />
                  <Bar dataKey="amount" radius={[4,4,0,0]}>
                    {incomeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-48 flex items-center justify-center text-xs" style={{color:'rgba(255,255,255,0.2)'}}>No income logged yet</div>}
          </Card>
        </div>

        <Card style={{padding:'24px'}}>
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Savings Goal</div>
          <div className="flex items-center justify-center mb-4">
            <div style={{position:'relative', width:'120px', height:'120px'}}>
              <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={sr>=30?'#86efac':sr>=15?'#fde68a':'#fca5a5'} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="314.16"
                  strokeDashoffset={314.16 - (314.16 * Math.min(sr, 100) / 100)} />
              </svg>
              <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <div className="text-2xl font-semibold" style={{color: sr>=30?'#86efac':sr>=15?'#fde68a':'#fca5a5'}}>{sr}%</div>
                <div className="text-xs" style={{color:'rgba(255,255,255,0.3)'}}>saved</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-center" style={{color:'rgba(255,255,255,0.4)'}}>
            {sr >= 30 ? '🎉 Excellent! Above 30% target' : sr >= 15 ? '📈 Good progress. Target is 30%' : '⚠️ Below target. Trim expenses'}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5" style={{color:'rgba(255,255,255,0.3)'}}>
              <span>Goal: 30%</span>
              <span>{Math.min(Math.round(sr/30*100), 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
              <div className="h-full rounded-full" style={{width:`${Math.min(sr/30*100, 100)}%`, background: sr>=30?'#86efac':sr>=15?'#fde68a':'#fca5a5'}}></div>
            </div>
          </div>
        </Card>
      </div>

      {adding && (
        <Card style={{padding:'24px', marginBottom:'16px', border:'1px solid rgba(124,58,237,0.3)'}}>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Source</label>
              <input value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="Freelance, Product sale..." className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Amount ($)</label>
              <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider mb-1.5 block" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace', fontSize:'10px'}}>Date</label>
              <input value={form.income_date} onChange={e=>setForm({...form,income_date:e.target.value})} placeholder="May 5" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f5f5f7'}} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-xl text-sm" style={{color:'rgba(255,255,255,0.4)'}}>Cancel</button>
            <button onClick={addIncome} className="px-4 py-2 rounded-xl text-sm font-medium" style={{background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff'}}>Save</button>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <div className="text-sm font-medium mb-4" style={{color:'rgba(255,255,255,0.6)'}}>Income Log</div>
          <table className="w-full">
            <thead>
              <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                {['Source','Amount','Date',''].map(h => (
                  <th key={h} className="text-left pb-3 text-xs uppercase" style={{color:'rgba(255,255,255,0.25)', fontFamily:'SF Mono, monospace', fontSize:'10px', letterSpacing:'1px'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {income.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-sm" style={{color:'rgba(255,255,255,0.2)'}}>No income logged yet</td></tr>
              ) : income.map(i => (
                <tr key={i.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td className="py-3.5 text-sm font-medium" style={{color:'#f5f5f7'}}>{i.source}</td>
                  <td className="py-3.5 text-sm font-medium" style={{color:'#86efac', fontFamily:'SF Mono, monospace'}}>+${Number(i.amount).toFixed(2)}</td>
                  <td className="py-3.5 text-xs" style={{color:'rgba(255,255,255,0.3)'}}>{i.income_date || '—'}</td>
                  <td className="py-3.5"><button onClick={()=>deleteInc(i.id)} className="text-xs px-3 py-1.5 rounded-lg" style={{color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.08)'}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── AI ADVISOR PAGE ───
function AIPage({ user, subs, expenses, income, investments }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm your BurnRate AI Advisor. I can see your financial data and help you optimize spending, cut dead subscriptions, and grow your wealth. What's on your mind?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = [
    "Which subscriptions should I cancel?",
    "How can I improve my savings rate?",
    "Give me investment advice based on my portfolio",
    "Where am I leaking the most money?",
  ]

  async function sendMessage(msg) {
    const userMsg = msg || input.trim()
    if (!userMsg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const context = `
      Subscriptions: ${subs.map(s => `${s.name} $${s.cost}/mo status:${s.status} days-unused:${s.days_since_used}`).join(', ') || 'none'}.
      Expenses: ${expenses.map(e => `${e.description} $${e.amount} (${e.category})`).join(', ') || 'none'}.
      Income: ${income.map(i => `${i.source} $${i.amount}`).join(', ') || 'none'}.
      Investments: ${investments.map(inv => `${inv.symbol} ${inv.shares} shares, buy:$${inv.buyPrice}, current:$${inv.currentPrice}`).join(', ') || 'none'}.
    `

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Could not get a response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div className="p-8 h-screen flex flex-col" style={{maxHeight:'100vh'}}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center rounded-xl text-lg" style={{width:'40px', height:'40px', background:'linear-gradient(135deg, #7c3aed, #4c1d95)'}}>🤖</div>
          <div>
            <h1 className="text-2xl font-semibold" style={{color:'#f5f5f7', letterSpacing:'-0.5px'}}>AI Financial Advisor</h1>
            <div className="text-xs" style={{color:'rgba(255,255,255,0.3)', fontFamily:'SF Mono, monospace'}}>powered by claude · sees your real data</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{background:'rgba(124,58,237,0.1)', color:'#c4b5fd', border:'1px solid rgba(124,58,237,0.2)'}}>
            {s}
          </button>
        ))}
      </div>

      <Card style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:'0'}}>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" style={{minHeight:'0'}}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 flex items-center justify-center rounded-xl text-sm" style={{
                width:'32px', height:'32px',
                background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {m.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{
                background: m.role === 'user' ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(76,29,149,0.15))' : 'rgba(255,255,255,0.03)',
                border: m.role === 'user' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.07)',
                color: '#f5f5f7'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 flex items-center justify-center rounded-xl text-sm" style={{width:'32px', height:'32px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>🤖</div>
              <div className="px-4 py-3 rounded-2xl" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="rounded-full" style={{width:'6px', height:'6px', background:'rgba(255,255,255,0.3)', animation:`pulse 1.2s infinite ${i*0.2}s`}}></div>)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex gap-3 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about your finances..."
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
              style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'#f5f5f7'}}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl font-medium text-sm transition-all"
              style={{width:'44px', height:'44px', background:'linear-gradient(135deg, #7c3aed, #4c1d95)', color:'#fff', opacity: loading || !input.trim() ? 0.5 : 1}}>
              ↑
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}