import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, getRecentCases, getCrimeTypes } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import toast from 'react-hot-toast'

const STATUS_COLORS  = { OPEN:'#00aaff', ACTIVE:'#ff3366', SOLVED:'#00ff88', CLOSED:'#9d4edd', COLD:'#475569' }
const PRIORITY_COLOR = { LOW:'#00ff88', MEDIUM:'#ffaa00', HIGH:'#ff6600', CRITICAL:'#ff3366' }

const STAT_CARDS = [
  { key: 'totalCases',     label: 'Total Cases',     color: '#00aaff', grad: 'from-blue-600/20 to-blue-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )},
  { key: 'activeCases',    label: 'Active Cases',    color: '#ff3366', grad: 'from-red-600/20 to-red-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )},
  { key: 'totalSuspects',  label: 'Suspects',        color: '#ffaa00', grad: 'from-amber-600/20 to-amber-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )},
  { key: 'totalEvidence',  label: 'Evidence Items',  color: '#00ff88', grad: 'from-green-600/20 to-green-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )},
  { key: 'solvedCases',    label: 'Cases Solved',    color: '#9d4edd', grad: 'from-purple-600/20 to-purple-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )},
  { key: 'totalWitnesses', label: 'Witnesses',        color: '#00ccaa', grad: 'from-teal-600/20 to-teal-600/5', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )},
]

function AnimatedCounter({ value, duration = 1200 }) {
  const [count, setCount] = useState(0)
  const frameRef = useRef()
  useEffect(() => {
    if (!value) return
    let start = 0
    const step = value / (duration / 16)
    const tick = () => {
      start = Math.min(start + step, value)
      setCount(Math.floor(start))
      if (start < value) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])
  return <span>{count}</span>
}

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl text-xs" 
         style={{ background: '#0d1224', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || '#00ff88' }} className="font-bold font-mono">{p.value}</p>
      ))}
    </div>
  )
}

