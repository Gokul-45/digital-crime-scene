import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { path: '/',            label: 'Dashboard',   icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  )},
  { path: '/cases',       label: 'Cases',        icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )},
  { path: '/evidence',    label: 'Evidence',     icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  )},
  { path: '/witnesses',   label: 'Witnesses',    icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )},
  { path: '/suspects',    label: 'Suspects',     icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
      <path d="m15 10 1 1-1 1M9 10l-1 1 1 1" strokeWidth="1.5"/>
    </svg>
  )},
  { path: '/timeline',    label: 'Timeline',     icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )},
  { path: '/ai-insights', label: 'AI Insights',  icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V14h2v2h-2v1h2v2h-2v1h-2v-1H9v-2h2v-1H9v-2h2v-1.1A5.001 5.001 0 0 1 7 7a5 5 0 0 1 5-5z"/>
    </svg>
  )},
  { path: '/reports',     label: 'Reports',      icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
]

const ROLE_COLOR = {
  ADMIN: '#ff3366',
  INVESTIGATOR: '#00aaff',
  ANALYST: '#ffaa00',
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Session terminated securely')
    navigate('/login')
  }

  const closeSidebar = () => setIsOpen(false)
  const roleColor = ROLE_COLOR[user?.role] || '#00aaff'

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-60 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0a0f1e 0%, #060915 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* ── LOGO ── */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,204,170,0.1))',
                border: '1px solid rgba(0,255,136,0.3)',
                boxShadow: '0 0 15px rgba(0,255,136,0.15)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: '#00ff88' }}>
                DCSR System
              </h1>
              <p className="text-[10px] text-slate-600 tracking-wider">Cyber Forensics</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-600 hover:text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── LIVE INDICATOR ── */}
        <div className="px-4 py-2.5">
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', color: '#00ff88' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Operational
          </div>
        </div>

        {/* ── NAVIGATION ── */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={closeSidebar}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── QUICK STATS ── */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[9px] text-slate-700 uppercase tracking-[0.2em] mb-2">System Status</p>
          <div className="space-y-1.5">
            {[
              { label: 'AI Engine',   val: 'Online',  color: '#00ff88' },
              { label: 'DB Sync',     val: 'Active',  color: '#00aaff' },
              { label: 'Alert Level', val: 'Moderate',color: '#ffaa00' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── USER PROFILE ── */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}15)`,
                border: `1px solid ${roleColor}40`,
                color: roleColor,
              }}
            >
              {user?.fullName?.[0] || user?.username?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {user?.fullName || user?.username}
              </p>
              <span
                className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 uppercase tracking-wider"
                style={{ background: `${roleColor}15`, color: roleColor, border: `1px solid ${roleColor}25` }}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all hover:text-red-400"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#475569',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  )
}
