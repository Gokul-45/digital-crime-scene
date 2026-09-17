import { useState, useEffect } from 'react'
import { getAllCases, getCaseById, getTimeline, getSuspectsByCase, getEvidenceByCase } from '../services/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import toast from 'react-hot-toast'

export default function Reports() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getAllCases().then(r => setCases(r.data))
  }, [])

  const generatePDF = async () => {
    if (!selectedCase) return
    setGenerating(true)
    try {
      const [{ data: c }, { data: timelineData }, { data: suspects }, { data: evidence }] = await Promise.all([
        getCaseById(selectedCase),
        getTimeline(selectedCase),
        getSuspectsByCase(selectedCase),
        getEvidenceByCase(selectedCase)
      ])

      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(200, 0, 0)
      doc.text('DCSR - OFFICIAL INVESTIGATION REPORT', 14, 22)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      
      // Case Overview
      doc.setFontSize(14)
      doc.text('Case Overview', 14, 45)
      doc.autoTable({
        startY: 50,
        head: [['Case Number', 'Title', 'Date', 'Status', 'Priority']],
        body: [[c.caseNumber, c.title, new Date(c.incidentDate).toLocaleDateString(), c.status, c.priority]],
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40] }
      })

      // Suspects
      let finalY = doc.lastAutoTable.finalY || 50
      if (suspects.length > 0) {
        doc.text('Suspect Profiling', 14, finalY + 15)
        doc.autoTable({
          startY: finalY + 20,
          head: [['Name', 'Status', 'Probability', 'Location']],
          body: suspects.map(s => [s.name, s.status, `${s.probabilityScore?.toFixed(1) || 0}%`, s.lastKnownLocation || 'Unknown']),
          theme: 'striped'
        })
        finalY = doc.lastAutoTable.finalY
      }

      // Evidence
      if (evidence.length > 0) {
        doc.text('Key Evidence', 14, finalY + 15)
        doc.autoTable({
          startY: finalY + 20,
          head: [['Number', 'Title', 'Type', 'Key']],
          body: evidence.map(e => [e.evidenceNumber, e.title, e.type, e.isKeyEvidence ? 'YES' : 'NO']),
          theme: 'striped'
        })
        finalY = doc.lastAutoTable.finalY
      }

      // Timeline summary
      const evs = timelineData.events || []
      if (evs.length > 0) {
        doc.text('Timeline Events', 14, finalY + 15)
        doc.autoTable({
          startY: finalY + 20,
          head: [['Time', 'Phase', 'Type', 'Description']],
          body: evs.map(e => [new Date(e.eventTime).toLocaleString(), e.phase, e.eventType, e.title]),
          theme: 'grid'
        })
      }

      doc.save(`DCSR_Report_${c.caseNumber}.pdf`)
      toast.success('Report downloaded')
    } catch (e) {
      console.error(e)
      toast.error('Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-bold text-crime-text mb-2">📄 Export Investigation Report</h2>
        <p className="text-sm text-crime-muted mb-6">Select a case to generate a consolidated PDF report including suspects, evidence, and timeline data.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-crime-muted uppercase mb-2">Select Case</label>
            <select className="form-input w-full" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
              <option value="">-- Choose Case --</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>)}
            </select>
          </div>
          
          <button onClick={generatePDF} disabled={!selectedCase || generating}
            className="btn-accent w-full py-3 flex items-center justify-center gap-2">
            {generating ? <span className="spinner" /> : '📥'}
            {generating ? 'Compiling Report...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
