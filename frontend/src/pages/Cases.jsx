import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCases, createCase, deleteCase } from '../services/api'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  OPEN:   { bg:'rgba(0,170,255,0.12)',   color:'#00aaff', border:'rgba(0,170,255,0.3)' },
  ACTIVE: { bg:'rgba(255,51,102,0.12)',  color:'#ff3366', border:'rgba(255,51,102,0.3)' },
  SOLVED: { bg:'rgba(0,255,136,0.12)',   color:'#00ff88', border:'rgba(0,255,136,0.3)' },
  CLOSED: { bg:'rgba(157,78,221,0.12)',  color:'#9d4edd', border:'rgba(157,78,221,0.3)' },
  COLD:   { bg:'rgba(71,85,105,0.15)',   color:'#94a3b8', border:'rgba(71,85,105,0.3)' },
}
const PRIORITY_STYLES = {
  LOW:      { color:'#00ff88', bg:'rgba(0,255,136,0.1)',   border:'rgba(0,255,136,0.25)' },
  MEDIUM:   { color:'#ffaa00', bg:'rgba(255,170,0,0.1)',   border:'rgba(255,170,0,0.25)' },
  HIGH:     { color:'#ff6600', bg:'rgba(255,102,0,0.1)',   border:'rgba(255,102,0,0.25)' },
  CRITICAL: { color:'#ff3366', bg:'rgba(255,51,102,0.1)',  border:'rgba(255,51,102,0.25)' },
}
const CRIME_TYPES = ['ROBBERY','ASSAULT','BURGLARY','MURDER','FRAUD','KIDNAPPING','HIT_AND_RUN','CYBERCRIME','DRUG_OFFENSE','PHISHING','RANSOMWARE','IDENTITY_THEFT']

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  )
}
function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM
  return (
    <span className="badge" style={{ background: p.bg, color: p.color, border: `1px solid ${p.border}` }}>
      {priority}
    </span>
  )
}

export default function Cases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({
    title:'', description:'', location:'', latitude:'', longitude:'',
    crimeType:'', priority:'MEDIUM', incidentDate:''
  })
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  const load = () => {
    setLoading(true)
    getAllCases()
      .then(r => setCases(r.data))
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.incidentDate) { toast.error('Title and incident date required'); return }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await createCase({ ...form, createdById: user.id })
      toast.success('Case created successfully')
      setShowForm(false)
      setForm({ title:'', description:'', location:'', latitude:'', longitude:'', crimeType:'', priority:'MEDIUM', incidentDate:'' })
      load()
    } catch { toast.error('Failed to create case') }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this case? This action cannot be undone.')) return
    try { await deleteCase(id); toast.success('Case deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const filtered = cases.filter(c =>
    (filter === 'ALL' || c.status === filter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) ||
     c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
     (c.crimeType || '').toLowerCase().includes(search.toLowerCase()))
  )

  const statusCounts = ['OPEN','ACTIVE','SOLVED','CLOSED','COLD'].reduce((acc, s) => {
    acc[s] = cases.filter(c => c.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-5">

      {/* ── HEADER STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'ALL' : status)}
              className="glass-card p-3 text-center transition-all hover:scale-105"
              style={{
                borderTop: filter === status ? `2px solid ${s.color}` : '2px solid transparent',
                opacity: filter !== 'ALL' && filter !== status ? 0.5 : 1,
              }}
            >
              <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{count}</div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{status}</div>
            </button>
          )
        })}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="form-input pl-9"
              placeholder="Search by title, number, type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Status filter */}
          <select className="form-input w-full sm:w-36" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            {['OPEN','ACTIVE','SOLVED','CLOSED','COLD'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Case
        </button>
      </div>

      {/* ── CREATE FORM ── */}
      {showForm && (
        <div className="glass-card p-6 animate-fade-up" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Create New Case</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill in the incident details to open a new investigation</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Case Title *</label>
              <input className="form-input" placeholder="e.g. Ransomware Attack — FinTech Corp" required
                value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Crime Type</label>
              <select className="form-input" value={form.crimeType} onChange={e => setForm(p=>({...p,crimeType:e.target.value}))}>
                <option value="">Select Type</option>
                {CRIME_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority Level</label>
              <select className="form-input" value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))}>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Incident Date & Time *</label>
              <input className="form-input" type="datetime-local" required
                value={form.incidentDate} onChange={e => setForm(p=>({...p,incidentDate:e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Location</label>
              <input className="form-input" placeholder="e.g. Andheri East, Mumbai"
                value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Latitude</label>
              <input className="form-input" type="number" step="0.0001" placeholder="12.9716"
                value={form.latitude} onChange={e => setForm(p=>({...p,latitude:e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Longitude</label>
              <input className="form-input" type="number" step="0.0001" placeholder="77.5946"
                value={form.longitude} onChange={e => setForm(p=>({...p,longitude:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
              <textarea className="form-input" rows={3} placeholder="Brief incident description..."
                value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <button type="submit" className="btn-accent flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Create Case
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── CASES TABLE ── */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">
              {filter !== 'ALL' ? `${filter} Cases` : 'All Cases'}
            </h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background:'rgba(0,170,255,0.1)', color:'#00aaff', border:'1px solid rgba(0,170,255,0.2)' }}
            >
              {filtered.length}
            </span>
          </div>
          {filter !== 'ALL' && (
            <button onClick={() => setFilter('ALL')} className="text-xs text-slate-500 hover:text-slate-300">
              Clear filter ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="spinner" style={{ width:'32px', height:'32px', borderWidth:'3px' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  {['Case No.','Title','Crime Type','Location','Status','Priority','Date',''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    className="transition-colors cursor-pointer group"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{c.caseNumber}</td>
                    <td className="px-5 py-3.5 font-semibold text-sm text-white max-w-[200px] truncate group-hover:text-green-400 transition-colors">
                      {c.title}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {c.crimeType ? c.crimeType.replace(/_/g,' ') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[150px] truncate">
                      {c.location ? (
                        <span className="flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {c.location}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-500 font-mono whitespace-nowrap">
                      {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c.id}`) }}
                          className="text-[11px] font-semibold text-green-400 hover:underline"
                        >View</button>
                        <span className="text-slate-700">·</span>
                        <button
                          onClick={(e) => handleDelete(c.id, e)}
                          className="text-[11px] font-semibold text-red-400 hover:underline"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <div className="text-4xl mb-3 opacity-20">📁</div>
                      <p className="text-sm text-slate-600">No cases found</p>
                      {search && (
                        <button onClick={() => setSearch('')} className="text-xs text-green-400 mt-2 hover:underline">
                          Clear search
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
