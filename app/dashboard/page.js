'use client'
import { useState, useEffect } from 'react'
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif"
const MONO = "'DM Mono',monospace"

const THEMES = {
  dashboard:     { accent:'#7c3aed', bg:'rgba(124,58,237,0.1)',  border:'rgba(124,58,237,0.3)',  text:'#c4b5fd',  chart:['#7c3aed','#06b6d4','#10b981','#f59e0b','#f43f5e'] },
  subscriptions: { accent:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)',   text:'#fca5a5',  chart:['#ef4444','#f97316','#fbbf24','#a3e635','#34d399'] },
  spending:      { accent:'#f59e0b', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  text:'#fde68a',  chart:['#f59e0b','#f97316','#ef4444','#a78bfa','#34d399'] },
  investments:   { accent:'#10b981', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.3)',  text:'#6ee7b7',  chart:['#10b981','#06b6d4','#3b82f6','#8b5cf6','#f59e0b'] },
  balance:       { accent:'#06b6d4', bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.3)',   text:'#67e8f9',  chart:['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b'] },
  goals:         { accent:'#f43f5e', bg:'rgba(244,63,94,0.1)',   border:'rgba(244,63,94,0.3)',   text:'#fda4af',  chart:['#f43f5e','#f97316','#fbbf24','#10b981','#06b6d4'] },
  ai:            { accent:'#8b5cf6', bg:'rgba(139,92,246,0.1)',  border:'rgba(139,92,246,0.3)',  text:'#ddd6fe',  chart:['#8b5cf6','#7c3aed','#06b6d4','#10b981','#f59e0b'] },
}

