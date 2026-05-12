'use client'
import { useState, useEffect } from 'react'
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const FONT = "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif"
const MONO = "'DM Mono',monospace"

// ── LANGUAGE SYSTEM ──────────────────────────────────────────────
const LANG_STORAGE_KEY = 'burnrate_lang'

const DASHBOARD_TRANSLATIONS = {
  en: {
    overview: 'Overview', subscriptions: 'Subscriptions', spending: 'Spending',
    investments: 'Investments', balance: 'Balance', challenge: 'Challenge',
    ai_advisor: 'AI Advisor', monthly_summary: 'Monthly Summary',
    sign_out: 'Sign out →', command_center: 'command center',
    greeting_morning: 'Good morning', greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening', greeting_night: 'Good night',
    days_left: 'days left in month', monthly_summary_btn: '📋 Monthly Summary',
    powered_by: 'powered by claude',
  },
  tr: {
    overview: 'Genel Bakış', subscriptions: 'Abonelikler', spending: 'Harcamalar',
    investments: 'Yatırımlar', balance: 'Bakiye', challenge: 'Meydan Okuma',
    ai_advisor: 'Yapay Zeka', monthly_summary: 'Aylık Özet',
    sign_out: 'Çıkış Yap →', command_center: 'komuta merkezi',
    greeting_morning: 'Günaydın', greeting_afternoon: 'İyi öğlenler',
    greeting_evening: 'İyi akşamlar', greeting_night: 'İyi geceler',
    days_left: 'gün kaldı', monthly_summary_btn: '📋 Aylık Özet',
    powered_by: 'claude ile güçlendirildi',
  }
}

function getLang() {
  if (typeof window === 'undefined') return 'en'
  return localStorage.getItem(LANG_STORAGE_KEY) || 'en'
}

function setDashboardLang(lang) {
  if (typeof window !== 'undefined') localStorage.setItem(LANG_STORAGE_KEY, lang)
}

function t(key) {
  const lang = getLang()
  return DASHBOARD_TRANSLATIONS[lang]?.[key] || DASHBOARD_TRANSLATIONS['en'][key] || key
}

function getGreeting(name, lang = 'en') {
  const hour = new Date().getHours()
  const greetings = {
    en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night' },
    tr: { morning: 'Günaydın', afternoon: 'İyi öğlenler', evening: 'İyi akşamlar', night: 'İyi geceler' }
  }
  const g = greetings[lang] || greetings.en
  let greet
  if (hour >= 6 && hour < 12) greet = g.morning
  else if (hour >= 12 && hour < 18) greet = g.afternoon
  else if (hour >= 18 && hour < 24) greet = g.evening
  else greet = g.night
  const emoji = hour >= 6 && hour < 12 ? '☀️' : hour >= 12 && hour < 18 ? '🌤️' : hour >= 18 && hour < 22 ? '🌙' : '⭐'
  return `${greet}, ${name} ${emoji}`
}

// ── LOGO SVG ──────────────────────────────────────────────────────
const LOGO_SVG = (size = 32) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dashFireGrad" x1="0.2" y1="1" x2="0.2" y2="0">
        <stop offset="0%" stopColor="#ef4444"/>
        <stop offset="40%" stopColor="#f59e0b"/>
        <stop offset="85%" stopColor="#a78bfa"/>
        <stop offset="100%" stopColor="#c4b5fd"/>
      </linearGradient>
      <linearGradient id="dashBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#111120"/>
        <stop offset="100%" stopColor="#0a0a0f"/>
      </linearGradient>
      <linearGradient id="dashBorderGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7c3aed"/>
        <stop offset="100%" stopColor="#4c1d95"/>
      </linearGradient>
      <clipPath id="dashSq">
        <rect x="0" y="0" width="100" height="100" rx="22"/>
      </clipPath>
    </defs>
    <rect x="0" y="0" width="100" height="100" rx="22" fill="url(#dashBgGrad)"/>
    <rect x="0" y="0" width="100" height="100" rx="22" fill="none" stroke="url(#dashBorderGrad)" strokeWidth="1.5"/>
    <g clipPath="url(#dashSq)" opacity="0.12">
      <line x1="0" y1="25" x2="100" y2="25" stroke="#7c3aed" strokeWidth="0.8"/>
      <line x1="0" y1="50" x2="100" y2="50" stroke="#7c3aed" strokeWidth="0.8"/>
      <line x1="0" y1="75" x2="100" y2="75" stroke="#7c3aed" strokeWidth="0.8"/>
      <line x1="25" y1="0" x2="25" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
      <line x1="50" y1="0" x2="50" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
      <line x1="75" y1="0" x2="75" y2="100" stroke="#7c3aed" strokeWidth="0.8"/>
    </g>
    <path d="M50 88 C32 88 18 76 19 62 C20 52 28 46 27 36 C27 27 22 20 20 12 C32 20 37 31 36 42 C42 30 44 14 39 2 C54 14 58 32 55 48 C61 36 63 18 58 4 C74 20 77 44 71 60 C77 48 79 32 74 18 C88 36 90 60 82 74 C80 62 80 48 76 36 C86 52 85 74 76 84 C68 90 58 88 50 88Z" fill="url(#dashFireGrad)"/>
    <path d="M50 80 C36 80 28 70 29 60 C30 52 36 47 35 38 C35 30 32 24 30 17 C40 25 43 35 41 45 C47 35 48 22 44 12 C56 22 58 38 54 52 C59 42 60 28 56 18 C66 32 67 50 62 62 C66 54 67 42 63 34 C70 46 69 62 63 72 C57 80 50 80 50 80Z" fill="#fff" opacity="0.07"/>
  </svg>
)



// ── PLAN CONFIG ───────────────────────────────────────────────────
const PLAN_ACCESS = {
  starter: ['dashboard', 'spending', 'balance'],
  pro:     ['dashboard', 'spending', 'balance', 'subscriptions', 'goals', 'ai'],
  elite:   ['dashboard', 'spending', 'balance', 'subscriptions', 'goals', 'ai', 'investments', 'summary'],
}

const PLAN_META = {
  starter: { name: 'Starter', color: '#06b6d4', emoji: '🚀', price: '$9/mo' },
  pro:     { name: 'Pro',     color: '#7c3aed', emoji: '💜', price: '$19/mo' },
  elite:   { name: 'Elite',   color: '#f59e0b', emoji: '⚡', price: '$39/mo' },
}

const WHOP_UPGRADE_LINKS = {
  starter: 'https://whop.com/checkout/plan_69Su8P5fb8BKc',
  pro:     'https://whop.com/checkout/plan_SFjoNXODXAH6j',
  elite:   null,
}

const MODULE_PLAN = {
  subscriptions: 'pro',
  goals:         'pro',
  ai:            'pro',
  investments:   'elite',
  summary:       'elite',
}

function canAccess(userPlan, moduleId) {
  const plan = userPlan || 'starter'
  return (PLAN_ACCESS[plan] || PLAN_ACCESS.starter).includes(moduleId)
}

const THEMES = {
  dashboard:     { accent:'#7c3aed', bg:'rgba(124,58,237,0.1)',  border:'rgba(124,58,237,0.3)',  text:'#c4b5fd',  chart:['#7c3aed','#06b6d4','#10b981','#f59e0b','#f43f5e'] },
  subscriptions: { accent:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)',   text:'#fca5a5',  chart:['#ef4444','#f97316','#fbbf24','#a3e635','#34d399'] },
  spending:      { accent:'#f59e0b', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  text:'#fde68a',  chart:['#f59e0b','#f97316','#ef4444','#a78bfa','#34d399'] },
  investments:   { accent:'#10b981', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.3)',  text:'#6ee7b7',  chart:['#10b981','#06b6d4','#3b82f6','#8b5cf6','#f59e0b'] },
  balance:       { accent:'#06b6d4', bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.3)',   text:'#67e8f9',  chart:['#06b6d4','#3b82f6','#8b5cf6','#10b981','#f59e0b'] },
  goals:         { accent:'#f43f5e', bg:'rgba(244,63,94,0.1)',   border:'rgba(244,63,94,0.3)',   text:'#fda4af',  chart:['#f43f5e','#f97316','#fbbf24','#10b981','#06b6d4'] },
  ai:            { accent:'#8b5cf6', bg:'rgba(139,92,246,0.1)',  border:'rgba(139,92,246,0.3)',  text:'#ddd6fe',  chart:['#8b5cf6','#7c3aed','#06b6d4','#10b981','#f59e0b'] },
  summary:       { accent:'#7c3aed', bg:'rgba(124,58,237,0.1)',  border:'rgba(124,58,237,0.3)',  text:'#c4b5fd',  chart:['#6ee7b7','#f97316','#ef4444','#7c3aed','#06b6d4'] },
}

