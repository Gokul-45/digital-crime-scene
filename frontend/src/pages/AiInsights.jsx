import { useState, useEffect } from 'react'
import { getAllCases, getInsights, generateInsights, dismissInsight } from '../services/api'
import toast from 'react-hot-toast'

const SEVERITY = {
  CRITICAL: {
    color: '#ff3366', bg: 'rgba(255,51,102,0.08)', border: 'rgba(255,51,102,0.3)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  ALERT: {
    color: '#ff6600', bg: 'rgba(255,102,0,0.08)', border: 'rgba(255,102,0,0.3)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6600" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  },
  WARNING: {
    color: '#ffaa00', bg: 'rgba(255,170,0,0.06)', border: 'rgba(255,170,0,0.25)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffaa00" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    )
  },
  INFO: {
    color: '#00aaff', bg: 'rgba(0,170,255,0.06)', border: 'rgba(0,170,255,0.25)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00aaff" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    )
  },
}

const AI_FEATURES = [
  { icon: '🔗', label: 'Anomaly Detection',    desc: 'Finds inconsistencies in evidence' },
  { icon: '🧬', label: 'Behaviour Profiling',   desc: 'Suspect pattern analysis' },
  { icon: '🌐', label: 'Network Mapping',       desc: 'Digital trace correlation' },
  { icon: '⏱️', label: 'Timeline Analysis',     desc: 'Chronological gap detection' },
]

export default function AiInsights() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  useEffect(() => {
    getAllCases().then(r => { setCases(r.data); if(r.data.length) setSelectedCase(r.data[0].id) })
  }, [])

  useEffect(() => { if(selectedCase) load() }, [selectedCase])

  const load = () => {
    setLoading(true)
    getInsights(selectedCase).then(r => setInsights(r.data)).finally(() => setLoading(false))
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const { data } = await generateInsights(selectedCase)
      toast.success(`${data.generated} new insights generated`)
      load()
    } catch { toast.error('AI scan failed — check backend connection') }
    finally { setGenerating(false) }
  }

  const handleDismiss = async (id) => {
    try {
      await dismissInsight(id)
      setInsights(is => is.filter(i => i.id !== id))
      toast.success('Insight dismissed')
    } catch { toast.error('Dismiss failed') }
  }

  const severityCounts = ['CRITICAL','ALERT','WARNING','INFO'].reduce((acc, s) => {
    acc[s] = insights.filter(i => i.severity === s).length
    return acc
  }, {})

  const filtered = activeFilter === 'ALL' ? insights : insights.filter(i => i.severity === activeFilter)

  return (
    <div className="space-y-5">

      {/* ── AI HERO BANNER ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(0,170,255,0.08) 50%, rgba(0,255,136,0.05) 100%)',
          border: '1px solid rgba(157,78,221,0.2)',
        }}
      >
        {/* Hex grid */}
        <div className="absolute inset-0 hex-bg opacity-50 pointer-events-none" />
        {/* Scan line */}
        <div className="scan-overlay" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* AI orb */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(157,78,221,0.3), rgba(0,170,255,0.2))',
                border: '1px solid rgba(157,78,221,0.4)',
                boxShadow: '0 0 30px rgba(157,78,221,0.2)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9d4edd" strokeWidth="1.5">
                <path d="M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V14h2v2h-2v1h2v2h-2v1h-2v-1H9v-2h2v-1H9v-2h2v-1.1A5.001 5.001 0 0 1 7 7a5 5 0 0 1 5-5z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider"
                  style={{ background:'rgba(157,78,221,0.15)', color:'#9d4edd', border:'1px solid rgba(157,78,221,0.3)' }}
                >
                  ● AI ENGINE ACTIVE
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily:'Rajdhani, sans-serif' }}>
                THREAT INTELLIGENCE <span style={{ color:'#9d4edd' }}>SCANNER</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Machine learning analysis • Pattern detection • Anomaly scoring
              </p>
            </div>
          </div>

          {/* AI Features mini-grid */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {AI_FEATURES.map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.06)' }}
              >
                <span>{icon}</span>
                <span className="text-slate-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <select className="form-input w-64" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
          <option value="">Select Case</option>
          {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>)}
        </select>
        <button
          onClick={handleGenerate}
          disabled={!selectedCase || generating}
          className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #9d4edd, #6b21c4)' }}
        >
          {generating ? (
            <><div className="spinner" style={{ width:'14px', height:'14px' }} /> Scanning Case...</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              Run AI Scan
            </>
          )}
        </button>
      </div>

      {/* ── SEVERITY FILTER TABS ── */}
      {insights.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[{ key:'ALL', label:'All Insights', count: insights.length, color:'#94a3b8' },
            ...['CRITICAL','ALERT','WARNING','INFO'].map(s => ({
              key: s, label: s, count: severityCounts[s] || 0, color: SEVERITY[s]?.color
            }))
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeFilter === key ? `${color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeFilter === key ? `${color}50` : 'rgba(255,255,255,0.07)'}`,
                color: activeFilter === key ? color : '#475569',
              }}
            >
              {label}
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                style={{ background: `${color}20`, color }}
              >{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── INSIGHTS GRID ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div>
            <div className="spinner mx-auto mb-3" style={{ width:'32px', height:'32px', borderWidth:'3px', borderTopColor:'#9d4edd' }} />
            <p className="text-xs text-slate-600 text-center animate-pulse tracking-widest">ANALYSING...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((insight, idx) => {
            const ui = SEVERITY[insight.severity] || SEVERITY.INFO
            return (
              <div
                key={insight.id}
                className="glass-card p-5 animate-fade-up"
                style={{
                  borderLeft: `3px solid ${ui.color}`,
                  background: ui.bg,
                  animationDelay: `${idx * 0.05}s`,
                  opacity: 0,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${ui.color}15`, border: `1px solid ${ui.border}` }}
                    >
                      {ui.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">{insight.title}</h3>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: ui.color }}
                      >{insight.severity}</span>
                    </div>
                  </div>
                  {insight.confidence && (
                    <div className="text-right shrink-0">
                      <div
                        className="text-sm font-bold font-mono"
                        style={{ color: insight.confidence >= 90 ? '#00ff88' : '#ffaa00' }}
                      >
                        {insight.confidence.toFixed(1)}%
                      </div>
                      <div className="text-[9px] text-slate-600">confidence</div>
                    </div>
                  )}
                </div>

                {/* Confidence bar */}
                {insight.confidence && (
                  <div className="prob-bar mb-3">
                    <div
                      className="prob-fill"
                      style={{
                        width: `${insight.confidence}%`,
                        background: `linear-gradient(90deg, ${ui.color}66, ${ui.color})`,
                      }}
                    />
                  </div>
                )}

                <p className="text-sm text-slate-300 leading-relaxed mb-4">{insight.content}</p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider"
                      style={{ background:'rgba(255,255,255,0.04)', color:'#475569', border:'1px solid rgba(255,255,255,0.06)' }}
                    >
                      {insight.insightType?.replace(/_/g, ' ')}
                    </span>
                    {insight.relatedEntityType && (
                      <span
                        className="text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider"
                        style={{ background:'rgba(0,170,255,0.08)', color:'#00aaff', border:'1px solid rgba(0,170,255,0.2)' }}
                      >
                        {insight.relatedEntityType}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="text-xs text-slate-600 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Dismiss
                  </button>
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="lg:col-span-2 glass-card p-14 text-center">
              <div
                className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center animate-float"
                style={{ background:'rgba(157,78,221,0.1)', border:'1px solid rgba(157,78,221,0.2)' }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9d4edd" strokeWidth="1.5">
                  <path d="M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V14h2v2h-2v1h2v2h-2v1h-2v-1H9v-2h2v-1H9v-2h2v-1.1A5.001 5.001 0 0 1 7 7a5 5 0 0 1 5-5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Insights Generated</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-5">
                Select a case and click <strong className="text-purple-400">Run AI Scan</strong> to analyse 
                evidence, witness statements, and timeline data for anomalies, contradictions, and predictions.
              </p>
              <button
                onClick={handleGenerate}
                disabled={!selectedCase || generating}
                className="btn-accent"
                style={{ background: 'linear-gradient(135deg, #9d4edd, #6b21c4)' }}
              >
                {generating ? 'Scanning...' : '⚡ Generate Insights Now'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
