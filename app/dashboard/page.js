'use client'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import { useState, useEffect } from 'react'
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const THEMES = {
  dashboard:     { accent:'#7c3aed', bg:'rgba(124,58,237,0.08)',  border:'rgba(124,58,237,0.25)',  text:'#c4b5fd',  chart:['#7c3aed','#a78bfa','#6d28d9','#ddd6fe','#4c1d95'] },
  subscriptions: { accent:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.25)',   text:'#fca5a5',  chart:['#ef4444','#f87171','#dc2626','#fecaca','#b91c1c'] },
  spending:      { accent:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)',  text:'#fde68a',  chart:['#f59e0b','#fbbf24','#d97706','#fef3c7','#92400e'] },
  investments:   { accent:'#10b981', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)',  text:'#6ee7b7',  chart:['#10b981','#34d399','#059669','#a7f3d0','#065f46'] },
  balance:       { accent:'#06b6d4', bg:'rgba(6,182,212,0.08)',   border:'rgba(6,182,212,0.25)',   text:'#67e8f9',  chart:['#06b6d4','#22d3ee','#0891b2','#cffafe','#164e63'] },
  ai:            { accent:'#8b5cf6', bg:'rgba(139,92,246,0.08)',  border:'rgba(139,92,246,0.25)',  text:'#ddd6fe',  chart:['#8b5cf6','#a78bfa','#7c3aed','#ede9fe','#4c1d95'] },
}

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
      { id:1, symbol:'AAPL', name:'Apple Inc.', shares:2, buyPrice:150, currentPrice:189, type:'stock' },
      { id:2, symbol:'BTC', name:'Bitcoin', shares:0.01, buyPrice:40000, currentPrice:62000, type:'crypto' },
    ])
  }

  if (!user) return (
    <div style={{background:'#0a0a0f', fontFamily:'SF Pro Display,-apple-system,BlinkMacSystemFont,sans-serif', minHeight:'100vh', display:'flex', flexDirection:'column'}}>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-tabbar { display: flex !important; }
          .main-content { padding-bottom: 80px !important; }
          .page-padding { padding: 20px !important; }
          .stat-grid-4 { grid-template-columns: repeat(2,1fr) !important; }
          .stat-grid-3 { grid-template-columns: repeat(2,1fr) !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-topbar { display: none !important; }
          .mobile-tabbar { display: none !important; }
          .app-shell { flex-direction: row !important; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar" style={{display:'none', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'sticky', top:0, zIndex:50, backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'28px', height:'28px', borderRadius:'8px', background:'linear-gradient(135deg,#7c3aed,#4c1d95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>🔥</div>
          <div style={{color:'#f5f5f7', fontSize:'15px', fontWeight:600, letterSpacing:'-0.3px'}}>BurnRate OS</div>
        </div>
        <div style={{color:'rgba(255,255,255,0.3)', fontSize:'11px', fontFamily:'SF Mono,monospace'}}>{user?.name || user?.email?.split('@')[0] || 'User'}</div>
      </div>

      <div className="app-shell" style={{display:'flex', flex:1}}>

        {/* DESKTOP SIDEBAR */}
        <div className="desktop-sidebar" style={{width:'220px', background:'rgba(255,255,255,0.018)', borderRight:'1px solid rgba(255,255,255,0.06)', flexShrink:0, flexDirection:'column', padding:'32px 16px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px', paddingLeft:'8px'}}>
            <div style={{width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#7c3aed,#4c1d95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0}}>🔥</div>
            <div>
              <div style={{color:'#f5f5f7', fontSize:'14px', fontWeight:600, letterSpacing:'-0.3px'}}>BurnRate OS</div>
              <div style={{color:'rgba(255,255,255,0.3)', fontSize:'10px', fontFamily:'SF Mono,monospace'}}>command center</div>
            </div>
          </div>

          <nav style={{display:'flex', flexDirection:'column', gap:'2px', flex:1}}>
            {navItems.map(item => {
              const t = THEMES[item.id]
              const active = page === item.id
              return (
                <button key={item.id} onClick={() => setPage(item.id)}
                  style={{display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'10px', fontSize:'13px', fontWeight:500, textAlign:'left', background:active?t.bg:'transparent', color:active?t.text:'rgba(255,255,255,0.38)', border:active?`1px solid ${t.border}`:'1px solid transparent', cursor:'pointer', transition:'all 0.18s'}}>
                  <span style={{fontSize:'15px'}}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div style={{marginBottom:'16px'}}>
            <button onClick={() => setPage('ai')}
              style={{width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'11px 12px', borderRadius:'12px', background:page==='ai'?'linear-gradient(135deg,#7c3aed,#4c1d95)':'rgba(124,58,237,0.1)', color:page==='ai'?'#fff':'#c4b5fd', border:'1px solid rgba(124,58,237,0.35)', cursor:'pointer', transition:'all 0.18s'}}>
              <span style={{fontSize:'16px'}}>🤖</span>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:'13px', fontWeight:600}}>AI Advisor</div>
                <div style={{fontSize:'10px', color:page==='ai'?'rgba(255,255,255,0.5)':'rgba(196,181,253,0.5)', fontFamily:'SF Mono,monospace'}}>powered by claude</div>
              </div>
            </button>
          </div>

          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'16px'}}>
            <div style={{paddingLeft:'8px', marginBottom:'10px'}}>
              <div style={{color:'#f5f5f7', fontSize:'13px', fontWeight:500}}>{user?.name || 'User'}</div>
              <div style={{color:'rgba(255,255,255,0.28)', fontSize:'10px', fontFamily:'SF Mono,monospace', marginTop:'2px'}}>{user?.email || ''}</div>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.href='/login' }}
              style={{width:'100%', textAlign:'left', padding:'6px 8px', borderRadius:'8px', fontSize:'12px', color:'rgba(255,255,255,0.28)', background:'transparent', border:'none', cursor:'pointer'}}>
              Sign out →
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content" style={{flex:1, overflowY:'auto'}}>
          {page==='dashboard'     && <OverviewPage theme={THEMES.dashboard} netBal={netBal} totalSubs={totalSubs} totalExp={totalExp} deadSubs={deadSubs} subs={subs} expenses={expenses} totalIncome={totalIncome} invGain={invGain} totalInvValue={totalInvValue} />}
          {page==='subscriptions' && <SubsPage theme={THEMES.subscriptions} subs={subs} userId={user.id} onRefresh={() => loadData(user.id)} />}
          {page==='spending'      && <SpendingPage theme={THEMES.spending} expenses={expenses} userId={user.id} onRefresh={() => loadData(user.id)} />}
          {page==='investments'   && <InvestmentsPage theme={THEMES.investments} investments={investments} setInvestments={setInvestments} />}
          {page==='balance'       && <BalancePage theme={THEMES.balance} income={income} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} userId={user.id} onRefresh={() => loadData(user.id)} />}
          {page==='ai'            && <AIPage theme={THEMES.ai} user={user} subs={subs} expenses={expenses} income={income} investments={investments} />}
        </div>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="mobile-tabbar" style={{display:'none', position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,15,0.95)', borderTop:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', zIndex:50, padding:'8px 0 20px'}}>
        {[...navItems, { id:'ai', icon:'🤖', label:'AI' }].map(item => {
          const active = page === item.id
          const t = THEMES[item.id] || THEMES.ai
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', padding:'6px 4px', background:'transparent', border:'none', cursor:'pointer'}}>
              <div style={{width:'36px', height:'36px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', background:active?t.bg:'transparent', border:active?`1px solid ${t.border}`:'1px solid transparent', transition:'all 0.18s'}}>
                {item.icon}
              </div>
              <span style={{fontSize:'10px', fontWeight:active?600:400, color:active?t.text:'rgba(255,255,255,0.3)', transition:'all 0.18s'}}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}

function PageHeader({ theme, title, subtitle, action }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
      <div>
        <h1 style={{color:theme.text,fontSize:'24px',fontWeight:600,letterSpacing:'-0.5px',margin:0,marginBottom:'4px'}}>{title}</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0}}>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function AddBtn({ theme, label, onClick }) {
  return (
    <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',fontSize:'13px',fontWeight:500,background:`linear-gradient(135deg,${theme.accent},${theme.accent}88)`,color:'#fff',border:'none',cursor:'pointer'}}>
      {label}
    </button>
  )
}

const TIP = {fontFamily:'SF Mono,monospace',fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)'}
const VAL = {fontFamily:'SF Mono,monospace'}

function TH({ children }) {
  return <th style={{...TIP,textAlign:'left',paddingBottom:'12px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:400}}>{children}</th>
}

const tooltipStyle = {background:'#12121c',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'#f5f5f7',fontSize:'12px'}

// ── OVERVIEW ──────────────────────────────────────────────────────

function OverviewPage({ theme, netBal, totalSubs, totalExp, deadSubs, subs, expenses, totalIncome, invGain, totalInvValue }) {
  const sr = totalIncome > 0 ? Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100) : 0

  const pieData = [
    { name:'Subscriptions', value:totalSubs },
    { name:'Expenses',      value:totalExp },
    { name:'Saved',         value:Math.max(0, netBal) },
  ].filter(d => d.value > 0)

  const barData = expenses.slice(-6).map((e,i) => ({ name:e.description?.slice(0,8)||`#${i+1}`, amount:Number(e.amount) }))

  return (
    <div style={{padding:'40px'}}>
      <div style={{marginBottom:'32px'}}>
        <h1 style={{color:theme.text,fontSize:'26px',fontWeight:600,letterSpacing:'-0.5px',margin:0,marginBottom:'4px'}}>Good morning ☀️</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0}}>Here's your financial snapshot.</p>
      </div>

      {deadSubs.length > 0 && (
        <div style={{display:'flex',gap:'12px',padding:'14px 18px',borderRadius:'14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',marginBottom:'24px'}}>
          <span>⚠️</span>
          <div>
            <div style={{color:'#fca5a5',fontSize:'13px',fontWeight:500}}>{deadSubs.length} dead subscription{deadSubs.length>1?'s':''} detected</div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',marginTop:'2px'}}>{deadSubs.map(s=>s.name).join(', ')} — wasting ${deadSubs.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo</div>
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard label="Net Balance" value={`$${Math.abs(netBal).toFixed(0)}`} sub={netBal>=0?'↑ Positive':'↓ In the red'} color={netBal>=0?'#6ee7b7':'#fca5a5'} icon="💰" />
        <StatCard label="Monthly Burn" value={`$${(totalExp+totalSubs).toFixed(0)}`} sub="expenses + subs" color="#fca5a5" icon="🔥" />
        <StatCard label="Savings Rate" value={`${sr}%`} sub={sr>=30?'Excellent':sr>=15?'Good':'Needs work'} color={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} icon="📊" />
        <StatCard label="Portfolio" value={`$${totalInvValue.toFixed(0)}`} sub={invGain>=0?`+$${invGain.toFixed(0)} gain`:`-$${Math.abs(invGain).toFixed(0)} loss`} color={invGain>=0?'#6ee7b7':'#fca5a5'} icon="📈" />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Spending Breakdown</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={4} dataKey="value">
                  {pieData.map((_,i) => <Cell key={i} fill={theme.chart[i]} />)}
                </Pie>
                <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No data yet</div>}
          <div style={{display:'flex',gap:'16px',justifyContent:'center',marginTop:'8px'}}>
            {pieData.map((d,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'rgba(255,255,255,0.35)'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:theme.chart[i]}}></div>
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Recent Expenses</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle} />
                <Bar dataKey="amount" radius={[4,4,0,0]}>
                  {barData.map((_,i) => <Cell key={i} fill={THEMES.spending.chart[i%5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No expenses yet</div>}
        </Card>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'14px'}}>⚔️ Top Subscriptions</div>
          {subs.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No subscriptions yet</div> :
            subs.slice(0,4).map(s => (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px'}}>{s.name}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px'}}>{s.category}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{color:THEMES.subscriptions.text,fontSize:'13px',...VAL}}>${Number(s.cost).toFixed(2)}</span>
                  <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7'}}>{s.status}</span>
                </div>
              </div>
            ))}
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'14px'}}>💸 Recent Spending</div>
          {expenses.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No expenses yet</div> :
            expenses.slice(0,4).map(e => (
              <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px'}}>{e.description}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px'}}>{e.expense_date||'—'}</div>
                </div>
                <span style={{color:THEMES.spending.text,fontSize:'13px',...VAL}}>-${Number(e.amount).toFixed(2)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────────

function SubsPage({ theme, subs, userId, onRefresh }) {
  const [form, setForm] = useState({name:'',cost:'',category:'SaaS / Tools',days_since_used:'0',notes:''})
  const [adding, setAdding] = useState(false)

  async function addSub() {
    if (!form.name||!form.cost) return
    const days = parseInt(form.days_since_used)||0
    const status = days===0?'keep':days<30?'keep':days<60?'warn':'dead'
    await supabaseInsert('subscriptions',{...form,cost:parseFloat(form.cost),days_since_used:days,status,user_id:userId})
    setForm({name:'',cost:'',category:'SaaS / Tools',days_since_used:'0',notes:''})
    setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('subscriptions',id); onRefresh() }

  const total = subs.reduce((a,s)=>a+Number(s.cost),0)
  const dead = subs.filter(s=>s.status==='dead')
  const catData = [...new Set(subs.map(s=>s.category))].map(c=>({name:c,value:subs.filter(s=>s.category===c).reduce((a,s)=>a+Number(s.cost),0)}))

  return (
    <div style={{padding:'40px'}}>
      <PageHeader theme={theme} title="⚔️ Subscription Guillotine" subtitle="Track every recurring charge. Kill the dead ones."
        action={<AddBtn theme={theme} label="+ Add Subscription" onClick={()=>setAdding(!adding)} />} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard label="Monthly Cost" value={`$${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard label="Dead Tools" value={dead.length} sub={`$${dead.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo wasted`} color="#fca5a5" icon="💀" />
        <StatCard label="Worth Keeping" value={subs.filter(s=>s.status==='keep').length} color="#6ee7b7" icon="✅" />
      </div>

      {adding && (
        <Card style={{padding:'24px',marginBottom:'20px',border:`1px solid ${theme.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
            {[['Service Name','name','text','Shopify, Claude Pro...'],['Monthly Cost ($)','cost','number','29.00'],['Days Since Last Used','days_since_used','number','0 = used today']].map(([label,key,type,ph])=>(
              <div key={key}>
                <div style={{...TIP,marginBottom:'6px'}}>{label}</div>
                <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>Category</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none'}}>
                {['SaaS / Tools','AI Tools','Marketing','Storage','Design','Productivity','Other'].map(c=><option key={c} style={{background:'#12121c'}}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer'}}>Cancel</button>
            <button onClick={addSub} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:500,background:`linear-gradient(135deg,${theme.accent},${theme.accent}99)`,color:'#fff',border:'none',cursor:'pointer'}}>Save</button>
          </div>
        </Card>
      )}

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'16px'}}>
        <Card style={{padding:'24px'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr><TH>Service</TH><TH>Cost/mo</TH><TH>Category</TH><TH>Last Used</TH><TH>Status</TH><TH></TH></tr></thead>
            <tbody>
              {subs.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No subscriptions yet</td></tr>
              : subs.map(s=>(
                <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'12px 0 12px',color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{s.name}</td>
                  <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>${Number(s.cost).toFixed(2)}</td>
                  <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${theme.accent}22`,color:theme.text}}>{s.category}</span></td>
                  <td style={{padding:'12px 0',...VAL,color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>{s.days_since_used===0?'Today':`${s.days_since_used}d ago`}</td>
                  <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',fontWeight:500,background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7'}}>{s.status.toUpperCase()}</span></td>
                  <td style={{padding:'12px 0'}}><button onClick={()=>del(s.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer'}}>Kill</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>By Category</div>
          {catData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                  {catData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} />)}
                </Pie>
                <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No data</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'8px'}}>
            {catData.map((d,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)'}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:theme.chart[i%5]}}></div>
                  {d.name}
                </div>
                <span style={{...VAL,color:'rgba(255,255,255,0.6)'}}>${d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── SPENDING ──────────────────────────────────────────────────────

function SpendingPage({ theme, expenses, userId, onRefresh }) {
  const [form, setForm] = useState({description:'',amount:'',category:'impulse',expense_date:''})
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')

  async function addExpense() {
    if (!form.description||!form.amount) return
    await supabaseInsert('expenses',{...form,amount:parseFloat(form.amount),user_id:userId})
    setForm({description:'',amount:'',category:'impulse',expense_date:''}); setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('expenses',id); onRefresh() }

  const filtered = filter==='all' ? expenses : expenses.filter(e=>e.category===filter)
  const total = expenses.reduce((a,e)=>a+Number(e.amount),0)
  const leaks = expenses.filter(e=>e.category==='impulse'||e.category==='food')
  const leakAmt = leaks.reduce((a,e)=>a+Number(e.amount),0)
  const areaData = expenses.slice(-7).map((e,i)=>({day:`D${i+1}`,amount:Number(e.amount)}))
  const catLabels = {impulse:'Impulse',food:'Food',transport:'Transport',business:'Business',other:'Other'}
  const catColors = {impulse:'#ef4444',food:'#f97316',transport:'#f59e0b',business:'#10b981',other:'#8b5cf6'}

  return (
    <div style={{padding:'40px'}}>
      <PageHeader theme={theme} title="💸 Daily Spending" subtitle="Track impulse buys and convenience leaks."
        action={<AddBtn theme={theme} label="+ Log Expense" onClick={()=>setAdding(!adding)} />} />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard label="Total Spent" value={`$${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard label="Leak Amount" value={`$${leakAmt.toFixed(2)}`} sub={`${total>0?Math.round(leakAmt/total*100):0}% of spending`} color="#fca5a5" icon="🩸" />
        <StatCard label="Transactions" value={expenses.length} color={theme.text} icon="📋" />
        <StatCard label="Avg / Transaction" value={expenses.length>0?`$${(total/expenses.length).toFixed(2)}`:'$0'} color={theme.text} icon="📊" />
      </div>

      {adding && (
        <Card style={{padding:'24px',marginBottom:'20px',border:`1px solid ${theme.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
            {[['Description','description','text','Late night delivery...'],['Amount ($)','amount','number','0.00'],['Date','expense_date','text','May 5']].map(([label,key,type,ph])=>(
              <div key={key}>
                <div style={{...TIP,marginBottom:'6px'}}>{label}</div>
                <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>Category</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none'}}>
                <option value="impulse" style={{background:'#12121c'}}>Impulse / Leak</option>
                <option value="food" style={{background:'#12121c'}}>Food & Delivery</option>
                <option value="transport" style={{background:'#12121c'}}>Transport</option>
                <option value="business" style={{background:'#12121c'}}>Business</option>
                <option value="other" style={{background:'#12121c'}}>Other</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer'}}>Cancel</button>
            <button onClick={addExpense} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:500,background:`linear-gradient(135deg,${theme.accent},${theme.accent}99)`,color:'#fff',border:'none',cursor:'pointer'}}>Save</button>
          </div>
        </Card>
      )}

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Spending Trend</div>
          {areaData.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle}/>
                <Area type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2} fill="url(#spendGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No data yet</div>}
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>By Category</div>
          {[...new Set(expenses.map(e=>e.category))].map(cat=>{
            const amt = expenses.filter(e=>e.category===cat).reduce((a,e)=>a+Number(e.amount),0)
            const pct = total>0?(amt/total*100):0
            return (
              <div key={cat} style={{marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'5px'}}>
                  <span style={{color:'rgba(255,255,255,0.45)'}}>{catLabels[cat]||cat}</span>
                  <span style={{...VAL,color:catColors[cat]||theme.text}}>${amt.toFixed(2)}</span>
                </div>
                <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}>
                  <div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:catColors[cat]||theme.accent}}></div>
                </div>
              </div>
            )
          })}
          {expenses.length===0 && <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No data yet</div>}
        </Card>
      </div>

      <Card style={{padding:'24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500}}>Expense Log</div>
          <div style={{display:'flex',gap:'6px'}}>
            {['all','impulse','food','transport','business'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{fontSize:'11px',padding:'5px 12px',borderRadius:'100px',background:filter===f?theme.bg:'transparent',color:filter===f?theme.text:'rgba(255,255,255,0.28)',border:filter===f?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer'}}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><TH>Description</TH><TH>Amount</TH><TH>Category</TH><TH>Date</TH><TH></TH></tr></thead>
          <tbody>
            {filtered.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No expenses yet</td></tr>
            : filtered.map(e=>(
              <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{e.description}</td>
                <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>-${Number(e.amount).toFixed(2)}</td>
                <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${catColors[e.category]||theme.accent}22`,color:catColors[e.category]||theme.text}}>{catLabels[e.category]||e.category}</span></td>
                <td style={{padding:'12px 0',color:'rgba(255,255,255,0.28)',fontSize:'12px'}}>{e.expense_date||'—'}</td>
                <td style={{padding:'12px 0'}}><button onClick={()=>del(e.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer'}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ── INVESTMENTS ───────────────────────────────────────────────────

function InvestmentsPage({ theme, investments, setInvestments }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})
  const [prices, setPrices] = useState({})
  const [changes, setChanges] = useState({})
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(false)

  async function fetchPrices() {
    if (investments.length === 0) return
    setLoadingPrices(true)
    const updatedPrices = {}
    const updatedChanges = {}
    for (const inv of investments) {
      try {
        const res = await fetch(`/api/stocks?symbol=${inv.symbol}`)
        const data = await res.json()
        if (data.price) {
          updatedPrices[inv.symbol] = parseFloat(data.price)
          updatedChanges[inv.symbol] = parseFloat(data.change)
        }
      } catch {}
    }
    setPrices(updatedPrices)
    setChanges(updatedChanges)
    setLastUpdated(new Date().toLocaleTimeString())
    setLoadingPrices(false)
  }

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [investments.length])

  async function searchStocks(query) {
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/stocks?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
    } catch { setSearchResults([]) }
    setSearching(false)
  }

  async function selectStock(stock) {
    setSearchQuery(stock.name)
    setSearchResults([])
    setFetchingPrice(true)
    try {
      const res = await fetch(`/api/stocks?symbol=${stock.symbol}`)
      const data = await res.json()
      setForm(f => ({...f, symbol:stock.symbol, name:stock.name, type:stock.type, currentPrice:data.price||''}))
    } catch {}
    setFetchingPrice(false)
  }

  function addInv() {
    if (!form.symbol||!form.shares||!form.buyPrice) return
    setInvestments([...investments,{...form,shares:parseFloat(form.shares),buyPrice:parseFloat(form.buyPrice),currentPrice:parseFloat(form.currentPrice)||0,id:Date.now()}])
    setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})
    setSearchQuery('')
    setAdding(false)
  }
  function del(id) { setInvestments(investments.filter(i=>i.id!==id)) }

  const totalValue = investments.reduce((a,inv)=>a+(inv.shares*(prices[inv.symbol]||inv.currentPrice)),0)
  const totalCost  = investments.reduce((a,inv)=>a+(inv.shares*inv.buyPrice),0)
  const totalGain  = totalValue - totalCost
  const gainPct    = totalCost>0?((totalGain/totalCost)*100).toFixed(2):0
  const pieData = investments.map(inv=>({name:inv.symbol,value:inv.shares*(prices[inv.symbol]||inv.currentPrice)}))
  const barData = investments.map(inv=>({name:inv.symbol,cost:inv.shares*inv.buyPrice,value:inv.shares*(prices[inv.symbol]||inv.currentPrice)}))

  return (
    <div style={{padding:'40px'}}>
      <PageHeader theme={theme} title="📈 Investments" subtitle="Live prices update every 30 seconds."
        action={
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            {lastUpdated && (
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981'}}></div>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:'SF Mono,monospace'}}>Updated {lastUpdated}</span>
              </div>
            )}
            <AddBtn theme={theme} label="+ Add Position" onClick={()=>setAdding(!adding)} />
          </div>
        }
      />

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard label="Portfolio Value" value={`$${totalValue.toFixed(2)}`} color={theme.text} icon="💼" />
        <StatCard label="Total Cost" value={`$${totalCost.toFixed(2)}`} color="rgba(255,255,255,0.6)" icon="💸" />
        <StatCard label="Total Gain/Loss" value={`${totalGain>=0?'+':''}$${totalGain.toFixed(2)}`} sub={`${gainPct}%`} color={totalGain>=0?'#6ee7b7':'#fca5a5'} icon={totalGain>=0?'📈':'📉'} />
        <StatCard label="Positions" value={investments.length} color={theme.text} icon="🎯" />
      </div>

      {adding && (
        <Card style={{padding:'24px',marginBottom:'20px',border:`1px solid ${theme.border}`}}>
          <div style={{marginBottom:'16px'}}>
            <div style={{...TIP,marginBottom:'6px'}}>Search Stock or Crypto</div>
            <div style={{position:'relative'}}>
              <input
                value={searchQuery}
                onChange={e=>searchStocks(e.target.value)}
                placeholder="Search Apple, Bitcoin, Tesla..."
                style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:`1px solid ${theme.border}`,color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
              />
              {searching && <div style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>Searching...</div>}
              {fetchingPrice && <div style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:theme.text,fontSize:'12px'}}>Fetching price...</div>}

              {searchResults.length > 0 && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:'4px',background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',overflow:'hidden',zIndex:100,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
                  {searchResults.map((s,i) => (
                    <div key={i} onClick={()=>selectStock(s)}
                      style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.05)',transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div>
                        <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:600}}>{s.symbol}</div>
                        <div style={{color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{s.name}</div>
                      </div>
                      <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:s.type==='crypto'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.type==='crypto'?'#fde68a':'#6ee7b7'}}>{s.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {form.symbol && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
              <div>
                <div style={{...TIP,marginBottom:'6px'}}>Symbol</div>
                <div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:theme.text,fontSize:'13px',fontWeight:600,...VAL}}>{form.symbol}</div>
              </div>
              <div>
                <div style={{...TIP,marginBottom:'6px'}}>Current Price</div>
                <div style={{padding:'10px 14px',borderRadius:'10px',background:fetchingPrice?'rgba(255,255,255,0.02)':'rgba(16,185,129,0.08)',border:`1px solid ${fetchingPrice?'rgba(255,255,255,0.09)':'rgba(16,185,129,0.2)'}`,color:'#6ee7b7',fontSize:'13px',fontWeight:600,...VAL}}>
                  {fetchingPrice ? 'Loading...' : form.currentPrice ? `$${form.currentPrice}` : '—'}
                </div>
              </div>
              <div>
                <div style={{...TIP,marginBottom:'6px'}}>Type</div>
                <div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>{form.type}</div>
              </div>
              <div>
                <div style={{...TIP,marginBottom:'6px'}}>Shares / Amount</div>
                <input type="number" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})} placeholder="2"
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              </div>
              <div>
                <div style={{...TIP,marginBottom:'6px'}}>Buy Price ($)</div>
                <input type="number" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} placeholder="150.00"
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              </div>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>{setAdding(false);setSearchQuery('');setSearchResults([]);setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})}}
              style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer'}}>Cancel</button>
            <button onClick={addInv} disabled={!form.symbol||!form.shares||!form.buyPrice}
              style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:500,background:`linear-gradient(135deg,${theme.accent},${theme.accent}99)`,color:'#fff',border:'none',cursor:'pointer',opacity:!form.symbol||!form.shares||!form.buyPrice?0.4:1}}>
              Add Position
            </button>
          </div>
        </Card>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'16px',marginBottom:'16px'}}>
        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Portfolio Split</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} />)}
              </Pie>
              <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'8px'}}>
            {pieData.map((d,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)'}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:theme.chart[i%5]}}></div>{d.name}
                </div>
                <span style={{...VAL,color:'rgba(255,255,255,0.6)'}}>${d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Cost vs Current Value</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle}/>
              <Bar dataKey="cost" fill={`${theme.accent}55`} radius={[4,4,0,0]} name="Cost"/>
              <Bar dataKey="value" fill={theme.accent} radius={[4,4,0,0]} name="Value"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{padding:'24px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>All Positions</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              {['Symbol','Name','Type','Shares','Buy Price','Live Price','24h Change','Value','Gain/Loss',''].map(h=>(
                <th key={h} style={{...TIP,textAlign:'left',paddingBottom:'12px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:400}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {investments.length===0 ? (
              <tr><td colSpan={10} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No positions yet. Search and add your first one.</td></tr>
            ) : investments.map((inv,i)=>{
              const livePrice = prices[inv.symbol] || inv.currentPrice
              const change = changes[inv.symbol] || 0
              const val = inv.shares * livePrice
              const cost = inv.shares * inv.buyPrice
              const gain = val - cost
              const gp = cost > 0 ? ((gain/cost)*100).toFixed(1) : 0
              const isLive = !!prices[inv.symbol]
              const changePos = change >= 0

              return (
                <tr key={inv.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'14px 8px 14px 0',...VAL,color:theme.text,fontWeight:700,fontSize:'14px'}}>{inv.symbol}</td>
                  <td style={{padding:'14px 8px',color:'rgba(255,255,255,0.6)',fontSize:'12px',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.name}</td>
                  <td style={{padding:'14px 8px'}}>
                    <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',background:inv.type==='crypto'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:inv.type==='crypto'?'#fde68a':'#6ee7b7'}}>{inv.type}</span>
                  </td>
                  <td style={{padding:'14px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{inv.shares}</td>
                  <td style={{padding:'14px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>${inv.buyPrice.toFixed(2)}</td>
                  <td style={{padding:'14px 8px'}}>
                    <div>
                      <div style={{...VAL,color:'#f5f5f7',fontSize:'14px',fontWeight:600}}>{loadingPrices&&!isLive?'...':`$${livePrice.toFixed(2)}`}</div>
                      {isLive && <div style={{display:'flex',alignItems:'center',gap:'3px',marginTop:'2px'}}>
                        <div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10b981'}}></div>
                        <span style={{fontSize:'9px',color:'#10b981',fontFamily:'SF Mono,monospace'}}>LIVE</span>
                      </div>}
                    </div>
                  </td>
                  <td style={{padding:'14px 8px'}}>
                    {isLive ? (
                      <div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'8px',background:changePos?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'}}>
                        <span style={{fontSize:'12px',color:changePos?'#6ee7b7':'#fca5a5',fontWeight:600,...VAL}}>{changePos?'▲':'▼'} {Math.abs(change)}%</span>
                      </div>
                    ) : <span style={{color:'rgba(255,255,255,0.15)',fontSize:'12px'}}>—</span>}
                  </td>
                  <td style={{padding:'14px 8px',...VAL,color:theme.text,fontSize:'13px',fontWeight:600}}>${val.toFixed(2)}</td>
                  <td style={{padding:'14px 8px'}}>
                    <div>
                      <div style={{...VAL,color:gain>=0?'#6ee7b7':'#fca5a5',fontSize:'13px',fontWeight:600}}>{gain>=0?'+':''}${gain.toFixed(2)}</div>
                      <div style={{...VAL,color:gain>=0?'rgba(110,231,183,0.5)':'rgba(252,165,165,0.5)',fontSize:'11px'}}>{gp}%</div>
                    </div>
                  </td>
                  <td style={{padding:'14px 0'}}>
                    <button onClick={()=>del(inv.id||i)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer'}}>×</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}

// ── BALANCE ───────────────────────────────────────────────────────

function BalancePage({ theme, income, totalIncome, totalExp, totalSubs, netBal, userId, onRefresh }) {
  const [form, setForm] = useState({source:'',amount:'',income_date:''})
  const [adding, setAdding] = useState(false)

  async function addIncome() {
    if (!form.source||!form.amount) return
    await supabaseInsert('income',{...form,amount:parseFloat(form.amount),user_id:userId})
    setForm({source:'',amount:'',income_date:''}); setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('income',id); onRefresh() }

  const sr = totalIncome>0?Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100):0
  const incomeData = income.map((i,idx)=>({name:i.source?.slice(0,8)||`#${idx+1}`,amount:Number(i.amount)}))

  return (
    <div style={{padding:'40px'}}>
      <PageHeader theme={theme} title="💰 Balance & Savings" subtitle="Track income and your savings rate."
        action={<AddBtn action={
          <div style={{display:'flex',gap:'10px'}}>
            <button onClick={fetchPrices} disabled={loadingPrices}
              style={{padding:'10px 18px',borderRadius:'12px',fontSize:'13px',fontWeight:500,background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}}>
              {loadingPrices ? '⟳ Loading...' : '⟳ Refresh Prices'}
            </button>
            <AddBtn theme={theme} label="+ Add Position" onClick={()=>setAdding(!adding)} />
          </div>
        }theme={theme} label="+ Log Income" onClick={()=>setAdding(!adding)} />} />

      <Card style={{padding:'32px',marginBottom:'24px',background:`linear-gradient(135deg,${theme.bg},rgba(0,0,0,0))`}}>
        <div style={{...TIP,marginBottom:'8px'}}>Net Balance</div>
        <div style={{color:netBal>=0?'#6ee7b7':'#fca5a5',fontSize:'52px',fontWeight:600,letterSpacing:'-2px',lineHeight:1,marginBottom:'8px'}}>
          ${Math.abs(netBal).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginBottom:'24px'}}>{netBal>=0?'↑ You are net positive':'↓ Spending exceeds income'}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',paddingTop:'24px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          {[['Total Income',`$${totalIncome.toFixed(2)}`,'#6ee7b7'],['Total Expenses',`$${(totalExp+totalSubs).toFixed(2)}`,'#fca5a5'],['Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5']].map(([l,v,c])=>(
            <div key={l}>
              <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',marginBottom:'4px'}}>{l}</div>
              <div style={{color:c,fontSize:'18px',fontWeight:600,...VAL}}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {adding && (
        <Card style={{padding:'24px',marginBottom:'20px',border:`1px solid ${theme.border}`}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
            {[['Source','source','text','Freelance, Product sale...'],['Amount ($)','amount','number','0.00'],['Date','income_date','text','May 5']].map(([label,key,type,ph])=>(
              <div key={key}>
                <div style={{...TIP,marginBottom:'6px'}}>{label}</div>
                <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                  style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer'}}>Cancel</button>
            <button onClick={addIncome} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:500,background:`linear-gradient(135deg,${theme.accent},${theme.accent}99)`,color:'#fff',border:'none',cursor:'pointer'}}>Save</button>
          </div>
        </Card>
      )}

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Income Sources</div>
          {incomeData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle}/>
                <Bar dataKey="amount" radius={[4,4,0,0]}>
                  {incomeData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No income logged yet</div>}
        </Card>

        <Card style={{padding:'24px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'20px'}}>Savings Goal</div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
            <div style={{position:'relative',width:'120px',height:'120px'}}>
              <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="314.16" strokeDashoffset={314.16-(314.16*Math.min(sr,100)/100)}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5',fontSize:'22px',fontWeight:600}}>{sr}%</div>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px'}}>saved</div>
              </div>
            </div>
          </div>
          <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',textAlign:'center',marginBottom:'16px'}}>
            {sr>=30?'🎉 Above 30% target':sr>=15?'📈 Target is 30%':'⚠️ Below target'}
          </div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.28)',marginBottom:'5px'}}>
              <span>Goal: 30%</span><span>{Math.min(Math.round(sr/30*100),100)}%</span>
            </div>
            <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}>
              <div style={{height:'100%',borderRadius:'100px',width:`${Math.min(sr/30*100,100)}%`,background:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'}}></div>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{padding:'24px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:500,marginBottom:'16px'}}>Income Log</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><TH>Source</TH><TH>Amount</TH><TH>Date</TH><TH></TH></tr></thead>
          <tbody>
            {income.length===0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px'}}>No income logged yet</td></tr>
            : income.map(i=>(
              <tr key={i.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{i.source}</td>
                <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>+${Number(i.amount).toFixed(2)}</td>
                <td style={{padding:'12px 0',color:'rgba(255,255,255,0.28)',fontSize:'12px'}}>{i.income_date||'—'}</td>
                <td style={{padding:'12px 0'}}><button onClick={()=>del(i.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer'}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ── AI ADVISOR ────────────────────────────────────────────────────

function AIPage({ theme, user, subs, expenses, income, investments }) {
  const [messages, setMessages] = useState([
    { role:'ai', text:"Hey! I'm your BurnRate AI Advisor. I can see your real financial data — subscriptions, spending, income, and investments. Ask me anything and I'll give you sharp, actionable advice." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = [
    "Which subscriptions should I cancel?",
    "How can I improve my savings rate?",
    "Give me investment advice",
    "Where am I leaking the most money?",
  ]

  async function send(msg) {
    const userMsg = msg || input.trim()
    if (!userMsg||loading) return
    setInput('')
    setMessages(prev=>[...prev,{role:'user',text:userMsg}])
    setLoading(true)

    const context = `
      Subscriptions: ${subs.map(s=>`${s.name} $${s.cost}/mo status:${s.status} unused:${s.days_since_used}days`).join(', ')||'none'}.
      Expenses: ${expenses.map(e=>`${e.description} $${e.amount} (${e.category})`).join(', ')||'none'}.
      Income: ${income.map(i=>`${i.source} $${i.amount}`).join(', ')||'none'}.
      Investments: ${investments.map(inv=>`${inv.symbol} ${inv.shares}x buy:$${inv.buyPrice} now:$${inv.currentPrice}`).join(', ')||'none'}.
    `

    try {
      const res = await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,context})})
      const data = await res.json()
      setMessages(prev=>[...prev,{role:'ai',text:data.reply||'Could not get a response.'}])
    } catch {
      setMessages(prev=>[...prev,{role:'ai',text:'Connection error. Please try again.'}])
    }
    setLoading(false)
  }

  return (
    <div style={{padding:'40px',height:'100vh',display:'flex',flexDirection:'column',maxHeight:'100vh',boxSizing:'border-box'}}>
      <div style={{marginBottom:'20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'4px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>🤖</div>
          <div>
            <h1 style={{color:theme.text,fontSize:'22px',fontWeight:600,letterSpacing:'-0.4px',margin:0}}>AI Financial Advisor</h1>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:'SF Mono,monospace'}}>powered by claude · sees your real data</div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>send(s)} style={{fontSize:'12px',padding:'6px 14px',borderRadius:'100px',background:theme.bg,color:theme.text,border:`1px solid ${theme.border}`,cursor:'pointer'}}>
            {s}
          </button>
        ))}
      </div>

      <Card style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        <div style={{flex:1,overflowY:'auto',padding:'24px',display:'flex',flexDirection:'column',gap:'16px',minHeight:0}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:'12px',flexDirection:m.role==='user'?'row-reverse':'row'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0,background:m.role==='user'?`linear-gradient(135deg,${theme.accent},${theme.accent}88)`:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                {m.role==='user'?'👤':'🤖'}
              </div>
              <div style={{maxWidth:'520px',padding:'12px 16px',borderRadius:'16px',fontSize:'13px',lineHeight:'1.6',color:'#f5f5f7',background:m.role==='user'?theme.bg:'rgba(255,255,255,0.03)',border:m.role==='user'?`1px solid ${theme.border}`:'1px solid rgba(255,255,255,0.06)'}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex',gap:'12px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>🤖</div>
              <div style={{padding:'12px 16px',borderRadius:'16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'5px',alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:`${theme.accent}88`,animation:`pulse 1.2s infinite ${i*0.2}s`}}></div>)}
              </div>
            </div>
          )}
        </div>

        <div style={{padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'10px',alignItems:'center'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask anything about your finances..."
            style={{flex:1,padding:'11px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#f5f5f7',fontSize:'13px',outline:'none'}} />
          <button onClick={()=>send()} disabled={loading||!input.trim()}
            style={{width:'42px',height:'42px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}99)`,color:'#fff',border:'none',cursor:'pointer',fontSize:'16px',opacity:loading||!input.trim()?0.4:1,flexShrink:0}}>
            ↑
          </button>
        </div>
      </Card>
    </div>
  )
}