'use client'
import React, { useState, useEffect } from 'react'
import { supabaseQuery, supabaseInsert, supabaseDelete } from '../lib/supabase'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ── THEME SYSTEM ──────────────────────────────────────────────────
const THEMES_CONFIG = {
  default: {
    id: 'default',
    name: 'Koyu Mor',
    emoji: '⚡',
    plan: 'starter',
    bg: '#0a0a0f',
    bgGradient: "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(109,40,217,0.28) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(76,29,149,0.22) 0%, transparent 50%), linear-gradient(160deg, #06041a 0%, #03020a 40%, #05031a 70%, #03020a 100%)",
    accent: '#7c3aed',
    accentLight: '#a78bfa',
    accentBg: 'rgba(124,58,237,0.12)',
    accentBorder: 'rgba(124,58,237,0.3)',
    accentText: '#c4b5fd',
    sbBg: 'rgba(255,255,255,0.015)',
    sbBorder: 'rgba(255,255,255,0.06)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.07)',
    btnBg: 'rgba(255,255,255,0.05)',
    btnBorder: 'rgba(255,255,255,0.1)',
    btnText: 'rgba(255,255,255,0.7)',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    emoji: '🟢',
    plan: 'pro',
    bg: '#000000',
    bgGradient: '#000000',
    accent: '#00ff88',
    accentLight: '#00ffaa',
    accentBg: 'rgba(0,255,136,0.08)',
    accentBorder: 'rgba(0,255,136,0.25)',
    accentText: '#00ff88',
    sbBg: 'rgba(255,255,255,0.015)',
    sbBorder: 'rgba(255,255,255,0.05)',
    cardBg: 'rgba(255,255,255,0.02)',
    cardBorder: 'rgba(255,255,255,0.05)',
    btnBg: 'rgba(0,255,136,0.08)',
    btnBorder: 'rgba(0,255,136,0.25)',
    btnText: '#00ff88',
  },
  gold: {
    id: 'gold',
    name: 'Altın',
    emoji: '✨',
    plan: 'pro',
    bg: '#020b18',
    bgGradient: 'linear-gradient(160deg, #020b18 0%, #050d1f 60%, #020b18 100%)',
    accent: '#f59e0b',
    accentLight: '#fde68a',
    accentBg: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.28)',
    accentText: '#fde68a',
    sbBg: 'rgba(255,255,255,0.02)',
    sbBorder: 'rgba(245,158,11,0.1)',
    cardBg: 'rgba(245,158,11,0.04)',
    cardBorder: 'rgba(245,158,11,0.1)',
    btnBg: 'rgba(245,158,11,0.12)',
    btnBorder: 'rgba(245,158,11,0.28)',
    btnText: '#fde68a',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    emoji: '🌸',
    plan: 'pro',
    bg: '#080608',
    bgGradient: 'linear-gradient(160deg, #080608 0%, #0d080f 60%, #080608 100%)',
    accent: '#ec4899',
    accentLight: '#f9a8d4',
    accentBg: 'rgba(236,72,153,0.12)',
    accentBorder: 'rgba(236,72,153,0.28)',
    accentText: '#f9a8d4',
    sbBg: 'rgba(255,255,255,0.02)',
    sbBorder: 'rgba(236,72,153,0.1)',
    cardBg: 'rgba(236,72,153,0.03)',
    cardBorder: 'rgba(236,72,153,0.08)',
    btnBg: 'rgba(236,72,153,0.12)',
    btnBorder: 'rgba(236,72,153,0.28)',
    btnText: '#f9a8d4',
  },
  elite: {
    id: 'elite',
    name: 'BurnElite+',
    emoji: '👑',
    plan: 'elite',
    bg: '#060610',
    bgGradient: `
      radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.12) 0%, transparent 50%),
      linear-gradient(135deg, #060610 0%, #080818 40%, #060614 100%)
    `,
    accent: '#a78bfa',
    accentLight: '#c4b5fd',
    accentBg: 'rgba(255,255,255,0.06)',
    accentBorder: 'rgba(255,255,255,0.12)',
    accentText: 'rgba(255,255,255,0.88)',
    sbBg: 'rgba(255,255,255,0.04)',
    sbBorder: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    btnBg: 'rgba(255,255,255,0.08)',
    btnBorder: 'rgba(255,255,255,0.15)',
    btnText: 'rgba(255,255,255,0.85)',
    isElite: true,
  },
}

const THEME_ACCESS = {
  starter: ['default'],
  pro: ['default', 'neon', 'gold', 'rose'],
  elite: ['default', 'neon', 'gold', 'rose', 'elite'],
}

function getAvailableThemes(plan) {
  return THEME_ACCESS[plan] || THEME_ACCESS.starter
}

function canUseTheme(plan, themeId) {
  return getAvailableThemes(plan).includes(themeId)
}

function getTheme(themeId) {
  return THEMES_CONFIG[themeId] || THEMES_CONFIG.default
}
const FONT = "'Plus Jakarta Sans', -apple-system, sans-serif"
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
  return localStorage.getItem(LANG_STORAGE_KEY) || 'tr'
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
  starter: ['dashboard', 'spending', 'balance', 'settings'],
  pro:     ['dashboard', 'spending', 'balance', 'subscriptions', 'goals', 'ai', 'debt', 'settings'],
  elite:   ['dashboard', 'spending', 'balance', 'subscriptions', 'goals', 'ai', 'investments', 'summary', 'debt', 'settings'],
}

const PLAN_META = {
  starter: { name: 'Starter', color: '#06b6d4', emoji: '🚀', price: '$9/mo' },
  pro:     { name: 'Pro',     color: '#7c3aed', emoji: '💜', price: '$19/mo' },
  elite:   { name: 'Elite',   color: '#f59e0b', emoji: '⚡', price: '$39/mo' },
}

const WHOP_UPGRADE_LINKS = {
  starter: '/checkout?plan=pro',
  pro:     '/checkout?plan=elite',
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
  summary:       { accent:'#14b8a6', bg:'rgba(20,184,166,0.1)',  border:'rgba(20,184,166,0.3)',  text:'#5eead4',  chart:['#14b8a6','#6ee7b7','#f97316','#ef4444','#7c3aed'] },
  debt:          { accent:'#f43f5e', bg:'rgba(244,63,94,0.1)',   border:'rgba(244,63,94,0.3)',   text:'#fda4af',  chart:['#f43f5e','#f97316','#fbbf24','#10b981','#06b6d4'] },
}

const TIP = {fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)'}
const VAL = {fontFamily:MONO}
const tooltipStyle = {background:'#0a0414',border:'1px solid rgba(124,58,237,0.2)',borderRadius:'14px',color:'#f5f5f7',fontSize:'12px',fontFamily:FONT,boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}
const tooltipItemStyle = {color:'#f5f5f7'}
const tooltipLabelStyle = {color:'rgba(255,255,255,0.5)',marginBottom:'4px'}
const CAT_COLORS_MAP = {
  kira:'#06b6d4',mobilya:'#8b5cf6',tadilat:'#64748b',temizlik:'#67e8f9',
  market:'#10b981',restoran:'#f59e0b',food:'#f97316',
  akaryakit:'#eab308',transport:'#f59e0b',taksi:'#fbbf24',
  hastane:'#ec4899',ilac:'#f43f5e',spor:'#10b981',
  dugun:'#a78bfa',seyahat:'#06b6d4',eglence:'#8b5cf6',hediye:'#f43f5e',
  giyim:'#a78bfa',guzellik:'#ec4899',egitim:'#3b82f6',business:'#10b981',
  abonelik:'#7c3aed',bagis:'#6ee7b7',impulse:'#ef4444',other:'#8b5cf6',
}

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
  const upgradeLink = WHOP_UPGRADE_LINKS[userPlan] || '/checkout?plan=pro'

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
  const upgradeLink = WHOP_UPGRADE_LINKS[userPlan] || '/checkout?plan=pro'

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
        <div style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',fontFamily:FONT}}>{(lang==='tr')?'İstediğin zaman iptal · Anında aktivasyon':'Cancel anytime · Instant activation'}</div>
      </div>
    </div>
  )
}


export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(() => {
    try { return localStorage.getItem('burnrate_page') || 'dashboard' } catch { return 'dashboard' }
  })
  const [subs, setSubs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [investments, setInvestments] = useState([])
  const [upgradeModal, setUpgradeModal] = useState(null)
  const [manageModal, setManageModal] = useState(false)
  const [monthlySummaryModal, setMonthlySummaryModal] = useState(false)
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState(null)
  const [monthlyGoalModal, setMonthlyGoalModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [lang, setLang] = useState('tr')
  const [currency, setCurrency] = useState('TRY')
  const [currencyRate, setCurrencyRate] = useState(1)
  const [currencySymbol, setCurrencySymbol] = useState('₺')

  useEffect(() => {
    setLang(getLang())
    const savedCurrency = localStorage.getItem('burnrate_currency') || 'TRY'
    setCurrency(savedCurrency)
    if (savedCurrency !== 'TRY') {
      fetchCurrencyRate(savedCurrency)
    }
    
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
      if (!parsed || !parsed.id) { localStorage.removeItem('burnrate_user'); window.location.href = '/login'; return }
      if (!parsed.onboarded) { window.location.href = '/onboarding'; return }
      if (parsed.is_trial && parsed.trial_expires_at) {
        const expires = new Date(parsed.trial_expires_at)
        const now = new Date()
        if (expires < now) {
          window.location.href = '/checkout?plan=pro&trial_expired=true'
          return
        }
      }
      setUser(parsed)
      loadData(parsed.id)
    } catch(e) { localStorage.removeItem('burnrate_user'); window.location.href = '/login' }
  }, [])

  async function loadData(userId) {
    const [s, e, i, inv] = await Promise.all([
      supabaseQuery('subscriptions', { user_id: userId }),
      supabaseQuery('expenses', { user_id: userId }),
      supabaseQuery('income', { user_id: userId }),
      supabaseQuery('investments', { user_id: userId }),
    ])
    setSubs(Array.isArray(s) ? s : [])
    setExpenses(Array.isArray(e) ? e : [])
    setIncome(Array.isArray(i) ? i : [])
    setInvestments(Array.isArray(inv) ? inv.map(i=>({...i,shares:Number(i.shares),buyPrice:Number(i.buy_price),currentPrice:Number(i.current_price)||0,symbol:i.symbol,name:i.name,type:i.type})) : [])
  }

  async function fetchCurrencyRate(cur) {
    try {
      const symbol = cur === 'USD' ? 'USDTRY=X' : 'EURTRY=X'
      const res = await fetch(`/api/stocks?symbol=${symbol}`)
      const data = await res.json()
      if (data.price) {
        const rate = parseFloat(data.price)
        setCurrencyRate(rate)
        setCurrencySymbol(cur === 'USD' ? '$' : '€')
      }
    } catch(e) {}
  }

  useEffect(() => {
    const handler = (e) => {
      const cur = e.detail.currency
      setCurrency(cur)
      if (cur === 'TRY') {
        setCurrencyRate(1)
        setCurrencySymbol('₺')
      } else {
        fetchCurrencyRate(cur)
      }
    }
    window.addEventListener('currencyChange', handler)
    return () => {
      window.removeEventListener('currencyChange', handler)
    }
  }, [])

  function navigateTo(moduleId) {
    if (!canAccess(user?.plan, moduleId)) { setUpgradeModal(moduleId); return }
    setPage(moduleId)
    try { localStorage.setItem('burnrate_page', moduleId) } catch {}
  }

  const navItems = [
    { id:'dashboard',     icon:'⚡', label: (lang==='tr') ? 'Genel Bakış'   : 'Overview' },
    { id:'subscriptions', icon:'⚔️', label: (lang==='tr') ? 'Abonelikler'   : 'Subscriptions' },
    { id:'spending',      icon:'🧾', label: (lang==='tr') ? 'Harcamalar'    : 'Spending' },
    { id:'investments',   icon:'📈', label: (lang==='tr') ? 'Yatırımlar'    : 'Investments' },
    { id:'balance',       icon:'💰', label: (lang==='tr') ? 'Bakiye'        : 'Balance' },
    { id:'debt',          icon:'🤝', label: (lang==='tr') ? 'Borç Takibi'   : 'Debt Tracker' },
    { id:'goals',         icon:'🎯', label: (lang==='tr') ? 'Meydan Okuma'  : 'Challenge' },
  ]

  if (!user) return (
  <div style={{minHeight:'100vh',background:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(109,40,217,0.28) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(76,29,149,0.22) 0%, transparent 50%), linear-gradient(160deg, #06041a 0%, #03020a 40%, #05031a 70%, #03020a 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:FONT}}>
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'24px'}}>
      <div style={{position:'relative',width:'64px',height:'64px'}}>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid rgba(124,58,237,0.15)'}}></div>
        <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid transparent',borderTopColor:'#7c3aed',animation:'spin 1s linear infinite'}}></div>
        <div style={{position:'absolute',inset:'8px',borderRadius:'50%',border:'2px solid transparent',borderTopColor:'rgba(124,58,237,0.5)',animation:'spin 0.7s linear infinite reverse'}}></div>
        <div style={{position:'absolute',inset:'16px',borderRadius:'50%',background:'rgba(124,58,237,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>⚡</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px'}}>
        <div style={{color:'#c4b5fd',fontSize:'15px',fontWeight:600,letterSpacing:'-0.3px'}}>BurnRate OS</div>
        <div style={{color:'rgba(167,139,250,0.4)',fontSize:'11px',fontFamily:MONO,letterSpacing:'2px',textTransform:'uppercase'}}>yükleniyor...</div>
      </div>
    </div>
  </div>
)

  const DYNAMIC_THEME = THEMES.dashboard

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
    <div style={{
      background: "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(109,40,217,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(76,29,149,0.1) 0%, transparent 50%), linear-gradient(160deg, #04030e 0%, #020209 40%, #030214 70%, #020209 100%)",
      fontFamily:FONT, height:'100vh', overflow:'hidden', display:'flex',
      transition:'background 0.4s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes aurora{0%{transform:scaleX(1) scaleY(1);opacity:0.7}50%{transform:scaleX(1.05) scaleY(1.1);opacity:1}100%{transform:scaleX(0.95) scaleY(0.95);opacity:0.75}}
        .recharts-tooltip-wrapper * { color: #f5f5f7 !important; }
        .sidebar nav::-webkit-scrollbar{display:none}
        .sidebar::-webkit-scrollbar{display:none}
        .page-wrap::-webkit-scrollbar{display:none}
        .goal-modal::-webkit-scrollbar{display:none}
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

      {monthlyGoalModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}} onClick={e=>e.target===e.currentTarget&&setMonthlyGoalModal(false)}>
          <div className="goal-modal" style={{background:'#0a0414',border:'1px solid rgba(124,58,237,0.25)',borderRadius:'24px',maxWidth:'560px',width:'100%',maxHeight:'85vh',overflowY:'auto',scrollbarWidth:'none',msOverflowStyle:'none',boxShadow:'0 0 80px rgba(124,58,237,0.15)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 32px',borderBottom:'1px solid rgba(255,255,255,0.06)',position:'sticky',top:0,background:'#0a0414',zIndex:1}}>
              <div style={{color:'#f1f0ff',fontSize:'18px',fontWeight:700,fontFamily:FONT}}>🎯 {lang==='tr'?'Aylık Hedef':'Monthly Goal'}</div>
              <button onClick={()=>setMonthlyGoalModal(false)} style={{fontSize:'20px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer'}}>×</button>
            </div>
            <MonthlyGoalContent userId={user.id} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} lang={lang} FONT={FONT} MONO={MONO} onClose={()=>setMonthlyGoalModal(false)} />
          </div>
        </div>
      )}

      {monthlySummaryModal && (
        <MonthlySummaryModal onClose={()=>setMonthlySummaryModal(false)} userId={user.id} lang={lang} FONT={FONT} MONO={MONO} investments={investments} />
      )}

      {/* TRIAL BANNER */}
      {user?.is_trial && user?.trial_expires_at && (() => {
        const daysLeft = Math.ceil((new Date(user.trial_expires_at) - new Date()) / (1000*60*60*24))
        if (daysLeft <= 0) return null
        const isUrgent = daysLeft <= 3
        return (
          <div style={{position:'fixed',top:0,left:0,right:0,zIndex:200,background:isUrgent?'linear-gradient(90deg,#ef4444,#dc2626)':'linear-gradient(90deg,#7c3aed,#4c1d95)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'center',gap:'16px'}}>
            <span style={{color:'#fff',fontSize:'13px',fontFamily:FONT,fontWeight:500}}>
              {isUrgent
                ? (lang==='tr')?`🚨 Denemeniz ${daysLeft} gün içinde sona eriyor! Verilerinizi kaybetmemek için şimdi yükseltin.`:`🚨 Your trial expires in ${daysLeft} day${daysLeft!==1?'s':''}! Upgrade now to keep your data.`
                : (lang==='tr')?`⏳ Denemeniz ${daysLeft} gün içinde sona eriyor`:`⏳ Your trial expires in ${daysLeft} day${daysLeft!==1?'s':''}`
              }
            </span>
            <a href="/checkout?plan=pro"
              style={{background:'rgba(255,255,255,0.2)',color:'#fff',padding:'5px 14px',borderRadius:'100px',fontSize:'12px',fontWeight:700,textDecoration:'none',fontFamily:FONT,whiteSpace:'nowrap'}}>
              {(lang==='tr')?'Şimdi Yükselt →':'Upgrade Now →'}
            </a>
          </div>
        )
      })()}

      {/* SIDEBAR */}
      <div className="sidebar" style={{width:'224px',background:'rgba(124,58,237,0.06)',borderRight:'1px solid rgba(124,58,237,0.18)',backdropFilter:'blur(20px)',flexShrink:0,display:'flex',flexDirection:'column',padding:'28px 14px',paddingTop:user?.is_trial?'52px':'28px',overflowY:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px',paddingLeft:'8px'}}>
          <div style={{flexShrink:0}}>{LOGO_SVG(32)}</div>
          <div>
            <div style={{color:'#f5f5f7',fontSize:'14px',fontWeight:600,letterSpacing:'-0.3px'}}>BurnRate OS</div>
            <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO}}>{lang==='tr'?'komuta merkezi':'command center'}</div>
          </div>
        </div>

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

        <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>
          {['en','tr'].map(l => (
            <button key={l} onClick={()=>changeLang(l)}
              style={{flex:1,padding:'4px 0',fontSize:'10px',fontFamily:MONO,fontWeight:600,color:lang===l?'#fff':'rgba(255,255,255,0.25)',background:lang===l?'#7c3aed':'transparent',border:`1px solid ${lang===l?'#7c3aed':'rgba(255,255,255,0.08)'}`,borderRadius:'6px',cursor:'pointer',letterSpacing:'0.08em',transition:'all 0.2s'}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

       <nav style={{display:'flex',flexDirection:'column',gap:'4px',flex:1,overflowY:'auto',scrollbarWidth:'none',msOverflowStyle:'none'}}>
          {navItems.map(item => {
            const t = THEMES[item.id]
            const active = page === item.id
            const locked = !canAccess(userPlan, item.id)
            return (
              <button key={item.id} onClick={() => navigateTo(item.id)}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background='rgba(124,58,237,0.08)';e.currentTarget.style.color='rgba(255,255,255,0.65)';e.currentTarget.style.transform='translateX(3px)'}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color=locked?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.38)';e.currentTarget.style.transform=''}}}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',fontSize:'13px',fontWeight:active?600:400,textAlign:'left',background:active?t.bg:'transparent',color:active?t.text:locked?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.38)',border:active?`1px solid ${t.border}`:'1px solid transparent',cursor:'pointer',transition:'all 0.18s cubic-bezier(.34,1.56,.64,1)',fontFamily:FONT}}>
                <span style={{fontSize:'14px',opacity:locked?0.5:1}}>{item.icon}</span>
                <span style={{flex:1}}>{item.label}</span>
                {locked && <span style={{fontSize:'10px',opacity:0.4}}>🔒</span>}
              </button>
            )
          })}
        </nav>

        <div style={{height:'1px',background:'rgba(255,255,255,0.06)',margin:'8px 0'}}></div>

        <div style={{marginBottom:'14px'}}>
          <button onClick={() => navigateTo('ai')}
           style={{width:'100%',display:'flex',alignItems:'center',gap:'10px',padding:'11px 12px',borderRadius:'12px',background:page==='ai'?'linear-gradient(135deg,#7c3aed,#7c3aedcc)':'rgba(124,58,237,0.12)',color:page==='ai'?'#fff':'#c4b5fd',border:'1px solid rgba(124,58,237,0.3)',cursor:'pointer',transition:'all 0.15s',fontFamily:FONT}}>
            <span style={{fontSize:'15px',opacity:canAccess(userPlan,'ai')?1:0.5}}>🤖</span>
            <div style={{textAlign:'left',flex:1}}>
              <div style={{fontSize:'13px',fontWeight:600}}>{lang==='tr'?'Yapay Zeka':'AI Advisor'}</div>
              <div style={{fontSize:'10px',color:page==='ai'?'rgba(255,255,255,0.5)':'#c4b5fd88',fontFamily:MONO}}>{lang==='tr'?'claude destekli':'powered by claude'}</div>
            </div>
            {!canAccess(userPlan,'ai') && <span style={{fontSize:'10px',opacity:0.4}}>🔒</span>}
          </button>
        </div>

        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'14px'}}>
          <div style={{paddingLeft:'8px',marginBottom:'10px'}}>
            <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:500}}>{user.name || 'User'}</div>
            <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:MONO,marginTop:'2px'}}>{user.email}</div>
          </div>
          <button onClick={()=>navigateTo('settings')}
            style={{width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:'8px',fontSize:'12px',color:page==='settings'?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)',background:page==='settings'?'rgba(255,255,255,0.05)':'transparent',border:'none',cursor:'pointer',fontFamily:FONT,marginBottom:'2px'}}>
            ⚙️ {lang==='tr'?'Ayarlar':'Settings'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="page-wrap" style={{flex:1,overflowY:'auto',paddingTop:user?.is_trial?'40px':'0',scrollbarWidth:'none',msOverflowStyle:'none'}}>
        {page==='dashboard' && <OverviewPage theme={DYNAMIC_THEME} netBal={netBal} totalSubs={totalSubs} totalExp={totalExp} deadSubs={deadSubs} subs={subs} expenses={expenses} totalIncome={totalIncome} invGain={invGain} totalInvValue={totalInvValue} onSummary={()=>navigateTo('summary')} onQuickAdd={()=>navigateTo('spending')} onMonthlySummary={()=>setMonthlySummaryModal(true)} onMonthlyGoal={()=>setMonthlyGoalModal(true)} userPlan={userPlan} userName={user.name||'User'} currency={currency} currencyRate={currencyRate} currencySymbol={currencySymbol} lang={lang} />}
        {page==='subscriptions' && (canAccess(userPlan,'subscriptions') ? <SubsPage theme={THEMES.subscriptions} subs={subs} userId={user.id} onRefresh={() => loadData(user.id)} currency={currency} currencyRate={currencyRate} currencySymbol={currencySymbol} lang={lang} /> : <LockedPage moduleId="subscriptions" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('subscriptions')} lang={lang} />)}
        {page==='spending' && <SpendingPage theme={THEMES.spending} expenses={expenses} userId={user.id} onRefresh={() => loadData(user.id)} currency={currency} currencyRate={currencyRate} currencySymbol={currencySymbol} lang={lang} />}
        {page==='investments' && (canAccess(userPlan,'investments') ? <InvestmentsPage theme={THEMES.investments} investments={investments} setInvestments={setInvestments} userId={user.id} onRefresh={() => loadData(user.id)} lang={lang} /> : <LockedPage moduleId="investments" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('investments')} lang={lang} />)}
        {page==='balance' && <BalancePage theme={THEMES.balance} income={income} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} userId={user.id} onRefresh={() => loadData(user.id)} currency={currency} currencyRate={currencyRate} currencySymbol={currencySymbol} lang={lang} />}
        {page==='goals' && (canAccess(userPlan,'goals') ? <GoalsPage theme={THEMES.goals} expenses={expenses} totalExp={totalExp} totalSubs={totalSubs} totalIncome={totalIncome} userId={user.id} lang={lang} /> : <LockedPage moduleId="goals" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('goals')} lang={lang} />)}
        {page==='summary' && (canAccess(userPlan,'summary') ? <MonthlySummaryPage theme={THEMES.summary} totalIncome={totalIncome} totalExp={totalExp} totalSubs={totalSubs} netBal={netBal} subs={subs} expenses={expenses} income={income} lang={lang} /> : <LockedPage moduleId="summary" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('summary')} lang={lang} />)}
        {page==='ai' && (canAccess(userPlan,'ai') ? <AIPage theme={DYNAMIC_THEME} user={user} subs={subs} expenses={expenses} income={income} investments={investments} lang={lang} /> : <LockedPage moduleId="ai" userPlan={userPlan} onUpgrade={()=>setUpgradeModal('ai')} lang={lang} />)}
        {page==='debt' && <DebtPage theme={THEMES.debt} userId={user.id} currency={currency} currencyRate={currencyRate} currencySymbol={currencySymbol} lang={lang} />}
        {page==='settings' && <SettingsPage theme={DYNAMIC_THEME} user={user} lang={lang} userPlan={userPlan} onLangChange={changeLang} onSignOut={()=>{ localStorage.removeItem('burnrate_user'); localStorage.removeItem('burnrate_lang'); localStorage.removeItem('burnrate_ai_chat'); window.location.href='/login' }} />}
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
  const rgb = accent ? hexToRgb(accent) : '124,58,237'
  return (
    <div
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.006)';e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${rgb},0.4), 0 0 0 4px rgba(${rgb},0.08), inset 0 1px 0 rgba(${rgb},0.22), 0 20px 60px rgba(0,0,0,0.7), 0 8px 24px rgba(${rgb},0.18)`}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${rgb},0.22), inset 0 1px 0 rgba(${rgb},0.15), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)`}}
      style={{
        background:`rgba(${rgb},0.07)`,
        borderRadius:'20px',
        position:'relative',
        overflow:'hidden',
        boxShadow:`0 0 0 1px rgba(${rgb},0.22), inset 0 1px 0 rgba(${rgb},0.15), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)`,
        transition:'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease',
        animation:'fadeIn 0.3s ease',
        ...style
      }}>{children}</div>
  )
}