const TIP = {fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)'}
const VAL = {fontFamily:MONO}
const tooltipStyle = {background:'#12121c',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',color:'#f5f5f7',fontSize:'12px',fontFamily:FONT}
const tooltipItemStyle = {color:'#f5f5f7'}
const tooltipLabelStyle = {color:'rgba(255,255,255,0.5)',marginBottom:'4px'}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

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

// ── UPGRADE MODAL ─────────────────────────────────────────────────
function UpgradeModal({ moduleId, userPlan, onClose, lang='en' }) {
  const required = MODULE_PLAN[moduleId] || 'pro'
  const requiredMeta = PLAN_META[required]
  const currentMeta = PLAN_META[userPlan] || PLAN_META.starter
  const upgradeLink = WHOP_UPGRADE_LINKS[userPlan] || 'https://whop.com/burnrate-os'

  const moduleNames = {
    subscriptions: (lang==='tr')?'Abonelik Takibi':'Subscription Tracker',
    goals:         (lang==='tr')?'30 Günlük Meydan Okuma':'30-Day Challenge',
    ai:            (lang==='tr')?'Yapay Zeka Danışmanı':'AI Financial Advisor',
    investments:   (lang==='tr')?'Canlı Yatırımlar':'Live Investments',
    summary:       (lang==='tr')?'Aylık Özet':'Monthly Summary',
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{background:'#0f0f1a',border:`1px solid ${requiredMeta.color}44`,borderRadius:'24px',padding:'40px',maxWidth:'440px',width:'100%',boxShadow:`0 0 80px ${requiredMeta.color}22`,animation:'fadeIn 0.2s ease'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'18px',background:`rgba(${hexToRgb(requiredMeta.color)},0.12)`,border:`1px solid ${requiredMeta.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',marginBottom:'24px'}}>🔒</div>
        <div style={{fontFamily:MONO,fontSize:'11px',color:requiredMeta.color,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'10px'}}>{requiredMeta.name} Feature</div>
        <h2 style={{color:'#f1f0ff',fontSize:'22px',fontWeight:700,letterSpacing:'-0.03em',margin:'0 0 12px',fontFamily:FONT}}>{moduleNames[moduleId]} is locked</h2>
        <p style={{color:'#a09ab8',fontSize:'14px',lineHeight:1.6,margin:'0 0 28px',fontFamily:FONT,fontWeight:300}}>
          You're on the <strong style={{color:currentMeta.color}}>{currentMeta.name}</strong> plan. Upgrade to <strong style={{color:requiredMeta.color}}>{requiredMeta.name}</strong> to unlock this module.
        </p>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'18px',marginBottom:'24px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{(lang==='tr')?'Mevcut Plan':'Current plan'}</span>
            <span style={{color:currentMeta.color,fontSize:'13px',fontWeight:600,fontFamily:MONO}}>{currentMeta.name} · {currentMeta.price}</span>
          </div>
          <div style={{height:'1px',background:'rgba(255,255,255,0.06)',marginBottom:'14px'}}></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{(lang==='tr')?'Yükseltilecek Plan':'Upgrade to'}</span>
            <span style={{color:requiredMeta.color,fontSize:'13px',fontWeight:700,fontFamily:MONO}}>{requiredMeta.name} · {requiredMeta.price}</span>
          </div>
        </div>
        <a href={upgradeLink} target="_blank" rel="noreferrer"
          style={{display:'block',textAlign:'center',padding:'16px',borderRadius:'14px',background:requiredMeta.color,color:'#fff',fontWeight:700,fontSize:'15px',textDecoration:'none',marginBottom:'12px',boxShadow:`0 0 40px ${requiredMeta.color}44`,fontFamily:FONT}}>
          {requiredMeta.emoji} Upgrade to {requiredMeta.name} →
        </a>
        <button onClick={onClose}
          style={{width:'100%',padding:'12px',borderRadius:'14px',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.4)',fontSize:'14px',cursor:'pointer',fontFamily:FONT}}>
          {(lang==='tr')?'Şimdi değil':'Maybe later'}
        </button>
      </div>
    </div>
  )
}

// ── LOCKED PAGE ───────────────────────────────────────────────────
function LockedPage({ moduleId, userPlan, onUpgrade, lang='en' }) {
  const required = MODULE_PLAN[moduleId] || 'pro'
  const requiredMeta = PLAN_META[required]
  const upgradeLink = WHOP_UPGRADE_LINKS[userPlan] || 'https://whop.com/burnrate-os'

  const moduleNames = {
    subscriptions: (lang==='tr')?'Abonelik Takibi':'Subscription Tracker',
    goals:         (lang==='tr')?'30 Günlük Meydan Okuma':'30-Day Challenge',
    ai:            (lang==='tr')?'Yapay Zeka Danışmanı':'AI Financial Advisor',
    investments:   (lang==='tr')?'Canlı Yatırımlar':'Live Investments',
    summary:       (lang==='tr')?'Aylık Özet Puanı':'Monthly Summary Score',
  }
  const moduleDescs = {
    subscriptions: 'Track every recurring charge. Auto-label as KEEP, WARN, or DEAD. Cancel what\'s draining you invisibly.',
    goals:         'AI-generated daily financial tasks. 10×3 calendar grid. Build discipline with 30-day streaks.',
    ai:            'Claude-powered analysis of your real spending. Not generic tips — personalized, data-driven insights.',
    investments:   'Yahoo Finance live prices. Track your portfolio with 30-second auto-refresh and real-time data.',
    summary:       'A/B/C/D monthly score. Money flow chart. Subscription audit. Your complete financial report card.',
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',background:'#0a0a0f'}}>
      <div style={{maxWidth:'480px',width:'100%',textAlign:'center'}}>
        <div style={{width:'80px',height:'80px',borderRadius:'24px',background:`rgba(${hexToRgb(requiredMeta.color)},0.1)`,border:`1px solid ${requiredMeta.color}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px',margin:'0 auto 28px'}}>🔒</div>
        <div style={{fontFamily:MONO,fontSize:'11px',color:requiredMeta.color,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'12px'}}>{requiredMeta.name} Plan Required</div>
        <h2 style={{color:'#f1f0ff',fontSize:'28px',fontWeight:700,letterSpacing:'-0.03em',margin:'0 0 16px',fontFamily:FONT,lineHeight:1.1}}>{moduleNames[moduleId]}</h2>
        <p style={{color:'#a09ab8',fontSize:'15px',lineHeight:1.7,margin:'0 0 40px',fontFamily:FONT,fontWeight:300}}>{moduleDescs[moduleId]}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center',marginBottom:'40px'}}>
          {(required === 'pro'
            ? [(lang==='tr')?'Abonelik Takibi':'Subscription Tracker',(lang==='tr')?'30 Günlük Meydan Okuma':'30-Day Challenge','AI Advisor']
            : [(lang==='tr')?'Canlı Yatırımlar':'Live Investments',(lang==='tr')?'Aylık Özet':'Monthly Summary','Priority Support']
          ).map(f => (
            <span key={f} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 14px',borderRadius:'100px',background:`rgba(${hexToRgb(requiredMeta.color)},0.1)`,border:`1px solid ${requiredMeta.color}33`,color:requiredMeta.color,fontSize:'12px',fontFamily:FONT}}>✓ {f}</span>
          ))}
        </div>
        <a href={upgradeLink} target="_blank" rel="noreferrer"
          style={{display:'block',width:'100%',padding:'18px',borderRadius:'16px',background:requiredMeta.color,color:'#fff',fontWeight:700,fontSize:'16px',textDecoration:'none',boxShadow:`0 0 60px ${requiredMeta.color}44`,fontFamily:FONT,marginBottom:'12px'}}>
          {requiredMeta.emoji} Upgrade to {requiredMeta.name} · {requiredMeta.price}
        </a>
        <div style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',fontFamily:FONT}}>{(lang==='tr')?'İstediğin zaman iptal · Anında aktivasyon':'Cancel anytime · Instant activation via Whop'}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [subs, setSubs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [investments, setInvestments] = useState([])
  const [upgradeModal, setUpgradeModal] = useState(null)
  const [manageModal, setManageModal] = useState(false)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(getLang())
  }, [])

  function changeLang(l) {
    setDashboardLang(l)
    setLang(l)
  }

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
    setInvestments([])
  }

  function navigateTo(moduleId) {
    if (!canAccess(user?.plan, moduleId)) { setUpgradeModal(moduleId); return }
    setPage(moduleId)
  }

  const navItems = [
    { id:'dashboard',     icon:'⚡', label: (lang==='tr') ? 'Genel Bakış'   : 'Overview' },
    { id:'subscriptions', icon:'⚔️', label: (lang==='tr') ? 'Abonelikler'   : 'Subscriptions' },
    { id:'spending',      icon:'💸', label: (lang==='tr') ? 'Harcamalar'    : 'Spending' },
    { id:'investments',   icon:'📈', label: (lang==='tr') ? 'Yatırımlar'    : 'Investments' },
    { id:'balance',       icon:'💰', label: (lang==='tr') ? 'Bakiye'        : 'Balance' },
    { id:'goals',         icon:'🎯', label: (lang==='tr') ? 'Meydan Okuma'  : 'Challenge' },
  ]

  if (!user) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:FONT}}>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:'14px'}}>Loading...</div>
    </div>
  )

  const userPlan = user.plan || 'starter'
  const planMeta = PLAN_META[userPlan] || PLAN_META.starter
  const upgradeLink = WHOP_UPGRADE_LINKS[userPlan]

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
        @keyframes spin{to{transform:rotate(360deg)}}
        .recharts-tooltip-wrapper * { color: #f5f5f7 !important; }
        .recharts-default-tooltip { background: #12121c !important; border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 12px !important; }
        .recharts-tooltip-label { color: rgba(255,255,255,0.5) !important; }
        .recharts-tooltip-item { color: #f5f5f7 !important; }
        @media(max-width:768px){
          .sidebar{display:none!important}
          .tabbar{display:flex!important}
          .page-wrap{padding-bottom:80px!important}
          .page-pad{padding:20px!important}
          .grid4{grid-template-columns:repeat(2,1fr)!important}
          .grid3{grid-template-columns:repeat(2,1fr)!important}
          .grid2{grid-template-columns:1fr!important}
        }
      `}</style>

      {upgradeModal && <UpgradeModal moduleId={upgradeModal} userPlan={userPlan} onClose={() => setUpgradeModal(null)} />}

      {/* TRIAL BANNER */}
      {user?.is_trial && user?.trial_expires_at && (() => {
        const daysLeft = Math.ceil((new Date(user.trial_expires_at) - new Date()) / (1000*60*60*24))
              if (daysLeft <= 0) return null
        return (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:200,background:'linear-gradient(90deg,#7c3aed,#4c1d95)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'16px'}}>
            <span style={{color:'#fff',fontSize:'13px',fontFamily:FONT,fontWeight:500}}>
              {(lang==='tr')?`⏳ Denemeniz ${daysLeft} gün içinde sona eriyor`:`⏳ Your trial expires in ${daysLeft} day${daysLeft!==1?'s':''}`}
            </span>
            <a href={WHOP_UPGRADE_LINKS.starter} target="_blank" rel="noreferrer"
              style={{background:'rgba(255,255,255,0.2)',color:'#fff',padding:'5px 14px',borderRadius:'100px',fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:FONT,whiteSpace:'nowrap'}}>
              {(lang==='tr')?'Plan Al →':'Upgrade →'}
            </a>
          </div>
        )
      })()}

      {/* MANAGE MODAL */}
      {manageModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}
          onClick={e=>e.target===e.currentTarget&&setManageModal(false)}>
          <div style={{background:'#0f0f1a',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'24px',padding:'36px',maxWidth:'420px',width:'100%'}}>
            <div style={{fontSize:'32px',marginBottom:'16px',textAlign:'center'}}>⚙️</div>
            <h2 style={{color:'#f1f0ff',fontSize:'20px',fontWeight:700,margin:'0 0 8px',fontFamily:FONT,textAlign:'center'}}>
              {lang==='tr'?'Aboneliği Yönet':'Manage Subscription'}
            </h2>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',lineHeight:1.7,margin:'0 0 24px',fontFamily:FONT,textAlign:'center'}}>
              {lang==='tr'?
                <span>Aboneliğiniz <strong style={{color:'#a78bfa'}}>Whop</strong> üzerinden yönetilmektedir.<br/><br/>İptal etmek için:<br/>1. Aşağıdaki butona tıklayın<br/>2. Aboneliğinize tıklayın<br/>3. <strong>Cancel membership</strong> butonuna basın</span>
                :
                <span>Your subscription is managed through <strong style={{color:'#a78bfa'}}>Whop</strong>.<br/><br/>To cancel:<br/>1. Click button below<br/>2. Click your subscription<br/>3. Press <strong>Cancel membership</strong></span>
              }
            </p>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{lang==='tr'?'Mevcut Plan':'Current Plan'}</span>
                <span style={{color:planMeta.color,fontSize:'13px',fontWeight:700,fontFamily:MONO}}>{planMeta.emoji} {planMeta.name}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{lang==='tr'?'Fiyat':'Price'}</span>
                <span style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontFamily:MONO}}>{planMeta.price}</span>
              </div>
            </div>
            <a href="https://whop.com/@me/settings/orders/" target="_blank" rel="noreferrer"
              style={{display:'block',textAlign:'center',padding:'14px',borderRadius:'12px',background:'rgba(255,255,255,0.08)',color:'#f5f5f7',fontWeight:600,fontSize:'14px',textDecoration:'none',marginBottom:'10px',fontFamily:FONT}}
              onClick={()=>setManageModal(false)}>
              {lang==='tr'?`Whop'ta Aboneliğimi Yönet →`:'Manage My Subscription on Whop →'}
            </a>
            <button onClick={()=>setManageModal(false)}
              style={{width:'100%',padding:'12px',borderRadius:'12px',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.3)',fontSize:'13px',cursor:'pointer',fontFamily:FONT}}>
              {lang==='tr'?'Kapat':'Close'}
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="sidebar" style={{width:'224px',background:'rgba(255,255,255,0.015)',borderRight:'1px solid rgba(255,255,255,0.06)',flexShrink:0,display:'flex',flexDirection:'column',padding:'28px 14px',paddingTop:user?.is_trial?'52px':'28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px',paddingLeft:'8px'}}>
          <div style={{flexShrink:0}}>{LOGO_SVG(32)}</div>
          <div>
            <div style={{color:'#f5f5f7',fontSize:'14px',fontWeight:600,letterSpacing:'-0.3px'}}>BurnRate OS</div>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>{lang==='tr'?'komuta merkezi':'command center'}</div>
          </div>
        </div>

        {/* PLAN BADGE */}
        <div style={{background:`rgba(${hexToRgb(planMeta.color)},0.1)`,border:`1px solid ${planMeta.color}44`,borderRadius:'10px',padding:'9px 12px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'14px'}}>{planMeta.emoji}</span>
          <div style={{flex:1}}>
            <div style={{color:planMeta.color,fontSize:'12px',fontWeight:700,fontFamily:MONO,letterSpacing:'0.05em'}}>{planMeta.name.toUpperCase()}</div>
            <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:FONT}}>{planMeta.price}</div>
          </div>
          {upgradeLink && (
            <a href={upgradeLink} target="_blank" rel="noreferrer"
              style={{fontSize:'10px',color:'rgba(255,255,255,0.35)',textDecoration:'none',fontFamily:FONT,background:'rgba(255,255,255,0.06)',padding:'3px 8px',borderRadius:'6px',whiteSpace:'nowrap'}}>
              ↑ upgrade
            </a>
          )}
        </div>

        {/* LANG TOGGLE */}
        <div style={{display:'flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'8px',overflow:'hidden',marginBottom:'16px'}}>
          {['en','tr'].map(l => (
            <button key={l} onClick={()=>changeLang(l)}
              style={{flex:1,padding:'6px 0',fontSize:'11px',fontFamily:MONO,fontWeight:500,color:lang===l?'#fff':'rgba(255,255,255,0.3)',background:lang===l?'#7c3aed':'transparent',border:'none',cursor:'pointer',letterSpacing:'0.05em',transition:'all 0.2s'}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <nav style={{display:'flex',flexDirection:'column',gap:'2px',flex:1}}>
          {navItems.map(item => {
            const t = THEMES[item.id]
            const active = page === item.id
            const locked = !canAccess(userPlan, item.id)
            return (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',fontSize:'13px',fontWeight:active?600:400,textAlign:'left',background:active?t.bg:'transparent',color:active?t.text:locked?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.38)',border:active?`1px solid ${t.border}`:'1px solid transparent',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
                <span style={{fontSize:'14px',opacity:locked?0.5:1}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {locked && <span style={{fontSize:'10px',opacity:0.4}}>🔒</span>}
              </button>
            )
          })}
        </nav>

        <div style={{marginBottom:'14px'}}>
          <button onClick={() => navigateTo('ai')}
            style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'11px 12px',borderRadius:'12px',background:page==='ai'?'linear-gradient(135deg,#7c3aed,#4c1d95)':'rgba(124,58,237,0.1)',color:page==='ai'?'#fff':'#c4b5fd',border:'1px solid rgba(124,58,237,0.3)',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
            <span style={{fontSize:'15px',opacity:canAccess(userPlan,'ai')?1:0.5}}>🤖</span>
            <div style={{textAlign:'left',flex:1}}>
              <div style={{fontSize:'13px',fontWeight:600}}>{lang==='tr'?'Yapay Zeka':'AI Advisor'}</div>
              <div style={{fontSize:'10px',color:page==='ai'?'rgba(255,255,255,0.5)':'rgba(196,181,253,0.5)',fontFamily:MONO}}>{lang==='tr'?'claude destekli':'powered by claude'}</div>
            </div>
            {!canAccess(userPlan,'ai') && <span style={{fontSize:'10px',opacity:0.4}}>🔒</span>}
          </button>
        </div>

        <div style={{marginBottom:'8px'}}>
          <button onClick={() => navigateTo('summary')}
            style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',fontSize:'13px',fontWeight:page==='summary'?600:400,background:page==='summary'?THEMES.summary.bg:'transparent',color:page==='summary'?THEMES.summary.text:canAccess(userPlan,'summary')?'rgba(255,255,255,0.38)':'rgba(255,255,255,0.2)',border:page==='summary'?`1px solid ${THEMES.summary.border}`:'1px solid transparent',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
            <span style={{fontSize:'14px',opacity:canAccess(userPlan,'summary')?1:0.5}}>📋</span>
            <span style={{flex:1}}>{lang==='tr'?'Aylık Özet':(lang==='tr')?'Aylık Özet':'Monthly Summary'}</span>
            {!canAccess(userPlan,'summary') && <span style={{fontSize:'10px',opacity:0.4}}>🔒</span>}
          </button>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'14px'}}>
          <div style={{paddingLeft:'8px',marginBottom:'10px'}}>
            <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{user.name || 'User'}</div>
            <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:MONO,marginTop:'2px'}}>{user.email}</div>
          </div>
          <button onClick={()=>setManageModal(true)}
            style={{width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',color:'rgba(255,255,255,0.2)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT,marginBottom:'2px'}}>
            {lang==='tr'?'⚙️ Aboneliği Yönet':'⚙️ Manage Subscription'}
          </button>
          <button onClick={() => { localStorage.clear(); window.location.href='/login' }}
            style={{width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',color:'rgba(255,255,255,0.25)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>
            {lang==='tr'?'Çıkış Yap →':'Sign out →'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="page-wrap" style={{flex:1,overflowY:'auto',paddingTop:user?.is_trial?'40px':'0'}}>
        {page==='dashboard'     && <OverviewPage theme={THEMES.dashboard} netBal={netBal} totalSubs={totalSubs} totalExp={totalExp} deadSubs={deadSubs} subs={subs} expenses={expenses} totalIncome={totalIncome} invGain={invGain} totalInvValue={totalInvValue} onSummary={()=>navigateTo('summary')} userPlan={userPlan} userName={user.name||'User'} lang={lang} />}
        {page==='subscriptions' && (canAccess(userPlan,'subscriptions') ? <SubsPage theme={THEMES.subscriptions} subs={subs} userId={user.id} onRefresh={() => loadData(user.id)} lang={lang} /> : <LockedPage moduleId="subscriptions" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('subscriptions')} />)}
        {page==='spending'      && <SpendingPage theme={THEMES.spending} expenses={expenses} userId={user.id} onRefresh={() => loadData(user.id)} lang={lang} />}
        {page==='investments'   && (canAccess(userPlan,'investments') ? <InvestmentsPage theme={THEMES.investments} investments={investments} setInvestments={setInvestments} lang={lang} /> : <LockedPage moduleId="investments" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('investments')} />)}
        {page==='balance'       && <BalancePage theme={THEMES.balance} income={income} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} userId={user.id} onRefresh={() => loadData(user.id)} lang={lang} />}
        {page==='goals'         && (canAccess(userPlan,'goals') ? <GoalsPage theme={THEMES.goals} expenses={expenses} totalExp={totalExp} totalSubs={totalSubs} totalIncome={totalIncome} lang={lang} /> : <LockedPage moduleId="goals" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('goals')} />)}
        {page==='summary'       && (canAccess(userPlan,'summary') ? <MonthlySummaryPage theme={THEMES.summary} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} subs={subs} expenses={expenses} income={income} lang={lang} /> : <LockedPage moduleId="summary" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('summary')} />)}
        {page==='ai'            && (canAccess(userPlan,'ai') ? <AIPage theme={THEMES.ai} user={user} subs={subs} expenses={expenses} income={income} investments={investments} lang={lang} /> : <LockedPage moduleId="ai" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('ai')} />)}
      </div>

      {/* MOBILE TAB BAR */}
      <div className="tabbar" style={{display:'none',position:'fixed',bottom:0,left:0,right:0,background:'rgba(10,10,15,0.97)',borderTop:'1px solid rgba(255,255,255,0.07)',backdropFilter:'blur(24px)',zIndex:50,padding:'8px 0 20px'}}>
        {[...navItems,{id:'ai',icon:'🤖',label:lang==='tr'?'Yapay Zeka':'AI'},{id:'summary',icon:'📋',label:lang==='tr'?'Özet':'Summary'}].map(item => {
          const active = page === item.id
          const t = THEMES[item.id] || THEMES.ai
          const locked = !canAccess(userPlan, item.id)
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)}
              style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'6px 2px',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>
              <div style={{width:'32px',height:'32px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',background:active?t.bg:'transparent',border:active?`1px solid ${t.border}`:'1px solid transparent',transition:'all 0.15s',position:'relative'}}>
                <span style={{opacity:locked?0.4:1}}>{item.icon}</span>
                {locked && <span style={{position:'absolute',top:'-4px',right:'-4px',fontSize:'8px'}}>🔒</span>}
              </div>
              <span style={{fontSize:'9px',fontWeight:active?600:400,color:active?t.text:locked?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.28)',transition:'all 0.15s'}}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── SHARED ────────────────────────────────────────────────────────
function Card({ children, style={}, accent=null }) {
  const rgb = accent ? hexToRgb(accent) : null
  const bg = rgb ? `rgba(${rgb},0.06)` : 'rgba(255,255,255,0.03)'
  const border = rgb ? `rgba(${rgb},0.14)` : 'rgba(255,255,255,0.07)'
  return <div style={{background:bg,border:`1px solid ${border}`,borderRadius:'16px',animation:'fadeIn 0.3s ease',...style}}>{children}</div>
}

function StatCard({ label, value, sub, color, icon, accent=null }) {
  return (
    <Card accent={accent} style={{padding:'20px'}}>
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
function OverviewPage({ theme, netBal, totalSubs, totalExp, deadSubs, subs, expenses, totalIncome, invGain, totalInvValue, onSummary, userPlan, userName, lang }) {
  const sr = totalIncome > 0 ? Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100) : 0
  const now = new Date()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})
  const daysLeft = new Date(now.getFullYear(),now.getMonth()+1,0).getDate() - now.getDate()
  const pieData = [{name:(lang==='tr')?'Abonelikler':'Subscriptions',value:totalSubs},{name:(lang==='tr')?'Gider':'Expenses',value:totalExp},{name:(lang==='tr')?'Tasarruf':'Saved',value:Math.max(0,netBal)}].filter(d=>d.value>0)
  const barData = expenses.slice(-6).map((e,i)=>({name:e.description?.slice(0,8)||`#${i+1}`,amount:Number(e.amount)}))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{color:theme.text,fontSize:'24px',fontWeight:700,letterSpacing:'-0.5px',margin:0,marginBottom:'4px',fontFamily:FONT}}>{getGreeting(userName, lang)}</h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} · {daysLeft} {lang==='tr'?'gün kaldı':'days left'}</p>
        </div>
        <button onClick={onSummary}
          style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',fontSize:'13px',fontWeight:600,background:'rgba(124,58,237,0.12)',color:'#c4b5fd',border:'1px solid rgba(124,58,237,0.25)',cursor:'pointer',fontFamily:FONT}}>
          📋 {lang==='tr'?'Aylık Özet':(lang==='tr')?'Aylık Özet':'Monthly Summary'} {!canAccess(userPlan,'summary') && '🔒'}
        </button>
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
        <StatCard accent={theme.accent} label={lang==='tr'?'Net Bakiye':'Net Balance'} value={`₺${Math.abs(netBal).toFixed(0)}`} sub={lang==='tr'?(netBal>=0?'↑ Pozitif':'↓ Açıkta'):(netBal>=0?'↑ Positive':'↓ In the red')} color={netBal>=0?'#6ee7b7':'#fca5a5'} icon="💰" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Aylık Harcama':'Monthly Burn'} value={`₺${(totalExp+totalSubs).toFixed(0)}`} sub={lang==='tr'?'harcama + abonelik':'expenses + subs'} color="#fb7185" icon="🔥" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Tasarruf Oranı':lang==='tr'?'Tasarruf Oranı':'Savings Rate'} value={`${sr}%`} sub={lang==='tr'?(sr>=30?'Mükemmel 🎉':sr>=15?'İyi, devam et':'Gelişmeli'):(sr>=30?'Excellent 🎉':sr>=15?'Good, keep going':'Needs work')} color={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} icon="📊" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Portföy':'Portfolio'} value={`₺${totalInvValue.toFixed(0)}`} sub={lang==='tr'?(invGain>=0?`+₺${invGain.toFixed(0)} kazanç`:`-₺${Math.abs(invGain).toFixed(0)} kayıp`):(invGain>=0?`+₺${invGain.toFixed(0)} gain`:`-₺${Math.abs(invGain).toFixed(0)} loss`)} color={invGain>=0?'#6ee7b7':'#fca5a5'} icon="📈" />
      </div>
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Harcama Dağılımı':'Spending Breakdown'}</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={5} dataKey="value">
                  {pieData.map((_,i) => <Cell key={i} fill={theme.chart[i]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v,name)=>[`₺${v.toFixed(2)}`,name]} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz veri yok':'No data yet'}</div>}
          <div style={{display:'flex',gap:'14px',justifyContent:'center',marginTop:'8px'}}>
            {pieData.map((d,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'rgba(255,255,255,0.4)',fontFamily:FONT}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:theme.chart[i]}}></div>{d.name}
              </div>
            ))}
          </div>
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Son Harcamalar':'Recent Expenses'}</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {barData.map((_,i) => <Cell key={i} fill={THEMES.spending.chart[i%5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz harcama yok':'No expenses yet'}</div>}
        </Card>
      </div>
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'⚔️ En Büyük Abonelikler':'⚔️ Top Subscriptions'}</div>
          {subs.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz abonelik yok':'No subscriptions yet'}</div> :
            subs.slice(0,4).map(s => (
              <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{s.name}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>{s.category}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                  <span style={{color:THEMES.subscriptions.text,fontSize:'13px',...VAL}}>₺{Number(s.cost).toFixed(2)}</span>
                  <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.status==='dead'?((lang==='tr')?'ölü':'dead'):s.status==='warn'?((lang==='tr')?'uyarı':'warn'):((lang==='tr')?'tut':'keep')}</span>
                </div>
              </div>
            ))}
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'💸 Son Harcamalar':'💸 Recent Spending'}</div>
          {expenses.length===0 ? <div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz harcama yok':'No expenses yet'}</div> :
            expenses.slice(0,4).map(e => (
              <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{e.description}</div>
                  <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>{e.expense_date||'—'}</div>
                </div>
                <span style={{color:THEMES.spending.text,fontSize:'13px',...VAL}}>-₺{Number(e.amount).toFixed(2)}</span>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}

// ── SUBSCRIPTIONS ─────────────────────────────────────────────────
function SubsPage({ theme, subs, userId, onRefresh, lang='en' }) {

  const SUB_CATS = [
    { v:'saas',          tr:'SaaS / Araçlar',       en:'SaaS / Tools',       icon:'🛠️', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'ai',            tr:'Yapay Zeka',            en:'AI Tools',           icon:'🤖', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'marketing',     tr:'Pazarlama',             en:'Marketing',          icon:'📢', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'design',        tr:'Tasarım',               en:'Design',             icon:'🎨', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'productivity',  tr:'Verimlilik',            en:'Productivity',       icon:'⚡', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'storage',       tr:'Depolama / Bulut',      en:'Storage / Cloud',    icon:'☁️', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'dev',           tr:'Geliştirme',            en:'Development',        icon:'💻', g_tr:'İş & Üretkenlik', g_en:'Work & Productivity' },
    { v:'streaming',     tr:'Yayın Platformu',       en:'Streaming',          icon:'🎬', g_tr:'Eğlence',         g_en:'Entertainment' },
    { v:'music',         tr:'Müzik',                 en:'Music',              icon:'🎵', g_tr:'Eğlence',         g_en:'Entertainment' },
    { v:'gaming',        tr:'Oyun',                  en:'Gaming',             icon:'🎮', g_tr:'Eğlence',         g_en:'Entertainment' },
    { v:'news',          tr:'Haber / Dergi',         en:'News / Magazine',    icon:'📰', g_tr:'Eğlence',         g_en:'Entertainment' },
    { v:'fitness',       tr:'Spor & Sağlık',         en:'Fitness & Health',   icon:'💪', g_tr:'Yaşam',           g_en:'Lifestyle' },
    { v:'food_sub',      tr:'Yemek Aboneliği',       en:'Food Subscription',  icon:'🍱', g_tr:'Yaşam',           g_en:'Lifestyle' },
    { v:'vpn',           tr:'VPN / Güvenlik',        en:'VPN / Security',     icon:'🔒', g_tr:'Yaşam',           g_en:'Lifestyle' },
    { v:'education',     tr:'Eğitim / Kurs',         en:'Education / Course', icon:'📚', g_tr:'Eğitim',          g_en:'Education' },
    { v:'language',      tr:'Dil Öğrenimi',          en:'Language Learning',  icon:'🌍', g_tr:'Eğitim',          g_en:'Education' },
    { v:'finance',       tr:'Finans / Yatırım',      en:'Finance / Investing',icon:'💰', g_tr:'Finans',          g_en:'Finance' },
    { v:'insurance',     tr:'Sigorta',               en:'Insurance',          icon:'🛡️', g_tr:'Finans',          g_en:'Finance' },
    { v:'other_sub',     tr:'Diğer',                 en:'Other',              icon:'📦', g_tr:'Diğer',           g_en:'Other' },
  ]
  const getSubCatLabel = (v) => { const cat=SUB_CATS.find(c=>c.v===v); return cat?((lang==='tr')?cat.tr:cat.en):v }

  const [form, setForm] = useState({name:'',cost:'',category:'saas',days_since_used:'0',notes:''})
  const [adding, setAdding] = useState(false)
  const [subCatSearch, setSubCatSearch] = useState('')
  const [subCatOpen, setSubCatOpen]     = useState(false)
  const filtSubCats = subCatSearch ? SUB_CATS.filter(c=>((lang==='tr')?c.tr:c.en).toLowerCase().includes(subCatSearch.toLowerCase())) : SUB_CATS

  async function addSub() {
    if (!form.name||!form.cost) return
    const days = parseInt(form.days_since_used)||0
    const status = days===0?'keep':days<30?'keep':days<60?'warn':'dead'
    await supabaseInsert('subscriptions',{...form,cost:parseFloat(form.cost),days_since_used:days,status,user_id:userId})
    setForm({name:'',cost:'',category:'saas',days_since_used:'0',notes:''}); setSubCatSearch(''); setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('subscriptions',id); onRefresh() }

  const total = subs.reduce((a,s)=>a+Number(s.cost),0)
  const dead = subs.filter(s=>s.status==='dead')
  const catData = [...new Set(subs.map(s=>s.category))].map(c=>({name:c,value:subs.filter(s=>s.category===c).reduce((a,s)=>a+Number(s.cost),0)}))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title={lang==='tr'?'⚔️ Abonelik Guillotine':'⚔️ Subscription Guillotine'} subtitle={lang==='tr'?'Tüm yinelenen ücretleri takip et. Ölüleri öldür.':'Track every recurring charge. Kill the dead ones.'}
        action={<AddBtn theme={theme} label={lang==='tr'?'+ Abonelik Ekle':'+ Add Subscription'} onClick={()=>setAdding(!adding)} />} />
      <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard accent={theme.accent} label={lang==='tr'?'Aylık Maliyet':'Monthly Cost'} value={`₺${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Ölü Araçlar':'Dead Tools'} value={dead.length} sub={lang==='tr'?`₺${dead.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/ay israf`:`₺${dead.reduce((a,s)=>a+Number(s.cost),0).toFixed(2)}/mo wasted`} color="#fca5a5" icon="💀" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Tutmaya Değer':'Worth Keeping'} value={subs.filter(s=>s.status==='keep').length} color="#6ee7b7" icon="✅" />
      </div>
      {adding && (
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label={lang==='tr'?'Hizmet Adı':'Service Name'} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={lang==='tr'?'Shopify, Claude Pro...':'Shopify, Claude Pro...'} />
            <InputField label={lang==='tr'?'Aylık Maliyet (₺)':'Monthly Cost (₺)'} value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} type="number" placeholder="29.00" />
            <InputField label={lang==='tr'?'Son Kullanımdan Bu Yana (gün)':'Days Since Last Used'} value={form.days_since_used} onChange={e=>setForm({...form,days_since_used:e.target.value})} type="number" placeholder="0 = used today" />
            <div style={{position:'relative'}}>
              <div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Kategori':'Category'}</div>
              <div onClick={()=>{setSubCatSearch('');setSubCatOpen(true)}}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:`1px solid ${subCatOpen?'rgba(239,68,68,0.4)':'rgba(255,255,255,0.09)'}`,color:'#f5f5f7',fontSize:'13px',cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',gap:'8px',justifyContent:'space-between',transition:'border 0.2s'}}>
                <span>{SUB_CATS.find(c=>c.v===form.category)?.icon} {getSubCatLabel(form.category)}</span>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:'10px'}}>{subCatOpen?'▲':'▼'}</span>
              </div>
              {subCatOpen&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:'4px',background:'#13131f',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',overflow:'hidden',zIndex:300,boxShadow:'0 12px 40px rgba(0,0,0,0.7)',maxHeight:'260px',overflowY:'auto'}}>
                  <div style={{padding:'8px 10px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    <input autoFocus value={subCatSearch} onChange={e=>setSubCatSearch(e.target.value)}
                      placeholder={(lang==='tr')?'Ara...':'Search...'}
                      style={{width:'100%',padding:'7px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',color:'#f5f5f7',fontSize:'12px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}}
                    />
                  </div>
                  {filtSubCats.map((cat,i)=>(
                    <div key={i}
                      onMouseDown={()=>{setForm({...form,category:cat.v});setSubCatSearch('');setSubCatOpen(false)}}
                      style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:'10px',background:form.category===cat.v?'rgba(239,68,68,0.08)':'transparent'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                      onMouseLeave={e=>e.currentTarget.style.background=form.category===cat.v?'rgba(239,68,68,0.08)':'transparent'}>
                      <span style={{fontSize:'16px'}}>{cat.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{color:'#f5f5f7',fontSize:'13px',fontFamily:FONT}}>{(lang==='tr')?cat.tr:cat.en}</div>
                        <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>{(lang==='tr')?cat.g_tr:cat.g_en}</div>
                      </div>
                      {form.category===cat.v&&<span style={{color:'#ef4444',fontSize:'12px'}}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
              {subCatOpen&&<div style={{position:'fixed',inset:0,zIndex:299}} onClick={()=>setSubCatOpen(false)}/>}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'İptal':'Cancel'}</button>
            <button onClick={addSub} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'Kaydet':'Save'}</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
              <thead><tr><TH>{lang==='tr'?'Hizmet':'Service'}</TH><TH>{lang==='tr'?'Maliyet/ay':'Cost/mo'}</TH><TH>{lang==='tr'?'Kategori':'Category'}</TH><TH>{lang==='tr'?'Son Kullanım':'Last Used'}</TH><TH>Status</TH><TH></TH></tr></thead>
              <tbody>
                {subs.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz abonelik yok':'No subscriptions yet'}</td></tr>
                : subs.map(s=>(
                  <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{s.name}</td>
                    <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>₺{Number(s.cost).toFixed(2)}</td>
                    <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${theme.accent}22`,color:theme.text,fontFamily:FONT}}>{getSubCatLabel(s.category)}</span></td>
                    <td style={{padding:'12px 0',...VAL,color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>{lang==='tr'?(s.days_since_used===0?'Bugün':`${s.days_since_used}g önce`):(s.days_since_used===0?'Today':`${s.days_since_used}d ago`)}</td>
                    <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',fontWeight:600,background:s.status==='dead'?'rgba(239,68,68,0.15)':s.status==='warn'?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',color:s.status==='dead'?'#fca5a5':s.status==='warn'?'#fde68a':'#6ee7b7',fontFamily:FONT}}>{s.status==='dead'?((lang==='tr')?'ÖLÜ':'DEAD'):s.status==='warn'?((lang==='tr')?'UYARI':'WARN'):((lang==='tr')?'TUTUN':'KEEP')}</span></td>
                    <td style={{padding:'12px 0'}}><button onClick={()=>del(s.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'Sil':'Kill'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Kategoriye Göre':'By Category'}</div>
          {catData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value">
                  {catData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v,name)=>[`₺${v.toFixed(2)}`,name]} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Veri yok':'No data'}</div>}
        </Card>
      </div>
    </div>
  )
}

// ── SPENDING ──────────────────────────────────────────────────────────────────
function SpendingPage({ theme, expenses, userId, onRefresh, lang='en' }) {

  const CATS = [
    {v:'kira',     tr:'Kira / Mortgage',      en:'Rent / Mortgage',      g_tr:'Ev & Yaşam',       g_en:'Home & Life'},
    {v:'mobilya',  tr:'Mobilya & Dekorasyon', en:'Furniture & Decor',    g_tr:'Ev & Yaşam',       g_en:'Home & Life'},
    {v:'tadilat',  tr:'Tadilat & Onarım',     en:'Renovation & Repair',  g_tr:'Ev & Yaşam',       g_en:'Home & Life'},
    {v:'temizlik', tr:'Temizlik',             en:'Cleaning',             g_tr:'Ev & Yaşam',       g_en:'Home & Life'},
    {v:'market',   tr:'Market & Alışveriş',   en:'Groceries',            g_tr:'Yiyecek & İçecek', g_en:'Food & Drink'},
    {v:'restoran', tr:'Restoran & Kafe',      en:'Restaurant & Cafe',    g_tr:'Yiyecek & İçecek', g_en:'Food & Drink'},
    {v:'food',     tr:'Yemek Siparişi',       en:'Food Delivery',        g_tr:'Yiyecek & İçecek', g_en:'Food & Drink'},
    {v:'akaryakit',tr:'Akaryakıt',            en:'Fuel',                 g_tr:'Ulaşım',           g_en:'Transport'},
    {v:'transport',tr:'Toplu Taşıma',         en:'Public Transport',     g_tr:'Ulaşım',           g_en:'Transport'},
    {v:'taksi',    tr:'Taksi & Araç Kiralama',en:'Taxi & Car Rental',    g_tr:'Ulaşım',           g_en:'Transport'},
    {v:'hastane',  tr:'Hastane & Doktor',     en:'Hospital & Doctor',    g_tr:'Sağlık',           g_en:'Health'},
    {v:'ilac',     tr:'İlaç & Eczane',        en:'Pharmacy',             g_tr:'Sağlık',           g_en:'Health'},
    {v:'spor',     tr:'Spor & Fitness',       en:'Sports & Fitness',     g_tr:'Sağlık',           g_en:'Health'},
    {v:'dugun',    tr:'Düğün & Organizasyon', en:'Wedding & Events',     g_tr:'Eğlence & Sosyal', g_en:'Events & Social'},
    {v:'seyahat',  tr:'Seyahat & Tatil',      en:'Travel & Vacation',    g_tr:'Eğlence & Sosyal', g_en:'Events & Social'},
    {v:'eglence',  tr:'Sinema & Etkinlik',    en:'Cinema & Events',      g_tr:'Eğlence & Sosyal', g_en:'Events & Social'},
    {v:'hediye',   tr:'Hediye & Çiçek',       en:'Gifts & Flowers',      g_tr:'Eğlence & Sosyal', g_en:'Events & Social'},
    {v:'giyim',    tr:'Giyim & Aksesuar',     en:'Clothing',             g_tr:'Giyim & Kişisel',  g_en:'Fashion'},
    {v:'guzellik', tr:'Güzellik & Bakım',     en:'Beauty & Care',        g_tr:'Giyim & Kişisel',  g_en:'Fashion'},
    {v:'egitim',   tr:'Kurs & Eğitim',        en:'Education',            g_tr:'Eğitim & İş',      g_en:'Education'},
    {v:'business', tr:'İş Giderleri',         en:'Business Expenses',    g_tr:'Eğitim & İş',      g_en:'Education'},
    {v:'abonelik', tr:'Abonelikler',          en:'Subscriptions',        g_tr:'Eğitim & İş',      g_en:'Education'},
    {v:'bagis',    tr:'Bağış & Yardım',       en:'Donations',            g_tr:'Diğer',            g_en:'Other'},
    {v:'impulse',  tr:'Ani Alım',             en:'Impulse Buy',          g_tr:'Diğer',            g_en:'Other'},
    {v:'other',    tr:'Diğer',               en:'Other',                g_tr:'Diğer',            g_en:'Other'},
  ]
  const CAT_COLORS_MAP = {
    kira:'#06b6d4',mobilya:'#8b5cf6',tadilat:'#64748b',temizlik:'#67e8f9',
    market:'#10b981',restoran:'#f59e0b',food:'#f97316',
    akaryakit:'#eab308',transport:'#f59e0b',taksi:'#fbbf24',
    hastane:'#ec4899',ilac:'#f43f5e',spor:'#10b981',
    dugun:'#a78bfa',seyahat:'#06b6d4',eglence:'#8b5cf6',hediye:'#f43f5e',
    giyim:'#a78bfa',guzellik:'#ec4899',egitim:'#3b82f6',business:'#10b981',
    abonelik:'#7c3aed',bagis:'#6ee7b7',impulse:'#ef4444',other:'#8b5cf6',
  }
  const getCL = (val) => { const cat=CATS.find(c=>c.v===val); return cat?((lang==='tr')?cat.tr:cat.en):val }
  const getCG = (val) => { const cat=CATS.find(c=>c.v===val); return cat?((lang==='tr')?cat.g_tr:cat.g_en):((lang==='tr')?'Diğer':'Other') }

  const [form, setForm]     = useState({description:'',amount:'',category:'other',expense_date:''})
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [catSearch, setCatSearch] = useState('')
  const [catOpen, setCatOpen]     = useState(false)

  async function addExpense() {
    if (!form.description||!form.amount) return
    await supabaseInsert('expenses',{...form,amount:parseFloat(form.amount),user_id:userId})
    setForm({description:'',amount:'',category:'other',expense_date:''}); setAdding(false); onRefresh()
  }
  async function del(id) { await supabaseDelete('expenses',id); onRefresh() }

  const filtered   = filter==='all'?expenses:expenses.filter(e=>e.category===filter)
  const total      = expenses.reduce((a,e)=>a+Number(e.amount),0)
  const leaks      = expenses.filter(e=>['impulse','food','restoran'].includes(e.category))
  const leakAmt    = leaks.reduce((a,e)=>a+Number(e.amount),0)
  const areaData   = expenses.slice(-7).map((e,i)=>({day:`G${i+1}`,amount:Number(e.amount)}))
  const usedCats   = [...new Set(expenses.map(e=>e.category))]
  const filterOpts = [['all',(lang==='tr')?'Tümü':'All'], ...usedCats.map(v=>[v,getCL(v)])]
  const filtCats   = catSearch ? CATS.filter(c=>((lang==='tr')?c.tr:c.en).toLowerCase().includes(catSearch.toLowerCase())||c.g_tr.toLowerCase().includes(catSearch.toLowerCase())) : CATS

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <PageHeader theme={theme} title={(lang==='tr')?'💸 Günlük Harcama':'💸 Daily Spending'} subtitle={(lang==='tr')?'Ani alımları ve sızıntıları takip et.':'Track impulse buys and convenience leaks.'}
        action={<AddBtn theme={theme} label={(lang==='tr')?'+ Harcama Ekle':'+ Log Expense'} onClick={()=>setAdding(!adding)} />} />
      <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard accent={theme.accent} label={(lang==='tr')?'Toplam Harcama':'Total Spent'} value={`₺${total.toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'Sızıntı Miktarı':'Leak Amount'} value={`₺${leakAmt.toFixed(2)}`} sub={(lang==='tr')?`Bütçenin %${total>0?Math.round(leakAmt/total*100):0}'ı`:`${total>0?Math.round(leakAmt/total*100):0}% of spending`} color="#fca5a5" icon="🩸" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'İşlem Sayısı':'Transactions'} value={expenses.length} color={theme.text} icon="📋" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'Ort. / İşlem':'Avg / Transaction'} value={expenses.length>0?`₺${(total/expenses.length).toFixed(2)}`:'₺0'} color={theme.text} icon="📊" />
      </div>
      {adding&&(
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label={(lang==='tr')?'Açıklama':'Description'} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Kına gecesi masrafı..." />
            <InputField label={(lang==='tr')?'Miktar (₺)':'Amount (₺)'} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" placeholder="0.00" />
            <InputField label={(lang==='tr')?'Tarih':'Date'} value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})} placeholder="12 Mayıs" />
            <div style={{position:'relative'}}>
              <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{(lang==='tr')?'Kategori':'Category'}</div>
              <input
                value={catOpen?catSearch:getCL(form.category)}
                onChange={e=>{setCatSearch(e.target.value);setCatOpen(true)}}
                onFocus={()=>{setCatSearch('');setCatOpen(true)}}
                onBlur={()=>setTimeout(()=>setCatOpen(false),200)}
                placeholder={(lang==='tr')?'Kategori ara...':'Search category...'}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}}
              />
              {catOpen&&(
                <div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:'4px',background:'#1a1a2e',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'12px',overflow:'hidden',zIndex:200,boxShadow:'0 8px 32px rgba(0,0,0,0.6)',maxHeight:'220px',overflowY:'auto'}}>
                  {filtCats.map((cat,i)=>(
                    <div key={i}
                      onMouseDown={()=>{setForm({...form,category:cat.v});setCatSearch('');setCatOpen(false)}}
                      style={{padding:'9px 14px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',justifyContent:'space-between',alignItems:'center'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span style={{color:'#f5f5f7',fontSize:'13px',fontFamily:FONT}}>{(lang==='tr')?cat.tr:cat.en}</span>
                      <span style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>{(lang==='tr')?cat.g_tr:cat.g_en}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{(lang==='tr')?'İptal':'Cancel'}</button>
            <button onClick={addExpense} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>{(lang==='tr')?'Kaydet':'Save'}</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{(lang==='tr')?'Harcama Trendi':'Spending Trend'}</div>
          {areaData.length>0?(
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={areaData}>
                <defs><linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={theme.accent} stopOpacity={0.35}/><stop offset="95%" stopColor={theme.accent} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
                <Area type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2.5} fill="url(#spendGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          ):<div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{(lang==='tr')?'Henüz veri yok':'No data yet'}</div>}
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{(lang==='tr')?'Kategoriye Göre':'By Category'}</div>
          {usedCats.map(cat=>{
            const amt=expenses.filter(e=>e.category===cat).reduce((a,e)=>a+Number(e.amount),0)
            const pct=total>0?(amt/total*100):0
            const col=CAT_COLORS_MAP[cat]||theme.accent
            return (
              <div key={cat} style={{marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'5px'}}>
                  <span style={{color:'rgba(255,255,255,0.45)',fontFamily:FONT}}>{getCL(cat)}</span>
                  <span style={{fontFamily:MONO,color:col}}>₺{amt.toFixed(2)}</span>
                </div>
                <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}>
                  <div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:col,transition:'width 0.5s'}}></div>
                </div>
              </div>
            )
          })}
          {expenses.length===0&&<div style={{color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{(lang==='tr')?'Henüz veri yok':'No data yet'}</div>}
        </Card>
      </div>
      <Card accent={theme.accent} style={{padding:'22px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px',flexWrap:'wrap',gap:'8px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{(lang==='tr')?'Harcama Kayıtları':'Expense Log'}</div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {filterOpts.map(([f,label])=>(
              <button key={f} onClick={()=>setFilter(f)} style={{fontSize:'11px',padding:'5px 12px',borderRadius:'100px',background:filter===f?theme.bg:'transparent',color:filter===f?theme.text:'rgba(255,255,255,0.28)',border:filter===f?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:FONT}}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'400px'}}>
            <thead><tr>
              <TH>{(lang==='tr')?'Açıklama':'Description'}</TH>
              <TH>{(lang==='tr')?'Miktar':'Amount'}</TH>
              <TH>{(lang==='tr')?'Kategori':'Category'}</TH>
              <TH>{(lang==='tr')?'Tarih':'Date'}</TH>
              <TH></TH>
            </tr></thead>
            <tbody>
              {filtered.length===0
                ?<tr><td colSpan={5} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{(lang==='tr')?'Henüz harcama yok':'No expenses yet'}</td></tr>
                :filtered.map(e=>(
                  <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{e.description}</td>
                    <td style={{padding:'12px 0',fontFamily:MONO,color:theme.text,fontSize:'13px'}}>-₺{Number(e.amount).toFixed(2)}</td>
                    <td style={{padding:'12px 0'}}><span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:`${CAT_COLORS_MAP[e.category]||theme.accent}22`,color:CAT_COLORS_MAP[e.category]||theme.text,fontFamily:FONT}}>{getCL(e.category)}</span></td>
                    <td style={{padding:'12px 0',color:'rgba(255,255,255,0.28)',fontSize:'12px',fontFamily:FONT}}>{e.expense_date||'—'}</td>
                    <td style={{padding:'12px 0'}}><button onClick={()=>del(e.id)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── INVESTMENTS ───────────────────────────────────────────────────
function InvestmentsPage({ theme, investments, setInvestments, lang='en' }) {
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
      <PageHeader theme={theme} title={lang==='tr'?'📈 Yatırımlar':'📈 Investments'} subtitle={lang==='tr'?'Canlı fiyatlar · Tüm değerler ₺ cinsinden':'Live prices · All values in ₺'}
        action={
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            {lastUpdated && <div style={{display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}></div><span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:MONO}}>{(lang==='tr')?'Canlı':'Live'} · {lastUpdated}</span></div>}
            <AddBtn theme={theme} label={lang==='tr'?'+ Pozisyon Ekle':'+ Add Position'} onClick={()=>setAdding(!adding)} />
          </div>
        }
      />
      <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        <StatCard accent={theme.accent} label="Portföy Değeri (₺)" value={`₺${totalValue.toFixed(2)}`} color={theme.text} icon="💼" />
        <StatCard accent={theme.accent} label="Toplam Maliyet (₺)" value={`₺${totalCost.toFixed(2)}`} color="rgba(255,255,255,0.6)" icon="💸" />
        <StatCard accent={theme.accent} label="Kar/Zarar (₺)" value={`${totalGain>=0?'+':''}₺${totalGain.toFixed(2)}`} sub={`${gainPct}%`} color={totalGain>=0?'#6ee7b7':'#fca5a5'} icon={totalGain>=0?'📈':'📉'} />
        <StatCard accent={theme.accent} label={lang==='tr'?'Pozisyon':'Positions'} value={investments.length} color={theme.text} icon="🎯" />
      </div>
      {adding && (
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div style={{marginBottom:'14px'}}>
            <div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Hisse / Kripto Ara':'Search Stock or Crypto'}</div>
            <div style={{position:'relative'}}>
              <input value={searchQuery} onChange={e=>searchStocks(e.target.value)} placeholder={lang==='tr'?'Apple, Bitcoin, ASELS.IS ara...':'Search Apple, Bitcoin, Tesla...'}
                style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:`1px solid ${theme.border}`,color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
              {(searching||fetchingPrice) && <div style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.3)',fontSize:'12px',fontFamily:FONT}}>{searching?lang==='tr'?'Aranıyor...':'Searching...':lang==='tr'?'Fiyat alınıyor...':'Fetching price...'}</div>}
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
              <div><div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Sembol':'Symbol'}</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:theme.text,fontSize:'13px',fontWeight:700,...VAL}}>{form.symbol}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Canlı Fiyat':'Live Price'}</div><div style={{padding:'10px 14px',borderRadius:'10px',background:fetchingPrice?'rgba(255,255,255,0.02)':'rgba(16,185,129,0.08)',border:`1px solid ${fetchingPrice?'rgba(255,255,255,0.09)':'rgba(16,185,129,0.2)'}`,color:'#6ee7b7',fontSize:'13px',fontWeight:700,...VAL}}>{fetchingPrice?lang==='tr'?'Yükleniyor...':'Loading...':form.currentPrice?`₺${form.currentPrice}`:'—'}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Tür':'Type'}</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontFamily:FONT}}>{form.type}</div></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Adet / Lot':'Shares / Amount'}</div><input type="number" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})} placeholder="2" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
              <div><div style={{...TIP,marginBottom:'6px'}}>{(lang==='tr')?'Alış Fiyatı (₺)':'Buy Price (₺)'}</div><input type="number" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} placeholder="150.00" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>{setAdding(false);setSearchQuery('');setSearchResults([]);setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})}} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'İptal':'Cancel'}</button>
            <button onClick={addInv} disabled={!form.symbol||!form.shares||!form.buyPrice} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',opacity:!form.symbol||!form.shares||!form.buyPrice?0.4:1,fontFamily:FONT}}>{lang==='tr'?'Pozisyon Ekle':'Add Position'}</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'14px',marginBottom:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Portföy Dağılımı</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={4} dataKey="value">{pieData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0} />)}</Pie><Tooltip formatter={(v,name)=>[`₺${v.toFixed(2)}`,name]} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/></PieChart>
          </ResponsiveContainer>
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Maliyet vs Güncel Değer (₺)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,name)=>[`₺${v.toFixed(2)}`,name]} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
              <Bar dataKey="cost" fill={`${theme.accent}55`} radius={[6,6,0,0]} name={lang==='tr'?'Maliyet':'Cost'}/>
              <Bar dataKey="value" fill={theme.chart[1]} radius={[6,6,0,0]} name={lang==='tr'?'Değer':'Value'}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card accent={theme.accent} style={{padding:'22px'}}>
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>Tüm Pozisyonlar</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{['Sembol','İsim','Adet','Alış Fiyatı','Canlı Fiyat','24s','Değer (₺)','Kar/Zarar',''].map(h=><th key={h} style={{...TIP,textAlign:'left',paddingBottom:'10px',fontWeight:500}}>{h}</th>)}</tr></thead>
            <tbody>
              {investments.length===0 ? <tr><td colSpan={9} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>Henüz pozisyon yok. Hisse veya kripto arayın.</td></tr>
              : investments.map((inv,i)=>{
                const livePrice=prices[inv.symbol]||inv.currentPrice, change=changes[inv.symbol]||0
                const val=inv.shares*livePrice, cost=inv.shares*inv.buyPrice, gain=val-cost
                const gp=cost>0?((gain/cost)*100).toFixed(1):0, isLive=!!prices[inv.symbol], changePos=change>=0
                return (
                  <tr key={inv.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'12px 8px 12px 0',...VAL,color:theme.text,fontWeight:700,fontSize:'14px'}}>{inv.symbol}</td>
                    <td style={{padding:'12px 8px',color:'rgba(255,255,255,0.6)',fontSize:'12px',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:FONT}}>{inv.name}</td>
                    <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{inv.shares}</td>
                    <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>₺{inv.buyPrice.toFixed(2)}</td>
                    <td style={{padding:'12px 8px'}}>
                      <div style={{...VAL,color:'#f5f5f7',fontSize:'14px',fontWeight:700}}>{loadingPrices&&!isLive?'...':`₺${livePrice.toFixed(2)}`}</div>
                      {isLive&&<div style={{display:'flex',alignItems:'center',gap:'3px',marginTop:'2px'}}><div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10b981'}}></div><span style={{fontSize:'9px',color:'#10b981',fontFamily:MONO}}>{lang==='tr'?'CANLI':'LIVE'}</span></div>}
                    </td>
                    <td style={{padding:'12px 8px'}}>
                      {isLive?<div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',background:changePos?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'}}><span style={{fontSize:'12px',color:changePos?'#6ee7b7':'#fca5a5',fontWeight:700,...VAL}}>{changePos?'▲':'▼'} {Math.abs(change)}%</span></div>:<span style={{color:'rgba(255,255,255,0.15)',fontSize:'12px'}}>—</span>}
                    </td>
                    <td style={{padding:'12px 8px',...VAL,color:theme.text,fontSize:'13px',fontWeight:700}}>₺{val.toFixed(2)}</td>
                    <td style={{padding:'12px 8px'}}>
                      <div style={{...VAL,color:gain>=0?'#6ee7b7':'#fca5a5',fontSize:'13px',fontWeight:700}}>{gain>=0?'+':''}₺{gain.toFixed(2)}</div>
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
function BalancePage({ theme, income, totalIncome, totalExp, totalSubs, netBal, userId, onRefresh, lang='en' }) {
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
      <PageHeader theme={theme} title={lang==='tr'?'💰 Bakiye & Tasarruf':'💰 Balance & Savings'} subtitle={lang==='tr'?'Gelir ve tasarruf oranını takip et.':'Track income and your savings rate.'}
        action={<AddBtn theme={theme} label={lang==='tr'?'+ Gelir Ekle':'+ Log Income'} onClick={()=>setAdding(!adding)} />} />
      <Card accent={theme.accent} style={{padding:'28px',marginBottom:'20px'}}>
        <div style={{...TIP,marginBottom:'8px'}}>{lang==='tr'?'Net Bakiye':'Net Balance'}</div>
        <div style={{color:netBal>=0?'#6ee7b7':'#fca5a5',fontSize:'52px',fontWeight:700,letterSpacing:'-2px',lineHeight:1,marginBottom:'8px',...VAL}}>
          ₺{Math.abs(netBal).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginBottom:'24px',fontFamily:FONT}}>{lang==='tr'?(netBal>=0?'↑ Bu ay net pozitifsiniz':'↓ Harcamalar geliri aşıyor'):(netBal>=0?lang==='tr'?'↑ Bu ay net pozitifsiniz':'↑ You are net positive this month':lang==='tr'?'↓ Harcamalar geliri aşıyor':'↓ Spending exceeds income')}</div>
        <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          {[[lang==='tr'?'Toplam Gelir':'Total Income',`₺${totalIncome.toFixed(2)}`,'#6ee7b7'],[lang==='tr'?'Toplam Gider':'Total Expenses',`₺${(totalExp+totalSubs).toFixed(2)}`,'#fca5a5'],[lang==='tr'?'Tasarruf Oranı':'Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5']].map(([l,v,c])=>(
            <div key={l}><div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',marginBottom:'4px',fontFamily:FONT}}>{l}</div><div style={{color:c,fontSize:'20px',fontWeight:700,...VAL}}>{v}</div></div>
          ))}
        </div>
      </Card>
      {adding && (
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
            <InputField label={lang==='tr'?'Kaynak':'Source'} value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="Freelance, Product sale..." />
            <InputField label={lang==='tr'?'Miktar (₺)':'Amount (₺)'} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" placeholder="0.00" />
            <InputField label={lang==='tr'?'Tarih':'Date'} value={form.income_date} onChange={e=>setForm({...form,income_date:e.target.value})} placeholder="May 5" />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'İptal':'Cancel'}</button>
            <button onClick={addIncome} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'Kaydet':'Save'}</button>
          </div>
        </Card>
      )}
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Gelir Kaynakları':'Income Sources'}</div>
          {incomeData.length>0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
                <Bar dataKey="amount" radius={[6,6,0,0]}>{incomeData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz gelir girilmedi':'No income logged yet'}</div>}
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'20px',fontFamily:FONT}}>{lang==='tr'?'Tasarruf Hedefi':'Savings Goal'}</div>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
            <div style={{position:'relative',width:'120px',height:'120px'}}>
              <svg width="120" height="120" style={{transform:'rotate(-90deg)'}}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} strokeWidth="10" strokeLinecap="round" strokeDasharray="314.16" strokeDashoffset={314.16-(314.16*Math.min(sr,100)/100)}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5',fontSize:'22px',fontWeight:700}}>{sr}%</div>
                <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:FONT}}>{lang==='tr'?'kaydedildi':'saved'}</div>
              </div>
            </div>
          </div>
          <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',textAlign:'center',fontFamily:FONT}}>{sr>=30?lang==='tr'?'🎉 %30 hedefin üzerinde':'🎉 Above 30% target':sr>=15?lang==='tr'?'📈 Hedef %30':'📈 Target is 30%':lang==='tr'?'⚠️ Hedefin altında':'⚠️ Below target'}</div>
        </Card>
      </div>
      <Card accent={theme.accent} style={{padding:'22px'}}>
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Gelir Kayıtları':'Income Log'}</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr><TH>{lang==='tr'?'Kaynak':'Source'}</TH><TH>{lang==='tr'?'Miktar':'Amount'}</TH><TH>{lang==='tr'?'Tarih':'Date'}</TH><TH></TH></tr></thead>
          <tbody>
            {income.length===0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}>{lang==='tr'?'Henüz gelir girilmedi':'No income logged yet'}</td></tr>
            : income.map(i=>(
              <tr key={i.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{i.source}</td>
                <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>+₺{Number(i.amount).toFixed(2)}</td>
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
function GoalsPage({ theme, expenses, totalExp, totalSubs, totalIncome, lang='en' }) {
  const now = new Date()
  const today = now.getDate()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})
  const [completedDays, setCompletedDays] = useState(() => { try { return JSON.parse(localStorage.getItem('burnrate_completed_days')||'[]') } catch { return [] } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [aiTasks, setAiTasks] = useState({})
  const [completedTasks, setCompletedTasks] = useState(() => { try { return JSON.parse(localStorage.getItem('burnrate_completed_tasks')||'{}') } catch { return {} } })

  async function loadTasksForDay(day) {
    setSelectedDay(day)
    if (aiTasks[day]) return
    setLoadingTasks(true)
    setAiTasks(prev => ({...prev, [day]: (lang==='tr') ? [
      ["Bugün harcadığın her kuruşu not et","Anlık bir alım yapmaktan kaçın","Gece tüm harcamalarını kaydet"],
      ["Dünün harcamalarını gözden geçir","Gereksiz bir alımı atla","Bugün 50₺ biriktir"],
      ["Kullanılmayan bir aboneliği iptal et","Bugün evde ye","Her işlemi kaydet"],
      ["Yatırım portföyünü kontrol et","Paket servis uygulamalarını kullanma","Haftalık bütçe belirle"],
      ["Abonelik listeni gözden geçir","Öğle yemeği hazırla","Gelir kaynaklarını kaydet"],
      ["Aylık harcama oranını hesapla","Bugün kafede kahve içme","Tasarruf oranını kontrol et"],
      ["Finansal hedeflerini gözden geçir","Haftalık yemek hazırlığı yap","Bozuk parayı biriktir"],
      ["Abonelik yenilemelerini kontrol et","Yürüyerek git","Banka ücretlerini gözden geçir"],
      ["Yarın için harcama limiti belirle","Sosyal medyadan alışveriş yapma","Tüm fişleri kaydet"],
      ["Kredi kartı ekstresini incele","Akşam yemeğini evde pişir","Acil fonu kontrol et"],
    ][(day-1) % 10] : DAILY_TASKS[(day-1) % DAILY_TASKS.length]}))
    try {
      const prompt = (lang==='tr') ? `30 günlük para meydan okuması için ${day}. gün - tam olarak 3 kısa uygulanabilir Türkçe finansal görev üret. SADECE JSON dizisi döndür: ["görev1","görev2","görev3"]`
        : `Generate exactly 3 short, actionable financial tasks for Day ${day} of a 30-day money challenge. Return ONLY a JSON array of 3 strings.`
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: prompt, context: `spending: ₺${totalExp}, subs: ₺${totalSubs}, income: ₺${totalIncome}` }) })
      const data = await res.json()
      const match = (data.reply||'').match(/\[.*\]/s)
      if (match) { const tasks = JSON.parse(match[0]); if (Array.isArray(tasks)&&tasks.length>0) setAiTasks(prev=>({...prev,[day]:tasks})) }
    } catch {}
    setLoadingTasks(false)
  }

  function toggleTask(day, idx) {
    const key = `${day}-${idx}`
    const updated = {...completedTasks,[key]:!completedTasks[key]}
    setCompletedTasks(updated); localStorage.setItem('burnrate_completed_tasks',JSON.stringify(updated))
  }

  function completeDay(day) {
    if (!completedDays.includes(day)) { const u=[...completedDays,day]; setCompletedDays(u); localStorage.setItem('burnrate_completed_days',JSON.stringify(u)) }
    setSelectedDay(null)
  }

  const dayTasks = selectedDay ? (aiTasks[selectedDay]||DAILY_TASKS[(selectedDay-1)%DAILY_TASKS.length]) : []
  const completedCount = completedDays.length
  const streakPct = Math.round(completedCount/Math.max(today,1)*100)

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'4px',fontFamily:FONT}}>{lang==='tr'?'🎯 30 Günlük Finansal Meydan Okuma':'🎯 30-Day Financial Challenge'}</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} — {lang==='tr'?'bir gün seçin, AI görevlerinizi görün':'tap a day to see your AI tasks'}</p>
      </div>
      <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        <StatCard accent={theme.accent} label={lang==='tr'?'Tamamlanan Gün':'Days Completed'} value={completedCount} sub={lang==='tr'?`${today} günden beri`:`of ${today} days so far`} color={theme.text} icon="✅" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Tamamlama Oranı':'Completion Rate'} value={`${streakPct}%`} sub={streakPct>=80?lang==='tr'?'Muhteşem!':'Outstanding!':streakPct>=50?lang==='tr'?'Devam et!':'Keep going!':lang==='tr'?'Yapabilirsin!':'You can do it!'} color={streakPct>=80?'#6ee7b7':streakPct>=50?'#fde68a':'#fca5a5'} icon="🔥" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Kalan Gün':'Days Remaining'} value={30-today} sub={lang==='tr'?'ay sonuna kadar':'until end of month'} color="rgba(255,255,255,0.5)" icon="📅" />
      </div>
      <Card accent={theme.accent} style={{padding:'24px',marginBottom:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{lang==='tr'?'Meydan okumaya başlamak için bir gün seçin':'Select a day to begin your challenge'}</div>
          <div style={{background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:'100px',padding:'5px 14px',fontSize:'12px',color:theme.text,fontWeight:600,fontFamily:FONT}}>{lang==='tr'?`${completedCount}/30 tamamlandı`:`${completedCount}/30 complete`}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'8px'}}>
          {Array.from({length:30},(_,i)=>i+1).map(day => {
            const isCompleted=completedDays.includes(day), isToday=day===today, isPast=day<=today, isSelected=selectedDay===day
            return (
              <button key={day} onClick={()=>isPast&&loadTasksForDay(day)}
                style={{aspectRatio:'1',borderRadius:'12px',fontSize:'14px',fontWeight:700,background:isCompleted?`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`:isSelected?theme.bg:isToday?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.03)',border:isSelected?`2px solid ${theme.accent}`:isCompleted?'none':isToday?`1px solid rgba(255,255,255,0.2)`:'1px solid rgba(255,255,255,0.06)',color:isCompleted?'#fff':isPast?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)',cursor:isPast?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',fontFamily:FONT,boxShadow:isCompleted?`0 4px 12px ${theme.accent}44`:'none',transform:isSelected?'scale(1.08)':'scale(1)'}}>
                {isCompleted?'✓':day}
              </button>
            )
          })}
        </div>
      </Card>
      {selectedDay && (
        <Card accent={theme.accent} style={{padding:'24px',animation:'fadeIn 0.25s ease'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div>
              <div style={{color:theme.text,fontSize:'18px',fontWeight:700,fontFamily:FONT}}>{lang==='tr'?`${selectedDay}. Gün Görevleri`:`Day ${selectedDay} Tasks`}</div>
              <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',marginTop:'2px',fontFamily:FONT}}>{lang==='tr'?'Yapay zeka tarafından · 3 görevi tamamla':'AI-generated · Complete all 3 tasks'}</div>
            </div>
            <button onClick={()=>setSelectedDay(null)} style={{fontSize:'20px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer',lineHeight:1}}>×</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'24px'}}>
            {loadingTasks ? (
              <div style={{display:'flex',gap:'10px',alignItems:'center',padding:'20px',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:FONT}}>
                <div style={{width:'16px',height:'16px',borderRadius:'50%',border:`2px solid ${theme.accent}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite',flexShrink:0}}></div>
                {lang==='tr'?'Yapay zeka görevlerinizi oluşturuyor...':'AI is generating your personalized tasks...'}
              </div>
            ) : dayTasks.map((task,idx) => {
              const done = completedTasks[`${selectedDay}-${idx}`]
              return (
                <div key={idx} onClick={()=>toggleTask(selectedDay,idx)}
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px',borderRadius:'12px',background:done?theme.bg:'rgba(255,255,255,0.03)',border:done?`1px solid ${theme.border}`:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{width:'24px',height:'24px',borderRadius:'8px',flexShrink:0,background:done?theme.accent:'transparent',border:done?'none':`1.5px solid rgba(255,255,255,0.2)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',color:'#fff',fontWeight:700}}>{done?'✓':''}</div>
                  <span style={{fontSize:'14px',color:done?theme.text:'rgba(255,255,255,0.8)',fontWeight:done?600:400,fontFamily:FONT,flex:1,lineHeight:'1.4'}}>{task}</span>
                  {done && <span style={{fontSize:'11px',color:theme.text,fontFamily:MONO,opacity:0.7}}>{lang==='tr'?'tamam':'done'}</span>}
                </div>
              )
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'16px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',fontFamily:FONT}}>{lang==='tr'?`${dayTasks.filter((_,idx)=>completedTasks[`${selectedDay}-${idx}`]).length}/${dayTasks.length} görev tamamlandı`:`${dayTasks.filter((_,idx)=>completedTasks[`${selectedDay}-${idx}`]).length} of ${dayTasks.length} tasks completed`}</div>
            <button onClick={()=>completeDay(selectedDay)}
              style={{padding:'12px 28px',borderRadius:'12px',fontSize:'14px',fontWeight:700,background:completedDays.includes(selectedDay)?'rgba(16,185,129,0.15)':`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:completedDays.includes(selectedDay)?'#6ee7b7':'#fff',border:completedDays.includes(selectedDay)?'1px solid rgba(16,185,129,0.3)':'none',cursor:'pointer',fontFamily:FONT}}>
              {completedDays.includes(selectedDay)?lang==='tr'?'✓ Gün Tamamlandı!':'✓ Day Completed!':lang==='tr'?'🎯 Günü Tamamla →':'🎯 Complete Day →'}
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── MONTHLY SUMMARY ───────────────────────────────────────────────
function MonthlySummaryPage({ theme, totalIncome, totalExp, totalSubs, netBal, subs, expenses, income, lang='en' }) {
  const now = new Date()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})
  const sr = totalIncome>0?Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100):0
  const totalSpend = totalExp+totalSubs
  const topExpense = expenses.length>0?expenses.reduce((a,e)=>Number(e.amount)>Number(a.amount)?e:a,expenses[0]):{description:'—',amount:0}
  const deadSubs = subs.filter(s=>s.status==='dead')
  const wastedOnDead = deadSubs.reduce((a,s)=>a+Number(s.cost),0)
  const score = sr>=30?'A':sr>=20?'B':sr>=10?'C':'D'
  const scoreColor = sr>=30?'#6ee7b7':sr>=20?'#fde68a':sr>=10?'#f97316':'#fca5a5'
  const chartData = [{name:(lang==='tr')?'Gelir':'Income',value:totalIncome,fill:'#6ee7b7'},{name:(lang==='tr')?'Gider':'Expenses',value:totalExp,fill:'#f97316'},{name:'Subs',value:totalSubs,fill:'#ef4444'},{name:(lang==='tr')?'Tasarruf':'Saved',value:Math.max(0,netBal),fill:'#7c3aed'}]

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'4px',fontFamily:FONT}}>📋 Monthly Summary</h1>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} — {lang==='tr'?'tam finansal raporunuz':'your complete financial report'}</p>
      </div>
      <Card accent={theme.accent} style={{padding:'28px',marginBottom:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'24px'}}>
          <div>
            <div style={{...TIP,marginBottom:'10px'}}>{lang==='tr'?'Aylık Finansal Puan':'Monthly Financial Grade'}</div>
            <div style={{fontSize:'80px',fontWeight:700,letterSpacing:'-4px',lineHeight:1,color:scoreColor,...VAL}}>{score}</div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginTop:'8px',fontFamily:FONT}}>{lang==='tr'?(sr>=30?'🎉 Mükemmel!':sr>=20?'💪 İyi gidiyorsun!':sr>=10?'📈 Gelişme gerekli':'⚠️ Harcamalar azaltılmalı'):(sr>=30?'🎉 Outstanding!':sr>=20?'💪 Good progress!':sr>=10?'📈 Room for improvement':'⚠️ Time to cut spending')}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
            {[[lang==='tr'?'Net Bakiye':'Net Balance',`₺${Math.abs(netBal).toFixed(0)}`,netBal>=0?'#6ee7b7':'#fca5a5'],[lang==='tr'?'Tasarruf Oranı':'Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'],[lang==='tr'?'Toplam Gelir':'Total Income',`₺${totalIncome.toFixed(0)}`,'#6ee7b7'],[lang==='tr'?'Toplam Harcama':'Total Spend',`₺${totalSpend.toFixed(0)}`,'#fca5a5']].map(([l,v,c])=>(
              <div key={l}><div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'4px'}}>{l}</div><div style={{color:c,fontSize:'22px',fontWeight:700,...VAL}}>{v}</div></div>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'Para Akışı':'Money Flow'}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,name)=>[`₺${v.toFixed(2)}`,name]} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
              <Bar dataKey="value" radius={[8,8,0,0]}>{chartData.map((d,i)=><Cell key={i} fill={d.fill} strokeWidth={0}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'16px',fontFamily:FONT}}>{lang==='tr'?'Önemli Bulgular':'Key Insights'}</div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            {[
              {icon:'💸',label:lang==='tr'?'En büyük harcama':'Biggest expense',value:`${topExpense.description} ($${Number(topExpense.amount).toFixed(0)})`,color:'#fca5a5'},
              {icon:'💀',label:lang==='tr'?'Ölü aboneliklere harcanan':'Wasted on dead subs',value:wastedOnDead>0?`₺${wastedOnDead.toFixed(0)}/mo — cancel them!`:'No dead subscriptions 🎉',color:wastedOnDead>0?'#fca5a5':'#6ee7b7'},
              {icon:'📈',label:lang==='tr'?'Tasarruf performansı':'Savings performance',value:`${sr}% — ${sr>=30?'excellent':sr>=15?'good':'needs work'}`,color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'},
              {icon:'🎯',label:lang==='tr'?'Sonraki ay hedefi':'Next month target',value:`Save ₺${Math.max(Math.round(totalIncome*0.3),50)} (30% of income)`,color:theme.text},
            ].map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <span style={{fontSize:'18px',flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:'rgba(255,255,255,0.3)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'0.8px'}}>{item.label}</div>
                  <div style={{color:item.color,fontSize:'13px',fontWeight:500,marginTop:'1px',fontFamily:FONT,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── AI ADVISOR ────────────────────────────────────────────────────
function AIPage({ theme, user, subs, expenses, income, investments, lang='en' }) {
  const [messages, setMessages] = useState([
    { role:'ai', text: lang==='tr' ? "Merhaba! Ben BurnRate Yapay Zeka Danışmanınızım. Gerçek finansal verilerinizi görüyorum — abonelikler, harcamalar, gelir ve yatırımlar. Her şeyi sorun, size keskin ve uygulanabilir tavsiyeler vereceğim." : "Hey! I'm your BurnRate AI Advisor. I can see your real financial data — subscriptions, spending, income, and investments. Ask me anything and I'll give you sharp, actionable advice." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = lang==='tr'?["Hangi abonelikleri iptal etmeliyim?","Tasarruf oranımı nasıl artırabilirim?","Yatırım tavsiyesi ver","Para sızıntım nerede?"]:["Which subscriptions should I cancel?","How can I improve my savings rate?","Give me investment advice","Where am I leaking money?"]

  async function send(msg) {
    const userMsg = msg||input.trim()
    if (!userMsg||loading) return
    setInput('')
    setMessages(prev=>[...prev,{role:'user',text:userMsg}])
    setLoading(true)
    const context = `Subscriptions: ${subs.map(s=>`${s.name} $${s.cost}/mo status:${s.status}`).join(', ')||'none'}. Expenses: ${expenses.map(e=>`${e.description} $${e.amount}`).join(', ')||'none'}. Income: ${income.map(i=>`${i.source} $${i.amount}`).join(', ')||'none'}. Investments: ${investments.map(inv=>`${inv.symbol} ${inv.shares}x buy:$${inv.buyPrice}`).join(', ')||'none'}.`
    try {
      const res = await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,context,lang})})
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
            <h1 style={{color:theme.text,fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',margin:0,fontFamily:FONT}}>{lang==='tr'?'Yapay Zeka Danışmanı':(lang==='tr')?'Yapay Zeka Danışmanı':'AI Financial Advisor'}</h1>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:MONO}}>{lang==='tr'?'claude destekli · gerçek verilerinizi görür':'powered by claude · sees your real data'}</div>
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>send(s)} style={{fontSize:'12px',padding:'6px 14px',borderRadius:'100px',background:theme.bg,color:theme.text,border:`1px solid ${theme.border}`,cursor:'pointer',fontFamily:FONT,fontWeight:500}}>{s}</button>
        ))}
      </div>
      <Card accent={theme.accent} style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
        <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'14px',minHeight:0}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:'10px',flexDirection:m.role==='user'?'row-reverse':'row'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,background:m.role==='user'?`linear-gradient(135deg,${theme.accent},${theme.accent}88)`:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>{m.role==='user'?'👤':'🤖'}</div>
              <div style={{maxWidth:'520px',padding:'11px 15px',borderRadius:'14px',fontSize:'13px',lineHeight:'1.65',color:'#f5f5f7',background:m.role==='user'?theme.bg:'rgba(255,255,255,0.03)',border:m.role==='user'?`1px solid ${theme.border}`:'1px solid rgba(255,255,255,0.06)',fontFamily:FONT}}>{m.text}</div>
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
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={lang==='tr'?'Finanslarınız hakkında her şeyi sorun...':'Ask anything about your finances...'}
            style={{flex:1,padding:'11px 15px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT}} />
          <button onClick={()=>send()} disabled={loading||!input.trim()}
            style={{width:'42px',height:'42px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontSize:'16px',opacity:loading||!input.trim()?0.4:1,flexShrink:0}}>↑</button>
        </div>
      </Card>
    </div>
  )
}