const TREND_DATA = [
  { month:'Aug', cases:4,  solved:2 },
  { month:'Sep', cases:7,  solved:5 },
  { month:'Oct', cases:10, solved:7 },
  { month:'Nov', cases:6,  solved:4 },
  { month:'Dec', cases:13, solved:9 },
  { month:'Jan', cases:9,  solved:6 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentCases, setRecentCases] = useState([])
  const [crimeTypes, setCrimeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getStats(), getRecentCases(), getCrimeTypes()])
      .then(([s, r, c]) => {
        setStats(s.data)
        setRecentCases(r.data)
        setCrimeTypes(Object.entries(c.data || {}).map(([name, count]) => ({ name, count })))
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="spinner mx-auto mb-3" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
        <p className="text-xs text-slate-600 tracking-widest animate-pulse">LOADING INTEL...</p>
      </div>
    </div>
  )

  const statusData = Object.entries(stats?.caseStatusBreakdown || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-5">

      {/* ── HERO BANNER ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ minHeight: '180px' }}
      >
        {/* Dashboard hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dashboard_hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060915]/95 via-[#060915]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060915]/80 to-transparent" />
        <div className="scan-overlay" />

        <div className="relative z-10 p-6 md:p-8 flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-[0.2em] uppercase"
                style={{ background: 'rgba(255,51,102,0.15)', color: '#ff3366', border: '1px solid rgba(255,51,102,0.3)' }}
              >
                ● LIVE OPERATIONS
              </span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                COMMAND <span className="text-glow-green">OVERVIEW</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">Real-time cybercrime intelligence • All systems operational</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              <span className="w-px h-3 bg-slate-700" />
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                National Cyber Crime Unit, India
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <button
              onClick={() => navigate('/cases')}
              className="btn-accent flex items-center gap-2"
              style={{ padding: '0.7rem 1.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Case
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map(({ key, label, color, icon }, i) => (
          <div
            key={key}
            className={`stat-card animate-fade-up stagger-${i + 1}`}
            style={{ opacity: 0 }}
          >
            {/* Top colour line */}
            <div
              className="stat-card-line"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
            />
            <div className="flex items-center justify-between mb-3">
              <span style={{ color }} className="opacity-80">{icon}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              />
            </div>
            <div
              className="text-2xl font-bold font-mono leading-none mb-1"
              style={{ color, fontFamily: 'JetBrains Mono, monospace' }}
            >
              <AnimatedCounter value={stats?.[key] || 0} />
            </div>
            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Case Status Donut */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Case Status
            </h3>
            <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-1 rounded">
              {statusData.reduce((a, b) => a + b.value, 0)} Total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={48} outerRadius={68}
                paddingAngle={4}
                strokeWidth={0}
              >
                {statusData.map(({ name }) => (
                  <Cell key={name} fill={STATUS_COLORS[name] || '#475569'} />
                ))}
              </Pie>
              <Tooltip content={<CUSTOM_TOOLTIP />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {statusData.map(({ name, value }) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[name] || '#475569' }} />
                <span className="text-slate-500 truncate">{name}</span>
                <span className="text-white font-bold font-mono ml-auto">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Monthly Trend
            </h3>
            <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-1 rounded">6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00aaff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00aaff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Area type="monotone" dataKey="cases" stroke="#00aaff" fill="url(#casesGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="solved" stroke="#00ff88" fill="url(#solvedGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1">
            {[{ key: 'cases', label: 'Reported', color: '#00aaff' }, { key: 'solved', label: 'Solved', color: '#00ff88' }].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Crime Types */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Crime Types
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={crimeTypes.length ? crimeTypes : [{ name: 'No Data', count: 0 }]}
              layout="vertical"
              margin={{ top: 0, right: 10, bottom: 0, left: -5 }}
            >
              <XAxis type="number" tick={{ fill: '#334155', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category" dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false}
                width={90}
              />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {(crimeTypes.length ? crimeTypes : [{ name: 'No Data', count: 0 }]).map((_, idx) => {
                  const colors = ['#ffaa00', '#ff3366', '#00aaff', '#9d4edd', '#00ff88', '#ff6600']
                  return <Cell key={idx} fill={colors[idx % colors.length]} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── RECENT CASES TABLE ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="section-title">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Recent Cases
          </h3>
          <button onClick={() => navigate('/cases')} className="btn-ghost text-xs py-1.5 px-3">
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Case No.', 'Title', 'Type', 'Status', 'Priority', 'Date', ''].map(h => (
                  <th key={h} className="pb-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCases.map(c => (
                <tr
                  key={c.id}
                  className="transition-colors cursor-pointer group"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <td className="py-3 font-mono text-[11px] text-slate-500">{c.caseNumber}</td>
                  <td className="py-3 font-medium text-white text-sm group-hover:text-green-400 transition-colors">{c.title}</td>
                  <td className="py-3 text-xs text-slate-500">{c.crimeType || '—'}</td>
                  <td className="py-3">
                    <span
                      className="badge"
                      style={{
                        background: `${STATUS_COLORS[c.status]}15`,
                        color: STATUS_COLORS[c.status],
                        border: `1px solid ${STATUS_COLORS[c.status]}30`,
                      }}
                    >{c.status}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className="badge"
                      style={{
                        background: `${PRIORITY_COLOR[c.priority]}15`,
                        color: PRIORITY_COLOR[c.priority],
                        border: `1px solid ${PRIORITY_COLOR[c.priority]}30`,
                      }}
                    >{c.priority}</span>
                  </td>
                  <td className="py-3 text-xs text-slate-600 font-mono">
                    {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </td>
                </tr>
              ))}
              {recentCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-slate-600 text-sm">No cases found</div>
                    <button onClick={() => navigate('/cases')} className="btn-accent mt-4 text-xs py-2 px-4">
                      Create First Case
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Log Evidence',    icon: '🔬', path: '/evidence',  color: '#00ff88' },
          { label: 'Add Suspect',     icon: '🕵️', path: '/suspects',  color: '#ffaa00' },
          { label: 'View Timeline',   icon: '⏱️', path: '/timeline',  color: '#00aaff' },
          { label: 'AI Insights',     icon: '🤖', path: '/ai-insights', color: '#9d4edd' },
        ].map(({ label, icon, path, color }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            style={{ textAlign: 'center' }}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