function StatCard({ label, value, sub, color, icon, accent=null }) {
  const rgb = accent ? hexToRgb(accent) : '124,58,237'
  return (
    <div style={{
      background: `rgba(${rgb},0.07)`,
      borderRadius: '20px',
      padding: '22px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 0 0 1px rgba(${rgb},0.22), inset 0 1px 0 rgba(${rgb},0.15), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)`,
      transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease',
      cursor: 'default'
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.008)'; e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${rgb},0.4), 0 0 0 4px rgba(${rgb},0.08), inset 0 1px 0 rgba(${rgb},0.22), 0 20px 60px rgba(0,0,0,0.7), 0 8px 24px rgba(${rgb},0.18)`}}
    onMouseLeave={e=>{e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${rgb},0.22), inset 0 1px 0 rgba(${rgb},0.15), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
        <div style={{fontFamily:MONO,fontSize:'9.5px',letterSpacing:'1.8px',textTransform:'uppercase',color:'rgba(255,255,255,0.28)'}}>{label}</div>
        {icon && <div style={{width:'31px',height:'31px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',background:`rgba(${rgb},0.1)`,border:`1px solid rgba(${rgb},0.2)`}}>{icon}</div>}
      </div>
      <div style={{color:color||'#f5f5f7',fontSize:'28px',fontWeight:800,letterSpacing:'-1.5px',lineHeight:1,marginBottom:'8px',fontFamily:FONT}}>{value}</div>
      {sub && <div style={{color:'rgba(255,255,255,0.32)',fontSize:'11.5px',fontFamily:FONT,display:'flex',alignItems:'center',gap:'5px'}}>{sub}</div>}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'2px',background:`linear-gradient(90deg,transparent,rgba(${rgb},0.6),transparent)`,opacity:0,transition:'opacity 0.22s, transform 0.3s cubic-bezier(.34,1.56,.64,1)',transform:'scaleX(0.3)'}} className="stat-bar"></div>
    </div>
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
    <button onClick={onClick} disabled={disabled}
      style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 22px',borderRadius:'14px',fontSize:'13px',fontWeight:700,background:disabled?'rgba(255,255,255,0.05)':`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:disabled?'rgba(255,255,255,0.3)':'#fff',border:'none',cursor:disabled?'not-allowed':'pointer',whiteSpace:'nowrap',fontFamily:FONT,transition:'transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s, filter 0.18s',boxShadow:disabled?'none':`0 4px 20px rgba(${hexToRgb(theme.accent)},0.38), inset 0 1px 0 rgba(255,255,255,0.15)`}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform='translateY(-2.5px) scale(1.03)';e.currentTarget.style.filter='brightness(1.08)';e.currentTarget.style.boxShadow=`0 8px 34px rgba(${hexToRgb(theme.accent)},0.55)`}}}
      onMouseLeave={e=>{if(!disabled){e.currentTarget.style.transform='';e.currentTarget.style.filter='';e.currentTarget.style.boxShadow=`0 4px 20px rgba(${hexToRgb(theme.accent)},0.38), inset 0 1px 0 rgba(255,255,255,0.15)`}}}
      onMouseDown={e=>{if(!disabled){e.currentTarget.style.transform='translateY(0) scale(0.97)'}}}
      onMouseUp={e=>{if(!disabled){e.currentTarget.style.transform='translateY(-2.5px) scale(1.03)'}}}>
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
function OverviewPage({ theme, netBal, totalSubs, totalExp, deadSubs, subs, expenses, totalIncome, invGain, totalInvValue, onSummary, onQuickAdd, onMonthlySummary, onMonthlyGoal, userPlan, userName, currency, currencyRate, currencySymbol, lang }) {
  const sr = totalIncome > 0 ? Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100) : 0
  const fmt = (amount) => `${currencySymbol}${(amount / currencyRate).toFixed(0)}`
  const now = new Date()
  const monthName = now.toLocaleString('en-US',{month:'long',year:'numeric'})
  const daysLeft = new Date(now.getFullYear(),now.getMonth()+1,0).getDate() - now.getDate()
  const pieData = [{name:(lang==='tr')?'Abonelikler':'Subscriptions',value:totalSubs},{name:(lang==='tr')?'Gider':'Expenses',value:totalExp},{name:(lang==='tr')?'Tasarruf':'Saved',value:Math.max(0,netBal)}].filter(d=>d.value>0)
  const barData = expenses.slice(-6).map((e,i)=>({name:e.description?.slice(0,8)||`#${i+1}`,amount:Number(e.amount),category:e.category||'other'}))

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{color:theme.text,fontSize:'24px',fontWeight:700,letterSpacing:'-0.5px',margin:0,marginBottom:'4px',fontFamily:FONT}}>{getGreeting(userName, lang)}</h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{monthName} · {daysLeft} {lang==='tr'?'gün kaldı':'days left'}</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onMonthlyGoal}
            style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'100px',fontSize:'13px',fontWeight:600,background:'rgba(244,63,94,0.1)',color:'#fda4af',border:'1px solid rgba(244,63,94,0.3)',cursor:'pointer',fontFamily:FONT,transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)',boxShadow:'0 0 0 1px rgba(244,63,94,0.25)'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.04)';e.currentTarget.style.boxShadow='0 0 0 1px rgba(244,63,94,0.5), 0 8px 24px rgba(244,63,94,0.2)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 0 1px rgba(244,63,94,0.25)'}}>
            🎯 {lang==='tr'?'Aylık Hedef':'Monthly Goal'}
          </button>
          <button onClick={onMonthlySummary}
            style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'100px',fontSize:'13px',fontWeight:600,background:'rgba(20,184,166,0.1)',color:'#5eead4',border:'1px solid rgba(20,184,166,0.3)',cursor:'pointer',fontFamily:FONT,transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)',boxShadow:'0 0 0 1px rgba(20,184,166,0.2)'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.04)';e.currentTarget.style.boxShadow='0 0 0 1px rgba(20,184,166,0.5), 0 8px 24px rgba(20,184,166,0.2)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 0 1px rgba(20,184,166,0.2)'}}>
            📋 {lang==='tr'?'Aylık Özet':'Monthly Summary'}
          </button>
        </div>
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
        <StatCard accent={theme.accent} label={lang==='tr'?'Net Bakiye':'Net Balance'} value={fmt(Math.abs(netBal))} sub={lang==='tr'?(netBal>=0?'↑ Pozitif':'↓ Açıkta'):(netBal>=0?'↑ Positive':'↓ In the red')} color={netBal>=0?'#6ee7b7':'#fca5a5'} icon="💰" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Aylık Harcama':'Monthly Burn'} value={fmt(totalExp+totalSubs)} sub={lang==='tr'?'harcama + abonelik':'expenses + subs'} color="#fb7185" icon="🔥" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Tasarruf Oranı':lang==='tr'?'Tasarruf Oranı':'Savings Rate'} value={`${sr}%`} sub={lang==='tr'?(sr>=30?'Mükemmel 🎉':sr>=15?'İyi, devam et':'Gelişmeli'):(sr>=30?'Excellent 🎉':sr>=15?'Good, keep going':'Needs work')} color={sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'} icon="📊" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Portföy':'Portfolio'} value={fmt(totalInvValue)} sub={lang==='tr'?(invGain>=0?`+₺${invGain.toFixed(0)} kazanç`:`-₺${Math.abs(invGain).toFixed(0)} kayıp`):(invGain>=0?`+₺${invGain.toFixed(0)} gain`:`-₺${Math.abs(invGain).toFixed(0)} loss`)} color={invGain>=0?'#6ee7b7':'#fca5a5'} icon="📈" />
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
          ) : <div style={{height:'180px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>📊</span>Henüz veri yok</div>}
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.06)" />
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false} />
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                <Bar dataKey="amount" radius={[6,6,0,0]}>
                  {barData.map((item,i) => <Cell key={i} fill={CAT_COLORS_MAP[item.category]||THEMES.spending.chart[i%5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'180px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>📊</span>Henüz veri yok</div>}
        </Card>
      </div>
      <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <Card accent={theme.accent} style={{padding:'22px'}}>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',fontWeight:600,marginBottom:'14px',fontFamily:FONT}}>{lang==='tr'?'⚔️ En Büyük Abonelikler':'⚔️ Top Subscriptions'}</div>
          {subs.length===0 ? <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',padding:'24px 0',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>⚔️</span>Henüz abonelik yok</div> :
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
          {expenses.length===0 ? <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',padding:'24px 0',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>💸</span>Henüz harcama yok</div> :
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
function SubsPage({ theme, subs, userId, onRefresh, currency='TRY', currencyRate=1, currencySymbol='₺', lang='en' }) {

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

  const [form, setForm] = useState({name:'',cost:'',category:'saas',days_since_used:0,last_used_date:new Date().toISOString().split('T')[0],billing_period:'monthly',notes:''})
  const [adding, setAdding] = useState(false)
  const [subCatSearch, setSubCatSearch] = useState('')
  const [subCatOpen, setSubCatOpen]     = useState(false)
  const filtSubCats = subCatSearch ? SUB_CATS.filter(c=>((lang==='tr')?c.tr:c.en).toLowerCase().includes(subCatSearch.toLowerCase())) : SUB_CATS

  async function addSub() {
    if (!form.name||!form.cost) return
    const days = parseInt(form.days_since_used)||0
    const status = days===0?'keep':days<30?'keep':days<60?'warn':'dead'
    const monthlyCost=form.billing_period==='yearly'?parseFloat(form.cost)/12:parseFloat(form.cost); const {billing_period,last_used_date,...formData}=form; await supabaseInsert('subscriptions',{...formData,cost:parseFloat(monthlyCost.toFixed(2)),days_since_used:days,status,user_id:userId})
    setForm({name:'',cost:'',category:'saas',days_since_used:0,last_used_date:new Date().toISOString().split('T')[0],billing_period:'monthly',notes:''}); setSubCatSearch(''); setAdding(false); onRefresh()
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
        <StatCard accent={theme.accent} label={lang==='tr'?'Aylık Maliyet':'Monthly Cost'} value={`${currencySymbol}${(total/currencyRate).toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Ölü Araçlar':'Dead Tools'} value={dead.length} sub={lang==='tr'?`${currencySymbol}${(dead.reduce((a,s)=>a+Number(s.cost),0)/currencyRate).toFixed(2)}/ay israf`:`${currencySymbol}${(dead.reduce((a,s)=>a+Number(s.cost),0)/currencyRate).toFixed(2)}/mo wasted`} color="#fca5a5" icon="💀" />
        <StatCard accent={theme.accent} label={lang==='tr'?'Tutmaya Değer':'Worth Keeping'} value={subs.filter(s=>s.status==='keep').length} color="#6ee7b7" icon="✅" />
      </div>
      {adding && (
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label={lang==='tr'?'Hizmet Adı':'Service Name'} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={lang==='tr'?'Netflix, Spotify, ChatGPT...':'Netflix, Spotify, ChatGPT...'} />
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'8px'}}>{lang==='tr'?'Fatura Dönemi':'Billing Period'}</div><div style={{display:'flex',background:'rgba(255,255,255,0.04)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.09)',overflow:'hidden'}}>{['monthly','yearly'].map(p=>(<button key={p} onClick={()=>setForm({...form,billing_period:p})} style={{flex:1,padding:'10px',fontSize:'13px',fontFamily:FONT,fontWeight:form.billing_period===p?600:400,color:form.billing_period===p?'#fff':'rgba(255,255,255,0.35)',background:form.billing_period===p?'rgba(239,68,68,0.4)':'transparent',border:'none',cursor:'pointer',transition:'all 0.2s'}}>{p==='monthly'?(lang==='tr'?'📅 Aylık':'📅 Monthly'):(lang==='tr'?'📆 Yıllık (÷12)':'📆 Yearly (÷12)')}</button>))}</div>{form.billing_period==='yearly'&&form.cost&&<div style={{marginTop:'6px',fontSize:'11px',color:'rgba(245,158,11,0.8)',fontFamily:FONT}}>≈ ₺{(parseFloat(form.cost)/12).toFixed(2)}/{lang==='tr'?'ay':'mo'}</div>}</div>
            <div>
              <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>
                {form.billing_period==='yearly'?(lang==='tr'?'Yıllık Ücret (₺)':'Annual Fee (₺)'):(lang==='tr'?'Aylık Ücret (₺)':'Monthly Fee (₺)')}
              </div>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:MONO}}>₺</span>
                <input type="number" min="0" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})}
                  placeholder="0.00"
                  style={{width:'100%',padding:'10px 14px 10px 28px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:MONO}} />
              </div>
              {form.billing_period==='yearly'&&form.cost&&(
                <div style={{marginTop:'6px',fontSize:'11px',color:'rgba(245,158,11,0.8)',fontFamily:FONT}}>≈ ₺{(parseFloat(form.cost)/12).toFixed(2)}/{lang==='tr'?'ay':'mo'}</div>
              )}
            </div>
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{lang==='tr'?'Son Kullanım Tarihi':'Last Used Date'}</div><input type="date" value={form.last_used_date||new Date().toISOString().split('T')[0]} onChange={e=>{const days=Math.floor((new Date()-new Date(e.target.value))/(1000*60*60*24));setForm({...form,last_used_date:e.target.value,days_since_used:days<0?0:days})}} max={new Date().toISOString().split('T')[0]} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT,colorScheme:'dark'}} /></div>
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
                {subs.length===0 ? <tr><td colSpan={6} style={{textAlign:'center',padding:'60px 20px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}><div style={{fontSize:'36px',opacity:0.6}}>⚔️</div><div style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',fontWeight:500,fontFamily:FONT}}>Henüz abonelik yok</div><div style={{color:'rgba(255,255,255,0.18)',fontSize:'12px',fontFamily:FONT}}>İlk aboneliğini eklemek için + butonuna tıkla</div></div></td></tr>
                : subs.map(s=>(
                  <tr key={s.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.05)';e.currentTarget.style.borderRadius='8px'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                    <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{s.name}</td>
                    <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>{currencySymbol}{(Number(s.cost)/currencyRate).toFixed(2)}</td>
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
function SpendingPage({ theme, expenses, userId, onRefresh, currency='TRY', currencyRate=1, currencySymbol='₺', lang='en' }) {

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
  const getCL = (val) => { const cat=CATS.find(c=>c.v===val); return cat?((lang==='tr')?cat.tr:cat.en):val }
  const getCG = (val) => { const cat=CATS.find(c=>c.v===val); return cat?((lang==='tr')?cat.g_tr:cat.g_en):((lang==='tr')?'Diğer':'Other') }

  const [form, setForm]     = useState({description:'',amount:'',category:'other',expense_date:'',recurring:false})
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [catSearch, setCatSearch] = useState('')
  const [catOpen, setCatOpen]     = useState(false)

  async function addExpense() {
    if (!form.description||!form.amount) return
    const {recurring,...expData}=form; await supabaseInsert('expenses',{...expData,amount:parseFloat(form.amount),user_id:userId})
    setForm({description:'',amount:'',category:'other',expense_date:'',recurring:false}); setAdding(false); onRefresh()
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
        <StatCard accent={theme.accent} label={(lang==='tr')?'Toplam Harcama':'Total Spent'} value={`${currencySymbol}${(total/currencyRate).toFixed(2)}`} color={theme.text} icon="💸" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'Sızıntı Miktarı':'Leak Amount'} value={`${currencySymbol}${(leakAmt/currencyRate).toFixed(2)}`} sub={(lang==='tr')?`Bütçenin %${total>0?Math.round(leakAmt/total*100):0}'ı`:`${total>0?Math.round(leakAmt/total*100):0}% of spending`} color="#fca5a5" icon="🩸" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'İşlem Sayısı':'Transactions'} value={expenses.length} color={theme.text} icon="📋" />
        <StatCard accent={theme.accent} label={(lang==='tr')?'Ort. / İşlem':'Avg / Transaction'} value={expenses.length>0?`${currencySymbol}${(total/expenses.length/currencyRate).toFixed(2)}`:`${currencySymbol}0`} color={theme.text} icon="📊" />
      </div>
      {adding&&(
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
            <InputField label={(lang==='tr')?'Açıklama':'Description'} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder={lang==='tr'?'Akaryakıt, market, restoran...':'Fuel, groceries, restaurant...'} />
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{(lang==='tr')?'Miktar (₺)':'Amount (₺)'}</div><div style={{position:'relative'}}><span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:MONO}}>₺</span><input type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" style={{width:'100%',padding:'10px 14px 10px 28px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:MONO}} /></div></div>
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{(lang==='tr')?'Tarih':'Date'}</div><input type="date" value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT,colorScheme:'dark'}} /></div>
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
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',userSelect:'none'}}>
              <div onClick={()=>setForm({...form,recurring:!form.recurring})} style={{width:'20px',height:'20px',borderRadius:'6px',background:form.recurring?theme.accent:'transparent',border:`1.5px solid ${form.recurring?theme.accent:'rgba(255,255,255,0.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s',flexShrink:0}}>
                {form.recurring&&<span style={{color:'#fff',fontSize:'12px',fontWeight:700}}>✓</span>}
              </div>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,0.45)',fontFamily:FONT}}>{(lang==='tr')?'Her ay tekrarla':'Repeat monthly'}</span>
            </label>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{(lang==='tr')?'İptal':'Cancel'}</button>
              <button onClick={addExpense} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>{(lang==='tr')?'Kaydet':'Save'}</button>
            </div>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.06)"/>
                <XAxis dataKey="day" tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
                <Area type="monotone" dataKey="amount" stroke={theme.accent} strokeWidth={2.5} fill="url(#spendGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          ):<div style={{height:'160px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>📊</span>Henüz veri yok</div>}
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
                  <span style={{fontFamily:MONO,color:col}}>{currencySymbol}{(amt/currencyRate).toFixed(2)}</span>
                </div>
                <div style={{height:'5px',borderRadius:'100px',background:'rgba(255,255,255,0.06)'}}>
                  <div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:col,transition:'width 0.5s'}}></div>
                </div>
              </div>
            )
          })}
          {expenses.length===0&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',padding:'24px 0',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>📊</span>Henüz veri yok</div>}
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
                ?<tr><td colSpan={5} style={{textAlign:'center',padding:'60px 20px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}><div style={{fontSize:'36px',opacity:0.6}}>💸</div><div style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',fontWeight:500,fontFamily:FONT}}>Henüz harcama yok</div><div style={{color:'rgba(255,255,255,0.18)',fontSize:'12px',fontFamily:FONT}}>İlk harcamanı eklemek için + butonuna tıkla</div></div></td></tr>
                :filtered.map(e=>(
                  <tr key={e.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.05)';e.currentTarget.style.borderRadius='8px'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                    <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{e.description}</td>
                    <td style={{padding:'12px 0',fontFamily:MONO,color:theme.text,fontSize:'13px'}}>-{currencySymbol}{(Number(e.amount)/currencyRate).toFixed(2)}</td>
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
function InvestmentsPage({ theme, investments, setInvestments, userId, onRefresh, lang='en' }) {
  const [activeTab, setActiveTab] = useState('stocks') // 'stocks' | 'fx'
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
  const [selectedStock, setSelectedStock] = useState(null)
  const [chartData, setChartData] = useState([])
  const [chartPeriod, setChartPeriod] = useState('1m')
  const [loadingChart, setLoadingChart] = useState(false)
  const [stockDetail, setStockDetail] = useState(null)
  const [chartTooltip, setChartTooltip] = useState(null)

  async function fetchChart(symbol, period) {
    setLoadingChart(true)
    setChartData([])
    try {
      const res = await fetch(`/api/stocks?history=${symbol}&period=${period}`)
      const data = await res.json()
      setChartData(data.candles || [])
    } catch {}
    setLoadingChart(false)
  }

  async function fetchStockDetail(symbol) {
    try {
      const res = await fetch(`/api/stocks?symbol=${symbol}`)
      const data = await res.json()
      setStockDetail(data)
    } catch {}
  }
  const [fxRates, setFxRates] = useState({})
  const [loadingFx, setLoadingFx] = useState(false)
  const [fxAdding, setFxAdding] = useState(false)
  const [fxForm, setFxForm] = useState({type:'USDTRY=X',amount:'',buyRate:''})

  const FX_ITEMS = [
    {symbol:'USDTRY=X',   label:'Dolar',             icon:'🇺🇸', code:'USD', color:'#10b981', unit:''},
    {symbol:'EURTRY=X',   label:'Euro',               icon:'🇪🇺', code:'EUR', color:'#3b82f6', unit:''},
    {symbol:'GBPTRY=X',   label:'Sterlin',            icon:'🇬🇧', code:'GBP', color:'#8b5cf6', unit:''},
    {symbol:'GOLD_GRAM',  label:'Gram Altın',         icon:'🥇', code:'XAU', color:'#f59e0b', unit:'gram'},
    {symbol:'GOLD_CEYREK',label:'Çeyrek Altın',       icon:'🟡', code:'XAU', color:'#f59e0b', unit:'adet'},
    {symbol:'GOLD_YARIM', label:'Yarım Altın',        icon:'🟡', code:'XAU', color:'#fbbf24', unit:'adet'},
    {symbol:'GOLD_TAM',   label:'Tam Altın',          icon:'🟡', code:'XAU', color:'#d97706', unit:'adet'},
    {symbol:'GOLD_CUMHUR',label:'Cumhuriyet Altını',  icon:'🪙', code:'XAU', color:'#b45309', unit:'adet'},
    {symbol:'SI=F',       label:'Gümüş',              icon:'🥈', code:'XAG', color:'#94a3b8', unit:'gram'},
  ]

  const GOLD_GRAMS = {
    'GOLD_GRAM':   1,
    'GOLD_CEYREK': 1.75,
    'GOLD_YARIM':  3.5,
    'GOLD_TAM':    7.0,
    'GOLD_CUMHUR': 7.216,
  }

  const stockInvestments = investments.filter(i => i.type !== 'fx')
  const fxInvestments = investments.filter(i => i.type === 'fx')

  async function fetchPrices() {
    if (stockInvestments.length === 0) return
    setLoadingPrices(true)
    try {
      const results = await Promise.all(
        stockInvestments.map(inv =>
          fetch(`/api/stocks?symbol=${inv.symbol}`)
            .then(r => r.json())
            .then(data => ({ symbol: inv.symbol, data }))
            .catch(() => ({ symbol: inv.symbol, data: {} }))
        )
      )
      const up = {}, uc = {}
      results.forEach(({ symbol, data }) => {
        if (data.price) { up[symbol]=parseFloat(data.price); uc[symbol]=parseFloat(data.change||0) }
      })
      setPrices(up); setChanges(uc); setLastUpdated(new Date().toLocaleTimeString())
    } catch {}
    setLoadingPrices(false)
  }

  async function fetchFxRates() {
    setLoadingFx(true)
    try {
      const results = await Promise.all(
        FX_ITEMS.map(fx => 
          fetch(`/api/stocks?symbol=${fx.symbol}`)
            .then(r => r.json())
            .then(data => ({ symbol: fx.symbol, data }))
            .catch(() => ({ symbol: fx.symbol, data: {} }))
        )
      )
      const rates = {}
      results.forEach(({ symbol, data }) => {
        if (data.price) rates[symbol] = { price: parseFloat(data.price), change: parseFloat(data.change||0) }
      })
      setFxRates(rates)
    } catch {}
    setLoadingFx(false)
  }


  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [stockInvestments.length])

  useEffect(() => {
    if (activeTab === 'fx') fetchFxRates()
  }, [activeTab])

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

  async function addInv() {
    if (!form.symbol||!form.shares||!form.buyPrice) return
    await supabaseInsert('investments',{
      symbol:form.symbol, name:form.name, shares:parseFloat(form.shares),
      buy_price:parseFloat(form.buyPrice), current_price:parseFloat(form.currentPrice)||0,
      type:form.type, user_id:userId
    })
    setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})
    setSearchQuery(''); setAdding(false); onRefresh()
  }

  async function addFx() {
    if (!fxForm.amount||!fxForm.buyRate) return
    const fx = FX_ITEMS.find(f=>f.symbol===fxForm.type)
    await supabaseInsert('investments',{
      symbol:fxForm.type, name:fx?.label||fxForm.type, shares:parseFloat(fxForm.amount),
      buy_price:parseFloat(fxForm.buyRate), current_price:fxRates[fxForm.type]?.price||0,
      type:'fx', user_id:userId
    })
    setFxForm({type:'USDTRY=X',amount:'',buyRate:''}); setFxAdding(false); onRefresh()
  }

  async function del(id) { await supabaseDelete('investments', id); onRefresh() }

  function handleStockClick(inv) {
    if (selectedStock?.symbol === inv.symbol) {
      setSelectedStock(null); setChartData([]); setStockDetail(null)
    } else {
      setSelectedStock(inv)
      setChartPeriod('1m')
      fetchChart(inv.symbol, '1m')
      fetchStockDetail(inv.symbol)
    }
  }

  const totalValue = stockInvestments.reduce((a,inv)=>a+(inv.shares*(prices[inv.symbol]||inv.currentPrice)),0)
  const totalCost = stockInvestments.reduce((a,inv)=>a+(inv.shares*inv.buyPrice),0)
  const totalGain = totalValue - totalCost
  const gainPct = totalCost>0?((totalGain/totalCost)*100).toFixed(2):0

  const totalFxValue = fxInvestments.reduce((a,inv)=>a+(inv.shares*(fxRates[inv.symbol]?.price||inv.currentPrice)),0)
  const totalFxCost = fxInvestments.reduce((a,inv)=>a+(inv.shares*inv.buyPrice),0)
  const totalFxGain = totalFxValue - totalFxCost

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      {/* HEADER */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'3px',fontFamily:FONT}}>{lang==='tr'?'📈 Yatırım Takibi':'📈 Investment Tracker'}</h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>{lang==='tr'?'Hisse, kripto, döviz ve kıymetli madenler':'Stocks, crypto, forex & precious metals'}</p>
        </div>
        {lastUpdated && activeTab==='stocks' && (
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',animation:'pulse 2s infinite'}}></div>
            <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:MONO}}>{lang==='tr'?'Canlı':'Live'} · {lastUpdated}</span>
          </div>
        )}
      </div>

      {/* TABS */}
      <div style={{display:'flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'4px',marginBottom:'20px',width:'fit-content'}}>
        {[
          {id:'stocks', icon:'📈', label:lang==='tr'?'Hisse & Kripto':'Stocks & Crypto'},
          {id:'fx',     icon:'💱', label:lang==='tr'?'Döviz & Altın':'Forex & Gold'},
        ].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{padding:'9px 20px',borderRadius:'9px',fontSize:'13px',fontWeight:activeTab===tab.id?600:400,background:activeTab===tab.id?theme.bg:'transparent',color:activeTab===tab.id?theme.text:'rgba(255,255,255,0.35)',border:activeTab===tab.id?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:FONT,transition:'all 0.2s',display:'flex',alignItems:'center',gap:'7px'}}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── STOCKS TAB ── */}
      {activeTab==='stocks' && (
        <>
          <div className="grid4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
            <StatCard accent={theme.accent} label={lang==='tr'?'Portföy Değeri':'Portfolio Value'} value={`₺${totalValue.toFixed(0)}`} color={theme.text} icon="💼" />
            <StatCard accent={theme.accent} label={lang==='tr'?'Toplam Maliyet':'Total Cost'} value={`₺${totalCost.toFixed(0)}`} color="rgba(255,255,255,0.6)" icon="💸" />
            <StatCard accent={theme.accent} label={lang==='tr'?'Kar/Zarar':'Gain/Loss'} value={`${totalGain>=0?'+':''}₺${totalGain.toFixed(0)}`} sub={`${gainPct}%`} color={totalGain>=0?'#6ee7b7':'#fca5a5'} icon={totalGain>=0?'📈':'📉'} />
            <StatCard accent={theme.accent} label={lang==='tr'?'Pozisyon':'Positions'} value={stockInvestments.length} color={theme.text} icon="🎯" />
          </div>

          {/* ADD BUTTON */}
          <div style={{marginBottom:'16px'}}>
            <AddBtn theme={theme} label={lang==='tr'?'+ Pozisyon Ekle':'+ Add Position'} onClick={()=>setAdding(!adding)} />
          </div>

          {/* ADD FORM */}
          {adding && (
            <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
              <div style={{marginBottom:'14px'}}>
                <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Hisse / Kripto Ara':'Search Stock or Crypto'}</div>
                <div style={{position:'relative'}}>
                  <input value={searchQuery} onChange={e=>searchStocks(e.target.value)} placeholder={lang==='tr'?'AAPL, THYAO, BTC, ETH...':'AAPL, THYAO, BTC, ETH...'}
                    style={{width:'100%',padding:'12px 16px',borderRadius:'12px',background:'rgba(255,255,255,0.04)',border:`1px solid ${theme.border}`,color:'#f5f5f7',fontSize:'14px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
                  {(searching||fetchingPrice) && <div style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.3)',fontSize:'12px',fontFamily:FONT}}>{searching?'Aranıyor...':'Fiyat alınıyor...'}</div>}
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
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
                  <div><div style={{...TIP,marginBottom:'6px'}}>Sembol</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:theme.text,fontSize:'13px',fontWeight:700,...VAL}}>{form.symbol}</div></div>
                  <div><div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Canlı Fiyat (₺)':'Live Price (₺)'}</div><div style={{padding:'10px 14px',borderRadius:'10px',background:fetchingPrice?'rgba(255,255,255,0.02)':'rgba(16,185,129,0.08)',border:`1px solid ${fetchingPrice?'rgba(255,255,255,0.09)':'rgba(16,185,129,0.2)'}`,color:'#6ee7b7',fontSize:'13px',fontWeight:700,...VAL}}>{fetchingPrice?'Yükleniyor...':form.currentPrice?`₺${form.currentPrice}`:'—'}</div></div>
                  <div><div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Tür':'Type'}</div><div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontFamily:FONT}}>{form.type}</div></div>
                  <div><div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Adet / Lot':'Shares'}</div><input type="number" value={form.shares} onChange={e=>setForm({...form,shares:e.target.value})} placeholder="1" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
                  <div><div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Alış Fiyatı (₺)':'Buy Price (₺)'}</div><input type="number" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} placeholder="0.00" style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} /></div>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
                <button onClick={()=>{setAdding(false);setSearchQuery('');setSearchResults([]);setForm({symbol:'',name:'',shares:'',buyPrice:'',currentPrice:'',type:'stock'})}} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'İptal':'Cancel'}</button>
                <button onClick={addInv} disabled={!form.symbol||!form.shares||!form.buyPrice} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',opacity:!form.symbol||!form.shares||!form.buyPrice?0.4:1,fontFamily:FONT}}>{lang==='tr'?'Ekle':'Add'}</button>
              </div>
            </Card>
          )}

          {/* STOCK LIST */}
          <Card accent={theme.accent} style={{padding:'22px',marginBottom:'16px'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
                <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  {[lang==='tr'?'Hisse':'Stock',lang==='tr'?'Adet':'Shares',lang==='tr'?'Alış':'Buy',lang==='tr'?'Güncel':'Current','24s',lang==='tr'?'Değer':'Value',lang==='tr'?'Kar/Zarar':'G/L',''].map(h=>(
                    <th key={h} style={{...TIP,textAlign:'left',paddingBottom:'10px',fontWeight:500}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {stockInvestments.length===0 ? (
                    <tr><td colSpan={8} style={{textAlign:'center',padding:'60px 20px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}><div style={{fontSize:'36px',opacity:0.6}}>📈</div><div style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',fontWeight:500,fontFamily:FONT}}>Henüz pozisyon yok</div><div style={{color:'rgba(255,255,255,0.18)',fontSize:'12px',fontFamily:FONT}}>Hisse veya kripto eklemek için + butonuna tıkla</div></div></td></tr>
                  ) : stockInvestments.map((inv,i)=>{
                    const livePrice=prices[inv.symbol]||inv.currentPrice
                    const change=changes[inv.symbol]||0
                    const val=inv.shares*livePrice, cost=inv.shares*inv.buyPrice, gain=val-cost
                    const gp=cost>0?((gain/cost)*100).toFixed(1):0
                    const isLive=!!prices[inv.symbol], changePos=change>=0
                    const isSelected=selectedStock?.symbol===inv.symbol
                    return (
                      <tr key={inv.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',background:isSelected?'rgba(255,255,255,0.03)':'transparent',transition:'background 0.15s'}} onClick={()=>handleStockClick(inv)} onMouseEnter={e=>{e.currentTarget.style.background='rgba(16,185,129,0.06)'}} onMouseLeave={e=>{e.currentTarget.style.background=isSelected?'rgba(255,255,255,0.03)':'transparent'}}>
                        <td style={{padding:'12px 8px 12px 0'}}>
                          <div style={{...VAL,color:theme.text,fontWeight:700,fontSize:'14px'}}>{inv.symbol}</div>
                          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',fontFamily:FONT,maxWidth:'100px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inv.name}</div>
                        </td>
                        <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{inv.shares}</td>
                        <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>₺{Number(inv.buyPrice).toFixed(2)}</td>
                        <td style={{padding:'12px 8px'}}>
                          <div style={{...VAL,color:'#f5f5f7',fontSize:'13px',fontWeight:700}}>₺{livePrice.toFixed(2)}</div>
                          {isLive&&<div style={{display:'flex',alignItems:'center',gap:'3px',marginTop:'2px'}}><div style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10b981'}}></div><span style={{fontSize:'9px',color:'#10b981',fontFamily:MONO}}>CANLI</span></div>}
                        </td>
                        <td style={{padding:'12px 8px'}}>
                          {isLive?<div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',background:changePos?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'}}><span style={{fontSize:'12px',color:changePos?'#6ee7b7':'#fca5a5',fontWeight:700,...VAL}}>{changePos?'▲':'▼'} {Math.abs(change)}%</span></div>:<span style={{color:'rgba(255,255,255,0.15)',fontSize:'12px'}}>—</span>}
                        </td>
                        <td style={{padding:'12px 8px',...VAL,color:theme.text,fontSize:'13px',fontWeight:700}}>₺{val.toFixed(0)}</td>
                        <td style={{padding:'12px 8px'}}>
                          <div style={{...VAL,color:gain>=0?'#6ee7b7':'#fca5a5',fontSize:'13px',fontWeight:700}}>{gain>=0?'+':''}₺{gain.toFixed(0)}</div>
                          <div style={{...VAL,color:gain>=0?'rgba(110,231,183,0.5)':'rgba(252,165,165,0.5)',fontSize:'11px'}}>{gp}%</div>
                        </td>
                        <td style={{padding:'12px 0'}}><button onClick={e=>{e.stopPropagation();del(inv.id||i)}} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* STOCK DETAIL + CHART + NEWS */}
          {selectedStock && (
            <Card accent={theme.accent} style={{padding:'22px',animation:'fadeIn 0.25s ease'}}>
              {/* HEADER */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <div>
                  <div style={{color:theme.text,fontSize:'20px',fontWeight:700,fontFamily:FONT}}>{selectedStock.symbol} <span style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',fontWeight:400}}>{selectedStock.name}</span></div>
                  {stockDetail && <div style={{color:'rgba(255,255,255,0.3)',fontSize:'12px',fontFamily:FONT,marginTop:'3px'}}>{stockDetail.exchange}</div>}
                </div>
                <button onClick={()=>{setSelectedStock(null);setChartData([]);setStockDetail(null);setChartTooltip(null)}} style={{fontSize:'20px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer'}}>×</button>
              </div>

              {/* DETAIL STATS */}
              {stockDetail && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px',padding:'16px',background:'rgba(255,255,255,0.02)',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.06)'}}>
                  {[
                    {label:lang==='tr'?'Güncel Fiyat':'Current', value:`₺${Number(stockDetail.price).toLocaleString('tr-TR')}`, color:theme.text},
                    {label:lang==='tr'?'Gün Yüksek':'Day High',  value:stockDetail.dayHigh?`₺${Number(stockDetail.dayHigh).toLocaleString('tr-TR')}`:'—', color:'#6ee7b7'},
                    {label:lang==='tr'?'Gün Düşük':'Day Low',    value:stockDetail.dayLow?`₺${Number(stockDetail.dayLow).toLocaleString('tr-TR')}`:'—', color:'#fca5a5'},
                    {label:lang==='tr'?'52H Yüksek':'52W High',  value:stockDetail.week52High?`₺${Number(stockDetail.week52High).toLocaleString('tr-TR')}`:'—', color:'#6ee7b7'},
                    {label:lang==='tr'?'52H Düşük':'52W Low',    value:stockDetail.week52Low?`₺${Number(stockDetail.week52Low).toLocaleString('tr-TR')}`:'—', color:'#fca5a5'},
                    {label:lang==='tr'?'Piyasa Değeri':'Mkt Cap', value:stockDetail.marketCap?`$${(stockDetail.marketCap/1e9).toFixed(1)}B`:'—', color:'rgba(255,255,255,0.6)'},
                    {label:lang==='tr'?'Hacim':'Volume',          value:stockDetail.volume?Number(stockDetail.volume).toLocaleString('tr-TR'):'—', color:'rgba(255,255,255,0.6)'},
                    {label:'USD/TRY',                             value:`₺${stockDetail.usdtry||'—'}`, color:'#fde68a'},
                  ].map((item,i)=>(
                    <div key={i}>
                      <div style={{color:'rgba(255,255,255,0.28)',fontSize:'10px',fontFamily:MONO,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'4px'}}>{item.label}</div>
                      <div style={{color:item.color,fontSize:'13px',fontWeight:600,fontFamily:MONO}}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CHART PERIOD SELECTOR */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{lang==='tr'?'Fiyat Grafiği':'Price Chart'}</div>
                <div style={{display:'flex',gap:'4px'}}>
                  {[['1w',lang==='tr'?'1H':'1W'],['1m',lang==='tr'?'1A':'1M'],['3m','3M'],['6m','6M'],['1y','1Y']].map(([p,label])=>(
                    <button key={p} onClick={()=>{setChartPeriod(p);fetchChart(selectedStock.symbol,p)}}
                      style={{padding:'5px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:chartPeriod===p?600:400,background:chartPeriod===p?theme.bg:'transparent',color:chartPeriod===p?theme.text:'rgba(255,255,255,0.3)',border:chartPeriod===p?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:MONO,transition:'all 0.15s'}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CANDLESTICK CHART */}
              {loadingChart ? (
                <div style={{height:'260px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.3)',fontSize:'13px',fontFamily:FONT,marginBottom:'20px'}}>
                  <div style={{width:'14px',height:'14px',borderRadius:'50%',border:`2px solid ${theme.accent}`,borderTopColor:'transparent',animation:'spin 0.8s linear infinite'}}></div>
                  {lang==='tr'?'Grafik yükleniyor...':'Loading chart...'}
                </div>
              ) : chartData.length > 0 ? (() => {
                const CHART_H = 240
                const CHART_W_PCT = 100
                const PAD_LEFT = 52
                const PAD_RIGHT = 8
                const PAD_TOP = 12
                const PAD_BOTTOM = 28
                const innerH = CHART_H - PAD_TOP - PAD_BOTTOM
                const highs = chartData.map(d=>d.high)
                const lows  = chartData.map(d=>d.low)
                const maxP  = Math.max(...highs) * 1.002
                const minP  = Math.min(...lows)  * 0.998
                const range = maxP - minP || 1
                const n     = chartData.length
                const toY   = v => PAD_TOP + ((maxP - v) / range) * innerH
                const toX   = i => PAD_LEFT + (i / n) * (100 - (PAD_LEFT + PAD_RIGHT)/1) 

                // Use pixel-based approach
                const W_PX = 800 // viewBox width
                const innerW = W_PX - PAD_LEFT - PAD_RIGHT
                const toXpx  = i => PAD_LEFT + (i + 0.5) * (innerW / n)
                const candleW = Math.max((innerW / n) * 0.65, 2)

                const yLabels = 5
                const priceTicks = Array.from({length:yLabels},(_,i)=> minP + (range * i / (yLabels-1)))
                const xTicks = [0, Math.floor(n/4), Math.floor(n/2), Math.floor(3*n/4), n-1].filter(i=>i<n)

                return (
                  <div style={{marginBottom:'20px',background:'rgba(255,255,255,0.02)',borderRadius:'12px',padding:'12px',border:'1px solid rgba(255,255,255,0.05)'}}>
                    <svg viewBox={`0 0 ${W_PX} ${CHART_H}`} width="100%" height={CHART_H} style={{overflow:'visible'}}>
                      {/* Grid lines + Y labels */}
                      {priceTicks.map((price,i)=>{
                        const y = toY(price)
                        return (
                          <g key={i}>
                            <line x1={PAD_LEFT} y1={y} x2={W_PX-PAD_RIGHT} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4"/>
                            <text x={PAD_LEFT-4} y={y} textAnchor="end" dominantBaseline="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="DM Mono">
                              {price>=1000?`₺${(price/1000).toFixed(1)}K`:`₺${price.toFixed(0)}`}
                            </text>
                          </g>
                        )
                      })}

                      {/* X axis line */}
                      <line x1={PAD_LEFT} y1={CHART_H-PAD_BOTTOM} x2={W_PX-PAD_RIGHT} y2={CHART_H-PAD_BOTTOM} stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>

                      {/* Candles */}
                      {chartData.map((d,i)=>{
                        const isGreen = d.close >= d.open
                        const col = isGreen ? '#10b981' : '#ef4444'
                        const xc  = toXpx(i)
                        const yHigh  = toY(d.high)
                        const yLow   = toY(d.low)
                        const yOpen  = toY(d.open)
                        const yClose = toY(d.close)
                        const bodyY  = Math.min(yOpen, yClose)
                        const bodyH  = Math.max(Math.abs(yClose - yOpen), 1.5)
                        const isHovered = chartTooltip?.i === i
                        return (
                          <g key={i}
                            onMouseEnter={()=>setChartTooltip({i, d, xc, yClose})}
                            onMouseLeave={()=>setChartTooltip(null)}
                            style={{cursor:'crosshair'}}>
                            {/* Hover hit area */}
                            <rect x={xc - candleW/2 - 2} y={PAD_TOP} width={candleW+4} height={innerH} fill="transparent"/>
                            {/* Hover line */}
                            {isHovered && <line x1={xc} y1={PAD_TOP} x2={xc} y2={CHART_H-PAD_BOTTOM} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3"/>}
                            <line x1={xc} y1={yHigh} x2={xc} y2={yLow} stroke={isHovered?col:'rgba(255,255,255,0.6)'} strokeWidth={isHovered?1.5:1.2} opacity="0.8"/>
                            <rect x={xc - candleW/2} y={bodyY} width={candleW} height={bodyH}
                              fill={isGreen ? '#10b981' : '#ef4444'}
                              fillOpacity={isHovered ? 1 : 0.85}
                              stroke={col} strokeWidth={isHovered?1.5:0.5}
                              rx="1.5"
                            />
                          </g>
                        )
                      })}

                      {/* TOOLTIP */}
                      {chartTooltip && (() => {
                        const {i, d, xc} = chartTooltip
                        const isGreen = d.close >= d.open
                        const boxW = 160, boxH = 90
                        const boxX = xc + candleW > W_PX - boxW - 10 ? xc - boxW - 8 : xc + 8
                        const boxY = PAD_TOP + 4
                        return (
                          <g>
                            <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="8" fill="#0f0f1a" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                            <text x={boxX+10} y={boxY+16} fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="DM Mono">{new Date(d.time).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'2-digit'})}</text>
                            {[
                              ['A',  d.open,  isGreen?'#6ee7b7':'#fca5a5'],
                              ['K',  d.close, isGreen?'#10b981':'#ef4444'],
                              ['Y',  d.high,  '#6ee7b7'],
                              ['D',  d.low,   '#fca5a5'],
                            ].map(([label, val, col], idx) => (
                              <g key={label}>
                                <text x={boxX+10} y={boxY+32+idx*14} fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="DM Mono">{label}</text>
                                <text x={boxX+28} y={boxY+32+idx*14} fill={col} fontSize="10" fontFamily="DM Mono" fontWeight="600">
                                  {val>=1000?`₺${val.toLocaleString('tr-TR',{maximumFractionDigits:0})}`:`₺${val.toFixed(2)}`}
                                </text>
                              </g>
                            ))}
                          </g>
                        )
                      })()}

                      {/* X axis date labels */}
                      {xTicks.map(i=>(
                        <text key={i} x={toXpx(i)} y={CHART_H-PAD_BOTTOM+14} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="DM Mono">
                          {new Date(chartData[i].time).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'})}
                        </text>
                      ))}
                    </svg>
                  </div>
                )
              })() : (
                <div style={{height:'160px',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT,marginBottom:'20px'}}>{lang==='tr'?'Grafik verisi yok':'No chart data'}</div>
              )}

            </Card>
          )}
        </>
      )}

      {/* ── FOREX & GOLD TAB ── */}
      {activeTab==='fx' && (
        <>
          {/* LIVE RATES */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
            {FX_ITEMS.map(fx=>{
              const rate = fxRates[fx.symbol]
              const change = rate?.change||0
              const changePos = change>=0
              return (
                <Card key={fx.symbol} accent={theme.accent} style={{padding:'18px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{fontSize:'22px'}}>{fx.icon}</span>
                      <div>
                        <div style={{color:'#f5f5f7',fontSize:'14px',fontWeight:700,fontFamily:FONT}}>{fx.label}</div>
                        <div style={{color:'rgba(255,255,255,0.3)',fontSize:'10px',fontFamily:MONO}}>{fx.code}/TRY</div>
                      </div>
                    </div>
                    {rate && (
                      <div style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:'8px',background:changePos?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)'}}>
                        <span style={{fontSize:'11px',color:changePos?'#6ee7b7':'#fca5a5',fontWeight:700,...VAL}}>{changePos?'▲':'▼'} {Math.abs(change).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                  {loadingFx ? (
                    <div style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',fontFamily:MONO}}>...</div>
                  ) : rate ? (
                    <div>
                      <div style={{color:fx.color,fontSize:'20px',fontWeight:700,...VAL}}>₺{Number(rate.price).toLocaleString('tr-TR',{maximumFractionDigits:2})}</div>
                      {fx.unit && <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:FONT,marginTop:'2px'}}>/ {fx.unit}</div>}
                    </div>
                  ) : (
                    <div style={{color:'rgba(255,255,255,0.2)',fontSize:'13px',fontFamily:FONT}}>—</div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* MY FX POSITIONS */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:'14px',fontWeight:600,fontFamily:FONT}}>{lang==='tr'?'Portföyüm':'My Portfolio'}</div>
            <AddBtn theme={theme} label={lang==='tr'?'+ Ekle':'+ Add'} onClick={()=>setFxAdding(!fxAdding)} />
          </div>

          {fxAdding && (
            <Card accent={theme.accent} style={{padding:'22px',marginBottom:'16px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'14px'}}>
                <div>
                  <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Tür':'Type'}</div>
                  <select value={fxForm.type} onChange={e=>setFxForm({...fxForm,type:e.target.value})}
                    style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(30,30,50,0.9)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,cursor:'pointer'}}>
                    {FX_ITEMS.map(fx=>(
                      <option key={fx.symbol} value={fx.symbol}>{fx.icon} {fx.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Miktar':'Amount'}</div>
                  <div style={{position:'relative'}}>
                    <input type="number" value={fxForm.amount} onChange={e=>setFxForm({...fxForm,amount:e.target.value})} placeholder={lang==='tr'?'1000 (gram/adet)':'1000 (units)'}
                      style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
                  </div>
                </div>
                <div>
                  <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Alış Kuru (₺)':'Buy Rate (₺)'}</div>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:MONO}}>₺</span>
                    <input type="number" value={fxForm.buyRate} onChange={e=>setFxForm({...fxForm,buyRate:e.target.value})} placeholder="32.50"
                      style={{width:'100%',padding:'10px 14px 10px 26px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT}} />
                  </div>
                </div>
              </div>
              {fxForm.amount && fxForm.buyRate && GOLD_GRAMS[fxForm.type] && (
                <div style={{padding:'10px 14px',borderRadius:'10px',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',marginBottom:'12px',fontSize:'12px',color:'#fde68a',fontFamily:FONT}}>
                  💡 {fxForm.amount} adet × {GOLD_GRAMS[fxForm.type]}g = <strong>{(parseFloat(fxForm.amount)*GOLD_GRAMS[fxForm.type]).toFixed(3)}g</strong> altın · Toplam maliyet: <strong>₺{(parseFloat(fxForm.amount)*parseFloat(fxForm.buyRate)).toFixed(2)}</strong>
                </div>
              )}
              <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
                <button onClick={()=>setFxAdding(false)} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'İptal':'Cancel'}</button>
                <button onClick={addFx} disabled={!fxForm.amount||!fxForm.buyRate} style={{padding:'9px 18px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',opacity:!fxForm.amount||!fxForm.buyRate?0.4:1,fontFamily:FONT}}>{lang==='tr'?'Kaydet':'Save'}</button>
              </div>
            </Card>
          )}

          {fxInvestments.length > 0 && (
            <>
              <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
                <StatCard accent={theme.accent} label={lang==='tr'?'Toplam Değer':'Total Value'} value={`₺${totalFxValue.toFixed(0)}`} color={theme.text} icon="💰" />
                <StatCard accent={theme.accent} label={lang==='tr'?'Toplam Maliyet':'Total Cost'} value={`₺${totalFxCost.toFixed(0)}`} color="rgba(255,255,255,0.6)" icon="💸" />
                <StatCard accent={theme.accent} label={lang==='tr'?'Kar/Zarar':'Gain/Loss'} value={`${totalFxGain>=0?'+':''}₺${totalFxGain.toFixed(0)}`} color={totalFxGain>=0?'#6ee7b7':'#fca5a5'} icon={totalFxGain>=0?'📈':'📉'} />
              </div>
              <Card accent={theme.accent} style={{padding:'22px'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    {[lang==='tr'?'Varlık':'Asset',lang==='tr'?'Miktar':'Amount',lang==='tr'?'Alış Kuru':'Buy Rate',lang==='tr'?'Güncel Kur':'Current',lang==='tr'?'Değer':'Value',lang==='tr'?'Kar/Zarar':'G/L',''].map(h=>(
                      <th key={h} style={{...TIP,textAlign:'left',paddingBottom:'10px',fontWeight:500}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {fxInvestments.map((inv,i)=>{
                      const fx = FX_ITEMS.find(f=>f.symbol===inv.symbol)
                      const currentRate = fxRates[inv.symbol]?.price || inv.currentPrice
                      const val = inv.shares * currentRate
                      const cost = inv.shares * inv.buyPrice
                      const gain = val - cost
                      const gp = cost>0?((gain/cost)*100).toFixed(1):0
                      return (
                        <tr key={inv.id||i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                          <td style={{padding:'12px 8px 12px 0'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                              <span style={{fontSize:'18px'}}>{fx?.icon||'💱'}</span>
                              <div style={{color:'#f5f5f7',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>{inv.name}</div>
                            </div>
                          </td>
                          <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>{inv.shares}</td>
                          <td style={{padding:'12px 8px',...VAL,color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>₺{Number(inv.buyPrice).toFixed(2)}</td>
                          <td style={{padding:'12px 8px',...VAL,color:fx?.color||theme.text,fontSize:'13px',fontWeight:700}}>₺{currentRate.toFixed(2)}</td>
                          <td style={{padding:'12px 8px',...VAL,color:theme.text,fontSize:'13px',fontWeight:700}}>₺{val.toFixed(0)}</td>
                          <td style={{padding:'12px 8px'}}>
                            <div style={{...VAL,color:gain>=0?'#6ee7b7':'#fca5a5',fontSize:'13px',fontWeight:700}}>{gain>=0?'+':''}₺{gain.toFixed(0)}</div>
                            <div style={{...VAL,color:gain>=0?'rgba(110,231,183,0.5)':'rgba(252,165,165,0.5)',fontSize:'11px'}}>{gp}%</div>
                          </td>
                          <td style={{padding:'12px 0'}}><button onClick={()=>del(inv.id||i)} style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',color:'rgba(255,255,255,0.28)',background:'transparent',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',fontFamily:FONT}}>×</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {fxInvestments.length === 0 && !fxAdding && (
            <Card accent={theme.accent} style={{padding:'40px',textAlign:'center'}}>
              <div style={{fontSize:'36px',marginBottom:'12px'}}>💱</div>
              <div style={{color:'rgba(255,255,255,0.4)',fontSize:'14px',fontFamily:FONT,marginBottom:'16px'}}>{lang==='tr'?'Henüz döviz veya altın eklenmedi.':'No forex or gold positions yet.'}</div>
              <AddBtn theme={theme} label={lang==='tr'?'+ İlk Pozisyonu Ekle':'+ Add First Position'} onClick={()=>setFxAdding(true)} />
            </Card>
          )}
        </>
      )}
    </div>
  )
}


function BalancePage({ theme, income, totalIncome, totalExp, totalSubs, netBal, userId, onRefresh, currency='TRY', currencyRate=1, currencySymbol='₺', lang='en' }) {
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
          {currencySymbol}{(Math.abs(netBal)/currencyRate).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
        </div>
        <div style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',marginBottom:'24px',fontFamily:FONT}}>{lang==='tr'?(netBal>=0?'↑ Bu ay net pozitifsiniz':'↓ Harcamalar geliri aşıyor'):(netBal>=0?lang==='tr'?'↑ Bu ay net pozitifsiniz':'↑ You are net positive this month':lang==='tr'?'↓ Harcamalar geliri aşıyor':'↓ Spending exceeds income')}</div>
        <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',paddingTop:'20px',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
          {[[lang==='tr'?'Toplam Gelir':'Total Income',`${currencySymbol}${(totalIncome/currencyRate).toFixed(2)}`,'#6ee7b7'],[lang==='tr'?'Toplam Gider':'Total Expenses',`${currencySymbol}${((totalExp+totalSubs)/currencyRate).toFixed(2)}`,'#fca5a5'],[lang==='tr'?'Tasarruf Oranı':'Savings Rate',`${sr}%`,sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5']].map(([l,v,c])=>(
            <div key={l}><div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',marginBottom:'4px',fontFamily:FONT}}>{l}</div><div style={{color:c,fontSize:'20px',fontWeight:700,...VAL}}>{v}</div></div>
          ))}
        </div>
      </Card>
      {adding && (
        <Card accent={theme.accent} style={{padding:'22px',marginBottom:'18px'}}>
          <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'14px'}}>
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{lang==='tr'?'Kaynak':'Source'}</div><select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(30,30,50,0.9)',border:'1px solid rgba(255,255,255,0.09)',color:form.source?'#f5f5f7':'rgba(255,255,255,0.3)',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT,cursor:'pointer',appearance:'none',backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,backgroundRepeat:'no-repeat',backgroundPosition:'right 14px center'}}><option value="" disabled>{lang==='tr'?'Kaynak seçin...':'Select source...'}</option><option value={lang==='tr'?'Maaş':'Salary'}>{lang==='tr'?'💼 Maaş':'💼 Salary'}</option><option value={lang==='tr'?'Freelance':'Freelance'}>{lang==='tr'?'💻 Freelance':'💻 Freelance'}</option><option value={lang==='tr'?'Ürün Satışı':'Product Sale'}>{lang==='tr'?'📦 Ürün Satışı':'📦 Product Sale'}</option><option value={lang==='tr'?'Kira Geliri':'Rental Income'}>{lang==='tr'?'🏠 Kira Geliri':'🏠 Rental Income'}</option><option value={lang==='tr'?'Yatırım Getirisi':'Investment Return'}>{lang==='tr'?'📈 Yatırım Getirisi':'📈 Investment Return'}</option><option value={lang==='tr'?'Temettü':'Dividend'}>{lang==='tr'?'💰 Temettü':'💰 Dividend'}</option><option value={lang==='tr'?'Proje Ödemesi':'Project Payment'}>{lang==='tr'?'🎯 Proje Ödemesi':'🎯 Project Payment'}</option><option value={lang==='tr'?'İkramiye':'Bonus'}>{lang==='tr'?'🎁 İkramiye':'🎁 Bonus'}</option><option value={lang==='tr'?'Diğer':'Other'}>{lang==='tr'?'📌 Diğer':'📌 Other'}</option></select></div>
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{lang==='tr'?'Miktar (₺)':'Amount (₺)'}</div><div style={{position:'relative'}}><span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'13px',fontFamily:MONO}}>₺</span><input type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00" style={{width:'100%',padding:'10px 14px 10px 28px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:MONO}} /></div></div>
            <div><div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:'rgba(255,255,255,0.25)',marginBottom:'6px'}}>{lang==='tr'?'Tarih':'Date'}</div><input type="date" value={form.income_date} onChange={e=>setForm({...form,income_date:e.target.value})} style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:FONT,colorScheme:'dark'}} /></div>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)"/>
                <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.3)',fontSize:11,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.3)',fontSize:10,fontFamily:FONT}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>`₺${v}`} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle}/>
                <Bar dataKey="amount" radius={[6,6,0,0]}>{incomeData.map((_,i)=><Cell key={i} fill={theme.chart[i%5]} strokeWidth={0}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{height:'200px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',color:'rgba(255,255,255,0.15)',fontSize:'13px',fontFamily:FONT}}><span style={{fontSize:'28px',opacity:0.4}}>📊</span>Henüz veri yok</div>}
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
            {income.length===0 ? <tr><td colSpan={4} style={{textAlign:'center',padding:'60px 20px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}><div style={{fontSize:'36px',opacity:0.6}}>💰</div><div style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',fontWeight:500,fontFamily:FONT}}>Henüz gelir girilmedi</div><div style={{color:'rgba(255,255,255,0.18)',fontSize:'12px',fontFamily:FONT}}>İlk gelirini eklemek için + butonuna tıkla</div></div></td></tr>
            : income.map(i=>(
              <tr key={i.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.05)';e.currentTarget.style.borderRadius='8px'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                <td style={{padding:'12px 0',color:'#f5f5f7',fontSize:'13px',fontWeight:500,fontFamily:FONT}}>{i.source}</td>
                <td style={{padding:'12px 0',...VAL,color:theme.text,fontSize:'13px'}}>+{currencySymbol}{(Number(i.amount)/currencyRate).toFixed(2)}</td>
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
function GoalsPage({ theme, expenses, totalExp, totalSubs, totalIncome, userId='', lang='en' }) {
  const now = new Date()
  const today = now.getDate()
  const monthName = now.toLocaleString(lang==='tr'?'tr-TR':'en-US',{month:'long',year:'numeric'})
  const [completedDays, setCompletedDays] = useState(() => { try { return JSON.parse(localStorage.getItem(`burnrate_completed_days_${userId}`)||'[]') } catch { return [] } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [aiTasks, setAiTasks] = useState({})
  const [completedTasks, setCompletedTasks] = useState(() => { try { return JSON.parse(localStorage.getItem(`burnrate_completed_tasks_${userId}`)||'{}') } catch { return {} } })
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationDay, setCelebrationDay] = useState(null)

  const streak = (() => { let s=0; for(let i=today;i>=1;i--){if(completedDays.includes(i))s++;else break}; return s })()
  const badges = [{days:3,icon:'🌱',label:lang==='tr'?'Başlangıç':'Beginner',color:'#10b981'},{days:7,icon:'🔥',label:lang==='tr'?'Kararlı':'Committed',color:'#f59e0b'},{days:14,icon:'⚡',label:lang==='tr'?'Güçlü':'Strong',color:'#06b6d4'},{days:21,icon:'💎',label:lang==='tr'?'Disiplinli':'Disciplined',color:'#8b5cf6'},{days:30,icon:'👑',label:lang==='tr'?'Şampiyon':'Champion',color:'#f59e0b'}]
  const earnedBadges = badges.filter(b=>completedDays.length>=b.days)
  const nextBadge = badges.find(b=>completedDays.length<b.days)
  const avgDailyExp = totalExp>0?totalExp/30:0
  const savedEstimate = Math.round(completedDays.length*avgDailyExp*0.15)
  const completedCount = completedDays.length
  const streakPct = Math.round(completedCount/Math.max(today,1)*100)

  const R = '244,63,94'
  const Rcolor = '#f43f5e'
  const Rsoft = `rgba(${R},0.12)`
  const Rdim = `rgba(${R},0.4)`

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
    setCompletedTasks(updated); localStorage.setItem(`burnrate_completed_tasks_${userId}`,JSON.stringify(updated))
  }

  function completeDay(day) {
    if (!completedDays.includes(day)) {
      const u=[...completedDays,day]
      setCompletedDays(u)
      localStorage.setItem(`burnrate_completed_days_${userId}`,JSON.stringify(u))
      setCelebrationDay(day)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3500)
    }
    setSelectedDay(null)
  }

  const dayTasks = selectedDay ? (aiTasks[selectedDay]||DAILY_TASKS[(selectedDay-1)%DAILY_TASKS.length]) : []

  return (
    <div className="page-pad" style={{padding:'36px'}}>

      {showCelebration && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
          <div style={{background:'linear-gradient(135deg,rgba(244,63,94,0.95),rgba(124,58,237,0.95))',borderRadius:'28px',padding:'40px 56px',textAlign:'center',animation:'fadeIn 0.3s ease',boxShadow:`0 0 100px rgba(244,63,94,0.5), 0 0 0 1px rgba(244,63,94,0.3)`}}>
            <div style={{fontSize:'56px',marginBottom:'14px'}}>🎉</div>
            <div style={{color:'#fff',fontSize:'24px',fontWeight:800,fontFamily:FONT,marginBottom:'8px',letterSpacing:'-0.5px'}}>{lang==='tr'?`${celebrationDay}. Gün Tamamlandı!`:`Day ${celebrationDay} Complete!`}</div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:'14px',fontFamily:FONT}}>{streak>1?(lang==='tr'?`${streak} günlük seri! 🔥`:`${streak} day streak! 🔥`):(lang==='tr'?'Harika iş! 💪':'Great work! 💪')}</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{marginBottom:'28px'}}>
        <h1 style={{color:'#fda4af',fontSize:'24px',fontWeight:800,letterSpacing:'-0.5px',margin:0,marginBottom:'4px',fontFamily:FONT}}>🎯 {lang==='tr'?'30 Günlük Finansal Meydan Okuma':'30-Day Financial Challenge'}</h1>
        <p style={{color:`rgba(${R},0.4)`,fontSize:'13px',margin:0,fontFamily:MONO,letterSpacing:'0.5px'}}>{monthName} — {lang==='tr'?'bir gün seç, AI görevlerini gör':'tap a day to see your AI tasks'}</p>
      </div>

      {/* STREAK BANNER */}
      <div style={{
        background:'linear-gradient(135deg, rgba(244,63,94,0.22) 0%, rgba(124,58,237,0.15) 100%)',
        border:'1px solid rgba(244,63,94,0.5)',
        borderRadius:'24px',
        padding:'24px 28px',
        marginBottom:'14px',
        display:'flex',
        alignItems:'center',
        justifyContent:'space-between',
        flexWrap:'wrap',
        gap:'20px',
        position:'relative',
        overflow:'hidden',
        boxShadow:'0 0 60px rgba(244,63,94,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
      }}>
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,rgba(${R},0.4),transparent)`}}></div>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          <div style={{
            width:'72px',height:'72px',borderRadius:'20px',
            background:"linear-gradient(135deg, rgba(244,63,94,0.3), rgba(244,63,94,0.12))",
            border:"1px solid rgba(244,63,94,0.5)",
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'32px',
            boxShadow:"0 0 30px rgba(244,63,94,0.3)"
          }}>
            {streak>=21?'👑':streak>=14?'💎':streak>=7?'⚡':streak>=3?'🔥':streak>=1?'✨':'🎯'}
          </div>
          <div>
            <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:Rdim,marginBottom:'6px'}}>{lang==='tr'?'Güncel Seri':'Current Streak'}</div>
            <div style={{color:'#fff',fontSize:'52px',fontWeight:800,fontFamily:FONT,letterSpacing:'-1.5px',lineHeight:1}}>{streak} <span style={{fontSize:'18px',color:'rgba(255,255,255,0.5)',fontWeight:500}}>{lang==='tr'?'gün':'days'}</span></div>
          </div>
        </div>
        <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
          {nextBadge && (
            <div style={{textAlign:'center',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'14px 20px'}}>
              <div style={{color:'rgba(255,255,255,0.25)',fontSize:'9px',fontFamily:MONO,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>{lang==='tr'?'Sıradaki Rozet':'Next Badge'}</div>
              <div style={{fontSize:'28px',marginBottom:'4px'}}>{nextBadge.icon}</div>
              <div style={{color:nextBadge.color,fontSize:'12px',fontWeight:700}}>{nextBadge.days - completedDays.length} {lang==='tr'?'gün':'days'}</div>
            </div>
          )}
          {savedEstimate > 0 && (
            <div style={{textAlign:'center',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'16px',padding:'14px 20px'}}>
              <div style={{color:'rgba(16,185,129,0.5)',fontSize:'9px',fontFamily:MONO,letterSpacing:'1px',textTransform:'uppercase',marginBottom:'8px'}}>{lang==='tr'?'Tahmini Tasarruf':'Est. Savings'}</div>
              <div style={{color:'#6ee7b7',fontSize:'22px',fontWeight:800,fontFamily:MONO,letterSpacing:'-0.5px'}}>+₺{savedEstimate}</div>
            </div>
          )}
        </div>
      </div>

      {/* EARNED BADGES */}
      {earnedBadges.length > 0 && (
        <div style={{background:`rgba(${R},0.04)`,border:`1px solid rgba(${R},0.12)`,borderRadius:'18px',padding:'16px 20px',marginBottom:'14px'}}>
          <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:Rdim,marginBottom:'12px'}}>{lang==='tr'?'Kazanılan Rozetler':'Earned Badges'}</div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            {earnedBadges.map((b,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 16px',borderRadius:'100px',background:`rgba(${hexToRgb(b.color)},0.1)`,border:`1px solid ${b.color}44`}}>
                <span style={{fontSize:'18px'}}>{b.icon}</span>
                <div>
                  <div style={{color:b.color,fontSize:'12px',fontWeight:700,fontFamily:FONT}}>{b.label}</div>
                  <div style={{color:'rgba(255,255,255,0.25)',fontSize:'10px',fontFamily:MONO}}>{b.days} {lang==='tr'?'gün':'days'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
        {[
          {label:lang==='tr'?'Tamamlanan Gün':'Days Completed', val:completedCount, sub:lang==='tr'?`${today} günden beri`:`of ${today} days`, color:'#fda4af', icon:'✅'},
          {label:lang==='tr'?'Tamamlama Oranı':'Completion Rate', val:`${streakPct}%`, sub:streakPct>=80?lang==='tr'?'Muhteşem!':'Outstanding!':streakPct>=50?lang==='tr'?'Devam et!':'Keep going!':lang==='tr'?'Yapabilirsin!':'You can do it!', color:streakPct>=80?'#6ee7b7':streakPct>=50?'#fde68a':'#fca5a5', icon:'🔥'},
          {label:lang==='tr'?'Kalan Gün':'Days Remaining', val:30-today, sub:lang==='tr'?'ay sonuna kadar':'until month end', color:'rgba(255,255,255,0.4)', icon:'📅'},
        ].map((s,i)=>(
          <div key={i}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.008)';e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${R},0.32), 0 14px 44px rgba(${R},0.1)`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${R},0.15), inset 0 1px 0 rgba(${R},0.12), 0 4px 24px rgba(0,0,0,0.55)`}}
            style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.25)',borderRadius:'20px',padding:'22px',position:'relative',overflow:'hidden',boxShadow:`0 0 0 1px rgba(${R},0.15), inset 0 1px 0 rgba(${R},0.12), 0 4px 24px rgba(0,0,0,0.55)`,transition:'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease',cursor:'default'}}>
            <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,rgba(${R},0.2),transparent)`}}></div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'}}>
              <div style={{fontFamily:MONO,fontSize:'9.5px',letterSpacing:'1.8px',textTransform:'uppercase',color:Rdim}}>{s.label}</div>
              <div style={{width:'31px',height:'31px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',background:'rgba(244,63,94,0.2)',border:'1px solid rgba(244,63,94,0.4)'}}>{s.icon}</div>
            </div>
            <div style={{color:s.color,fontSize:'28px',fontWeight:800,letterSpacing:'-1.2px',lineHeight:1,marginBottom:'8px',fontFamily:FONT}}>{s.val}</div>
            <div style={{color:`rgba(${R},0.4)`,fontSize:'11.5px',fontFamily:FONT}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* CALENDAR */}
      <div
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${R},0.32), 0 14px 44px rgba(${R},0.1)`}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 0 0 1px rgba(${R},0.15), inset 0 1px 0 rgba(${R},0.12), 0 4px 24px rgba(0,0,0,0.55)`}}
        style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(244,63,94,0.2)',borderRadius:'20px',padding:'24px',marginBottom:'16px',position:'relative',overflow:'hidden',boxShadow:`0 0 0 1px rgba(${R},0.15), inset 0 1px 0 rgba(${R},0.12), 0 4px 24px rgba(0,0,0,0.55)`,transition:'box-shadow 0.22s ease'}}>
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,rgba(${R},0.25),transparent)`}}></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <div style={{color:`rgba(${R},0.6)`,fontSize:'12px',fontWeight:600,fontFamily:FONT}}>{lang==='tr'?'Bir gün seç':'Select a day'}</div>
          <div style={{background:Rsoft,border:`1px solid rgba(${R},0.3)`,borderRadius:'100px',padding:'5px 14px',fontSize:'11px',color:'#fda4af',fontWeight:700,fontFamily:MONO}}>{completedCount}/30</div>
        </div>
        {/* PROGRESS */}
        <div style={{marginBottom:'18px'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:`rgba(${R},0.4)`,fontFamily:MONO,marginBottom:'6px',letterSpacing:'0.5px'}}>
            <span>{lang==='tr'?'İlerleme':'Progress'}</span>
            <span>{Math.round(completedCount/30*100)}%</span>
          </div>
          <div style={{height:'6px',borderRadius:'100px',background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:'100px',width:`${Math.round(completedCount/30*100)}%`,background:`linear-gradient(90deg,${Rcolor},rgba(${R},0.6))`,boxShadow:`0 0 10px rgba(${R},0.4)`,transition:'width 0.5s ease'}}></div>
          </div>
        </div>
        {/* DAY GRID */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(10,1fr)',gap:'8px'}}>
          {Array.from({length:30},(_,i)=>i+1).map(day => {
            const isCompleted=completedDays.includes(day)
            const isToday=day===today
            const isPast=day<=today
            const isSelected=selectedDay===day
            return (
              <button key={day} onClick={()=>isPast&&loadTasksForDay(day)}
                onMouseEnter={e=>{
                  if(isPast&&!isCompleted&&!isSelected){
                    e.currentTarget.style.transform='scale(1.15) translateY(-4px)'
                    e.currentTarget.style.background='rgba(244,63,94,0.3)'
                    e.currentTarget.style.boxShadow='inset 0 0 0 2px rgba(244,63,94,0.9), 0 0 30px rgba(244,63,94,0.4)'
                    e.currentTarget.style.color='#fff'
                  }
                }}
                onMouseLeave={e=>{
                  if(isPast&&!isCompleted&&!isSelected){
                    e.currentTarget.style.transform=isSelected?'scale(1.08)':'scale(1)'
                    e.currentTarget.style.background=isToday?'rgba(244,63,94,0.25)':'rgba(255,255,255,0.08)'
                    e.currentTarget.style.boxShadow=isToday?'inset 0 0 0 2px rgba(244,63,94,0.8), 0 0 20px rgba(244,63,94,0.3)':'inset 0 0 0 1.5px rgba(255,255,255,0.15)'
                    e.currentTarget.style.color=isToday?'#fda4af':'rgba(255,255,255,0.8)'
                  }
                }}
                style={{
                  aspectRatio:'1',
                  borderRadius:'50%',
                  fontSize:'14px',
                  fontWeight:700,
                  background:isCompleted?'linear-gradient(135deg,#f43f5e,#be123c)':isSelected?'rgba(244,63,94,0.25)':isToday?'rgba(244,63,94,0.25)':isPast?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.03)',
                  boxShadow:isCompleted?'0 0 0 0 transparent, 0 6px 20px rgba(244,63,94,0.5)':isSelected?`0 0 0 2px ${Rcolor}, 0 6px 20px rgba(${R},0.2)`:isToday?'inset 0 0 0 2px rgba(244,63,94,0.8), 0 0 20px rgba(244,63,94,0.3)':isPast?'inset 0 0 0 1.5px rgba(255,255,255,0.15)':'inset 0 0 0 1px rgba(255,255,255,0.07)',
                  color:isCompleted?'#fff':isToday?'#fda4af':isPast?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.2)',
                  cursor:isPast?'pointer':'not-allowed',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                  fontFamily:FONT,
                  transform:isSelected?'scale(1.08)':'scale(1)'
                }}>
                {isCompleted?'✓':day}
              </button>
            )
          })}
        </div>
      </div>

      {/* TASK PANEL */}
      {selectedDay && (
        <div
          style={{background:`rgba(${R},0.04)`,borderRadius:'20px',padding:'24px',position:'relative',overflow:'hidden',boxShadow:`0 0 0 1px rgba(${R},0.2), inset 0 1px 0 rgba(${R},0.12), 0 8px 32px rgba(${R},0.08)`,animation:'fadeIn 0.25s ease'}}>
          <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,rgba(${R},0.3),transparent)`}}></div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
            <div>
              <div style={{color:'#fda4af',fontSize:'18px',fontWeight:800,fontFamily:FONT,letterSpacing:'-0.3px'}}>{lang==='tr'?`${selectedDay}. Gün Görevleri`:`Day ${selectedDay} Tasks`}</div>
              <div style={{color:`rgba(${R},0.4)`,fontSize:'11px',marginTop:'3px',fontFamily:MONO,letterSpacing:'0.5px'}}>{lang==='tr'?'yapay zeka tarafından · 3 görevi tamamla':'AI-generated · complete all 3 tasks'}</div>
            </div>
            <button onClick={()=>setSelectedDay(null)} style={{fontSize:'20px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer',lineHeight:1,transition:'color 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#fda4af'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>×</button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'24px'}}>
            {loadingTasks ? (
              <div style={{display:'flex',gap:'12px',alignItems:'center',padding:'24px',color:`rgba(${R},0.5)`,fontSize:'13px',fontFamily:FONT}}>
                <div style={{width:'18px',height:'18px',borderRadius:'50%',border:`2px solid rgba(${R},0.3)`,borderTop:`2px solid ${Rcolor}`,animation:'spin 0.8s linear infinite',flexShrink:0}}></div>
                {lang==='tr'?'Yapay zeka görevlerin hazırlanıyor...':'AI is crafting your tasks...'}
              </div>
            ) : dayTasks.map((task,idx) => {
              const done = completedTasks[`${selectedDay}-${idx}`]
              return (
                <div key={idx} onClick={()=>toggleTask(selectedDay,idx)}
                  onMouseEnter={e=>{if(!done)e.currentTarget.style.background=`rgba(${R},0.08)`}}
                  onMouseLeave={e=>{if(!done)e.currentTarget.style.background=done?`rgba(${R},0.1)`:'rgba(255,255,255,0.02)'}}
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px',borderRadius:'14px',background:done?`rgba(${R},0.1)`:'rgba(255,255,255,0.02)',border:done?`1px solid rgba(${R},0.3)`:'1px solid rgba(255,255,255,0.06)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{width:'26px',height:'26px',borderRadius:'9px',flexShrink:0,background:done?Rcolor:'transparent',border:done?'none':`1.5px solid rgba(${R},0.3)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',color:'#fff',fontWeight:700,transition:'all 0.15s'}}>{done?'✓':''}</div>
                  <span style={{fontSize:'14px',color:done?'#fda4af':'rgba(255,255,255,0.75)',fontWeight:done?600:400,fontFamily:FONT,flex:1,lineHeight:'1.4'}}>{task}</span>
                  {done && <span style={{fontSize:'10px',color:`rgba(${R},0.5)`,fontFamily:MONO,letterSpacing:'1px'}}>{lang==='tr'?'TAMAM':'DONE'}</span>}
                </div>
              )
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'16px',borderTop:`1px solid rgba(${R},0.12)`}}>
            <div style={{fontSize:'12px',color:`rgba(${R},0.4)`,fontFamily:MONO}}>{dayTasks.filter((_,idx)=>completedTasks[`${selectedDay}-${idx}`]).length}/{dayTasks.length} {lang==='tr'?'tamamlandı':'completed'}</div>
            <button onClick={()=>completeDay(selectedDay)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.filter='brightness(1.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.filter=''}}
              style={{padding:'12px 28px',borderRadius:'14px',fontSize:'14px',fontWeight:700,background:completedDays.includes(selectedDay)?'rgba(16,185,129,0.15)':`linear-gradient(135deg,${Rcolor},rgba(${R},0.7))`,color:completedDays.includes(selectedDay)?'#6ee7b7':'#fff',border:completedDays.includes(selectedDay)?'1px solid rgba(16,185,129,0.3)':'none',cursor:'pointer',fontFamily:FONT,transition:'transform 0.2s cubic-bezier(.34,1.56,.64,1), filter 0.18s',boxShadow:completedDays.includes(selectedDay)?'none':`0 4px 20px rgba(${R},0.35), inset 0 1px 0 rgba(255,255,255,0.15)`}}>
              {completedDays.includes(selectedDay)?lang==='tr'?'✓ Gün Tamamlandı!':'✓ Day Completed!':lang==='tr'?'🎯 Günü Tamamla →':'🎯 Complete Day →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MONTHLY SUMMARY MODAL ─────────────────────────────────────────
function MonthlySummaryModal({ onClose, userId, lang, FONT, MONO, investments=[] }) {
  const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'

  const now = new Date()
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
      label: d.toLocaleString(lang==='tr'?'tr-TR':'en-US',{month:'long',year:'numeric'})
    }
  })

  const [selectedMonth, setSelectedMonth] = React.useState(months[0].key)
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState({ expenses:[], income:[], subs:[], investments:[] })
  const [liveInvPrices, setLiveInvPrices] = React.useState({})

  React.useEffect(() => { loadMonthData(selectedMonth) }, [selectedMonth])

  React.useEffect(()=>{
    if(!investments||investments.length===0) return
    async function fetchLivePrices(){
      try {
        const results = await Promise.all(
          investments.filter(i=>i.type!=='fx').map(inv=>
            fetch(`/api/stocks?symbol=${inv.symbol}`)
              .then(r=>r.json())
              .then(data=>({symbol:inv.symbol,price:parseFloat(data.price||0)}))
              .catch(()=>({symbol:inv.symbol,price:0}))
          )
        )
        const prices = {}
        results.forEach(({symbol,price})=>{ if(price>0) prices[symbol]=price })
        setLiveInvPrices(prices)
      } catch(e){}
    }
    fetchLivePrices()
    const interval = setInterval(fetchLivePrices, 5000)
    return ()=>clearInterval(interval)
  },[investments.length])

  async function loadMonthData(month) {
    setLoading(true)
    const [year, m] = month.split('-')
    const start = `${year}-${m}-01`
    const lastDay = new Date(parseInt(year), parseInt(m), 0).getDate()
    const end = `${year}-${m}-${lastDay}`
    console.log('Loading month:', month, 'start:', start, 'end:', end)
    try {
      const [expWithDate, expNoDate, inc, sub] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/expenses?user_id=eq.${userId}&expense_date=gte.${start}&expense_date=lte.${end}&select=*`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}}).then(r=>r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/expenses?user_id=eq.${userId}&expense_date=is.null&select=*`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}}).then(r=>r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/income?user_id=eq.${userId}&income_date=gte.${start}&income_date=lte.${end}&select=*`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}}).then(r=>r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${userId}&select=*`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}}).then(r=>r.json()),
      ])
      const exp = [...(Array.isArray(expWithDate)?expWithDate:[]), ...(Array.isArray(expNoDate)?expNoDate:[])]
      console.log('Expenses:', exp)
      console.log('Income:', inc)
      setData({
        expenses: Array.isArray(exp)?exp:[],
        income: Array.isArray(inc)?inc:[],
        subs: Array.isArray(sub)?sub:[],
      })
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const totalIncome = data.income.reduce((a,i)=>a+Number(i.amount),0)
  const totalExp = data.expenses.reduce((a,e)=>a+Number(e.amount),0)
  const netBal = totalIncome - totalExp

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#0a0414',border:'1px solid rgba(124,58,237,0.25)',borderRadius:'24px',maxWidth:'960px',width:'100%',maxHeight:'88vh',display:'flex',flexDirection:'column',boxShadow:'0 0 80px rgba(124,58,237,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 32px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <div style={{color:'#f1f0ff',fontSize:'18px',fontWeight:700,fontFamily:FONT}}>📋 {lang==='tr'?'Aylık Özet':'Monthly Summary'}</div>
          <button onClick={onClose} style={{fontSize:'20px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'none',cursor:'pointer'}}>×</button>
        </div>
        <div style={{display:'flex',gap:'8px',padding:'16px 32px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0,flexWrap:'wrap'}}>
          {months.map(m=>{
            const isSelected = selectedMonth === m.key
            return (
              <button key={m.key} onClick={()=>setSelectedMonth(m.key)}
                style={{padding:'7px 18px',borderRadius:'100px',fontSize:'12px',fontWeight:isSelected?700:400,background:isSelected?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.04)',color:isSelected?'#c4b5fd':'rgba(255,255,255,0.35)',border:isSelected?'1px solid rgba(124,58,237,0.4)':'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontFamily:FONT,transition:'all 0.15s'}}>
                {m.label}
              </button>
            )
          })}
        </div>
        <div style={{overflowY:'auto',flex:1,scrollbarWidth:'none',msOverflowStyle:'none'}}>
          {loading ? (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'300px',color:'rgba(255,255,255,0.3)',fontSize:'14px',fontFamily:FONT,gap:'12px'}}>
              <div style={{width:'20px',height:'20px',borderRadius:'50%',border:'2px solid rgba(124,58,237,0.3)',borderTop:'2px solid #7c3aed',animation:'spin 0.8s linear infinite'}}></div>
              {lang==='tr'?'Yükleniyor...':'Loading...'}
            </div>
          ) : (
            <MonthlySummaryPage theme={THEMES.summary} totalIncome={totalIncome} totalExp={totalExp} totalSubs={0} netBal={netBal} subs={[]} expenses={data.expenses} income={data.income} lang={lang} investments={investments} liveInvPrices={liveInvPrices} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── MONTHLY SUMMARY ───────────────────────────────────────────────
function MonthlySummaryPage({ theme, totalIncome, totalExp, totalSubs, netBal, subs, expenses, income, investments=[], liveInvPrices={}, lang='en' }) {
  const now = new Date()
  const monthName = now.toLocaleString(lang==='tr'?'tr-TR':'en-US',{month:'long',year:'numeric'})
  const sr = totalIncome>0?Math.round(((totalIncome-totalExp-totalSubs)/totalIncome)*100):0
  const totalSpend = totalExp+totalSubs
  const topExpense = expenses.length>0?expenses.reduce((a,e)=>Number(e.amount)>Number(a.amount)?e:a,expenses[0]):{description:'—',amount:0}
  const deadSubs = subs.filter(s=>s.status==='dead')
  const wastedOnDead = deadSubs.reduce((a,s)=>a+Number(s.cost),0)
  const score = sr>=30?'A':sr>=20?'B':sr>=10?'C':'D'
  const scoreColor = sr>=30?'#6ee7b7':sr>=20?'#fde68a':sr>=10?'#f97316':'#fca5a5'
  const T = '#14b8a6'
  const Tsoft = 'rgba(20,184,166,0.14)'
  const Tdim = 'rgba(20,184,166,0.4)'
  const cardStyle = {background:'rgba(20,184,166,0.04)',border:`1px solid ${Tsoft}`,borderRadius:'20px',padding:'22px',marginBottom:'14px',position:'relative',overflow:'hidden'}
  const barData = [{name:lang==='tr'?'Gelir':'Income',val:totalIncome,color:'#6ee7b7'},{name:lang==='tr'?'Gider':'Expenses',val:totalExp,color:'#f97316'},{name:lang==='tr'?'Abonelik':'Subs',val:totalSubs,color:'#ef4444'},{name:lang==='tr'?'Tasarruf':'Saved',val:Math.max(0,netBal),color:'#7c3aed'}]
  const maxBar = Math.max(...barData.map(d=>d.val),1)
  const pieTotal = totalExp+totalSubs
  const expPct = pieTotal>0?Math.round(totalExp/pieTotal*100):0
  const subPct = pieTotal>0?Math.round(totalSubs/pieTotal*100):0
  const expDash = pieTotal>0?(totalExp/pieTotal)*276:0
  const subDash = pieTotal>0?(totalSubs/pieTotal)*276:0
  const totalInvValue = investments.reduce((a,inv)=>a+(Number(inv.shares||0)*Number(liveInvPrices[inv.symbol]||inv.currentPrice||inv.current_price||inv.buyPrice||inv.buy_price||0)),0)
  const totalInvCost = investments.reduce((a,inv)=>a+(Number(inv.shares||0)*Number(inv.buyPrice||inv.buy_price||0)),0)
  const invGain = totalInvValue - totalInvCost
  const invGainPct = totalInvCost>0?((invGain/totalInvCost)*100).toFixed(2):0

  return (
    <div style={{padding:'28px',background:'transparent'}}>

      {/* GRADE CARD */}
      <div style={{background:'linear-gradient(135deg,rgba(20,184,166,0.08) 0%,rgba(6,182,212,0.04) 100%)',border:`1px solid rgba(20,184,166,0.2)`,borderRadius:'24px',padding:'28px 32px',marginBottom:'14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'24px',flexWrap:'wrap',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:'linear-gradient(90deg,transparent,rgba(20,184,166,0.3),transparent)'}}></div>
        <div>
          <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'2.5px',textTransform:'uppercase',color:Tdim,marginBottom:'8px'}}>{lang==='tr'?'Aylık Finansal Puan':'Monthly Financial Grade'}</div>
          <div style={{fontSize:'96px',fontWeight:800,lineHeight:1,letterSpacing:'-4px',color:scoreColor,fontFamily:MONO,textShadow:`0 0 60px ${scoreColor}44`}}>{score}</div>
          <div style={{color:'rgba(232,244,240,0.45)',fontSize:'13px',marginTop:'8px',fontFamily:FONT}}>{lang==='tr'?(sr>=30?'🎉 Mükemmel!':sr>=20?'💪 İyi gidiyorsun!':sr>=10?'📈 Gelişme gerekli':'⚠️ Harcamalar azaltılmalı'):(sr>=30?'🎉 Outstanding!':sr>=20?'💪 Good progress!':sr>=10?'📈 Room for improvement':'⚠️ Time to cut spending')}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {[
            [lang==='tr'?'Net Bakiye':'Net Balance', `₺${Math.abs(netBal).toFixed(0)}`, netBal>=0?'#6ee7b7':'#fca5a5'],
            [lang==='tr'?'Tasarruf Oranı':'Savings Rate', `${sr}%`, sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'],
            [lang==='tr'?'Toplam Gelir':'Total Income', `₺${totalIncome.toFixed(0)}`, '#6ee7b7'],
            [lang==='tr'?'Toplam Harcama':'Total Spend', `₺${totalSpend.toFixed(0)}`, '#fca5a5'],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:'rgba(255,255,255,0.03)',border:`1px solid rgba(20,184,166,0.12)`,borderRadius:'14px',padding:'14px 16px'}}>
              <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'1.5px',textTransform:'uppercase',color:Tdim,marginBottom:'6px'}}>{l}</div>
              <div style={{color:c,fontSize:'20px',fontWeight:700,letterSpacing:'-0.5px'}}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
        {/* BAR CHART */}
        <div style={cardStyle}>
          <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,${Tsoft},transparent)`}}></div>
          <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:Tdim,marginBottom:'16px'}}>{lang==='tr'?'Para Akışı':'Money Flow'}</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'8px',height:'120px'}}>
            {barData.map(d=>{
              const h = maxBar>0?Math.max((d.val/maxBar)*110,4):4
              return (
                <div key={d.name} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',flex:1}}>
                  <div style={{fontFamily:MONO,fontSize:'10px',fontWeight:600,color:d.color}}>₺{d.val>999?`${(d.val/1000).toFixed(1)}K`:d.val.toFixed(0)}</div>
                  <div style={{width:'100%',borderRadius:'6px 6px 0 0',height:`${h}px`,background:`linear-gradient(180deg,${d.color},${d.color}88)`,boxShadow:`0 0 12px ${d.color}33`}}></div>
                  <div style={{fontFamily:MONO,fontSize:'9px',color:'rgba(232,244,240,0.3)'}}>{d.name}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* DONUT */}
        <div style={cardStyle}>
          <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,${Tsoft},transparent)`}}></div>
          <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:Tdim,marginBottom:'16px'}}>{lang==='tr'?'Harcama Dağılımı':'Spending Breakdown'}</div>
          <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(20,184,166,0.08)" strokeWidth="16"/>
              {pieTotal>0 && <>
                <circle cx="55" cy="55" r="44" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray={`${expDash} ${276-expDash}`} strokeDashoffset="0" transform="rotate(-90 55 55)" strokeLinecap="round"/>
                <circle cx="55" cy="55" r="44" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray={`${subDash} ${276-subDash}`} strokeDashoffset={`-${expDash}`} transform="rotate(-90 55 55)" strokeLinecap="round"/>
              </>}
              <circle cx="55" cy="55" r="36" fill="#03080f"/>
              <text x="55" y="51" textAnchor="middle" fill="rgba(232,244,240,0.35)" fontSize="9" fontFamily="DM Mono">{lang==='tr'?'toplam':'total'}</text>
              <text x="55" y="65" textAnchor="middle" fill="#e8f4f0" fontSize="12" fontWeight="700" fontFamily="Plus Jakarta Sans">₺{pieTotal>999?`${(pieTotal/1000).toFixed(1)}K`:pieTotal.toFixed(0)}</text>
            </svg>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'rgba(232,244,240,0.5)'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'3px',background:'#f97316'}}></div>
                {lang==='tr'?'Gider':'Expenses'} ({expPct}%)
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'rgba(232,244,240,0.5)'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'3px',background:'#ef4444'}}></div>
                {lang==='tr'?'Abonelik':'Subs'} ({subPct}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YATIRIM */}
      <div style={{...cardStyle}}>
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,${Tsoft},transparent)`}}></div>
        <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:Tdim,marginBottom:'18px'}}>📈 {lang==='tr'?'Yatırım Özeti':'Investment Summary'}</div>
        <div style={{display:'flex',justifyContent:'space-around',alignItems:'center'}}>
          {[
            [lang==='tr'?'Portföy Değeri':'Portfolio Value',`₺${totalInvValue.toFixed(0)}`,'#6ee7b7',true],
            [lang==='tr'?'Toplam Maliyet':'Total Cost',`₺${totalInvCost.toFixed(0)}`,'rgba(232,244,240,0.4)',false],
            [lang==='tr'?'Kar / Zarar':'Gain / Loss',`${invGain>=0?'+':''}₺${invGain.toFixed(0)}`,invGain>=0?'#6ee7b7':'#fca5a5',true],
          ].map(([l,v,c,big],i)=>(
            <React.Fragment key={l}>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'1.5px',textTransform:'uppercase',color:Tdim,marginBottom:'8px'}}>{l}</div>
                <div style={{fontSize:big?'26px':'20px',fontWeight:700,letterSpacing:'-0.5px',color:c}}>{v}</div>
                {i===2 && <div style={{fontFamily:MONO,fontSize:'10px',color:invGain>=0?'#6ee7b7':'#fca5a5',marginTop:'4px'}}>{invGainPct}%</div>}
              </div>
              {i<2 && <div style={{width:'1px',height:'40px',background:`rgba(20,184,166,0.15)`}}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* INSIGHTS */}
      <div style={{...cardStyle,marginBottom:0}}>
        <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'1px',background:`linear-gradient(90deg,transparent,${Tsoft},transparent)`}}></div>
        <div style={{fontFamily:MONO,fontSize:'10px',letterSpacing:'1px',textTransform:'uppercase',color:Tdim,marginBottom:'14px'}}>{lang==='tr'?'Önemli Bulgular':'Key Insights'}</div>
        {[
          {icon:'💸',label:lang==='tr'?'En büyük harcama':'Biggest expense',val:`${topExpense.description} (₺${Number(topExpense.amount).toFixed(0)})`,color:'#fca5a5'},
          {icon:'💀',label:lang==='tr'?'Ölü aboneliklere harcanan':'Wasted on dead subs',val:wastedOnDead>0?`₺${wastedOnDead.toFixed(0)}/${lang==='tr'?'ay':'mo'} — ${lang==='tr'?'iptal et!':'cancel them!'}`:(lang==='tr'?'Ölü abonelik yok 🎉':'No dead subs 🎉'),color:wastedOnDead>0?'#fca5a5':'#6ee7b7'},
          {icon:'📈',label:lang==='tr'?'Tasarruf performansı':'Savings performance',val:`${sr}% — ${sr>=30?(lang==='tr'?'mükemmel':'excellent'):sr>=15?(lang==='tr'?'iyi':'good'):(lang==='tr'?'gelişmeli':'needs work')}`,color:sr>=30?'#6ee7b7':sr>=15?'#fde68a':'#fca5a5'},
          {icon:'🎯',label:lang==='tr'?'Sonraki ay hedefi':'Next month target',val:`${lang==='tr'?'Kaydet':'Save'} ₺${Math.max(Math.round(totalIncome*0.3),50)} (${lang==='tr'?'gelirin %30u':'30% of income'})`,color:T},
        ].map((item,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 14px',borderRadius:'12px',background:'rgba(255,255,255,0.02)',border:`1px solid rgba(20,184,166,0.08)`,marginBottom:i<3?'8px':'0',transition:'background 0.15s',cursor:'default'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(20,184,166,0.06)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
            <span style={{fontSize:'18px',flexShrink:0}}>{item.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:MONO,fontSize:'9px',letterSpacing:'1px',textTransform:'uppercase',color:Tdim,marginBottom:'3px'}}>{item.label}</div>
              <div style={{color:item.color,fontSize:'13px',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.val}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI ADVISOR ────────────────────────────────────────────────────
function AIPage({ theme, user, subs, expenses, income, investments, lang='en' }) {
  const getDefaultMsg = (l) => [{ role:'ai', text: l==='tr' ? "Merhaba! Ben BurnRate Yapay Zeka Danışmanınızım. Gerçek finansal verilerinizi görüyorum — abonelikler, harcamalar, gelir ve yatırımlar. Her şeyi sorun, size keskin ve uygulanabilir tavsiyeler vereceğim." : "Hey! I'm your BurnRate AI Advisor. I can see your real financial data — subscriptions, spending, income, and investments. Ask me anything and I'll give you sharp, actionable advice." }]
  const [messages, setMessages] = useState(getDefaultMsg(lang))
  useEffect(() => {
    try {
      const saved = localStorage.getItem('burnrate_ai_chat')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed)
      }
    } catch {}
  }, [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = React.useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(()=>{
    if(messagesEndRef.current) messagesEndRef.current.scrollIntoView({behavior:'smooth'})
  },[messages])

  const suggestions = lang==='tr'?["Hangi abonelikleri iptal etmeliyim?","Tasarruf oranımı nasıl artırabilirim?","Yatırım tavsiyesi ver","Para sızıntım nerede?"]:["Which subscriptions should I cancel?","How can I improve my savings rate?","Give me investment advice","Where am I leaking money?"]

  async function send(msg) {
    const userMsg = msg||input.trim()
    if (!userMsg||loading) return
    setInput('')
    setMessages(prev=>{const updated=[...prev,{role:'user',text:userMsg}];try{localStorage.setItem('burnrate_ai_chat',JSON.stringify(updated.slice(-50)))}catch{};return updated})
    setLoading(true)
    const context = `Subscriptions: ${subs.map(s=>`${s.name} ₺${s.cost}/mo status:${s.status}`).join(', ')||'none'}. Expenses: ${expenses.map(e=>`${e.description} ₺${e.amount}`).join(', ')||'none'}. Income: ${income.map(i=>`${i.source} ₺${i.amount}`).join(', ')||'none'}. Investments: ${investments.map(inv=>`${inv.symbol} ${inv.shares}x buy:₺${inv.buyPrice}`).join(', ')||'none'}. Currency: TRY (Turkish Lira).`
    try {
      const res = await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:userMsg,context,lang})})
      const data = await res.json()
      setMessages(prev=>{const updated=[...prev,{role:'ai',text:data.reply||'Could not get a response.'}];try{localStorage.setItem('burnrate_ai_chat',JSON.stringify(updated.slice(-50)))}catch{};return updated})
    } catch {
      setMessages(prev=>{const updated=[...prev,{role:'ai',text:'Connection error. Please try again.'}];try{localStorage.setItem('burnrate_ai_chat',JSON.stringify(updated.slice(-50)))}catch{};return updated})
    }
    setLoading(false)
  }

  return (
    <div className="page-pad" style={{padding:'36px',height:'100vh',display:'flex',flexDirection:'column',maxHeight:'100vh',boxSizing:'border-box'}}>
      <div style={{marginBottom:'18px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'12px',background:`linear-gradient(135deg,${theme.accent},${theme.accent}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>🤖</div>
            <div>
              <h1 style={{color:theme.text,fontSize:'20px',fontWeight:700,letterSpacing:'-0.4px',margin:0,fontFamily:FONT}}>{lang==='tr'?'Yapay Zeka Danışmanı':'AI Financial Advisor'}</h1>
              <div style={{color:'rgba(255,255,255,0.28)',fontSize:'11px',fontFamily:MONO}}>{lang==='tr'?'claude destekli · gerçek verilerinizi görür':'powered by claude · sees your real data'}</div>
            </div>
          </div>
          <button onClick={()=>{const init=[{role:'ai',text:lang==='tr'?'Sohbet temizlendi. Size nasıl yardımcı olabilirim?':'Chat cleared. How can I help you?'}];setMessages(init);try{localStorage.setItem('burnrate_ai_chat',JSON.stringify(init))}catch{}}} style={{padding:'6px 14px',borderRadius:'10px',fontSize:'12px',color:'rgba(255,255,255,0.3)',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontFamily:FONT}}>{lang==='tr'?'🗑️ Temizle':'🗑️ Clear'}</button>
        </div>
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap'}}>
        {suggestions.map((s,i)=>(
          <button key={i} onClick={()=>send(s)}
            style={{fontSize:'12px',padding:'8px 16px',borderRadius:'100px',background:'rgba(139,92,246,0.08)',color:'#ddd6fe',border:'1px solid rgba(139,92,246,0.25)',cursor:'pointer',fontFamily:FONT,fontWeight:500,transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.background='rgba(139,92,246,0.18)';e.currentTarget.style.boxShadow='0 6px 20px rgba(139,92,246,0.2)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.background='rgba(139,92,246,0.08)';e.currentTarget.style.boxShadow=''}}
          >{s}</button>
        ))}
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0,background:'rgba(139,92,246,0.04)',borderRadius:'20px',boxShadow:'0 0 0 1px rgba(139,92,246,0.15), inset 0 1px 0 rgba(139,92,246,0.1), 0 4px 24px rgba(0,0,0,0.55)'}}>
        <div onScroll={e=>{const el=e.currentTarget;setShowScrollBtn(el.scrollHeight-el.scrollTop-el.clientHeight>100)}} style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'14px',minHeight:0}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:'10px',flexDirection:m.role==='user'?'row-reverse':'row',position:'relative'}}
              onMouseEnter={e=>e.currentTarget.querySelector('.copy-btn')&&(e.currentTarget.querySelector('.copy-btn').style.opacity='1')}
              onMouseLeave={e=>e.currentTarget.querySelector('.copy-btn')&&(e.currentTarget.querySelector('.copy-btn').style.opacity='0')}>
              <div style={{width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0,background:m.role==='user'?'linear-gradient(135deg,#8b5cf6,#6d28d9)':'rgba(139,92,246,0.12)',border:m.role==='user'?'none':'1px solid rgba(139,92,246,0.2)',boxShadow:m.role==='user'?'0 4px 12px rgba(139,92,246,0.3)':'none'}}>{m.role==='user'?'👤':'🤖'}</div>
              <div style={{maxWidth:'520px',position:'relative'}}>
                <div style={{padding:'12px 16px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',fontSize:'13px',lineHeight:'1.7',color:'#f5f5f7',background:m.role==='user'?'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(109,40,217,0.2))':'rgba(139,92,246,0.07)',border:m.role==='user'?'1px solid rgba(139,92,246,0.3)':'1px solid rgba(139,92,246,0.15)',fontFamily:FONT}}>{m.text}</div>
                <div style={{fontSize:'10px',color:'rgba(139,92,246,0.35)',marginTop:'4px',fontFamily:MONO,textAlign:m.role==='user'?'right':'left',letterSpacing:'0.5px'}}>{new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</div>
                {m.role==='ai' && <button className="copy-btn" onClick={()=>{navigator.clipboard.writeText(m.text);setCopiedId(i);setTimeout(()=>setCopiedId(null),2000)}}
                  style={{position:'absolute',top:'8px',right:'-36px',width:'28px',height:'28px',borderRadius:'8px',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.25)',color:'#ddd6fe',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.15s',fontFamily:FONT}}>
                  {copiedId===i?'✓':'⎘'}
                </button>}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:'flex',gap:'10px'}}>
              <div style={{width:'32px',height:'32px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.2)'}}>🤖</div>
              <div style={{padding:'12px 18px',borderRadius:'16px 16px 16px 4px',background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.15)',display:'flex',gap:'5px',alignItems:'center'}}>
                {[0,1,2].map(i=><div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',background:`rgba(139,92,246,${0.4+i*0.2})`,animation:`pulse 1.4s infinite ${i*0.2}s`}}></div>)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
        {showScrollBtn && (
          <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}>
            <button onClick={()=>messagesEndRef.current?.scrollIntoView({behavior:'smooth'})}
              style={{padding:'6px 16px',borderRadius:'100px',background:'rgba(139,92,246,0.2)',border:'1px solid rgba(139,92,246,0.35)',color:'#ddd6fe',fontSize:'12px',cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',gap:'6px'}}>
              ↓ En alta git
            </button>
          </div>
        )}
        <div style={{padding:'14px 20px',borderTop:'1px solid rgba(139,92,246,0.15)',display:'flex',gap:'10px',alignItems:'center'}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={lang==='tr'?'Finanslarınız hakkında her şeyi sorun...':'Ask anything about your finances...'}
            style={{flex:1,padding:'13px 18px',borderRadius:'14px',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,transition:'border 0.18s, box-shadow 0.18s'}}
            onFocus={e=>{e.currentTarget.style.border='1px solid rgba(139,92,246,0.5)';e.currentTarget.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)'}}
            onBlur={e=>{e.currentTarget.style.border='1px solid rgba(139,92,246,0.2)';e.currentTarget.style.boxShadow=''}} />
          <button onClick={()=>send()} disabled={loading||!input.trim()}
            style={{width:'44px',height:'44px',borderRadius:'13px',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',border:'none',cursor:'pointer',fontSize:'16px',opacity:loading||!input.trim()?0.4:1,flexShrink:0,boxShadow:'0 4px 16px rgba(139,92,246,0.4)',transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)'}}
            onMouseEnter={e=>{if(!loading&&input.trim()){e.currentTarget.style.transform='translateY(-2px) scale(1.05)';e.currentTarget.style.boxShadow='0 8px 24px rgba(139,92,246,0.5)'}}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 16px rgba(139,92,246,0.4)'}}>↑</button>
        </div>
      </div>
    </div>
  )
}
// ── SETTINGS PAGE ─────────────────────────────────────────────────
function SettingsPage({ theme, user, lang, onLangChange, onSignOut }) {
  const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'

  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeSection, setActiveSection] = useState('profile')
  const [canceling, setCanceling] = useState(false)

  const [profileForm, setProfileForm] = useState({ name: '', profession: '', monthly_income: '' })
  const [prefForm, setPrefForm] = useState({ currency: 'TRY' })
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => { fetchDbUser() }, [])

  async function fetchDbUser() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}&select=*`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    const data = await res.json()
    if (data[0]) {
      setDbUser(data[0])
      setProfileForm({ name: data[0].name || '', profession: data[0].profession || '', monthly_income: data[0].monthly_income || '' })
     setPrefForm({ currency: data[0].currency || 'TRY' })
    }
    setLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ name: profileForm.name, profession: profileForm.profession, monthly_income: parseFloat(profileForm.monthly_income) || null })
    })
    const updated = JSON.parse(localStorage.getItem('burnrate_user') || '{}')
    updated.name = profileForm.name
    localStorage.setItem('burnrate_user', JSON.stringify(updated))
    setMessage(lang === 'tr' ? '✓ Profil kaydedildi' : '✓ Profile saved')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function savePrefs() {
  setSaving(true)
  setMessage('')
  await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ currency: prefForm.currency })
  })
  localStorage.setItem('burnrate_currency', prefForm.currency)
  window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency: prefForm.currency } }))
  
    
  setMessage(lang === 'tr' ? '✓ Kaydedildi, yükleniyor...' : '✓ Saved, loading...')
  setSaving(false)
  setTimeout(() => window.location.reload(), 800)
}

  async function handleCancel() {
    if (!dbUser?.stripe_sub_id) return
    if (!confirm(lang === 'tr' ? 'Aboneliğinizi iptal etmek istediğinizden emin misiniz?' : 'Are you sure you want to cancel?')) return
    setCanceling(true)
    const res = await fetch('/api/stripe/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
    const data = await res.json()
    if (data.success) {
      setMessage(lang === 'tr' ? '✓ Abonelik iptal edildi. Dönem sonuna kadar erişiminiz devam eder.' : '✓ Subscription canceled. Access continues until period end.')
      fetchDbUser()
    } else {
      setMessage('Error: ' + (data.error || 'Something went wrong'))
    }
    setCanceling(false)
    setTimeout(() => setMessage(''), 5000)
  }

  async function handleDeleteData() {
    if (deleteConfirm !== 'SİL' && deleteConfirm !== 'DELETE') return
    if (!confirm(lang === 'tr' ? 'Tüm verileriniz silinecek. Emin misiniz?' : 'All your data will be deleted. Are you sure?')) return
    await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/expenses?user_id=eq.${user.id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/income?user_id=eq.${user.id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
      fetch(`${SUPABASE_URL}/rest/v1/investments?user_id=eq.${user.id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }),
    ])
    setMessage(lang === 'tr' ? '✓ Tüm veriler silindi' : '✓ All data deleted')
    setDeleteConfirm('')
    setTimeout(() => setMessage(''), 3000)
  }

  const PLAN_META_LOCAL = {
    starter: { name: 'Starter', color: '#06b6d4', price: '$9/mo' },
    pro:     { name: 'Pro',     color: '#7c3aed', price: '$19/mo' },
    elite:   { name: 'Elite',   color: '#f59e0b', price: '$39/mo' },
  }

  const currentPlan = dbUser?.plan || user?.plan || 'starter'
  const planMeta = PLAN_META_LOCAL[currentPlan]
  const expiresAt = dbUser?.plan_expires_at ? new Date(dbUser.plan_expires_at).toLocaleDateString('tr-TR') : null

  const sections = [
    { id: 'profile',  icon: '👤', label: lang === 'tr' ? 'Profil' : 'Profile' },
    { id: 'plan',     icon: '💳', label: lang === 'tr' ? 'Plan & Abonelik' : 'Plan & Billing' },
    { id: 'prefs',    icon: '🌍', label: lang === 'tr' ? 'Tercihler' : 'Preferences' },
    { id: 'security', icon: '🔒', label: lang === 'tr' ? 'Güvenlik' : 'Security' },
    { id: 'export', icon: '📥', label: lang === 'tr' ? 'Rapor İndir' : 'Export Report' },
    { id: 'danger', icon: '🗑️', label: lang === 'tr' ? 'Veri & Hesap' : 'Data & Account' },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div className="page-pad" style={{ padding: '36px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: theme.text, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.4px', margin: 0, marginBottom: '4px', fontFamily: FONT }}>
          ⚙️ {lang === 'tr' ? 'Ayarlar' : 'Settings'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0, fontFamily: FONT }}>
          {lang === 'tr' ? 'Hesabınızı ve tercihlerinizi yönetin' : 'Manage your account and preferences'}
        </p>
      </div>

      {message && (
        <div style={{ background: message.startsWith('Error') || message.startsWith('Hata') ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)', border: `1px solid ${message.startsWith('Error') || message.startsWith('Hata') ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}`, borderRadius: 10, padding: '12px 18px', color: message.startsWith('Error') || message.startsWith('Hata') ? '#ef4444' : '#c4b5fd', marginBottom: 20, fontSize: 13, fontFamily: FONT }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Sol menü */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: activeSection === s.id ? 600 : 400, background: activeSection === s.id ? 'rgba(124,58,237,0.1)' : 'transparent', color: activeSection === s.id ? '#c4b5fd' : 'rgba(255,255,255,0.4)', border: activeSection === s.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent', cursor: 'pointer', textAlign: 'left', fontFamily: FONT, transition: 'all 0.15s' }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div>

          {/* PROFİL */}
          {activeSection === 'profile' && (
            <Card accent={theme.accent} style={{ padding: 24 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: FONT }}>
                {lang === 'tr' ? 'Profil Bilgileri' : 'Profile Information'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ ...TIP, marginBottom: 6 }}>{lang === 'tr' ? 'Ad Soyad' : 'Full Name'}</div>
                  <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder={lang === 'tr' ? 'Adınız...' : 'Your name...'}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: FONT }} />
                </div>
                <div>
                  <div style={{ ...TIP, marginBottom: 6 }}>{lang === 'tr' ? 'Meslek' : 'Profession'}</div>
                  <select value={profileForm.profession} onChange={e => setProfileForm({ ...profileForm, profession: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: FONT, cursor: 'pointer' }}>
                    <option value="">{lang === 'tr' ? 'Seçin...' : 'Select...'}</option>
                    {['Freelancer', lang === 'tr' ? 'Öğrenci' : 'Student', lang === 'tr' ? 'Girişimci' : 'Entrepreneur', lang === 'tr' ? 'Çalışan' : 'Employee', lang === 'tr' ? 'Serbest Meslek' : 'Self-employed', lang === 'tr' ? 'Diğer' : 'Other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ ...TIP, marginBottom: 6 }}>{lang === 'tr' ? 'Aylık Gelir Hedefi (₺)' : 'Monthly Income Target (₺)'}</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: MONO }}>₺</span>
                    <input type="number" value={profileForm.monthly_income} onChange={e => setProfileForm({ ...profileForm, monthly_income: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: MONO }} />
                  </div>
                </div>
                <div>
                  <div style={{ ...TIP, marginBottom: 6 }}>E-posta</div>
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: FONT }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: FONT }}>
                {saving ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (lang === 'tr' ? 'Kaydet' : 'Save Changes')}
              </button>
            </Card>
          )}

          {/* PLAN & ABONELİK */}
          {activeSection === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Card accent={theme.accent} style={{ padding: 24 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: FONT }}>
                  {lang === 'tr' ? 'Aktif Plan' : 'Current Plan'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ color: '#fff', fontSize: 24, fontWeight: 800, fontFamily: FONT }}>{planMeta.name}</span>
                      <span style={{ background: `${planMeta.color}20`, color: planMeta.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>AKTİF</span>
                    </div>
                    {expiresAt && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: FONT }}>{lang === 'tr' ? 'Sonraki yenileme:' : 'Next renewal:'} {expiresAt}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: planMeta.color, fontSize: 28, fontWeight: 800, fontFamily: MONO }}>{planMeta.price}</div>
                  </div>
                </div>
                {dbUser?.stripe_customer_id && (
                  <a href="/billing" style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none', fontFamily: FONT, marginRight: 10 }}>
                    {lang === 'tr' ? '🧾 Faturaları Görüntüle' : '🧾 View Invoices'}
                  </a>
                )}
                {dbUser?.stripe_sub_id && (
                  <button onClick={handleCancel} disabled={canceling}
                    style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: canceling ? 'not-allowed' : 'pointer', fontFamily: FONT, opacity: canceling ? 0.6 : 1 }}>
                    {canceling ? (lang === 'tr' ? 'İptal ediliyor...' : 'Canceling...') : (lang === 'tr' ? 'Aboneliği İptal Et' : 'Cancel Subscription')}
                  </button>
                )}
{dbUser?.stripe_sub_id && (() => {
  const createdAt = dbUser?.created_at ? new Date(dbUser.created_at) : null;
  const daysDiff = createdAt ? Math.floor((new Date() - createdAt) / (1000*60*60*24)) : 99;
  const canRefund = daysDiff <= 7;
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={async () => {
          if (!canRefund) return;
          if (!confirm(lang === 'tr' ? 'İade talebinde bulunmak istediğinizden emin misiniz? Aboneliğiniz iptal edilecek.' : 'Are you sure you want a refund? Your subscription will be canceled.')) return;
          setSaving(true);
          setMessage('');
          try {
            const res = await fetch('/api/stripe/refund', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            const data = await res.json();
            if (data.success) {
              setMessage(lang === 'tr' ? '✓ İade talebiniz alındı. 5-10 iş günü içinde hesabınıza yansır.' : '✓ Refund processed. Allow 5-10 business days.');
              fetchDbUser();
            } else {
              setMessage((lang === 'tr' ? 'Hata: ' : 'Error: ') + data.error);
            }
          } catch {
            setMessage(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
          }
          setSaving(false);
        }}
        disabled={!canRefund || saving}
        style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13, background: 'transparent', color: canRefund ? '#6ee7b7' : 'rgba(255,255,255,0.2)', border: `1px solid ${canRefund ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: canRefund ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
        {lang === 'tr' ? '💚 Para İadesi Talep Et' : '💚 Request Refund'}
      </button>
      <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: FONT }}>
        {canRefund
          ? (lang === 'tr' ? `✓ İade hakkınız var · ${7 - daysDiff} gün kaldı` : `✓ Eligible for refund · ${7 - daysDiff} days left`)
          : (lang === 'tr' ? '✗ 7 günlük iade süresi dolmuştur' : '✗ 7-day refund period has expired')}
      </div>
    </div>
  );
})()}
              </Card>

              <Card accent={theme.accent} style={{ padding: 24 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: FONT }}>
                  {lang === 'tr' ? 'Plan Değiştir' : 'Change Plan'}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[['starter', 'Starter', '$9'], ['pro', 'Pro', '$19'], ['elite', 'Elite', '$39']].map(([key, name, price]) => (
  <div key={key} onClick={async () => {
    if (key === currentPlan) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/stripe/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, newPlan: key }),
      });
      const data = await res.json();
      if (data.redirect) {
        window.location.href = data.redirect;
      } else if (data.success) {
        setMessage(lang === 'tr' ? `✓ Plan ${name} olarak güncellendi` : `✓ Plan updated to ${name}`);
        fetchDbUser();
      } else {
        setMessage('Hata: ' + (data.error || 'Bir sorun oluştu'));
      }
    } catch {
      setMessage('Bağlantı hatası');
    } finally {
      setSaving(false);
    }
  }}
                      style={{ flex: 1, padding: '16px 12px', borderRadius: 12, background: key === currentPlan ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)', border: key === currentPlan ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.07)', cursor: key === currentPlan ? 'default' : 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <div style={{ color: key === currentPlan ? '#c4b5fd' : '#fff', fontWeight: 700, fontSize: 14, fontFamily: FONT }}>{name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: MONO }}>{price}/mo</div>
                      {key === currentPlan && <div style={{ color: '#7c3aed', fontSize: 10, marginTop: 4, fontFamily: FONT }}>✓ {lang === 'tr' ? 'Mevcut' : 'Current'}</div>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TERCİHLER */}
          {activeSection === 'prefs' && (
  <Card accent={theme.accent} style={{ padding: 24 }}>
    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: FONT }}>
      {lang === 'tr' ? 'Dil, Para Birimi & Tema' : 'Language, Currency & Theme'}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
      <div>
        <div style={{ ...TIP, marginBottom: 8 }}>{lang === 'tr' ? 'Arayüz Dili' : 'Interface Language'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['tr', 'en'].map(l => (
            <button key={l} onClick={() => onLangChange(l)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: lang === l ? 700 : 400, background: lang === l ? '#7c3aed' : 'rgba(255,255,255,0.04)', color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)', border: `1px solid ${lang === l ? '#7c3aed' : 'rgba(255,255,255,0.09)'}`, cursor: 'pointer', fontFamily: FONT, transition: 'all 0.2s' }}>
              {l === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ ...TIP, marginBottom: 8 }}>{lang === 'tr' ? 'Para Birimi' : 'Currency'}</div>
        <select value={prefForm.currency} onChange={e => setPrefForm({ ...prefForm, currency: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(30,30,50,0.9)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: FONT, cursor: 'pointer' }}>
          <option value="TRY">🇹🇷 TRY — Türk Lirası</option>
          <option value="USD">🇺🇸 USD — US Dollar</option>
          <option value="EUR">🇪🇺 EUR — Euro</option>
        </select>
      </div>
    </div>
    <button onClick={savePrefs} disabled={saving}
      style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#7c3aed,#4c1d95)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: FONT }}>
      {saving ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...') : (lang === 'tr' ? 'Kaydet' : 'Save')}
    </button>
  </Card>
)}

          {/* GÜVENLİK */}
          {activeSection === 'security' && (
            <Card accent={theme.accent} style={{ padding: 24 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: FONT }}>
                {lang === 'tr' ? 'Hesap Bilgileri' : 'Account Information'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'E-posta', value: user.email },
                  { label: lang === 'tr' ? 'Kullanıcı ID' : 'User ID', value: user.id, mono: true },
                  { label: lang === 'tr' ? 'Lisans Anahtarı' : 'License Key', value: dbUser?.license_key || '—', mono: true },
                  { label: 'Stripe Customer ID', value: dbUser?.stripe_customer_id || lang === 'tr' ? 'Henüz yok' : 'Not yet', mono: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: FONT }}>{item.label}</span>
                    <span style={{ color: '#f5f5f7', fontSize: 12, fontFamily: item.mono ? MONO : FONT, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={onSignOut}
                  style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: FONT }}>
                  {lang === 'tr' ? 'Çıkış Yap →' : 'Sign Out →'}
                </button>
              </div>
            </Card>
          )}

          {activeSection === 'export' && (
  <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
    <Card accent={theme.accent} style={{padding:24}}>
      <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:600,marginBottom:16,fontFamily:FONT}}>
        📥 {lang==='tr'?'Finansal Rapor İndir':'Download Financial Report'}
      </div>
      <div style={{color:'rgba(255,255,255,0.4)',fontSize:13,marginBottom:20,fontFamily:FONT,lineHeight:1.6}}>
        {lang==='tr'?'Tüm finansal verilerinizi (harcamalar, gelirler, abonelikler, yatırımlar) PDF formatında indirin.':'Download all your financial data (expenses, income, subscriptions, investments) as a PDF report.'}
      </div>
      <button onClick={async()=>{
        const SUPABASE_URL='https://cgfcdtjyhphppucnldor.supabase.co'
        const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'
        const headers={'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}
        const [exp,inc,sub,inv]=await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/expenses?user_id=eq.${user.id}&select=*&order=expense_date.desc`,{headers}).then(r=>r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/income?user_id=eq.${user.id}&select=*&order=income_date.desc`,{headers}).then(r=>r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}&select=*`,{headers}).then(r=>r.json()),
          fetch(`${SUPABASE_URL}/rest/v1/investments?user_id=eq.${user.id}&select=*`,{headers}).then(r=>r.json()),
        ])
        const totalInc=inc.reduce((a,i)=>a+Number(i.amount),0)
        const totalExp=exp.reduce((a,e)=>a+Number(e.amount),0)
        const totalSub=sub.reduce((a,s)=>a+Number(s.cost),0)
        const netBal=totalInc-totalExp-totalSub
        const sr=totalInc>0?Math.round(((totalInc-totalExp-totalSub)/totalInc)*100):0
        const now=new Date()
        const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>BurnRate OS — Finansal Rapor</title><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',sans-serif;background:#ffffff;color:#1a1a2e;padding:40px;max-width:900px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #7c3aed}
  .logo{font-size:22px;font-weight:800;color:#7c3aed;letter-spacing:-0.5px}
  .logo span{color:#1a1a2e}
  .date{font-size:12px;color:#888;font-family:monospace}
  .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:32px}
  .summary-card{border-radius:12px;padding:16px;border:1px solid #e5e7eb}
  .summary-label{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:8px;font-family:monospace}
  .summary-val{font-size:22px;font-weight:800;letter-spacing:-0.5px}
  .section{margin-bottom:28px}
  .section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;margin-bottom:12px;font-family:monospace;font-weight:600}
  .card{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:8px}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 14px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#888;font-family:monospace;background:#f9fafb;border-bottom:1px solid #e5e7eb}
  td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f3f4f6;color:#374151}
  tr:last-child td{border-bottom:none}
  tr:nth-child(even) td{background:#fafafa}
  .green{color:#059669;font-weight:600}
  .red{color:#dc2626;font-weight:600}
  .yellow{color:#d97706;font-weight:600}
  .purple{color:#7c3aed;font-weight:600}
  .badge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:10px;font-family:monospace;font-weight:600}
  .badge-g{background:#d1fae5;color:#059669}
  .badge-r{background:#fee2e2;color:#dc2626}
  .badge-y{background:#fef3c7;color:#d97706}
  .divider{height:1px;background:#e5e7eb;margin:24px 0}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#aaa;font-family:monospace}
  @media print{body{padding:20px}button{display:none}}
</style></head><body>
  <div class="header">
    <div class="logo">⚡ BurnRate <span>OS</span></div>
    <div class="date">
      <div style="font-size:13px;font-weight:600;color:#1a1a2e;margin-bottom:2px">${dbUser?.name||user.email}</div>
      ${now.toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'})}
    </div>
  </div>
  <div class="summary-grid">
    <div class="summary-card" style="border-color:#d1fae5;background:#f0fdf4"><div class="summary-label">Toplam Gelir</div><div class="summary-val green">₺${totalInc.toLocaleString('tr-TR')}</div></div>
    <div class="summary-card" style="border-color:#fee2e2;background:#fff5f5"><div class="summary-label">Toplam Gider</div><div class="summary-val red">₺${totalExp.toLocaleString('tr-TR')}</div></div>
    <div class="summary-card" style="border-color:${netBal>=0?'#d1fae5':'#fee2e2'};background:${netBal>=0?'#f0fdf4':'#fff5f5'}"><div class="summary-label">Net Bakiye</div><div class="summary-val ${netBal>=0?'green':'red'}">${netBal>=0?'+':''}₺${netBal.toLocaleString('tr-TR')}</div></div>
    <div class="summary-card" style="border-color:#ede9fe;background:#faf5ff"><div class="summary-label">Tasarruf Oranı</div><div class="summary-val purple">%${sr}</div></div>
  </div>
  <div class="section">
    <div class="section-title">💸 Harcamalar (${exp.length} kayıt)</div>
    <div class="card"><table><thead><tr><th>Açıklama</th><th>Miktar</th><th>Kategori</th><th>Tarih</th></tr></thead><tbody>
    ${exp.length>0?exp.map(e=>`<tr><td>${e.description||'—'}</td><td class="red">-₺${Number(e.amount).toLocaleString('tr-TR')}</td><td>${e.category||'—'}</td><td style="font-family:monospace;font-size:12px">${e.expense_date||'—'}</td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:#aaa;padding:20px">Harcama yok</td></tr>'}
    </tbody></table></div>
  </div>
  <div class="section">
    <div class="section-title">💰 Gelirler (${inc.length} kayıt)</div>
    <div class="card"><table><thead><tr><th>Kaynak</th><th>Miktar</th><th>Tarih</th></tr></thead><tbody>
    ${inc.length>0?inc.map(i=>`<tr><td>${i.source||'—'}</td><td class="green">+₺${Number(i.amount).toLocaleString('tr-TR')}</td><td style="font-family:monospace;font-size:12px">${i.income_date||'—'}</td></tr>`).join(''):'<tr><td colspan="3" style="text-align:center;color:#aaa;padding:20px">Gelir yok</td></tr>'}
    </tbody></table></div>
  </div>
  <div class="section">
    <div class="section-title">⚔️ Abonelikler (${sub.length} kayıt)</div>
    <div class="card"><table><thead><tr><th>Hizmet</th><th>Aylık Maliyet</th><th>Kategori</th><th>Durum</th></tr></thead><tbody>
    ${sub.length>0?sub.map(s=>`<tr><td style="font-weight:500">${s.name||'—'}</td><td>₺${Number(s.cost).toLocaleString('tr-TR')}</td><td>${s.category||'—'}</td><td><span class="badge ${s.status==='dead'?'badge-r':s.status==='warn'?'badge-y':'badge-g'}">${s.status==='dead'?'ÖLÜ':s.status==='warn'?'UYARI':'AKTİF'}</span></td></tr>`).join(''):'<tr><td colspan="4" style="text-align:center;color:#aaa;padding:20px">Abonelik yok</td></tr>'}
    </tbody></table></div>
  </div>
  <div class="section">
    <div class="section-title">📈 Yatırımlar (${inv.length} kayıt)</div>
    <div class="card"><table><thead><tr><th>Sembol</th><th>İsim</th><th>Adet</th><th>Alış Fiyatı</th><th>Toplam Maliyet</th></tr></thead><tbody>
    ${inv.length>0?inv.map(i=>`<tr><td class="purple">${i.symbol||'—'}</td><td>${i.name||'—'}</td><td>${i.shares||0}</td><td>₺${Number(i.buy_price).toLocaleString('tr-TR')}</td><td style="font-weight:600">₺${(Number(i.shares)*Number(i.buy_price)).toLocaleString('tr-TR')}</td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">Yatırım yok</td></tr>'}
    </tbody></table></div>
  </div>
  <div class="footer">BurnRate OS · Finansal Rapor · ${now.toLocaleDateString('tr-TR')} · app.burnrate-os.com</div>
</body></html>`
        const win=window.open('','_blank')
        win.document.write(html)
        win.document.close()
        setTimeout(()=>win.print(),500)
      }}
        style={{padding:'12px 24px',borderRadius:'12px',fontSize:'13px',fontWeight:600,background:'linear-gradient(135deg,#7c3aed,#4c1d95)',color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT,boxShadow:'0 4px 20px rgba(124,58,237,0.35)',transition:'all 0.2s cubic-bezier(.34,1.56,.64,1)'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(124,58,237,0.5)'}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(124,58,237,0.35)'}}>
        📥 {lang==='tr'?'PDF Raporu İndir':'Download PDF Report'}
      </button>
    </Card>
  </div>
)}

          {/* HESAP YÖNETİMİ */}
{activeSection === 'danger' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <Card style={{ padding: 24, border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ color: '#f5f5f7', fontSize: 14, fontWeight: 600, marginBottom: 6, fontFamily: FONT }}>
        🗑️ {lang === 'tr' ? 'Tüm Verileri Sil' : 'Delete All Data'}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 14, fontFamily: FONT }}>
        {lang === 'tr' ? 'Tüm harcama, gelir, abonelik ve yatırım verileriniz silinir. Hesabınız silinmez.' : 'All your expenses, income, subscriptions and investments will be deleted. Your account remains.'}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
          placeholder={lang === 'tr' ? '"SİL" yazın' : 'Type "DELETE" to confirm'}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#f5f5f7', fontSize: 13, outline: 'none', fontFamily: FONT }} />
        <button onClick={handleDeleteData}
          disabled={deleteConfirm !== 'SİL' && deleteConfirm !== 'DELETE'}
          style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: deleteConfirm === 'SİL' || deleteConfirm === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.1)', color: deleteConfirm === 'SİL' || deleteConfirm === 'DELETE' ? '#fff' : 'rgba(239,68,68,0.4)', border: 'none', cursor: deleteConfirm === 'SİL' || deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed', fontFamily: FONT }}>
          {lang === 'tr' ? 'Sil' : 'Delete'}
        </button>
      </div>
    </Card>

    <Card style={{ padding: 24, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
      <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 6, fontFamily: FONT }}>
        ⛔ {lang === 'tr' ? 'Hesabı Kapat' : 'Close Account'}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 14, fontFamily: FONT }}>
        {lang === 'tr' ? 'Hesabınız, tüm verileriniz ve Stripe aboneliğiniz kalıcı olarak silinir. Bu işlem geri alınamaz.' : 'Your account, all data and Stripe subscription will be permanently deleted. This cannot be undone.'}
      </div>
      <button onClick={async () => {
        if (!confirm(lang === 'tr' ? 'Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?' : 'Are you sure you want to permanently delete your account?')) return;
        try {
          const res = await fetch('/api/delete-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
          const data = await res.json();
          if (data.success) {
            localStorage.removeItem('burnrate_user');
            localStorage.removeItem('burnrate_lang');
            localStorage.removeItem('burnrate_ai_chat');
            window.location.href = '/login';
          } else {
            setMessage('Hata: ' + data.error);
          }
        } catch {
          setMessage(lang === 'tr' ? 'Bağlantı hatası' : 'Connection error');
        }
      }}
        style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontFamily: FONT }}>
        {lang === 'tr' ? '⛔ Hesabı Kalıcı Olarak Kapat' : '⛔ Permanently Close Account'}
      </button>
    </Card>
  </div>
)}
</div>
      </div>
    </div>
  )
}
function DebtPage({ theme, userId, currency='TRY', currencyRate=1, currencySymbol='₺', lang }) {
  const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'

  const [tab, setTab] = useState('receivable')
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selected, setSelected] = useState(null)
  const [partialAmount, setPartialAmount] = useState('')
  const [showPartialInput, setShowPartialInput] = useState(false)
  const [form, setForm] = useState({
    type: 'receivable', person_name: '', person_phone: '', person_email: '',
    amount: '', category: 'personal', status: 'pending',
    due_date: '', description: '', notes: ''
  })

  const CATS = [
    { v: 'personal',  label: lang==='tr'?'Kişisel':'Personal',   icon: '👤' },
    { v: 'business',  label: lang==='tr'?'İş':'Business',        icon: '💼' },
    { v: 'vehicle',   label: lang==='tr'?'Araç':'Vehicle',       icon: '🚗' },
    { v: 'home',      label: lang==='tr'?'Ev':'Home',            icon: '🏠' },
    { v: 'education', label: lang==='tr'?'Eğitim':'Education',   icon: '📚' },
    { v: 'other',     label: lang==='tr'?'Diğer':'Other',        icon: '📦' },
  ]

  const STATUS = {
    pending:  { label: lang==='tr'?'Bekliyor':'Pending',    color: '#fde68a', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
    paid:     { label: lang==='tr'?'Ödendi':'Paid',         color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)'  },
    overdue:  { label: lang==='tr'?'Gecikmiş':'Overdue',    color: '#fca5a5', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'   },
    partial:  { label: lang==='tr'?'Kısmi':'Partial',       color: '#67e8f9', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)'   },
  }

  useEffect(() => { loadDebts() }, [userId])

  async function loadDebts() {
    setLoading(true)
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/debts?user_id=eq.${userId}&order=created_at.desc&select=*`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      )
      const data = await res.json()
      setDebts(Array.isArray(data) ? data : [])
    } catch(e) { setDebts([]) }
    setLoading(false)
  }

  async function addDebt() {
    if (!form.person_name || !form.amount) return
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), paid_amount: 0, user_id: userId, type: tab, due_date: form.due_date || null })
      })
      setForm({ type: 'receivable', person_name: '', person_phone: '', person_email: '', amount: '', category: 'personal', status: 'pending', due_date: '', description: '', notes: '' })
      setAdding(false)
      loadDebts()
    } catch(e) { console.error('addDebt error:', e) }
  }
  

  async function updateStatus(id, status) {
    await fetch(`${SUPABASE_URL}/rest/v1/debts?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ status })
    })
    loadDebts()
    setSelected(prev => prev ? { ...prev, status } : null)
  }

  async function addPartialPayment(debt) {
    const paid = parseFloat(partialAmount)
    if (!paid || paid <= 0) return
    const newPaid = Math.min((Number(debt.paid_amount) || 0) + paid, Number(debt.amount))
    const newStatus = newPaid >= Number(debt.amount) ? 'paid' : 'partial'
    await fetch(`${SUPABASE_URL}/rest/v1/debts?id=eq.${debt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ paid_amount: newPaid, status: newStatus })
    })
    setPartialAmount('')
    setShowPartialInput(false)
    loadDebts()
    setSelected(prev => prev ? { ...prev, paid_amount: newPaid, status: newStatus } : null)
  }

  async function deleteDebt(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/debts?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    setSelected(null)
    loadDebts()
  }

  const receivables = debts.filter(d => d.type === 'receivable')
  const payables = debts.filter(d => d.type === 'payable')
  const currentList = tab === 'receivable' ? receivables : payables

  const totalReceivable = receivables.filter(d => d.status !== 'paid').reduce((a, d) => a + Number(d.amount) - (Number(d.paid_amount) || 0), 0)
  const totalPayable = payables.filter(d => d.status !== 'paid').reduce((a, d) => a + Number(d.amount) - (Number(d.paid_amount) || 0), 0)
  const netStatus = totalReceivable - totalPayable

  function getAvatar(name) {
    return name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  function getAvatarColor(name) {
    const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']
    let hash = 0
    for (let i = 0; i < (name||'').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="page-pad" style={{padding:'36px'}}>
      {/* Başlık */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h1 style={{color:theme.text,fontSize:'22px',fontWeight:700,letterSpacing:'-0.4px',margin:0,marginBottom:'4px',fontFamily:FONT}}>
            🤝 {lang==='tr'?'Borç Takibi':'Debt Tracker'}
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'13px',margin:0,fontFamily:FONT}}>
            {lang==='tr'?'Alacak ve vereceklerinizi takip edin':'Track your receivables and payables'}
          </p>
        </div>
        <button onClick={()=>{setAdding(!adding);setSelected(null)}}
          style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 18px',borderRadius:'12px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',fontFamily:FONT}}>
          + {lang==='tr'?'Borç Ekle':'Add Debt'}
        </button>
      </div>

      {/* Özet kartlar */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        <div style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'16px',padding:'20px'}}>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',fontFamily:FONT,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{lang==='tr'?'Toplam Alacak':'Total Receivable'}</div>
          <div style={{color:'#6ee7b7',fontSize:'26px',fontWeight:800,fontFamily:FONT}}>{currencySymbol}{(totalReceivable/currencyRate).toFixed(0)}</div>
          <div style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',fontFamily:FONT,marginTop:'4px'}}>{receivables.filter(d=>d.status!=='paid').length} {lang==='tr'?'bekleyen':'pending'}</div>
        </div>
        <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'16px',padding:'20px'}}>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',fontFamily:FONT,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{lang==='tr'?'Toplam Verecek':'Total Payable'}</div>
          <div style={{color:'#fca5a5',fontSize:'26px',fontWeight:800,fontFamily:FONT}}>{currencySymbol}{(totalPayable/currencyRate).toFixed(0)}</div>
          <div style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',fontFamily:FONT,marginTop:'4px'}}>{payables.filter(d=>d.status!=='paid').length} {lang==='tr'?'bekleyen':'pending'}</div>
        </div>
        <div style={{background:netStatus>=0?'rgba(124,58,237,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${netStatus>=0?'rgba(124,58,237,0.2)':'rgba(239,68,68,0.2)'}`,borderRadius:'16px',padding:'20px'}}>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:'11px',fontFamily:FONT,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{lang==='tr'?'Net Durum':'Net Status'}</div>
          <div style={{color:netStatus>=0?'#c4b5fd':'#fca5a5',fontSize:'26px',fontWeight:800,fontFamily:FONT}}>{netStatus>=0?'+':''}{currencySymbol}{(Math.abs(netStatus)/currencyRate).toFixed(0)}</div>
          <div style={{color:'rgba(255,255,255,0.25)',fontSize:'12px',fontFamily:FONT,marginTop:'4px'}}>{netStatus>=0?(lang==='tr'?'Net alacaklısınız':'Net receivable'):(lang==='tr'?'Net borçlusunuz':'Net payable')}</div>
        </div>
      </div>

      {/* Ekleme formu */}
      {adding && (
        <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'24px',marginBottom:'20px'}}>
          <div style={{color:'#f1f0ff',fontSize:'15px',fontWeight:700,fontFamily:FONT,marginBottom:'20px'}}>
            {lang==='tr'?'Yeni Borç Ekle':'Add New Debt'}
          </div>
          <div style={{display:'flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'4px',marginBottom:'20px',width:'fit-content'}}>
            {[
              {v:'receivable', label:lang==='tr'?'💚 Alacak':'💚 Receivable'},
              {v:'payable',    label:lang==='tr'?'🔴 Verecek':'🔴 Payable'},
            ].map(t=>(
              <button key={t.v} onClick={()=>setForm({...form,type:t.v})}
                style={{padding:'9px 20px',borderRadius:'9px',fontSize:'13px',fontWeight:form.type===t.v?600:400,background:form.type===t.v?theme.bg:'transparent',color:form.type===t.v?theme.text:'rgba(255,255,255,0.4)',border:form.type===t.v?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:FONT}}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Ad Soyad *':'Full Name *'}</div>
              <input value={form.person_name} onChange={e=>setForm({...form,person_name:e.target.value})}
                placeholder={lang==='tr'?'Ahmet Yılmaz':'John Doe'}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}} />
            </div>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Tutar (₺) *':'Amount (₺) *'}</div>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontFamily:MONO}}>₺</span>
                <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00"
                  style={{width:'100%',padding:'10px 14px 10px 28px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:MONO,boxSizing:'border-box'}} />
              </div>
            </div>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Telefon':'Phone'}</div>
              <input value={form.person_phone} onChange={e=>setForm({...form,person_phone:e.target.value})} placeholder="+90 5xx xxx xx xx"
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}} />
            </div>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'E-posta':'Email'}</div>
              <input value={form.person_email} onChange={e=>setForm({...form,person_email:e.target.value})} placeholder="ornek@mail.com"
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}} />
            </div>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Son Ödeme Tarihi':'Due Date'}</div>
              <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,colorScheme:'dark',boxSizing:'border-box'}} />
            </div>
            <div>
              <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Kategori':'Category'}</div>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(30,30,50,0.9)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,cursor:'pointer'}}>
                {CATS.map(c=><option key={c.v} value={c.v}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{marginBottom:'14px'}}>
            <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Ne Borcu?':'Description'}</div>
            <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder={lang==='tr'?'Konut kredisi, taşıt kredisi...':'Mortgage, car loan, credit card...'}
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:'20px'}}>
            <div style={{...TIP,marginBottom:'6px'}}>{lang==='tr'?'Notlar':'Notes'}</div>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}
              placeholder={lang==='tr'?'Ek bilgiler...':'Additional notes...'} rows={2}
              style={{width:'100%',padding:'10px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:FONT,resize:'vertical',boxSizing:'border-box'}} />
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px'}}>
            <button onClick={()=>setAdding(false)} style={{padding:'10px 18px',borderRadius:'10px',fontSize:'13px',color:'rgba(255,255,255,0.35)',background:'transparent',border:'none',cursor:'pointer',fontFamily:FONT}}>
              {lang==='tr'?'İptal':'Cancel'}
            </button>
            <button onClick={addDebt} disabled={!form.person_name||!form.amount}
              style={{padding:'10px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`,color:'#fff',border:'none',cursor:'pointer',opacity:!form.person_name||!form.amount?0.4:1,fontFamily:FONT}}>
              {lang==='tr'?'Kaydet':'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Sekmeler */}
      <div style={{display:'flex',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'4px',marginBottom:'20px',width:'fit-content'}}>
        {[
          {v:'receivable', icon:'💚', label:lang==='tr'?'Alacaklar':'Receivables', count:receivables.length},
          {v:'payable',    icon:'🔴', label:lang==='tr'?'Verecekler':'Payables',    count:payables.length},
        ].map(t=>(
          <button key={t.v} onClick={()=>setTab(t.v)}
            style={{padding:'9px 20px',borderRadius:'9px',fontSize:'13px',fontWeight:tab===t.v?600:400,background:tab===t.v?theme.bg:'transparent',color:tab===t.v?theme.text:'rgba(255,255,255,0.4)',border:tab===t.v?`1px solid ${theme.border}`:'1px solid transparent',cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',gap:'7px'}}>
            {t.icon} {t.label}
            <span style={{background:'rgba(255,255,255,0.08)',borderRadius:'100px',padding:'1px 8px',fontSize:'11px',fontFamily:MONO}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:'48px',color:'rgba(255,255,255,0.25)',fontFamily:FONT,fontSize:'13px'}}>{lang==='tr'?'Yükleniyor...':'Loading...'}</div>
        ) : currentList.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'16px'}}>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>{tab==='receivable'?'💚':'🔴'}</div>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'14px',fontFamily:FONT,marginBottom:'16px'}}>
              {tab==='receivable'?(lang==='tr'?'Henüz alacak kaydı yok':'No receivables yet'):(lang==='tr'?'Henüz verecek kaydı yok':'No payables yet')}
            </div>
            <button onClick={()=>setAdding(true)}
              style={{padding:'10px 20px',borderRadius:'10px',fontSize:'13px',fontWeight:600,background:theme.bg,color:theme.text,border:`1px solid ${theme.border}`,cursor:'pointer',fontFamily:FONT}}>
              + {lang==='tr'?'İlk Kaydı Ekle':'Add First Entry'}
            </button>
          </div>
        ) : currentList.map(debt => {
          const st = STATUS[debt.status] || STATUS.pending
          const cat = CATS.find(c=>c.v===debt.category)
          const isSelected = selected?.id === debt.id
          const avatarColor = getAvatarColor(debt.person_name)
          const isOverdue = debt.due_date && new Date(debt.due_date) < new Date() && debt.status === 'pending'
          const paidAmt = Number(debt.paid_amount) || 0
          const totalAmt = Number(debt.amount)
          const remaining = totalAmt - paidAmt
          const paidPct = totalAmt > 0 ? Math.round((paidAmt / totalAmt) * 100) : 0

          return (
            <div key={debt.id}>
              <div onClick={()=>{setSelected(isSelected?null:debt);setShowPartialInput(false);setPartialAmount('')}}
                style={{background:isSelected?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.02)',border:`1px solid ${isSelected?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.06)'}`,borderRadius:isSelected?'16px 16px 0 0':'16px',padding:'18px 20px',cursor:'pointer',transition:'all 0.15s'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:avatarColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:800,color:'#fff',fontFamily:FONT,flexShrink:0}}>
                    {getAvatar(debt.person_name)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'3px'}}>
                      <span style={{color:'#f1f0ff',fontSize:'14px',fontWeight:600,fontFamily:FONT}}>{debt.person_name}</span>
                      {isOverdue && <span style={{fontSize:'10px',padding:'2px 8px',borderRadius:'100px',background:'rgba(239,68,68,0.15)',color:'#fca5a5',fontFamily:FONT}}>⚠️ {lang==='tr'?'Gecikmiş':'Overdue'}</span>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                      {debt.description && <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px',fontFamily:FONT}}>{debt.description}</span>}
                      {cat && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontFamily:FONT}}>{cat.icon} {cat.label}</span>}
                      {debt.due_date && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.25)',fontFamily:MONO}}>{new Date(debt.due_date).toLocaleDateString('tr-TR')}</span>}
                    </div>
                    {/* Kısmi ödeme progress */}
                    {paidAmt > 0 && debt.status !== 'paid' && (
                      <div style={{marginTop:'8px'}}>
                        <div style={{height:'4px',borderRadius:'100px',background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${paidPct}%`,background:'#67e8f9',borderRadius:'100px'}}></div>
                        </div>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',fontFamily:FONT,marginTop:'3px'}}>
                         {currencySymbol}{(paidAmt/currencyRate).toFixed(0)} {lang==='tr'?'ödendi':'paid'} · {currencySymbol}{(remaining/currencyRate).toFixed(0)} {lang==='tr'?'kaldı':'remaining'}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{color:tab==='receivable'?'#6ee7b7':'#fca5a5',fontSize:'18px',fontWeight:800,fontFamily:FONT}}>
                      {tab==='receivable'?'+':'−'}{currencySymbol}{(totalAmt/currencyRate).toLocaleString('tr-TR')}
                    </div>
                    {paidAmt > 0 && debt.status !== 'paid' && (
                      <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontFamily:FONT}}>₺{remaining.toFixed(0)} {lang==='tr'?'kaldı':'left'}</div>
                    )}
                    <span style={{fontSize:'11px',padding:'3px 10px',borderRadius:'100px',background:st.bg,color:st.color,border:`1px solid ${st.border}`,fontFamily:FONT,fontWeight:600}}>
                      {st.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detay paneli */}
              {isSelected && (
                <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',borderTop:'none',borderRadius:'0 0 16px 16px',padding:'16px 20px',animation:'fadeIn 0.2s ease'}}>

                  {/* Kişi bilgileri */}
                  <div style={{display:'flex',gap:'16px',marginBottom:'16px',flexWrap:'wrap'}}>
                    {debt.person_phone && (
                      <a href={`tel:${debt.person_phone}`} style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontFamily:FONT,textDecoration:'none'}}>
                        📞 {debt.person_phone}
                      </a>
                    )}
                    {debt.person_email && (
                      <a href={`mailto:${debt.person_email}`} style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,0.5)',fontSize:'13px',fontFamily:FONT,textDecoration:'none'}}>
                        ✉️ {debt.person_email}
                      </a>
                    )}
                    {debt.notes && <span style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',fontFamily:FONT}}>📝 {debt.notes}</span>}
                  </div>

                  {/* Kısmi ödeme */}
                  <div style={{marginBottom:'16px',padding:'14px',background:'rgba(6,182,212,0.06)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                      <div>
                        <div style={{color:'#67e8f9',fontSize:'13px',fontWeight:600,fontFamily:FONT}}>💳 {lang==='tr'?'Ödeme Durumu':'Payment Status'}</div>
                        <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',fontFamily:FONT,marginTop:'2px'}}>
                          {lang==='tr'?`₺${paidAmt.toFixed(0)} ödendi · ₺${remaining.toFixed(0)} kaldı`:`₺${paidAmt.toFixed(0)} paid · ₺${remaining.toFixed(0)} remaining`}
                        </div>
                      </div>
                      <div style={{color:'#67e8f9',fontSize:'20px',fontWeight:800,fontFamily:FONT}}>{paidPct}%</div>
                    </div>
                    {totalAmt > 0 && (
                      <div style={{height:'6px',borderRadius:'100px',background:'rgba(255,255,255,0.08)',marginBottom:'12px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${paidPct}%`,background:'#67e8f9',borderRadius:'100px',transition:'width 0.4s ease'}}></div>
                      </div>
                    )}

                    {debt.status !== 'paid' && (
                      <>
                        {!showPartialInput ? (
                          <button onClick={()=>setShowPartialInput(true)}
                            style={{padding:'8px 16px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'rgba(6,182,212,0.15)',color:'#67e8f9',border:'1px solid rgba(6,182,212,0.3)',cursor:'pointer',fontFamily:FONT}}>
                            + {lang==='tr'?'Ödeme Ekle':'Add Payment'}
                          </button>
                        ) : (
                          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                            <div style={{position:'relative',flex:1}}>
                              <span style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontFamily:MONO,fontSize:'13px'}}>₺</span>
                              <input type="number" value={partialAmount} onChange={e=>setPartialAmount(e.target.value)}
                                placeholder={lang==='tr'?'Ödenen tutar':'Amount paid'}
                                autoFocus
                                style={{width:'100%',padding:'9px 12px 9px 26px',borderRadius:'10px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(6,182,212,0.4)',color:'#f5f5f7',fontSize:'13px',outline:'none',fontFamily:MONO,boxSizing:'border-box'}} />
                            </div>
                            <button onClick={()=>addPartialPayment(debt)}
                              style={{padding:'9px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'rgba(6,182,212,0.2)',color:'#67e8f9',border:'1px solid rgba(6,182,212,0.4)',cursor:'pointer',fontFamily:FONT}}>
                              {lang==='tr'?'Kaydet':'Save'}
                            </button>
                            <button onClick={()=>{setShowPartialInput(false);setPartialAmount('')}}
                              style={{padding:'9px 12px',borderRadius:'10px',fontSize:'13px',background:'transparent',color:'rgba(255,255,255,0.3)',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontFamily:FONT}}>
                              ×
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Durum güncelle */}
                  <div style={{marginBottom:'14px'}}>
                    <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontFamily:FONT,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{lang==='tr'?'Durumu Güncelle':'Update Status'}</div>
                    <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                      {Object.entries(STATUS).map(([key, val]) => (
                        <button key={key} onClick={()=>updateStatus(debt.id,key)}
                          style={{padding:'6px 14px',borderRadius:'100px',fontSize:'12px',fontWeight:debt.status===key?700:400,background:debt.status===key?val.bg:'transparent',color:debt.status===key?val.color:'rgba(255,255,255,0.3)',border:`1px solid ${debt.status===key?val.border:'rgba(255,255,255,0.08)'}`,cursor:'pointer',fontFamily:FONT,transition:'all 0.15s'}}>
                          {val.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sil */}
                  <button onClick={()=>{if(confirm(lang==='tr'?'Bu kaydı silmek istediğinizden emin misiniz?':'Are you sure you want to delete this entry?'))deleteDebt(debt.id)}}
                    style={{padding:'8px 16px',borderRadius:'10px',fontSize:'12px',background:'rgba(239,68,68,0.1)',color:'#fca5a5',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer',fontFamily:FONT}}>
                    🗑️ {lang==='tr'?'Kaydı Sil':'Delete Entry'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
function MonthlyGoalContent({ userId, totalIncome, totalExp, totalSubs, netBal, lang, FONT, MONO, onClose }) {
  const SUPABASE_URL = 'https://cgfcdtjyhphppucnldor.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZmNkdGp5aHBocHB1Y25sZG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjAxMDAsImV4cCI6MjA5MzQ5NjEwMH0.Vxu08J2BOgTkTY2FXvoKmOj5-qR__p_091CUQsJZ118'

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`

  const [goals, setGoals] = React.useState({ income_goal: '', savings_goal: '', spending_limit: '' })
  const [savedGoals, setSavedGoals] = React.useState(null) // kaydedilen son değerler
  const [editing, setEditing] = React.useState(false) // düzenleme modu
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  React.useEffect(() => { loadGoals() }, [userId])

  async function loadGoals() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/monthly_goals?user_id=eq.${userId}&month=eq.${currentMonth}&select=*`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      )
      const data = await res.json()
      if (data && data[0]) {
        const g = {
          income_goal: data[0].income_goal || '',
          savings_goal: data[0].savings_goal || '',
          spending_limit: data[0].spending_limit || '',
        }
        setGoals(g)
        setSavedGoals(g)
        setEditing(false)
      } else {
        setEditing(true) // ilk kez — direkt düzenleme modunda başla
      }
    } catch(e) { setError('Yükleme hatası') }
    setLoading(false)
  }

  async function saveGoals() {
    setSaving(true)
    setError('')
    try {
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/monthly_goals?user_id=eq.${userId}&month=eq.${currentMonth}&select=id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      )
      const existing = await checkRes.json()
      const payload = {
        user_id: userId,
        month: currentMonth,
        income_goal: parseFloat(goals.income_goal) || null,
        savings_goal: parseFloat(goals.savings_goal) || null,
        spending_limit: parseFloat(goals.spending_limit) || null,
      }
      if (existing && existing.length > 0) {
        await fetch(
          `${SUPABASE_URL}/rest/v1/monthly_goals?user_id=eq.${userId}&month=eq.${currentMonth}`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, body: JSON.stringify(payload) }
        )
      } else {
        await fetch(
          `${SUPABASE_URL}/rest/v1/monthly_goals`,
          { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=representation' }, body: JSON.stringify(payload) }
        )
      }
      setSavedGoals({...goals})
      setEditing(false)
    } catch(e) { setError('Kayıt hatası') }
    setSaving(false)
  }

  const totalSpend = totalExp + totalSubs
  const currentSavings = totalIncome - totalSpend
  const savingsRate = totalIncome > 0 ? Math.round((currentSavings / totalIncome) * 100) : 0

  const goalDefs = [
    { key: 'income_goal', icon: '💚', label: lang==='tr'?'Gelir Hedefi':'Income Goal', desc: lang==='tr'?'Bu ay kazanmak istediğim tutar':'Target income for this month', color: '#6ee7b7', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', current: totalIncome, reverse: false, placeholder: '10000' },
    { key: 'savings_goal', icon: '💙', label: lang==='tr'?'Tasarruf Hedefi':'Savings Goal', desc: lang==='tr'?'Bu ay biriktirmek istediğim tutar':'Amount to save this month', color: '#67e8f9', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)', current: Math.max(currentSavings, 0), reverse: false, placeholder: '3000' },
    { key: 'spending_limit', icon: '⚠️', label: lang==='tr'?'Harcama Limiti':'Spending Limit', desc: lang==='tr'?'Bu ay max harcayabileceğim tutar':'Max spending allowed this month', color: '#fde68a', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', current: totalSpend, reverse: true, placeholder: '5000' },
  ]

  if (loading) return (
    <div style={{padding:'48px',textAlign:'center',color:'rgba(255,255,255,0.3)',fontFamily:FONT}}>
      <div style={{width:'24px',height:'24px',borderRadius:'50%',border:'2px solid rgba(255,255,255,0.08)',borderTop:'2px solid #10b981',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}></div>
      <div style={{fontSize:'13px'}}>{lang==='tr'?'Yükleniyor...':'Loading...'}</div>
    </div>
  )

  // ── GÖRÜNTÜLEME MODU ──
  if (!editing && savedGoals) {
    const hasAnyGoal = savedGoals.income_goal || savedGoals.savings_goal || savedGoals.spending_limit
    return (
      <div style={{padding:'24px 32px 32px'}}>
        {/* Özet */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'28px'}}>
          {[
            {label:lang==='tr'?'Gelir':'Income', value:`₺${totalIncome.toFixed(0)}`, color:'#6ee7b7'},
            {label:lang==='tr'?'Harcama':'Spending', value:`₺${totalSpend.toFixed(0)}`, color:'#fca5a5'},
            {label:lang==='tr'?'Tasarruf':'Saved', value:`₺${Math.max(currentSavings,0).toFixed(0)}`, color:'#67e8f9'},
            {label:lang==='tr'?'Oran':'Rate', value:`%${savingsRate}`, color:savingsRate>=30?'#6ee7b7':savingsRate>=15?'#fde68a':'#fca5a5'},
          ].map(item=>(
            <div key={item.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px 16px'}}>
              <div style={{color:'rgba(255,255,255,0.35)',fontSize:'11px',fontFamily:FONT,marginBottom:'6px'}}>{item.label}</div>
              <div style={{color:item.color,fontSize:'18px',fontWeight:700,fontFamily:FONT}}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Hedef kartları — görüntüleme */}
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px'}}>
          {goalDefs.map(card => {
            const goalVal = parseFloat(savedGoals[card.key]) || 0
            const pct = goalVal > 0 ? Math.min(Math.max((card.current / goalVal) * 100, 0), 100) : 0
            const isOver = card.current > goalVal && goalVal > 0
            const barColor = card.reverse
              ? (isOver ? '#fca5a5' : pct > 80 ? '#fde68a' : card.color)
              : (pct >= 100 ? '#6ee7b7' : card.color)

            return (
              <div key={card.key} style={{background:card.bg, border:`1px solid ${card.border}`, borderRadius:'16px', padding:'20px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: goalVal > 0 ? '14px' : '0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'20px'}}>{card.icon}</span>
                    <div>
                      <div style={{color:'#f1f0ff',fontSize:'14px',fontWeight:600,fontFamily:FONT}}>{card.label}</div>
                      <div style={{color:'rgba(255,255,255,0.3)',fontSize:'11px',fontFamily:FONT}}>{card.desc}</div>
                    </div>
                  </div>
                  {goalVal > 0 ? (
                    <div style={{textAlign:'right'}}>
                      <div style={{color:card.color,fontSize:'20px',fontWeight:800,fontFamily:FONT}}>₺{Number(goalVal).toLocaleString('tr-TR')}</div>
                      <div style={{color:'rgba(255,255,255,0.25)',fontSize:'11px',fontFamily:FONT}}>{lang==='tr'?'hedef':'target'}</div>
                    </div>
                  ) : (
                    <div style={{color:'rgba(255,255,255,0.2)',fontSize:'12px',fontFamily:FONT,fontStyle:'italic'}}>{lang==='tr'?'Hedef yok':'No goal'}</div>
                  )}
                </div>

                {goalVal > 0 && (
                  <>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'8px',fontFamily:FONT}}>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>
                        {lang==='tr'?'Mevcut:':'Current:'} <span style={{color:barColor,fontWeight:600}}>₺{card.current.toFixed(0)}</span>
                      </span>
                      <span style={{color:barColor,fontWeight:700}}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{height:'8px',borderRadius:'100px',background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:'100px',width:`${pct}%`,background:barColor,boxShadow:`0 0 10px ${barColor}55`}}></div>
                    </div>
                    {card.reverse && isOver && (
                      <div style={{marginTop:'10px',padding:'8px 12px',borderRadius:'8px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',fontSize:'12px',color:'#fca5a5',fontFamily:FONT}}>
                        ⚠️ {lang==='tr'?`Limit ₺${(card.current-goalVal).toFixed(0)} aşıldı!`:`Limit exceeded by ₺${(card.current-goalVal).toFixed(0)}!`}
                      </div>
                    )}
                    {!card.reverse && pct >= 100 && (
                      <div style={{marginTop:'10px',padding:'8px 12px',borderRadius:'8px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',fontSize:'12px',color:'#6ee7b7',fontFamily:FONT}}>
                        🎉 {lang==='tr'?'Hedefe ulaşıldı!':'Goal reached!'}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Düzenle butonu */}
        <button onClick={()=>setEditing(true)}
          style={{width:'100%',padding:'14px',borderRadius:'14px',fontSize:'14px',fontWeight:600,background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.6)',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:FONT,transition:'all 0.2s'}}>
          ✏️ {lang==='tr'?'Hedefleri Düzenle':'Edit Goals'}
        </button>
      </div>
    )
  }

  // ── DÜZENLEME MODU ──
  return (
    <div style={{padding:'24px 32px 32px'}}>
      {error && (
        <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'10px',padding:'10px 16px',marginBottom:'16px',color:'#fca5a5',fontSize:'13px',fontFamily:FONT}}>
          ⚠️ {error}
        </div>
      )}

      {/* Özet */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'28px'}}>
        {[
          {label:lang==='tr'?'Gelir':'Income', value:`₺${totalIncome.toFixed(0)}`, color:'#6ee7b7'},
          {label:lang==='tr'?'Harcama':'Spending', value:`₺${totalSpend.toFixed(0)}`, color:'#fca5a5'},
          {label:lang==='tr'?'Tasarruf':'Saved', value:`₺${Math.max(currentSavings,0).toFixed(0)}`, color:'#67e8f9'},
          {label:lang==='tr'?'Oran':'Rate', value:`%${savingsRate}`, color:savingsRate>=30?'#6ee7b7':savingsRate>=15?'#fde68a':'#fca5a5'},
        ].map(item=>(
          <div key={item.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'14px 16px'}}>
            <div style={{color:'rgba(255,255,255,0.35)',fontSize:'11px',fontFamily:FONT,marginBottom:'6px'}}>{item.label}</div>
            <div style={{color:item.color,fontSize:'18px',fontWeight:700,fontFamily:FONT}}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Hedef inputlar */}
      <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'24px'}}>
        {goalDefs.map(card => (
          <div key={card.key} style={{background:card.bg, border:`1px solid ${card.border}`, borderRadius:'16px', padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
              <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(255,255,255,0.05)',border:`1px solid ${card.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>
                {card.icon}
              </div>
              <div>
                <div style={{color:'#f1f0ff',fontSize:'14px',fontWeight:600,fontFamily:FONT}}>{card.label}</div>
                <div style={{color:'rgba(255,255,255,0.35)',fontSize:'12px',fontFamily:FONT}}>{card.desc}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <div style={{position:'relative',flex:1}}>
                <span style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.4)',fontSize:'14px',fontFamily:FONT}}>₺</span>
                <input
                  type="number"
                  value={goals[card.key]}
                  onChange={e=>setGoals({...goals,[card.key]:e.target.value})}
                  placeholder={card.placeholder}
                  style={{width:'100%',padding:'12px 14px 12px 32px',borderRadius:'12px',background:'rgba(0,0,0,0.25)',border:`1px solid ${card.border}`,color:'#f5f5f7',fontSize:'14px',outline:'none',fontFamily:FONT,boxSizing:'border-box'}}
                />
              </div>
              {goals[card.key] && (
                <button onClick={()=>setGoals({...goals,[card.key]:''})}
                  style={{padding:'12px 14px',borderRadius:'12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.35)',cursor:'pointer',fontSize:'12px',fontFamily:FONT}}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Butonlar */}
      <div style={{display:'flex',gap:'10px'}}>
        {savedGoals && (
          <button onClick={()=>{setGoals(savedGoals);setEditing(false)}}
            style={{padding:'14px 20px',borderRadius:'14px',fontSize:'14px',fontWeight:600,background:'transparent',color:'rgba(255,255,255,0.4)',border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',fontFamily:FONT}}>
            {lang==='tr'?'İptal':'Cancel'}
          </button>
        )}
        <button onClick={saveGoals} disabled={saving}
          style={{flex:1,padding:'14px',borderRadius:'14px',fontSize:'15px',fontWeight:700,
            background:'linear-gradient(135deg,#10b981,#059669)',
            color:'#fff',border:'none',
            cursor:saving?'not-allowed':'pointer',fontFamily:FONT,
            opacity:saving?0.7:1,
            boxShadow:'0 4px 20px rgba(16,185,129,0.3)'}}>
          {saving?(lang==='tr'?'⏳ Kaydediliyor...':'⏳ Saving...'):(lang==='tr'?'🎯 Hedefleri Kaydet':'🎯 Save Goals')}
        </button>
      </div>
    </div>
  )
}