const TIP = {fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)'}
const VAL = {fontFamily:MONO}
const tooltipStyle = {background:'#12121c',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',color:'#f5f5f7',fontSize:'12px',fontFamily:FONT}

const DAILY_TASKS = [
  ["Check your bank balance","No impulse buys today","Log all expenses tonight"],
  ["Review yesterday's spending","Skip one unnecessary purchase","Save $5 today"],
  ["Cancel one unused subscription","Cook at home today","Track every transaction"],
  ["Check investment portfolio","Avoid delivery apps today","Set a weekly budget"],
  ["Review subscriptions list","Pack lunch today","Log income sources"],
  ["Calculate monthly burn rate","No coffee shop today","Check savings rate"],
  ["Review financial goals","Meal prep for the week","Invest spare change"],
  ["Check for subscription renewals","Walk instead of ride","Review bank fees"],
  ["Set tomorrow's spending limit","No social media shopping","Log all receipts"],
  ["Review credit card statement","Cook dinner at home","Check emergency fund"],
  ["Cancel zombie subscriptions","Buy nothing day","Review utility bills"],
  ["Check investment gains","Make coffee at home","Track subscriptions"],
  ["Review weekly spending","Skip one paid app","Save on groceries"],
  ["Calculate savings rate","No impulse online shopping","Log all cash spent"],
  ["Check portfolio performance","Meal plan for week","Review insurance costs"],
  ["Review monthly progress","No takeout today","Check savings account"],
  ["Audit all subscriptions","Walk to nearby places","Review phone bill"],
  ["Check emergency fund","Cook a new recipe","Track fuel expenses"],
  ["Review investment strategy","Skip streaming tonight","Log business expenses"],
  ["Calculate weekly burn","No coffee delivery","Check credit score"],
  ["Review financial habits","Bring lunch to work","Track all spending"],
  ["Check savings goal progress","No restaurant today","Review subscriptions"],
  ["Review investment returns","Make tea at home","Log all expenses"],
  ["Check monthly targets","Skip online shopping","Review bank statement"],
  ["Calculate monthly savings","No food delivery","Track investments"],
  ["Review spending patterns","Cook instead of order","Check savings rate"],
  ["Audit recurring charges","Walk more today","Log income"],
  ["Check portfolio balance","Make homemade coffee","Review budget"],
  ["Review financial summary","No impulse buys","Track all costs"],
  ["Complete monthly review","Celebrate savings wins","Plan next month"],
]

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
      { id:2, symbol:'BTC-USD', name:'Bitcoin', shares:0.01, buyPrice:40000, currentPrice:62000, type:'crypto' },
    ])
  }

  const navItems = [
    { id:'dashboard',     icon:'⚡', label:'Overview' },
    { id:'subscriptions', icon:'⚔️', label:'Subscriptions' },
    { id:'spending',      icon:'💸', label:'Spending' },
    { id:'investments',   icon:'📈', label:'Investments' },
    { id:'balance',       icon:'💰', label:'Balance' },
    { id:'goals',         icon:'🎯', label:'Challenge' },
  ]

  if (!user) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:FONT}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Loading...</div>
    </div>
  )

  const totalIncome = income.reduce((a,i) => a+Number(i.amount), 0)
  const totalExp = expenses.reduce((a,e) => a+Number(e.amount), 0)
  const totalSubs = subs.reduce((a,s) => a+Number(s.cost), 0)
  const netBal = totalIncome - totalExp - totalSubs
  const deadSubs = subs.filter(s => s.status === 'dead')
  const totalInvValue = investments.reduce((a,inv) => a+(inv.shares*inv.currentPrice), 0)
  const totalInvCost = investments.reduce((a,inv) => a+(inv.shares*inv.buyPrice), 0)
  const invGain = totalInvValue - totalInvCost

  return (
    <div style={{background:'#0a0a0f',fontFamily:FONT,minHeight:'100vh',display:'flex'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:768px){
          .sidebar{display:none!important}
          .tabbar{display:flex!important}
          .page-wrap{padding-bottom:80px!important}
          .page-pad{padding:20px!important}
          .grid4{grid-template-columns:repeat(2,1fr)!important}
          .grid3{grid-template-columns:repeat(2,1fr)!important}
          .grid2{grid-template-columns:1fr!important}
          .hide-mob{display:none!important}
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar" style={{width:'224px',background:'rgba(255,255,255,0.015)',borderRight:'1px solid rgba(255,255,255,0.06)',flexShrink:0,display:'flex',flexDirection:'column',padding:'28px 14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'36px',paddingLeft:'8px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'linear-gradient(135deg,#7c3aed,#4c1d95)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',flexShrink:0}}>🔥</div>
          <div>
            <div style={{color:'#f5f5f7',fontSize:'14px',fontWeight:600,letterSpacing:'-0.3px',fontFamily:FONT}}>BurnRate OS</div>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>command center</div>
          </div>
        </div>

        <nav style={{display:'flex',flexDirection:'column',gap:'2px',flex:1}}>
          {navItems.map(item => {
            const t = THEMES[item.id]
            const active = page === item.id
            return (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',fontSize:'13px',fontWeight:active?600:400,textAlign:'left',background:active?t.bg:'transparent',color:active?t.text:'rgba(255,255,255,0.38)',border:active?`1px solid ${t.border}`:'1px solid transparent',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
                <span style={{fontSize:'14px'}}>{item.icon}</span>{item.label}
              </button>
            )
          })}
        </nav>

        <div style={{marginBottom:'14px'}}>
          <button onClick={() => setPage('ai')}
            style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'11px 12px',borderRadius:'12px',background:page==='ai'?'linear-gradient(135deg,#7c3aed,#4c1d95)':'rgba(124,58,237,0.1)',color:page==='ai'?'#fff':'#c4b5fd',border:'1px solid rgba(124,58,237,0.3)',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
            <span style={{fontSize:'15px'}}>🤖</span>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:'13px',fontWeight:600}}>AI Advisor</div>
              <div style={{fontSize:'10px',color:page==='ai'?'rgba(255,255,255,0.5)':'rgba(196,181,253,0.5)',fontFamily:MONO}}>powered by claude</div>
            </div>
          </button>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'14px'}}>
          <div style={{paddingLeft:'8px',marginBottom:'10px'}}>
            <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{user.name || 'User'}</div>
            <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:MONO,marginTop:'2px'}}>{user.email}</div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href='/login' }}
            style={{width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',color:'rgba(255,255,255,0.25)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>
            Sign out →
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="page-wrap" style={{flex:1,overflowY:'auto'}}>
        {page==='dashboard'     && <OverviewPage theme={THEMES.dashboard} netBal={netBal} totalSubs={totalSubs} totalExp={totalExp} deadSubs={deadSubs} subs={subs} expenses={expenses} totalIncome={totalIncome} invGain={invGain} totalInvValue={totalInvValue} />}
        {page==='subscriptions' && <SubsPage theme={THEMES.subscriptions} subs={subs} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page==='spending'      && <SpendingPage theme={THEMES.spending} expenses={expenses} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page==='investments'   && <InvestmentsPage theme={THEMES.investments} investments={investments} setInvestments={setInvestments} />}
        {page==='balance'       && <BalancePage theme={THEMES.balance} income={income} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} userId={user.id} onRefresh={() => loadData(user.id)} />}
        {page==='goals'         && <GoalsPage theme={THEMES.goals} expenses={expenses} totalExp={totalExp} totalSubs={totalSubs} totalIncome={totalIncome} />}
        {page==='ai'            && <AIPage theme={THEMES.ai} user={user} subs={subs} expenses={expenses} income={income} investments={investments} />}
        {page==='summary'       && <MonthlySummaryPage theme={THEMES.dashboard} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} subs={subs} expenses={expenses} income={income} />}
      </div>

      {/* MOBILE TAB BAR */}
      <div className="tabbar" style={{display:'none',position:'fixed',bottom:0,left:0,right:0,background:'rgba(10,10,15,0.97)',borderTop:'1px solid rgba(255,255,255,0.07)',backdropFilter:'blur(24px)',zIndex:50,padding:'8px 0 20px'}}>
        {[...navItems,{id:'ai',icon:'🤖',label:'AI'}].map(item => {
          const active = page === item.id
          const t = THEMES[item.id] || THEMES.ai
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'6px 2px',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>
              <div style={{width:'34px',height:'34px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',background:active?t.bg:'transparent',border:active?`1px solid ${t.border}`:'1px solid transparent',transition:'all 0.15s'}}>
                {item.icon}
              </div>
              <span style={{fontSize:'9px',fontWeight:active?600:400,color:active?t.text:'rgba(255,255,255,0.28)',transition:'all 0.15s'}}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── SHARED ────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'16px',animation:'fadeIn 0.3s ease',...style}}>{children}</div>
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <Card style={{padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
        <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px'}}>{label}</div>
        {icon && <span style={{fontSize:'18px',opacity:0.6}}>{icon}</span>}
      </div>
      <div style={{color:color||'#f5f5f7',fontSize:'24px',fontWeight:700,letterSpacing:'-0.5px',lineHeight:1,fontFamily:FONT}}>{value}</div>
      {sub && <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',marginTop:'6px',fontFamily:FONT}}>{sub}</div>}
    </Card>
  )
}

function PageHeader({ theme, title, subtitle, action }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
      <div>
        <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'3px',fontFamily:FONT}}>{title}</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

function AddBtn({ theme, label, onClick, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',fontSize:'13px',fontWeight:600,background:disabled?'rgba(255,255,255,0.05)':`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:disabled?'rgba(255,255,255,0.3)':'#fff',border:'none',cursor:disabled?'not-allowed':'pointer',whiteSpace:'nowrap',fontFamily:FONT,transition:'all 0.15s'}}>
      {label}
    </button>
  )
}

function TH({ children }) {
  return <th style={{...TIP,textAlign:'left',paddingBottom:'10px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:500}}>{children}</th>
}

function InputField({ label, value, onChange, type='text', placeholder }) {
  return (
    <div>
      <div style={{...TIP,marginBottom:'6px'}}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
    </div>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────
function OverviewPage({ theme, netBal, totalSubs, totalExp, deadSubs, subs, expenses, totalIncome, invGain, totalInvValue }) {
  const sr = totalIncome > 0 ? Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100) : 0
  const now = new Date()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})

  const pieData = [
    { name:'Subscriptions', value:totalSubs },
    { name:'Expenses',      value:totalExp },
    { name:'Saved',         value:Math.max(0, netBal) },
  ].filter(d => d.value > 0)

  const barData = expenses.slice(-6).map((e,i) => ({ name:e.description?.slice(0,8)||`#${i+1}`, amount:Number(e.amount) }))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:theme.text,fontSize:'24px',fontWeight:700,letterSpacing:'-0.5px',margin:0,marginBottom:'4px',fontFamily:FONT}}>Good morning ☀️</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} — your financial snapshot</p>
      </div>

      {deadSubs.length > 0 && (
        <div style={{display:'flex',gap:'12px',padding:'14px 18px',borderRadius:'14px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',marginBottom:'20px'}}>
          <span>⚠️</span>
          <div>
            <div style={{color:'#fca5a5',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{deadSubs.length} dead subscription{deadSubs.length>1?'s':''} detected</div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',marginTop:'2px',fontFamily:FONT}}>{deadSubs.map(s=>s.name).join(', ')} — wasting ${deadSubs.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo</div>
          </div>
        </div>
      )}

      <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard label="Net Balance" value={`$${Math.abs(netBal).toFixed(0)}`} sub={netBal>=0?'↑ Positive this month':'↓ In the red'} color={netBal>=0?'#6ee7b7':'#fca5a5'} icon="💰" />
        <StatCard label="Monthly Burn" value={`$${(totalExp+totalSubs).toFixed(0)}`} sub="expenses + subscriptions" color="#fb7185" icon="🔥" />
        <StatCard label="Savings Rate" value={`${sr}%`} sub={sr>=30?'Excellent 🎉':sr>=15?'Good, keep going':'Needs improvement'} color={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} icon="📊" />
        <StatCard label="Portfolio" value={`$${totalInvValue.toFixed(0)}`} sub={invGain>=0?`+$${invGain.toFixed(0)} total gain`:`-$${Math.abs(invGain).toFixed(0)} loss`} color={invGain>=0?'#6ee7b7':'#fca5a5'} icon="📈" />
      </div>

      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Spending Breakdown</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={5} dataKey="value">
                  {pieData.map((_,i) => <Cell key={i} fill={theme.chart[i]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No data yet</div>}
          <div style={{display:'flex',gap:'14px',justifyContent:'center',marginTop:'8px'}}>
            {pieData.map((d,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:FONT}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:theme.chart[i]}}></div>{d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Recent Expenses</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {barData.map((_,i) => <Cell key={i} fill={THEMES.spending.chart[i%5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No expenses yet</div>}
        </Card>
      </div>

      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>⚔️ Top Subscriptions</div>
          {subs.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No subscriptions yet</div> :
            subs.slice(0,4).map(s => (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{s.name}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>{s.category}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{color:THEMES.subscriptions.text,fontSize:'13px',...VAL}}>${Number(s.cost).toFixed(2)}</span>
                  <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.status}</span>
                </div>
              </div>
            ))}
        </Card>

        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>💸 Recent Spending</div>
          {expenses.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No expenses yet</div> :
            expenses.slice(0,4).map(e => (
              <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{e.description}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>{e.expense_date||'—'}</div>
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
    setForm({name:'',cost:'',category:'SaaS / Tools',days_since_used:'0',notes:''}); setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('subscriptions',id); onRefresh() }

  const total = subs.reduce((a,s)=>a+Number(s.cost),0)
  const dead = subs.filter(s=>s.status==='dead')
  const catData = [...new Set(subs.map(s=>s.category))].map(c=>({name:c,value:subs.filter(s=>s.category===c).reduce((a,s)=>a+Number(s.cost),0)}))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title="⚔️ Subscription Guillotine" subtitle="Track every recurring charge. Kill the dead ones."
        action={<AddBtn theme={theme} label="+ Add Subscription" onClick={()=>setAdding(!adding)} />} />
      <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard label="Monthly Cost" value={`$${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard label="Dead Tools" value={dead.length} sub={`$${dead.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo wasted`} color="#fca5a5" icon="💀" />
        <StatCard label="Worth Keeping" value={subs.filter(s=>s.status==='keep').length} color="#6ee7b7" icon="✅" />
      </div>
      {adding && (
        <Card style={{padding:'22px',marginBottom:'18px',border:`1px solid ${theme.border}`}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label="Service Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Shopify, Claude Pro..." />
            <InputField label="Monthly Cost ($)" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} type="number" placeholder="29.00" />
            <InputField label="Days Since Last Used" value={form.days_since_used} onChange={e=>setForm({...form,days_since_used:e.target.value})} type="number" placeholder="0 = used today" />
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>Category</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT}}>
                {['SaaS / Tools','AI Tools','Marketing','Storage','Design','Productivity','Other'].map(c=><option key={c} style={{background:'#12121c'}}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>Cancel</button>
            <button onClick={addSub} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>Save</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
              <thead><tr><TH>Service</TH><TH>Cost/mo</TH><TH>Category</TH><TH>Last Used</TH><TH>Status</TH><TH></TH></tr></thead>
              <tbody>
                {subs.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No subscriptions yet</td></tr>
                : subs.map(s=>(
                  <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{s.name}</td>
                    <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>${Number(s.cost).toFixed(2)}</td>
                    <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${theme.accent}22`,color:theme.text,fontFamily:FONT}}>{s.category}</span></td>
                    <td style={{padding:'12px 0',...VAL,color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>{s.days_since_used===0?'Today':`${s.days_since_used}d ago`}</td>
                    <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',fontWeight:600,background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.status.toUpperCase()}</span></td>
                    <td style={{padding:'12px 0'}}><button onClick={()=>del(s.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>Kill</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>By Category</div>
          {catData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value">
                  {catData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No data</div>}
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'8px'}}>
            {catData.map((d,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)',fontFamily:FONT}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:theme.chart[i%5]}}></div>{d.name}</div>
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
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title="💸 Daily Spending" subtitle="Track impulse buys and convenience leaks."
        action={<AddBtn theme={theme} label="+ Log Expense" onClick={()=>setAdding(!adding)} />} />
      <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard label="Total Spent" value={`$${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard label="Leak Amount" value={`$${leakAmt.toFixed(2)}`} sub={`${total>0?Math.round(leakAmt/total*100):0}% of spending`} color="#fca5a5" icon="🩸" />
        <StatCard label="Transactions" value={expenses.length} color={theme.text} icon="📋" />
        <StatCard label="Avg / Transaction" value={expenses.length>0?`$${(total/expenses.length).toFixed(2)}`:'$0'} color={theme.text} icon="📊" />
      </div>
      {adding && (
        <Card style={{padding:'22px',marginBottom:'18px',border:`1px solid ${theme.border}`}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Late night delivery..." />
            <InputField label="Amount ($)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" placeholder="0.00" />
            <InputField label="Date" value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})} placeholder="May 5" />
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>Category</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT}}>
                <option value="impulse" style={{background:'#12121c'}}>Impulse / Leak</option>
                <option value="food" style={{background:'#12121c'}}>Food & Delivery</option>
                <option value="transport" style={{background:'#12121c'}}>Transport</option>
                <option value="business" style={{background:'#12121c'}}>Business</option>
                <option value="other" style={{background:'#12121c'}}>Other</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>Cancel</button>
            <button onClick={addExpense} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>Save</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Spending Trend</div>
          {areaData.length>0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle}/>
                <Area type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2.5} fill="url(#spendGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No data yet</div>}
        </Card>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>By Category</div>
          {[...new Set(expenses.map(e=>e.category))].map(cat=>{
            const amt = expenses.filter(e=>e.category===cat).reduce((a,e)=>a+Number(e.amount),0)
            const pct = total>0?(amt/total*100):0
            return (
              <div key={cat} style={{marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'5px'}}>
                  <span style={{color:'rgba(255,255,255,0.45)',fontFamily:FONT}}>{catLabels[cat]||cat}</span>
                  <span style={{...VAL,color:catColors[cat]||theme.text}}>${amt.toFixed(2)}</span>
                </div>
                <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}>
                  <div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:catColors[cat]||theme.accent,transition:'width 0.5s'}}></div>
                </div>
              </div>
            )
          })}
          {expenses.length===0 && <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No data yet</div>}
        </Card>
      </div>
      <Card style={{padding:'22px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px',flexWrap:'wrap',gap:'8px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>Expense Log</div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {['all','impulse','food','transport','business'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{fontSize:'11px',padding:'5px 12px',borderRadius:'100px',background:filter===f?theme.bg:'transparent',color:filter===f?theme.text:'rgba(255,255,255,0.28)',border:filter===f?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:FONT}}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'400px'}}>
            <thead><tr><TH>Description</TH><TH>Amount</TH><TH>Category</TH><TH>Date</TH><TH></TH></tr></thead>
            <tbody>
              {filtered.length===0 ? <tr><td colSpan={5} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No expenses yet</td></tr>
              : filtered.map(e=>(
                <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{e.description}</td>
                  <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>-${Number(e.amount).toFixed(2)}</td>
                  <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${catColors[e.category]||theme.accent}22`,color:catColors[e.category]||theme.text,fontFamily:FONT}}>{catLabels[e.category]||e.category}</span></td>
                  <td style={{padding:'12px 0',color:'rgba(255,255,255,0.28)',fontSize:'12px',fontFamily:FONT}}>{e.expense_date||'—'}</td>
                  <td style={{padding:'12px 0'}}><button onClick={()=>del(e.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    const up = {}, uc = {}
    for (const inv of investments) {
      try {
        const res = await fetch(`/api/stocks?symbol=${inv.symbol}`)
        const data = await res.json()
        if (data.price) { up[inv.symbol]=parseFloat(data.price); uc[inv.symbol]=parseFloat(data.change) }
      } catch {}
    }
    setPrices(up); setChanges(uc); setLastUpdated(new Date().toLocaleTimeString()); setLoadingPrices(false)
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
    setSearchQuery(stock.name); setSearchResults([]); setFetchingPrice(true)
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
    setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'}); setSearchQuery(''); setAdding(false)
  }
  function del(id) { setInvestments(investments.filter(i=>i.id!==id)) }

  const totalValue = investments.reduce((a,inv)=>a+(inv.shares*(prices[inv.symbol]||inv.currentPrice)),0)
  const totalCost = investments.reduce((a,inv)=>a+(inv.shares*inv.buyPrice),0)
  const totalGain = totalValue - totalCost
  const gainPct = totalCost>0?((totalGain/totalCost)*100).toFixed(2):0
  const pieData = investments.map(inv=>({name:inv.symbol,value:inv.shares*(prices[inv.symbol]||inv.currentPrice)}))
  const barData = investments.map(inv=>({name:inv.symbol,cost:parseFloat((inv.shares*inv.buyPrice).toFixed(2)),value:parseFloat((inv.shares*(prices[inv.symbol]||inv.currentPrice)).toFixed(2))}))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title="📈 Investments" subtitle="Live prices update every 30 seconds."
        action={
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            {lastUpdated && <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}></div><span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:MONO}}>Live · {lastUpdated}</span></div>}
            <AddBtn theme={theme} label="+ Add Position" onClick={()=>setAdding(!adding)} />
          </div>
        }
      />
      <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard label="Portfolio Value" value={`$${totalValue.toFixed(2)}`} color={theme.text} icon="💼" />
        <StatCard label="Total Cost" value={`$${totalCost.toFixed(2)}`} color="rgba(255,255,255,0.6)" icon="💸" />
        <StatCard label="Total Gain/Loss" value={`${totalGain>=0?'+':''}$${totalGain.toFixed(2)}`} sub={`${gainPct}%`} color={totalGain>=0?'#6ee7b7':'#fca5a5'} icon={totalGain>=0?'📈':'📉'} />
        <StatCard label="Positions" value={investments.length} color={theme.text} icon="🎯" />
      </div>
      {adding && (
        <Card style={{padding:'22px',marginBottom:'18px',border:`1px solid ${theme.border}`}}>
          <div style={{marginBottom:'14px'}}>
            <div style={{...TIP,marginBottom:'6px'}}>Search Stock or Crypto</div>
            <div style={{position:'relative'}}>
              <input value={searchQuery} onChange={e=>searchStocks(e.target.value)} placeholder="Search Apple, Bitcoin, Tesla..."
                style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:`1px solid ${theme.border}`,color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
              {(searching||fetchingPrice) && <div style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.3)',fontSize:'12px',fontFamily:FONT}}>{searching?'Searching...':'Fetching price...'}</div>}
              {searchResults.length > 0 && (
                <div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:'4px',background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',overflow:'hidden',zIndex:100,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                  {searchResults.map((s,i) => (
                    <div key={i} onClick={()=>selectStock(s)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.05)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <div>
                        <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{s.symbol}</div>
                        <div style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{s.name}</div>
                      </div>
                      <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:s.type==='crypto'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.type==='crypto'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {form.symbol && (
            <div className="grid2" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
              <div><div style={{...TIP,marginBottom:'6px'}}>Symbol</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:theme.text,fontSize:'13px',fontWeight:700,...VAL}}>{form.symbol}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>Live Price</div><div style={{padding:'10px 14px',borderRadius:'10px',background:fetchingPrice?'rgba(255,255,255,0.02)':'rgba(16,185,129,0.08)',border:`1px solid ${fetchingPrice?'rgba(255,255,255,0.09)':'rgba(16,185,129,0.2)'}`,color:'#6ee7b7',fontSize:'13px',fontWeight:700,...VAL}}>{fetchingPrice?'Loading...':form.currentPrice?`$${form.currentPrice}`:'—'}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>Type</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontFamily:FONT}}>{form.type}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>Shares / Amount</div><input type="number" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})} placeholder="2" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>Buy Price ($)</div><input type="number" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} placeholder="150.00" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>{setAdding(false);setSearchQuery('');setSearchResults([]);setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})}} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>Cancel</button>
            <button onClick={addInv} disabled={!form.symbol||!form.shares||!form.buyPrice} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',opacity:!form.symbol||!form.shares||!form.buyPrice?0.4:1,fontFamily:FONT}}>Add Position</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'14px',marginBottom:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Portfolio Split</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value">{pieData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0} />)}</Pie><Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle}/></PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'8px'}}>
            {pieData.map((d,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.4)',fontFamily:FONT}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:theme.chart[i%5]}}></div>{d.name}</div>
                <span style={{...VAL,color:'rgba(255,255,255,0.6)'}}>${d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Cost vs Current Value</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle}/>
              <Bar dataKey="cost" fill={`${theme.accent}55`} radius={[6,6,0,0]} name="Cost"/>
              <Bar dataKey="value" fill={theme.chart[1]} radius={[6,6,0,0]} name="Value"/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card style={{padding:'22px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>All Positions</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{['Symbol','Name','Shares','Buy Price','Live Price','24h','Value','Gain/Loss',''].map(h=><th key={h} style={{...TIP,textAlign:'left',paddingBottom:'10px',fontWeight:500}}>{h}</th>)}</tr></thead>
            <tbody>
              {investments.length===0 ? <tr><td colSpan={9} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No positions yet. Search and add your first one.</td></tr>
              : investments.map((inv,i)=>{
                const livePrice=prices[inv.symbol]||inv.currentPrice, change=changes[inv.symbol]||0
                const val=inv.shares*livePrice, cost=inv.shares*inv.buyPrice, gain=val-cost
                const gp=cost>0?((gain/cost)*100).toFixed(1):0, isLive=!!prices[inv.symbol], changePos=change>=0
                return (
                  <tr key={inv.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 8px 12px 0',...VAL,color:theme.text,fontWeight:700,fontSize:'14px'}}>{inv.symbol}</td>
                    <td style={{padding:'12px 8px',color:'rgba(255,255,255,0.6)',fontSize:'12px',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:FONT}}>{inv.name}</td>
                    <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{inv.shares}</td>
                    <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>${inv.buyPrice.toFixed(2)}</td>
                    <td style={{padding:'12px 8px'}}>
                      <div style={{...VAL,color:'#f5f5f7',fontSize:'14px',fontWeight:700}}>{loadingPrices&&!isLive?'...':`$${livePrice.toFixed(2)}`}</div>
                      {isLive&&<div style={{display:'flex',alignItems:'center',gap:'3px',marginTop:'2px'}}><div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10b981'}}></div><span style={{fontSize:'9px',color:'#10b981',fontFamily:MONO}}>LIVE</span></div>}
                    </td>
                    <td style={{padding:'12px 8px'}}>
                      {isLive?<div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',background:changePos?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'}}><span style={{fontSize:'12px',color:changePos?'#6ee7b7':'#fca5a5',fontWeight:700,...VAL}}>{changePos?'▲':'▼'} {Math.abs(change)}%</span></div>:<span style={{color:'rgba(255,255,255,0.15)',fontSize:'12px'}}>—</span>}
                    </td>
                    <td style={{padding:'12px 8px',...VAL,color:theme.text,fontSize:'13px',fontWeight:700}}>${val.toFixed(2)}</td>
                    <td style={{padding:'12px 8px'}}>
                      <div style={{...VAL,color:gain>=0?'#6ee7b7':'#fca5a5',fontSize:'13px',fontWeight:700}}>{gain>=0?'+':''}${gain.toFixed(2)}</div>
                      <div style={{...VAL,color:gain>=0?'rgba(110,231,183,0.5)':'rgba(252,165,165,0.5)',fontSize:'11px'}}>{gp}%</div>
                    </td>
                    <td style={{padding:'12px 0'}}><button onClick={()=>del(inv.id||i)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
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
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title="💰 Balance & Savings" subtitle="Track income and your savings rate."
        action={<AddBtn theme={theme} label="+ Log Income" onClick={()=>setAdding(!adding)} />} />
      <Card style={{padding:'28px',marginBottom:'20px',background:`linear-gradient(135deg,${theme.bg},rgba(0,0,0,0))`}}>
        <div style={{...TIP,marginBottom:'8px'}}>Net Balance</div>
        <div style={{color:netBal>=0?'#6ee7b7':'#fca5a5',fontSize:'52px',fontWeight:700,letterSpacing:'-2px',lineHeight:1,marginBottom:'8px',...VAL}}>
          ${Math.abs(netBal).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginBottom:'24px',fontFamily:FONT}}>{netBal>=0?'↑ You are net positive this month':'↓ Spending exceeds income'}</div>
        <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          {[['Total Income',`$${totalIncome.toFixed(2)}`,'#6ee7b7'],['Total Expenses',`$${(totalExp+totalSubs).toFixed(2)}`,'#fca5a5'],['Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5']].map(([l,v,c])=>(
            <div key={l}><div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',marginBottom:'4px',fontFamily:FONT}}>{l}</div><div style={{color:c,fontSize:'20px',fontWeight:700,...VAL}}>{v}</div></div>
          ))}
        </div>
      </Card>
      {adding && (
        <Card style={{padding:'22px',marginBottom:'18px',border:`1px solid ${theme.border}`}}>
          <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
            <InputField label="Source" value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="Freelance, Product sale..." />
            <InputField label="Amount ($)" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" placeholder="0.00" />
            <InputField label="Date" value={form.income_date} onChange={e=>setForm({...form,income_date:e.target.value})} placeholder="May 5" />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>Cancel</button>
            <button onClick={addIncome} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>Save</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Income Sources</div>
          {incomeData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`$${v}`} contentStyle={tooltipStyle}/>
                <Bar dataKey="amount" radius={[6,6,0,0]}>{incomeData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No income logged yet</div>}
        </Card>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'20px',fontFamily:FONT}}>Savings Goal</div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
            <div style={{position:'relative',width:'120px',height:'120px'}}>
              <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} strokeWidth="10" strokeLinecap="round" strokeDasharray="314.16" strokeDashoffset={314.16-(314.16*Math.min(sr,100)/100)}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5',fontSize:'22px',fontWeight:700}}>{sr}%</div>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>saved</div>
              </div>
            </div>
          </div>
          <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',textAlign:'center',marginBottom:'14px',fontFamily:FONT}}>{sr>=30?'🎉 Above 30% target':sr>=15?'📈 Target is 30%':'⚠️ Below target'}</div>
          <div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'11px',color:'rgba(255,255,255,0.28)',marginBottom:'5px',fontFamily:FONT}}><span>Goal: 30%</span><span>{Math.min(Math.round(sr/30*100),100)}%</span></div>
            <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}><div style={{height:'100%',borderRadius:'100px',width:`${Math.min(sr/30*100,100)}%`,background:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5',transition:'width 0.5s'}}></div></div>
          </div>
        </Card>
      </div>
      <Card style={{padding:'22px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Income Log</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><TH>Source</TH><TH>Amount</TH><TH>Date</TH><TH></TH></tr></thead>
          <tbody>
            {income.length===0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No income logged yet</td></tr>
            : income.map(i=>(
              <tr key={i.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{i.source}</td>
                <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>+${Number(i.amount).toFixed(2)}</td>
                <td style={{padding:'12px 0',color:'rgba(255,255,255,0.28)',fontSize:'12px',fontFamily:FONT}}>{i.income_date||'—'}</td>
                <td style={{padding:'12px 0'}}><button onClick={()=>del(i.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ── 30-DAY CHALLENGE ──────────────────────────────────────────────
function GoalsPage({ theme, expenses, totalExp, totalSubs, totalIncome }) {
  const now = new Date()
  const today = now.getDate()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})

  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem('burnrate_completed_days')||'[]') } catch { return [] }
  })
  const [selectedDay, setSelectedDay] = useState(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [aiTasks, setAiTasks] = useState({})
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('burnrate_completed_tasks')||'{}') } catch { return {} }
  })

  async function loadTasksForDay(day) {
    setSelectedDay(day)
    if (aiTasks[day]) return
    setLoadingTasks(true)
    const defaultTasks = DAILY_TASKS[(day-1) % DAILY_TASKS.length]
    setAiTasks(prev => ({...prev, [day]: defaultTasks}))
    try {
      const res = await fetch('/api/ai', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          message: `Generate exactly 3 short, actionable financial tasks for Day ${day} of a 30-day money challenge. Each task should take less than 5 minutes. Return ONLY a JSON array of 3 strings, nothing else. Example: ["Task 1","Task 2","Task 3"]`,
          context: `User spending: $${totalExp}, subscriptions: $${totalSubs}, income: $${totalIncome}`
        })
      })
      const data = await res.json()
      const text = data.reply || ''
      const match = text.match(/\[.*\]/s)
      if (match) {
        const tasks = JSON.parse(match[0])
        if (Array.isArray(tasks) && tasks.length > 0) {
          setAiTasks(prev => ({...prev, [day]: tasks}))
        }
      }
    } catch {}
    setLoadingTasks(false)
  }

  function toggleTask(day, taskIdx) {
    const key = `${day}-${taskIdx}`
    const updated = {...completedTasks, [key]: !completedTasks[key]}
    setCompletedTasks(updated)
    localStorage.setItem('burnrate_completed_tasks', JSON.stringify(updated))
  }

  function completeDay(day) {
    if (!completedDays.includes(day)) {
      const updated = [...completedDays, day]
      setCompletedDays(updated)
      localStorage.setItem('burnrate_completed_days', JSON.stringify(updated))
    }
    setSelectedDay(null)
  }

  const dayTasks = selectedDay ? (aiTasks[selectedDay] || DAILY_TASKS[(selectedDay-1)%DAILY_TASKS.length]) : []
  const completedCount = completedDays.length
  const streakPct = Math.round(completedCount/Math.max(today,1)*100)

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'4px',fontFamily:FONT}}>🎯 30-Day Financial Challenge</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} — tap a day to see your tasks</p>
      </div>

      {/* STATS */}
      <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard label="Days Completed" value={completedCount} sub={`of ${today} days so far`} color={theme.text} icon="✅" />
        <StatCard label="Completion Rate" value={`${streakPct}%`} sub={streakPct>=80?'Outstanding!':streakPct>=50?'Keep going!':'You can do it!'} color={streakPct>=80?'#6ee7b7':streakPct>=50?'#fde68a':'#fca5a5'} icon="🔥" />
        <StatCard label="Days Remaining" value={30-today} sub="until end of month" color="rgba(255,255,255,0.5)" icon="📅" />
      </div>

      {/* CALENDAR GRID */}
      <Card style={{padding:'24px',marginBottom:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>Select a day to begin</div>
          <div style={{background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:'100px',padding:'5px 14px',fontSize:'12px',color:theme.text,fontWeight:600,fontFamily:FONT}}>
            {completedCount}/30 complete
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'8px'}}>
          {Array.from({length:30},(_,i)=>i+1).map(day => {
            const isCompleted = completedDays.includes(day)
            const isToday = day === today
            const isPast = day <= today
            const isSelected = selectedDay === day
            return (
              <button key={day} onClick={()=>isPast&&loadTasksForDay(day)}
                style={{
                  aspectRatio:'1',borderRadius:'12px',fontSize:'14px',fontWeight:700,
                  background:isCompleted?`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`:isSelected?theme.bg:isToday?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.03)',
                  border:isSelected?`2px solid ${theme.accent}`:isCompleted?'none':isToday?`1px solid rgba(255,255,255,0.2)`:'1px solid rgba(255,255,255,0.06)',
                  color:isCompleted?'#fff':isPast?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)',
                  cursor:isPast?'pointer':'not-allowed',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.15s',fontFamily:FONT,
                  boxShadow:isCompleted?`0 4px 12px ${theme.accent}44`:'none',
                  transform:isSelected?'scale(1.08)':'scale(1)',
                }}>
                {isCompleted ? '✓' : day}
              </button>
            )
          })}
        </div>
      </Card>

      {/* DAY TASKS PANEL */}
      {selectedDay && (
        <Card style={{padding:'24px',border:`1px solid ${theme.border}`,animation:'fadeIn 0.25s ease'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div>
              <div style={{color:theme.text,fontSize:'18px',fontWeight:700,fontFamily:FONT}}>Day {selectedDay}</div>
              <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',marginTop:'2px',fontFamily:FONT}}>Complete all tasks to finish the day</div>
            </div>
            <button onClick={()=>setSelectedDay(null)} style={{fontSize:'18px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer'}}>×</button>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'20px'}}>
            {loadingTasks ? (
              <div style={{display:'flex',gap:'8px',alignItems:'center',padding:'16px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT}}>
                <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${theme.accent}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
                AI is generating your tasks...
              </div>
            ) : dayTasks.map((task,idx) => {
              const key = `${selectedDay}-${idx}`
              const done = completedTasks[key]
              return (
                <div key={idx} onClick={()=>toggleTask(selectedDay,idx)}
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',borderRadius:'12px',background:done?theme.bg:'rgba(255,255,255,0.03)',border:done?`1px solid ${theme.border}`:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{width:'22px',height:'22px',borderRadius:'7px',flexShrink:0,background:done?theme.accent:'transparent',border:done?'none':`1.5px solid rgba(255,255,255,0.25)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'#fff',fontWeight:700,transition:'all 0.15s'}}>
                    {done?'✓':''}
                  </div>
                  <span style={{fontSize:'14px',color:done?theme.text:'rgba(255,255,255,0.75)',textDecoration:done?'none':'none',fontWeight:done?600:400,fontFamily:FONT,flex:1}}>{task}</span>
                </div>
              )
            })}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:FONT}}>
              {dayTasks.filter((_,idx)=>completedTasks[`${selectedDay}-${idx}`]).length}/{dayTasks.length} tasks done
            </div>
            <button onClick={()=>completeDay(selectedDay)}
              style={{padding:'12px 24px',borderRadius:'12px',fontSize:'14px',fontWeight:700,background:completedDays.includes(selectedDay)?'rgba(16,185,129,0.2)':`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:completedDays.includes(selectedDay)?'#6ee7b7':'#fff',border:completedDays.includes(selectedDay)?'1px solid rgba(16,185,129,0.3)':'none',cursor:'pointer',fontFamily:FONT,transition:'all 0.15s'}}>
              {completedDays.includes(selectedDay) ? '✓ Day Completed!' : '🎯 Complete Day'}
            </button>
          </div>
        </Card>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── MONTHLY SUMMARY ───────────────────────────────────────────────
function MonthlySummaryPage({ theme, totalIncome, totalExp, totalSubs, netBal, subs, expenses, income }) {
  const now = new Date()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})
  const sr = totalIncome>0?Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100):0
  const totalSpend = totalExp + totalSubs
  const topExpense = expenses.reduce((a,e)=>Number(e.amount)>Number(a.amount)?e:a, expenses[0]||{description:'—',amount:0})
  const deadSubs = subs.filter(s=>s.status==='dead')
  const wastedOnDead = deadSubs.reduce((a,s)=>a+Number(s.cost),0)

  const chartData = [
    {name:'Income',value:totalIncome,fill:'#6ee7b7'},
    {name:'Expenses',value:totalExp,fill:'#f97316'},
    {name:'Subscriptions',value:totalSubs,fill:'#ef4444'},
    {name:'Saved',value:Math.max(0,netBal),fill:'#7c3aed'},
  ]

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'4px',fontFamily:FONT}}>📋 Monthly Summary</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} — full financial report</p>
      </div>

      {/* BIG SCORE */}
      <Card style={{padding:'28px',marginBottom:'20px',background:`linear-gradient(135deg,${theme.bg},rgba(0,0,0,0))`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'16px'}}>
          <div>
            <div style={{...TIP,marginBottom:'8px'}}>Monthly Financial Score</div>
            <div style={{fontSize:'64px',fontWeight:700,letterSpacing:'-3px',lineHeight:1,...VAL,
              color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'}}>
              {sr>=30?'A':sr>=20?'B':sr>=10?'C':'D'}
            </div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'4px',fontFamily:FONT}}>
              {sr>=30?'Excellent financial discipline!':sr>=20?'Good progress, keep it up':sr>=10?'Room for improvement':'Time to cut spending'}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {[['Net Balance',`$${Math.abs(netBal).toFixed(0)}`,netBal>=0?'#6ee7b7':'#fca5a5'],
              ['Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'],
              ['Total Income',`$${totalIncome.toFixed(0)}`,'#6ee7b7'],
              ['Total Spend',`$${totalSpend.toFixed(0)}`,'#fca5a5']].map(([l,v,c])=>(
              <div key={l}>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'3px'}}>{l}</div>
                <div style={{color:c,fontSize:'20px',fontWeight:700,...VAL}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Money Flow</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={v=>`$${v.toFixed(2)}`} contentStyle={tooltipStyle}/>
              <Bar dataKey="value" radius={[8,8,0,0]}>
                {chartData.map((d,i)=><Cell key={i} fill={d.fill} strokeWidth={0}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'16px',fontFamily:FONT}}>Key Insights</div>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {[
              { icon:'🏆', label:'Best habit', value:'Tracked your finances', color:'#6ee7b7' },
              { icon:'💸', label:'Biggest expense', value:`${topExpense.description} ($${Number(topExpense.amount).toFixed(0)})`, color:'#fca5a5' },
              { icon:'💀', label:'Wasted on dead subs', value:`$${wastedOnDead.toFixed(0)}/mo`, color:wastedOnDead>0?'#fca5a5':'#6ee7b7' },
              { icon:'📈', label:'Savings rate', value:`${sr}% — ${sr>=30?'excellent':sr>=15?'good':'needs work'}`, color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5' },
              { icon:'🎯', label:'Next month goal', value:`Save $${Math.max(Math.round(totalIncome*0.3),50)} (30% of income)`, color:theme.text },
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.02)'}}>
                <span style={{fontSize:'18px'}}>{item.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:'rgba(255,255,255,0.35)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'0.8px'}}>{item.label}</div>
                  <div style={{color:item.color,fontSize:'13px',fontWeight:500,marginTop:'1px',fontFamily:FONT}}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{padding:'22px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Subscription Audit</div>
        {subs.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>No subscriptions tracked</div> : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
            {subs.map(s=>(
              <div key={s.id} style={{padding:'14px',borderRadius:'12px',background:'rgba(255,255,255,0.02)',border:`1px solid ${s.status==='dead'?'rgba(239,68,68,0.2)':s.status==='warn'?'rgba(245,158,11,0.2)':'rgba(16,185,129,0.15)'}`}}>
                <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:600,marginBottom:'4px',fontFamily:FONT}}>{s.name}</div>
                <div style={{color:THEMES.subscriptions.text,fontSize:'14px',fontWeight:700,...VAL,marginBottom:'6px'}}>${Number(s.cost).toFixed(2)}/mo</div>
                <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',fontWeight:600,background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
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
    "Where am I leaking money?",
  ]

  async function send(msg) {
    const userMsg = msg || input.trim()
    if (!userMsg||loading) return
    setInput('')
    setMessages(prev=>[...prev,{role:'user',text:userMsg}])
    setLoading(true)
    const context = `Subscriptions: ${subs.map(s=>`${s.name} $${s.cost}/mo status:${s.status}`).join(', ')||'none'}. Expenses: ${expenses.map(e=>`${e.description} $${e.amount}`).join(', ')||'none'}. Income: ${income.map(i=>`${i.source} $${i.amount}`).join(', ')||'none'}. Investments: ${investments.map(inv=>`${inv.symbol} ${inv.shares}x buy:$${inv.buyPrice}`).join(', ')||'none'}.`
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
    <div className="page-pad" style={{padding:'36px',height:'100vh',display:'flex',flexDirection:'column',maxHeight:'100vh',boxSizing:'border-box'}}>
      <div style={{marginBottom:'18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'40px',height:'40px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>🤖</div>
          <div>
            <h1 style={{color:theme.text,fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',margin:0,fontFamily:FONT}}>AI Financial Advisor</h1>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:MONO}}>powered by claude · sees your real data</div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>send(s)} style={{fontSize:'12px',padding:'6px 14px',borderRadius:'100px',background:theme.bg,color:theme.text,border:`1px solid ${theme.border}`,cursor:'pointer',fontFamily:FONT,fontWeight:500}}>
            {s}
          </button>
        ))}
      </div>
      <Card style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'14px',minHeight:0}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:'10px',flexDirection:m.role==='user'?'row-reverse':'row'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,background:m.role==='user'?`linear-gradient(135deg,${theme.accent},${theme.accent}88)`:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                {m.role==='user'?'👤':'🤖'}
              </div>
              <div style={{maxWidth:'520px',padding:'11px 15px',borderRadius:'14px',fontSize:'13px',lineHeight:'1.65',color:'#f5f5f7',background:m.role==='user'?theme.bg:'rgba(255,255,255,0.03)',border:m.role==='user'?`1px solid ${theme.border}`:'1px solid rgba(255,255,255,0.06)',fontFamily:FONT}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex',gap:'10px'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>🤖</div>
              <div style={{padding:'11px 15px',borderRadius:'14px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'5px',alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:`${theme.accent}99`,animation:`pulse 1.2s infinite ${i*0.2}s`}}></div>)}
              </div>
            </div>
          )}
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',gap:'10px',alignItems:'center'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask anything about your finances..."
            style={{flex:1,padding:'11px 15px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT}} />
          <button onClick={()=>send()} disabled={loading||!input.trim()}
            style={{width:'42px',height:'42px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontSize:'16px',opacity:loading||!input.trim()?0.4:1,flexShrink:0}}>
            ↑
          </button>
        </div>
      </Card>
    </div>
  )
}