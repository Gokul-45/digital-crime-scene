import { useState, useEffect, useRef } from 'react'
import { getAllCases, getSuspectsByCase, addSuspect, calculateScore, predictPath, updateSuspectStatus, deleteSuspect } from '../services/api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

const RISK_COLOR = { CRITICAL:'#ff3366', HIGH:'#ff6600', MEDIUM:'#ffaa00', LOW:'#00ccaa', MINIMAL:'#00ff88' }

export default function Suspects() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [suspects, setSuspects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [pathData, setPathData] = useState(null)
  const [scoring, setScoring] = useState(null)
  const [predicting, setPredicting] = useState(null)
  const [form, setForm] = useState({ name:'', alias:'', age:'', description:'',
    lastKnownLocation:'', lastSeenLatitude:'', lastSeenLongitude:'', criminalRecord:'', notes:'' })

  useEffect(() => {
    getAllCases().then(r => { setCases(r.data); if(r.data.length) setSelectedCase(r.data[0].id) })
  }, [])

  useEffect(() => {
    if (!selectedCase) return
    loadSuspects()
  }, [selectedCase])

  const loadSuspects = () => {
    setLoading(true)
    getSuspectsByCase(selectedCase).then(r => setSuspects(r.data)).finally(() => setLoading(false))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    try {
      await addSuspect({ ...form, caseId: selectedCase, addedById: user.id,
        lastSeenLatitude: form.lastSeenLatitude || null, lastSeenLongitude: form.lastSeenLongitude || null })
      toast.success('Suspect added')
      setShowForm(false)
      loadSuspects()
    } catch { toast.error('Failed to add suspect') }
  }

  const handleScore = async (id) => {
    setScoring(id)
    try {
      const { data } = await calculateScore(id)
      toast.success(`Score: ${data.compositeScore?.toFixed(1)}% — Risk: ${data.riskLevel}`)
      loadSuspects()
    } catch { toast.error('Scoring failed') }
    finally { setScoring(null) }
  }

  const handlePredictPath = async (id) => {
    setPredicting(id)
    try {
      const { data } = await predictPath(id, {})
      setPathData(data)
      toast.success(`Path predicted (${data.pathCoordinates?.length || 0} nodes)`)
    } catch { toast.error('Path prediction failed') }
    finally { setPredicting(null) }
  }

  const scoreToRadar = (s) => [
    { metric:'Evidence',  value: s.evidenceMatchScore || 0 },
    { metric:'Proximity', value: s.proximityScore     || 0 },
    { metric:'Timeline',  value: s.timelineScore      || 0 },
    { metric:'Behavior',  value: s.behaviorScore      || 0 },
    { metric:'Overall',   value: s.probabilityScore   || 0 },
  ]

  return (
    <div className="space-y-5">
      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '140px' }}>
        <div className="absolute inset-0 bg-cover bg-center"
             style={{ backgroundImage: 'url(/images/suspect_bg.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060915]/95 via-[#060915]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060915]/80 to-transparent" />
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background:'rgba(255,51,102,0.15)', color:'#ff3366', border:'1px solid rgba(255,51,102,0.3)' }}>
                ● SUSPECT DATABASE
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              SUSPECT <span className="text-glow-red">PROFILING</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">AI probability scoring • Escape path prediction • Behavioral analysis</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right mr-4">
              <div className="text-2xl font-bold font-mono text-red-400">{suspects.length}</div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider">Suspects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <select className="form-input w-64" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
          <option value="">Select Case</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} className="btn-accent" disabled={!selectedCase}>
          + Add Suspect
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass-card p-6">
          <div className="flex justify-between mb-4">
            <h3 className="section-title">🕵️ Add Suspect Profile</h3>
            <button onClick={() => setShowForm(false)} className="text-crime-muted hover:text-crime-red text-xl">×</button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Full Name *</label>
              <input className="form-input" required value={form.name}
                onChange={e => setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Alias (Nickname)</label>
              <input className="form-input" value={form.alias}
                onChange={e => setForm(p=>({...p,alias:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Age</label>
              <input className="form-input" type="number" value={form.age}
                onChange={e => setForm(p=>({...p,age:e.target.value}))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Description</label>
              <input className="form-input" placeholder="Physical description..."
                value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Last Known Location</label>
              <input className="form-input" placeholder="Area, City"
                value={form.lastKnownLocation} onChange={e => setForm(p=>({...p,lastKnownLocation:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Last Seen Latitude</label>
              <input className="form-input" type="number" step="0.0001"
                value={form.lastSeenLatitude} onChange={e => setForm(p=>({...p,lastSeenLatitude:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Last Seen Longitude</label>
              <input className="form-input" type="number" step="0.0001"
                value={form.lastSeenLongitude} onChange={e => setForm(p=>({...p,lastSeenLongitude:e.target.value}))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Criminal Record</label>
              <textarea className="form-input" rows={2} placeholder="Prior offenses, case numbers..."
                value={form.criminalRecord} onChange={e => setForm(p=>({...p,criminalRecord:e.target.value}))} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-accent">Add Suspect</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Path Result */}
      {pathData && (
        <div className="glass-card p-5 border border-crime-accent border-opacity-20">
          <div className="flex justify-between mb-3">
            <h3 className="section-title text-crime-accent">🗺️ Predicted Escape Path</h3>
            <div className="flex gap-4 text-xs text-crime-muted">
              <span>Nodes: <strong className="text-crime-text">{pathData.nodeCount}</strong></span>
              <span>Distance: <strong className="text-crime-text">{pathData.totalDistanceKm?.toFixed(2)} km</strong></span>
              <span>Algorithm: <strong className="text-crime-accent">Dijkstra + A*</strong></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pathData.pathCoordinates?.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="px-2 py-1 rounded text-xs font-mono" style={{
                  background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', color:'#00ff88'
                }}>
                  {i+1}. {p.name}
                </div>
                {i < pathData.pathCoordinates.length - 1 && <span className="text-crime-muted">→</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setPathData(null)} className="mt-3 text-xs text-crime-muted hover:text-crime-red">× Clear</button>
        </div>
      )}

      {/* Suspects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8 border-4" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suspects.map((s, i) => {
            const riskLevel = s.probabilityScore >= 80 ? 'CRITICAL' :
                              s.probabilityScore >= 60 ? 'HIGH' :
                              s.probabilityScore >= 40 ? 'MEDIUM' :
                              s.probabilityScore >= 20 ? 'LOW' : 'MINIMAL'
            const rColor = RISK_COLOR[riskLevel]

            return (
              <div key={s.id} className="glass-card p-5" style={{ borderLeft: `3px solid ${rColor}40` }}>
                {/* Header row */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0"
                    style={{ background: `${rColor}15`, border: `1px solid ${rColor}30`, color: rColor }}
                  >
                    {s.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base">{s.name}</h3>
                      {s.alias && <span className="text-xs text-slate-500 italic">"{s.alias}"</span>}
                      {i === 0 && <span className="badge" style={{ background:'rgba(255,170,0,0.1)', color:'#ffaa00', border:'1px solid rgba(255,170,0,0.3)' }}>PRIMARY</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="badge" style={{ background:'rgba(100,116,139,0.15)', color:'#94a3b8', border:'1px solid rgba(100,116,139,0.2)' }}>{s.status}</span>
                      <span className="badge" style={{ background:`${rColor}12`, color:rColor, border:`1px solid ${rColor}25` }}>{riskLevel} RISK</span>
                      {s.age && <span className="text-xs text-slate-600">Age {s.age}</span>}
                    </div>
                    {s.lastKnownLocation && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {s.lastKnownLocation}
                      </p>
                    )}
                  </div>
                  {/* Score circle */}
                  <div className="text-right shrink-0">
                    <div className="text-3xl font-black" style={{ color: rColor, fontFamily: 'JetBrains Mono, monospace' }}>
                      {(s.probabilityScore || 0).toFixed(0)}<span className="text-base">%</span>
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-wider">Probability</div>
                  </div>
                </div>

                {/* Score bars */}
                <div className="space-y-2 mb-4 bg-black/20 rounded-xl p-3">
                  {[
                    { label:'Evidence',  value: s.evidenceMatchScore, color:'#00ff88' },
                    { label:'Proximity', value: s.proximityScore,     color:'#00aaff' },
                    { label:'Timeline',  value: s.timelineScore,      color:'#ffaa00' },
                    { label:'Behavior',  value: s.behaviorScore,      color:'#ff3366' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600 w-20 shrink-0">{label}</span>
                      <div className="prob-bar flex-1">
                        <div className="prob-fill" style={{ width:`${value || 0}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                      </div>
                      <span className="w-9 text-right text-slate-400 font-mono shrink-0">{(value||0).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleScore(s.id)} disabled={scoring === s.id}
                          className="btn-accent text-xs flex items-center gap-1.5" style={{ padding:'0.45rem 1rem' }}>
                    {scoring === s.id
                      ? <><div className="spinner" style={{ width:'12px', height:'12px' }} /> Scoring...</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> AI Score</>}
                  </button>
                  <button onClick={() => handlePredictPath(s.id)} disabled={predicting === s.id}
                          className="btn-ghost text-xs flex items-center gap-1.5" style={{ padding:'0.45rem 1rem' }}>
                    {predicting === s.id
                      ? <><div className="spinner" style={{ width:'12px', height:'12px' }} /> Predicting...</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg> Predict Path</>}
                  </button>
                  <button onClick={() => deleteSuspect(s.id).then(() => { toast.success('Suspect removed'); loadSuspects() })}
                          className="btn-danger text-xs" style={{ padding:'0.45rem 0.75rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
          {suspects.length === 0 && (
            <div className="lg:col-span-2 glass-card p-12 text-center text-crime-muted">
              No suspects profiled for this case.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
