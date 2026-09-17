import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCases, createCase, updateCase, deleteCase } from '../services/api'
import toast from 'react-hot-toast'

const STATUSES = ['OPEN', 'ACTIVE', 'SOLVED', 'CLOSED', 'COLD']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const CRIME_TYPES = ['ROBBERY','ASSAULT','BURGLARY','MURDER','FRAUD','KIDNAPPING','HIT_AND_RUN','CYBERCRIME','DRUG_OFFENSE','PHISHING','RANSOMWARE','IDENTITY_THEFT']

const emptyForm = { title:'', description:'', location:'', latitude:'', longitude:'', crimeType:'', priority:'MEDIUM', incidentDate:'' }

export default function Cases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const response = await getAllCases()
      setCases(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load cases')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.incidentDate) return toast.error('Title and incident date required')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await createCase({ ...form, latitude: form.latitude === '' ? null : Number(form.latitude), longitude: form.longitude === '' ? null : Number(form.longitude), createdById: user.id || null })
      toast.success('Case created successfully')
      setForm(emptyForm); setShowForm(false); load()
    } catch (error) { toast.error(error.response?.data?.error || 'Failed to create case') }
  }

  const handleStatus = async (e, item) => {
    e.stopPropagation()
    const status = e.target.value
    if (status === item.status) return
    try {
      await updateCase(item.id, { status })
      setCases(prev => prev.map(c => c.id === item.id ? { ...c, status } : c))
      toast.success('Case status updated')
    } catch (error) { toast.error(error.response?.data?.error || 'Status update failed') }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this case and its related records?')) return
    try {
      await deleteCase(id)
      setCases(prev => prev.filter(c => c.id !== id))
      toast.success('Case deleted successfully')
    } catch (error) { toast.error(error.response?.data?.error || `Delete failed (${error.response?.status || 'network error'})`) }
  }

  const filtered = cases.filter(c => {
    const text = `${c.title || ''} ${c.caseNumber || ''} ${c.location || ''}`.toLowerCase()
    return (filter === 'ALL' || c.status === filter) && text.includes(search.toLowerCase())
  })

  return <div className="space-y-5">
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div><h2 className="text-xl font-bold text-crime-text">Cases</h2><p className="text-sm text-crime-muted">Manage and track investigations</p></div>
      <button className="btn-accent" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Case'}</button>
    </div>

    {showForm && <form onSubmit={handleCreate} className="glass-card p-5 space-y-4">
      <h3 className="font-semibold text-crime-text">Create New Case</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="title" value={form.title} onChange={change} placeholder="Case title *" className="input" required />
        <input name="location" value={form.location} onChange={change} placeholder="Location" className="input" />
        <select name="crimeType" value={form.crimeType} onChange={change} className="input"><option value="">Crime type</option>{CRIME_TYPES.map(x => <option key={x}>{x}</option>)}</select>
        <select name="priority" value={form.priority} onChange={change} className="input">{PRIORITIES.map(x => <option key={x}>{x}</option>)}</select>
        <input type="datetime-local" name="incidentDate" value={form.incidentDate} onChange={change} className="input" required />
        <input name="latitude" value={form.latitude} onChange={change} placeholder="Latitude (optional)" className="input" type="number" step="any" />
        <input name="longitude" value={form.longitude} onChange={change} placeholder="Longitude (optional)" className="input" type="number" step="any" />
        <textarea name="description" value={form.description} onChange={change} placeholder="Description" className="input md:col-span-2" rows="3" />
      </div>
      <button className="btn-accent" type="submit">Create Case</button>
    </form>}

    <div className="flex flex-wrap gap-3">
      <input className="input flex-1 min-w-48" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." />
      <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(x => <option key={x}>{x}</option>)}</select>
    </div>

    <div className="glass-card overflow-x-auto">
      {loading ? <div className="p-8 text-center text-crime-muted">Loading cases...</div> : filtered.length === 0 ? <div className="p-8 text-center text-crime-muted">No cases found</div> : <table className="w-full text-sm"><thead><tr className="text-left text-crime-muted border-b border-crime-border"><th className="p-4">Case</th><th className="p-4">Crime / Location</th><th className="p-4">Priority</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id} onClick={() => navigate(`/cases/${item.id}`)} className="border-b border-crime-border hover:bg-crime-card cursor-pointer"><td className="p-4"><div className="font-semibold text-crime-text">{item.title}</div><div className="text-xs text-crime-muted">{item.caseNumber}</div></td><td className="p-4"><div className="text-crime-text">{item.crimeType || '—'}</div><div className="text-xs text-crime-muted">{item.location || '—'}</div></td><td className="p-4 text-crime-text">{item.priority || 'MEDIUM'}</td><td className="p-4"><select value={item.status || 'OPEN'} onClick={e => e.stopPropagation()} onChange={e => handleStatus(e, item)} className="input text-xs py-1">{STATUSES.map(x => <option key={x}>{x}</option>)}</select></td><td className="p-4"><button onClick={e => handleDelete(e, item.id)} className="btn-ghost text-xs text-red-400">Delete</button></td></tr>)}</tbody></table>}
    </div>
  </div>
}
