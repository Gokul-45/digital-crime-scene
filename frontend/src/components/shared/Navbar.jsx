import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'

const PAGE_INFO = {
  '/':            { title: 'Command Dashboard',          subtitle: 'Real-time case overview & analytics', icon: '🎯' },
  '/cases':       { title: 'Case Management',            subtitle: 'Active & archived investigations',    icon: '📁' },
  '/evidence':    { title: 'Evidence Repository',        subtitle: 'Physical & digital evidence log',     icon: '🔬' },
  '/witnesses':   { title: 'Witness Analysis',           subtitle: 'NLP-powered testimony processing',    icon: '👁' },
  '/suspects':    { title: 'Suspect Profiling',          subtitle: 'AI probability scoring & tracking',   icon: '🕵' },
  '/timeline':    { title: 'Crime Timeline',             subtitle: 'Chronological event reconstruction',  icon: '⏱' },
  '/ai-insights': { title: 'AI Threat Insights',         subtitle: 'Machine-generated forensic alerts',   icon: '🤖' },
  '/reports':     { title: 'Investigation Reports',      subtitle: 'Generate & export case summaries',    icon: '📊' },
}

const ALERT_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

export default function Navbar({ toggleSidebar }) {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const info = PAGE_INFO[pathname] || { title: 'DCSR System', subtitle: '', icon: '🔍' }
  const [time, setTime] = useState(new Date())
  const [alertLevel] = useState('MODERATE')

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const alertColor = { LOW: '#00ff88', MODERATE: '#ffaa00', HIGH: '#ff6600', CRITICAL: '#ff3366' }[alertLevel]

  return (
    <header
      className="h-14 px-4 md:px-5 flex items-center justify-between sticky top-0 z-10"
      style={{
        background: 'rgba(6,9,21,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
          aria-label="Toggle Sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Breadcrumb separator */}
        <div className="hidden md:flex items-center gap-2 text-slate-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="text-[10px] text-slate-700 tracking-wider">NCCU</span>
          <span className="text-slate-800">/</span>
        </div>

        <div className="min-w-0">
          <h1 className="text-sm font-bold text-white truncate leading-tight">{info.title}</h1>
          <p className="text-[10px] text-slate-600 hidden sm:block truncate leading-tight">{info.subtitle}</p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        {/* Live clock */}
        <div
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-[10px] font-mono text-slate-500">
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>

        {/* Alert level */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: `${alertColor}10`,
            border: `1px solid ${alertColor}25`,
            color: alertColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: alertColor }} />
          {alertLevel}
        </div>

        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 hidden sm:inline tracking-wider">LIVE</span>
        </div>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/5"
          style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
            style={{ background: '#ff3366', color: 'white' }}
          >3</span>
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #00ff88, #00ccaa)',
            color: '#060915',
          }}
          title={user?.fullName || user?.username}
        >
          {user?.fullName?.[0] || user?.username?.[0] || '?'}
        </div>
      </div>
    </header>
  )
}
