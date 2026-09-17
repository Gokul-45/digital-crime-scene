import { useState, useEffect } from 'react'
import { getAllCases, getTimeline, reconstructTimeline, addTimelineEvent } from '../services/api'
import toast from 'react-hot-toast'

const PHASE_COLORS = { BEFORE:'#00aaff', DURING:'#ff3366', AFTER:'#00ff88' }
const PHASE_ICONS  = { BEFORE:'⬅️', DURING:'🔴', AFTER:'✅' }
const EVENT_ICONS  = { MOVEMENT:'🚶', EVIDENCE_FOUND:'🔬', WITNESS_ACCOUNT:'💬', CCTV:'📹', CALL:'📞', POLICE_ACTION:'🚔', INCIDENT:'⚠️' }

export default function Timeline() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [timelineData, setTimelineData] = useState({ events:[], grouped:{BEFORE:[],DURING:[],AFTER:[]} })
  const [loading, setLoading] = useState(false)
  const [reconstructing, setReconstructing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', phase:'DURING', eventType:'MOVEMENT', eventTime:'', source:'', confidenceLevel:80 })

  useEffect(() => {
    getAllCases().then(r => { setCases(r.data); if(r.data.length) setSelectedCase(r.data[0].id) })
  }, [])

  useEffect(() => { if(selectedCase) load() }, [selectedCase])

  const load = () => {
    setLoading(true)
    getTimeline(selectedCase)
      .then(r => setTimelineData(r.data))
      .finally(() => setLoading(false))
  }

  const handleReconstruct = async () => {
    setReconstructing(true)
    try {
      const { data } = await reconstructTimeline(selectedCase)
      toast.success(`Reconstructed: ${data.eventsGenerated} events generated`)
      load()
    } catch { toast.error('Reconstruction failed') }
    finally { setReconstructing(false) }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    try {
      await addTimelineEvent({ ...form, caseId: selectedCase,
        confidenceLevel: parseFloat(form.confidenceLevel) })
      toast.success('Event added to timeline')
      setShowForm(false)
      load()
    } catch { toast.error('Failed to add event') }
  }

  const grouped = timelineData.grouped || { BEFORE:[], DURING:[], AFTER:[] }
  const total = timelineData.total || 0

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3">
          <select className="form-input w-64" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
            <option value="">Select Case</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="btn-ghost text-xs" disabled={!selectedCase}>+ Add Event</button>
          <button onClick={handleReconstruct} disabled={!selectedCase || reconstructing}
            className="btn-accent text-xs flex items-center gap-1">
            {reconstructing ? <span className="spinner" /> : '⚡'} Auto-Reconstruct
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      {selectedCase && (
        <div className="grid grid-cols-4 gap-3">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-crime-text">{total}</div>
            <div className="text-xs text-crime-muted">Total Events</div>
          </div>
          {['BEFORE','DURING','AFTER'].map(phase => (
            <div key={phase} className="glass-card p-4 text-center" style={{ color: PHASE_COLORS[phase] }}>
              <div className="text-2xl font-bold">{grouped[phase]?.length || 0}</div>
              <div className="text-xs text-crime-muted">{phase}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Form */}
      {showForm && (
        <div className="glass-card p-5">
          <div className="flex justify-between mb-4">
            <h3 className="section-title">⏱️ Add Timeline Event</h3>
            <button onClick={() => setShowForm(false)} className="text-crime-muted hover:text-crime-red text-xl">×</button>
          </div>
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Event Title *</label>
              <input className="form-input" required value={form.title}
                onChange={e => setForm(p=>({...p,title:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Phase</label>
              <select className="form-input" value={form.phase} onChange={e => setForm(p=>({...p,phase:e.target.value}))}>
                {['BEFORE','DURING','AFTER'].map(ph => <option key={ph}>{ph}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Event Type</label>
              <select className="form-input" value={form.eventType} onChange={e => setForm(p=>({...p,eventType:e.target.value}))}>
                {Object.keys(EVENT_ICONS).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Event Time *</label>
              <input className="form-input" type="datetime-local" required value={form.eventTime}
                onChange={e => setForm(p=>({...p,eventTime:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs text-crime-muted mb-1 uppercase">Confidence %</label>
              <input className="form-input" type="number" min="0" max="100" value={form.confidenceLevel}
                onChange={e => setForm(p=>({...p,confidenceLevel:e.target.value}))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-crime-muted mb-1 uppercase">Description</label>
              <textarea className="form-input" rows={2} value={form.description}
                onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-accent">Add Event</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline View */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8 border-4" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {['BEFORE','DURING','AFTER'].map(phase => (
            <div key={phase} className="glass-card">
              {/* Phase Header */}
              <div className="p-4 border-b border-crime-border" style={{ borderLeftWidth:'3px', borderLeftColor:PHASE_COLORS[phase] }}>
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color:PHASE_COLORS[phase] }}>
                  {PHASE_ICONS[phase]} {phase} INCIDENT
                </h3>
                <p className="text-xs text-crime-muted">{grouped[phase]?.length || 0} events</p>
              </div>

              {/* Events */}
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {(grouped[phase] || []).map((e, i) => (
                  <div key={e.id} className="relative flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background:PHASE_COLORS[phase] }} />
                      {i < grouped[phase].length - 1 && (
                        <div className="w-px flex-1 mt-1 opacity-30" style={{ background:PHASE_COLORS[phase] }} />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm mr-1">{EVENT_ICONS[e.eventType] || '•'}</span>
                          <span className="text-sm font-medium text-crime-text">{e.title}</span>
                        </div>
                        {e.isVerified && <span className="text-xs text-crime-accent">✓</span>}
                      </div>
                      {e.description && <p className="text-xs text-crime-muted mt-0.5 line-clamp-2">{e.description}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-mono text-crime-muted">
                          {new Date(e.eventTime).toLocaleString('en-IN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
                        </span>
                        {e.confidenceLevel && (
                          <span className="text-xs" style={{ color: e.confidenceLevel>=70?'#00ff88':e.confidenceLevel>=50?'#ffaa00':'#ff3366' }}>
                            {e.confidenceLevel}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!grouped[phase]?.length && (
                  <p className="text-xs text-crime-muted text-center py-6">No events in this phase</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
