import { useState, useEffect } from 'react'
import { getAllCases, getWitnessesByCase, addWitness, analyzeWitness, deleteWitness } from '../services/api'
import toast from 'react-hot-toast'

export default function Witnesses() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [witnesses, setWitnesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [analyzing, setAnalyzing] = useState(null)
  const [form, setForm] = useState({ name:'', age:'', contact:'', address:'', statement:'', witnessType:'EYE_WITNESS' })

  useEffect(() => {
    getAllCases().then(r => { setCases(r.data); if(r.data.length) setSelectedCase(r.data[0].id) })
  }, [])

  useEffect(() => {
    if (!selectedCase) return
    setLoading(true)
    getWitnessesByCase(selectedCase)
      .then(r => setWitnesses(r.data))
      .finally(() => setLoading(false))
  }, [selectedCase])

  const handleAdd = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      await addWitness({ ...form, caseId: selectedCase, recordedById: user.id })
      toast.success('Witness statement recorded')
      setShowForm(false)
      setForm({ name:'', age:'', contact:'', address:'', statement:'', witnessType:'EYE_WITNESS' })
      getWitnessesByCase(selectedCase).then(r => setWitnesses(r.data))
    } catch { toast.error('Failed to add witness') }
  }

  const handleAnalyze = async (id) => {
    setAnalyzing(id)
    try {
      const { data } = await analyzeWitness(id)
      toast.success('Statement analyzed successfully')
      getWitnessesByCase(selectedCase).then(r => setWitnesses(r.data))
    } catch { toast.error('Analysis failed') }
    finally { setAnalyzing(null) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this witness record?')) return
    try { await deleteWitness(id); setWitnesses(ws => ws.filter(w => w.id !== id)); toast.success('Removed') }
    catch { toast.error('Delete failed') }
  }

  const credColor = (score) => score >= 75 ? '#00ff88' : score >= 50 ? '#ffaa00' : '#ff3366'

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <select className="form-input w-64" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
          <option value="">Select Case</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} className="btn-accent" disabled={!selectedCase}>
          + Add Witness
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="section-title">👁️ Record Witness Statement</h3>
            <button onClick={() => setShowForm(false)} className="text-crime-muted hover:text-crime-red text-xl">×</button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Witness Name</label>
              <input className="form-input" placeholder="Full name" value={form.name}
                onChange={e => setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Age</label>
              <input className="form-input" type="number" placeholder="Age" value={form.age}
                onChange={e => setForm(p=>({...p,age:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Witness Type</label>
              <select className="form-input" value={form.witnessType} onChange={e => setForm(p=>({...p,witnessType:e.target.value}))}>
                {['EYE_WITNESS','BYSTANDER','EXPERT','CHARACTER','ALIBI'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Contact</label>
              <input className="form-input" placeholder="Phone / Email" value={form.contact}
                onChange={e => setForm(p=>({...p,contact:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Address</label>
              <input className="form-input" placeholder="Witness address"
                value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Statement *</label>
              <textarea className="form-input" rows={5} required placeholder="Witness statement..."
                value={form.statement} onChange={e => setForm(p=>({...p,statement:e.target.value}))} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-accent">Record Statement</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Witnesses */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8 border-4" /></div>
      ) : (
        <div className="space-y-4">
          {witnesses.map(w => (
            <div key={w.id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-crime-text">{w.name || 'Anonymous'}</span>
                    {w.age && <span className="text-xs text-crime-muted">Age: {w.age}</span>}
                    <span className="badge-blue text-xs">{w.witnessType}</span>
                    {w.nlpAnalyzed && <span className="badge-green text-xs">✓ Analyzed</span>}
                  </div>
                  {w.contact && <p className="text-xs text-crime-muted mt-0.5">📞 {w.contact}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze(w.id)}
                    disabled={analyzing === w.id}
                    className="btn-accent text-xs flex items-center gap-1"
                  >
                    {analyzing === w.id ? <span className="spinner" /> : '🤖'} Analyze
                  </button>
                  <button onClick={() => handleDelete(w.id)} className="btn-danger text-xs">🗑</button>
                </div>
              </div>

              {/* Statement */}
              <div className="bg-crime-bg rounded-lg p-3 mb-3 border-l-2" style={{ borderColor: '#00aaff' }}>
                <p className="text-xs text-crime-muted uppercase tracking-wider mb-1">Statement</p>
                <p className="text-sm text-crime-text leading-relaxed">{w.statement}</p>
              </div>

              {/* NLP Results */}
              {w.nlpAnalyzed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {w.credibilityScore != null && (
                    <div className="bg-crime-bg rounded-lg p-3">
                      <p className="text-xs text-crime-muted mb-1">Credibility Score</p>
                      <div className="flex items-center gap-2">
                        <div className="prob-bar flex-1">
                          <div className="prob-fill" style={{ width:`${w.credibilityScore}%`, background: credColor(w.credibilityScore) }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: credColor(w.credibilityScore) }}>
                          {w.credibilityScore}%
                        </span>
                      </div>
                    </div>
                  )}
                  {w.keywords && (
                    <div className="bg-crime-bg rounded-lg p-3">
                      <p className="text-xs text-crime-muted mb-1">🔑 Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {w.keywords.split(',').slice(0,8).map(kw => (
                          <span key={kw} className="px-1.5 py-0.5 text-xs rounded bg-crime-amber bg-opacity-10 text-crime-amber border border-crime-amber border-opacity-20">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {w.contradictions && (
                    <div className="bg-crime-bg rounded-lg p-3 border border-crime-red border-opacity-30">
                      <p className="text-xs text-crime-red mb-1">⚠️ Contradictions</p>
                      <p className="text-xs text-crime-text">{w.contradictions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {witnesses.length === 0 && (
            <div className="glass-card p-12 text-center text-crime-muted">
              No witness statements recorded for this case.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
