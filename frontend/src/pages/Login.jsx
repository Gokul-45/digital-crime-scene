import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const CRIME_STATS = [
  { value: '2.4M+', label: 'Cases Analysed' },
  { value: '98.2%', label: 'Detection Rate' },
  { value: '147',   label: 'Active Ops' },
]

const TYPING_TEXTS = [
  'Analysing digital footprints...',
  'Cross-referencing threat actors...',
  'Scanning dark web signatures...',
  'Reconstructing crime timelines...',
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [typingIdx, setTypingIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)

  // Typing animation
  useEffect(() => {
    const current = TYPING_TEXTS[typingIdx]
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 45)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setCharIdx(0)
        setTypingIdx(i => (i + 1) % TYPING_TEXTS.length)
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [charIdx, typingIdx])

  useEffect(() => {
    setTypingText(TYPING_TEXTS[typingIdx].slice(0, charIdx))
  }, [charIdx, typingIdx])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Fill all fields'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Access granted. Welcome, Officer.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally { setLoading(false) }
  }

  const fillDemo = (role) => {
    const creds = {
      admin:        { username: 'admin',      password: 'password123' },
      investigator: { username: 'det_sharma', password: 'password123' },
      analyst:      { username: 'analyst_ak', password: 'password123' },
    }
    setForm(creds[role])
    toast('Credentials filled — click Authenticate', { icon: '🔑' })
  }

  return (
    <div className="min-h-screen flex overflow-hidden relative">

      {/* ── LEFT PANEL — HERO IMAGE ── */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col">
        {/* Cybercrime background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/login_bg.png)' }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060915]/30 via-[#060915]/10 to-[#060915]/80" />
        {/* Scan line effect */}
        <div className="absolute inset-0 matrix-overlay pointer-events-none" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Agency branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.4)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-green-400 tracking-[0.2em] uppercase">National Cyber Crime Unit</p>
              <p className="text-[10px] text-slate-500 tracking-wider">NCCU • Forensics Division</p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs"
                   style={{ background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)', color: '#ff3366' }}>
                <span className="pulse-dot text-[#ff3366]" style={{ backgroundColor: '#ff3366' }} />
                CLASSIFIED — RESTRICTED ACCESS
              </div>

              <h1 style={{ fontFamily: 'Rajdhani, sans-serif' }} 
                  className="text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-white">DIGITAL</span><br/>
                <span className="text-glow-green">CRIME SCENE</span><br/>
                <span className="text-white">RECONSTRUCTION</span>
              </h1>

              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                AI-powered forensic investigation platform for cybercrime analysis, 
                suspect profiling, and digital evidence reconstruction.
              </p>

              {/* Typing terminal */}
              <div 
                className="rounded-xl p-4 font-mono text-xs max-w-sm"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,136,0.2)' }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-slate-600 ml-2">terminal — dcsr@nccu</span>
                </div>
                <div className="text-green-400">
                  <span className="text-slate-500">{'>'} </span>
                  {typingText}
                  <span className="animate-pulse">▌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6">
            {CRIME_STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-glow-green" style={{ fontFamily: 'JetBrains Mono' }}>
                  {value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — LOGIN FORM ── */}
      <div 
        className="w-full lg:w-5/12 flex items-center justify-center p-6 relative"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #060915 100%)' }}
      >
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} 
        />
        {/* Radial glow */}
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-sm z-10 animate-fade-up">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">DCSR System</h1>
            <p className="text-xs text-slate-500 mt-1">Digital Crime Scene Reconstruction</p>
          </div>

          {/* Top separator */}
          <div className="h-px w-full mb-8 rounded-full"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.6), transparent)' }} />

          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white tracking-tight">Officer Authentication</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the system</p>
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Officer ID / Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-input pl-9"
                  placeholder="e.g. det_sharma"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Security Code
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input pl-9 pr-10"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3.5 flex items-center justify-center gap-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: '16px', height: '16px' }} /> AUTHENTICATING...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  AUTHENTICATE
                </>
              )}
            </button>
          </form>

          {/* Demo access */}
          <div className="mt-7 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-slate-600 text-center mb-3 uppercase tracking-[0.2em]">
              Demo Quick-Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'admin',        label: 'Admin',        icon: '👑', color: '#ff3366' },
                { role: 'investigator', label: 'Investigator', icon: '🕵️', color: '#00aaff' },
                { role: 'analyst',      label: 'Analyst',      icon: '🔬', color: '#ffaa00' },
              ].map(({ role, label, icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(role)}
                  className="py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 hover:brightness-125"
                  style={{
                    background: `rgba(0,0,0,0.3)`,
                    color,
                    border: `1px solid ${color}25`,
                  }}
                >
                  <div>{icon}</div>
                  <div className="mt-0.5">{label}</div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-700 text-center mt-3">All demo accounts: password123</p>
          </div>

          <div className="h-px w-full mt-7 mb-5 rounded-full"
               style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)' }} />

          <p className="text-center text-[10px] text-slate-700 tracking-wider">
            DCSR v2.0 • National Cyber Crime Unit • Unauthorized access is a criminal offence under IT Act 2000
          </p>
        </div>
      </div>
    </div>
  )
}
