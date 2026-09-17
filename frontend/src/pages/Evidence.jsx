import { useState, useEffect } from 'react'
import { getAllCases, getEvidenceByCase, addEvidence, deleteEvidence } from '../services/api'
import toast from 'react-hot-toast'

const TYPE_ICON = { IMAGE:'🖼️', VIDEO:'🎥', DOCUMENT:'📄', AUDIO:'🔊', PHYSICAL:'🔬', DIGITAL:'💾', OTHER:'📦' }

export default function Evidence() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [evidence, setEvidence] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('ALL')
  const [form, setForm] = useState({
    title:'', description:'', type:'IMAGE', location:'', latitude:'', longitude:'',
    forensicNotes:'', tags:'', isKeyEvidence: false, chainOfCustody:'', collectedAt:''
  })

  useEffect(() => {
    getAllCases().then(r => { setCases(r.data); if(r.data.length) setSelectedCase(r.data[0].id) })
  }, [])

  useEffect(() => {
    if (!selectedCase) return
    setLoading(true)
    getEvidenceByCase(selectedCase)
      .then(r => setEvidence(r.data))
      .finally(() => setLoading(false))
  }, [selectedCase])

  const handleAdd = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      await addEvidence({ ...form, caseId: selectedCase, uploadedById: user.id,
        latitude: form.latitude || null, longitude: form.longitude || null,
        collectedAt: form.collectedAt || new Date().toISOString().slice(0,16)
      })
      toast.success('Evidence added')
      setShowForm(false)
      getEvidenceByCase(selectedCase).then(r => setEvidence(r.data))
    } catch { toast.error('Failed to add evidence') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this evidence?')) return
    try { await deleteEvidence(id); setEvidence(ev => ev.filter(e => e.id !== id)); toast.success('Removed') }
    catch { toast.error('Delete failed') }
  }

  const filtered = filterType === 'ALL' ? evidence : evidence.filter(e => e.type === filterType)

  return (
    <div className="space-y-5">
      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '130px' }}>
        <div className="absolute inset-0 bg-cover bg-center"
             style={{ backgroundImage: 'url(/images/evidence_bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060915]/95 via-[#060915]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060915]/80 to-transparent" />
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background:'rgba(0,255,136,0.12)', color:'#00ff88', border:'1px solid rgba(0,255,136,0.3)' }}>
                ● FORENSIC EVIDENCE LOG
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              EVIDENCE <span className="text-glow-green">REPOSITORY</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">Chain of custody • Digital & physical evidence • Forensic analysis</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-2xl font-bold font-mono text-green-400">{evidence.length}</div>
            <div className="text-[10px] text-slate-600 uppercase tracking-wider">Items Logged</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select className="form-input w-56" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
            <option value="">Select Case</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
          </select>
          <select className="form-input w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="ALL">All Types</option>
            {Object.keys(TYPE_ICON).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-accent" disabled={!selectedCase}>
          + Add Evidence
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="section-title">🔬 Log New Evidence</h3>
            <button onClick={() => setShowForm(false)} className="text-crime-muted hover:text-crime-red text-xl">×</button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Title *</label>
              <input className="form-input" required placeholder="Evidence title"
                value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                {Object.keys(TYPE_ICON).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Collected At</label>
              <input className="form-input" type="datetime-local" value={form.collectedAt}
                onChange={e => setForm(p=>({...p,collectedAt:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Collection Location</label>
              <input className="form-input" placeholder="Where was it found?"
                value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Tags (comma-separated)</label>
              <input className="form-input" placeholder="fingerprint, cctv, weapon"
                value={form.tags} onChange={e => setForm(p=>({...p,tags:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Description</label>
              <textarea className="form-input" rows={2} placeholder="Details..."
                value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Forensic Notes</label>
              <textarea className="form-input" rows={2} placeholder="Lab analysis, notes..."
                value={form.forensicNotes} onChange={e => setForm(p=>({...p,forensicNotes:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Chain of Custody</label>
              <input className="form-input" placeholder="Officer → Lab → Storage"
                value={form.chainOfCustody} onChange={e => setForm(p=>({...p,chainOfCustody:e.target.value}))} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="keyEvidence" checked={form.isKeyEvidence}
                onChange={e => setForm(p=>({...p,isKeyEvidence:e.target.checked}))}
                className="w-4 h-4 accent-crime-accent" />
              <label htmlFor="keyEvidence" className="text-sm text-crime-text">Mark as Key Evidence</label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-accent">Add Evidence</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Evidence Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8 border-4" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(e => (
            <div key={e.id} className={`glass-card p-4 relative ${e.isKeyEvidence ? 'border-crime-red border-opacity-40' : ''}`}>
              {e.isKeyEvidence && (
                <span className="absolute top-3 right-3 badge-red text-xs">KEY</span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{TYPE_ICON[e.type] || '📦'}</span>
                <div>
                  <h4 className="text-sm font-semibold text-crime-text">{e.title}</h4>
                  <p className="text-xs text-crime-muted font-mono">{e.evidenceNumber}</p>
                </div>
              </div>
              {e.description && <p className="text-xs text-crime-muted mb-2 line-clamp-2">{e.description}</p>}
              {e.forensicNotes && (
                <div className="text-xs text-crime-blue mb-2 bg-crime-bg rounded p-2">
                  🔬 {e.forensicNotes}
                </div>
              )}
              {e.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {e.tags.split(',').map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 text-xs rounded bg-crime-border text-crime-muted">#{tag.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-crime-border">
                <span className="badge-blue text-xs">{e.type}</span>
                <button onClick={() => handleDelete(e.id)} className="text-xs text-crime-red hover:underline">Remove</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-3 text-center py-12 text-crime-muted">
              No evidence found. Add items using the button above.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
