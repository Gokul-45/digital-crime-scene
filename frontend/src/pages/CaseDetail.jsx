import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCaseById, getEvidenceByCase, getWitnessesByCase, getSuspectsByCase, getTimeline, getInsights } from '../services/api'
import toast from 'react-hot-toast'

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [evidence, setEvidence] = useState([])
  const [witnesses, setWitnesses] = useState([])
  const [suspects, setSuspects] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      getCaseById(id),
      getEvidenceByCase(id),
      getWitnessesByCase(id),
      getSuspectsByCase(id),
      getTimeline(id),
    ]).then(([c, e, w, s, t]) => {
      setCaseData(c.data)
      setEvidence(e.data)
      setWitnesses(w.data)
      setSuspects(s.data)
      setTimeline(t.data?.events || [])
    }).catch(() => toast.error('Failed to load case details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner w-10 h-10 border-4" /></div>
  if (!caseData) return <div className="text-center text-crime-muted py-20">Case not found</div>

  const tabs = [
    { id:'overview',   label:'Overview',   icon:'📋' },
    { id:'evidence',   label:`Evidence (${evidence.length})`,   icon:'🔬' },
    { id:'witnesses',  label:`Witnesses (${witnesses.length})`,  icon:'👁️' },
    { id:'suspects',   label:`Suspects (${suspects.length})`,    icon:'🕵️' },
    { id:'timeline',   label:`Timeline (${timeline.length})`,   icon:'⏱️' },
  ]

  const topSuspect = suspects[0]

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/cases')} className="mt-1 text-crime-muted hover:text-crime-accent text-sm">← Back</button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-crime-text">{caseData.title}</h2>
            <span className="badge-blue font-mono text-xs">{caseData.caseNumber}</span>
            <span className={`badge ${
              caseData.priority === 'CRITICAL' ? 'badge-red' :
              caseData.priority === 'HIGH'     ? 'badge-red' :
              caseData.priority === 'MEDIUM'   ? 'badge-amber' : 'badge-green'
            }`}>{caseData.priority}</span>
            <span className={`badge ${caseData.status === 'SOLVED' ? 'badge-green' : caseData.status === 'CLOSED' ? 'badge-purple' : 'badge-red'}`}>
              {caseData.status}
            </span>
          </div>
          <p className="text-sm text-crime-muted mt-1">
            {caseData.location} · {new Date(caseData.incidentDate).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/suspects')} className="btn-ghost text-xs">Suspect Path →</button>
          <button onClick={() => navigate('/timeline')} className="btn-accent text-xs">Timeline →</button>
        </div>
      </div>

      {/* Quick Stats Strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Evidence',  value: evidence.length,  color:'#00ff88' },
          { label:'Witnesses', value: witnesses.length,  color:'#00aaff' },
          { label:'Suspects',  value: suspects.length,   color:'#ffaa00' },
          { label:'Events',    value: timeline.length,   color:'#ff3366' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center" style={{ color }}>
            <div className="text-2xl font-bold font-mono">{value}</div>
            <div className="text-xs text-crime-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-crime-border pb-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === t.id
                ? 'bg-crime-card text-crime-accent border-t border-x border-crime-border'
                : 'text-crime-muted hover:text-crime-text'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-5">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs text-crime-muted uppercase tracking-wider mb-2">Case Description</h4>
              <p className="text-sm text-crime-text">{caseData.description || 'No description provided.'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:'Crime Type', value: caseData.crimeType },
                { label:'Reported', value: new Date(caseData.reportedDate || caseData.createdAt).toLocaleDateString() },
                { label:'Latitude', value: caseData.latitude || '—' },
                { label:'Longitude', value: caseData.longitude || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-crime-bg rounded-lg p-3">
                  <p className="text-xs text-crime-muted">{label}</p>
                  <p className="text-sm text-crime-text font-medium mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
            {topSuspect && (
              <div className="rounded-lg p-4 border border-crime-red border-opacity-30 bg-crime-red bg-opacity-5">
                <p className="text-xs text-crime-muted uppercase tracking-wider mb-1">Primary Suspect</p>
                <div className="flex items-center justify-between">
                  <span className="text-crime-text font-semibold">{topSuspect.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-crime-muted">Probability:</span>
                    <span className="text-crime-red font-bold">{topSuspect.probabilityScore?.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="prob-bar mt-2">
                  <div className="prob-fill" style={{ width:`${topSuspect.probabilityScore}%`, background:'linear-gradient(90deg, #ff3366, #ff6600)' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-3">
            {evidence.length === 0 ? <p className="text-crime-muted text-sm text-center py-8">No evidence logged. Go to Evidence page to add.</p> :
              evidence.map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg bg-crime-bg border border-crime-border">
                  <span className="text-xl">{e.type==='IMAGE'?'🖼️':e.type==='VIDEO'?'🎥':e.type==='DOCUMENT'?'📄':e.type==='AUDIO'?'🔊':'🔬'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-crime-text">{e.title}</span>
                      {e.isKeyEvidence && <span className="badge-red text-xs">KEY</span>}
                      <span className="badge-blue text-xs">{e.type}</span>
                    </div>
                    <p className="text-xs text-crime-muted mt-0.5">{e.description}</p>
                    {e.tags && <p className="text-xs text-crime-accent mt-1"># {e.tags}</p>}
                  </div>
                  <span className="text-xs text-crime-muted font-mono">{e.evidenceNumber}</span>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'witnesses' && (
          <div className="space-y-3">
            {witnesses.length === 0 ? <p className="text-crime-muted text-sm text-center py-8">No witnesses recorded.</p> :
              witnesses.map(w => (
                <div key={w.id} className="p-4 rounded-lg bg-crime-bg border border-crime-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-crime-text">{w.name || 'Anonymous'}</span>
                    <div className="flex gap-2">
                      {w.credibilityScore && <span className="text-xs text-crime-muted">Credibility: <span className="text-crime-accent">{w.credibilityScore}%</span></span>}
                      <span className="badge-blue text-xs">{w.witnessType}</span>
                    </div>
                  </div>
                  <p className="text-sm text-crime-text opacity-80 line-clamp-2">{w.statement}</p>
                  {w.keywords && <p className="text-xs text-crime-amber mt-2">🏷️ {w.keywords}</p>}
                  {w.contradictions && <p className="text-xs text-crime-red mt-1">⚠️ {w.contradictions}</p>}
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'suspects' && (
          <div className="space-y-3">
            {suspects.length === 0 ? <p className="text-crime-muted text-sm text-center py-8">No suspects added.</p> :
              suspects.map((s, i) => (
                <div key={s.id} className={`p-4 rounded-lg border ${i===0 ? 'border-crime-red border-opacity-40 bg-crime-red bg-opacity-5' : 'border-crime-border bg-crime-bg'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="text-crime-red">⚠️</span>}
                        <span className="font-semibold text-crime-text">#{i+1} {s.name}</span>
                        {s.alias && <span className="text-xs text-crime-muted">({s.alias})</span>}
                        <span className="badge-amber text-xs">{s.status}</span>
                      </div>
                      <p className="text-xs text-crime-muted mt-1">{s.lastKnownLocation}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold font-mono ${i===0 ? 'text-crime-red' : 'text-crime-amber'}`}>
                        {s.probabilityScore?.toFixed(1)}%
                      </div>
                      <div className="text-xs text-crime-muted">Probability</div>
                    </div>
                  </div>
                  <div className="prob-bar mt-3">
                    <div className="prob-fill" style={{
                      width:`${s.probabilityScore}%`,
                      background: i===0 ? 'linear-gradient(90deg, #ff3366, #ff6600)' : 'linear-gradient(90deg, #ffaa00, #ff6600)'
                    }} />
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {['BEFORE','DURING','AFTER'].map(phase => {
              const events = timeline.filter(t => t.phase === phase)
              if (!events.length) return null
              return (
                <div key={phase}>
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${phase==='DURING'?'text-crime-red':phase==='BEFORE'?'text-crime-blue':'text-crime-green'}`}>
                    {phase === 'BEFORE' ? '⬅ BEFORE INCIDENT' : phase === 'DURING' ? '🔴 DURING INCIDENT' : '➡ AFTER INCIDENT'}
                  </h4>
                  <div className="space-y-2">
                    {events.map(e => (
                      <div key={e.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${phase==='DURING'?'bg-crime-red':phase==='BEFORE'?'bg-crime-blue':'bg-crime-accent'}`} />
                        <div className="flex-1 pb-3 border-b border-crime-border last:border-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-crime-text">{e.title}</span>
                            <span className="text-xs font-mono text-crime-muted">{new Date(e.eventTime).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-xs text-crime-muted mt-0.5">{e.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {timeline.length === 0 && <p className="text-center text-crime-muted py-8 text-sm">No timeline events. Use the Timeline page to reconstruct.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
