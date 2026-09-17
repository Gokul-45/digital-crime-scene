import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

// Attach JWT on every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)

// Dashboard
export const getStats = () => API.get('/dashboard/stats')
export const getHeatmap = () => API.get('/dashboard/heatmap')
export const getRecentCases = () => API.get('/dashboard/recent-cases')
export const getCrimeTypes = () => API.get('/dashboard/crime-types')

// Cases
export const getAllCases = () => API.get('/cases')
export const getCaseById = (id) => API.get(`/cases/${id}`)
export const createCase = (data) => API.post('/cases', data)
export const updateCase = (id, data) => API.put(`/cases/${id}`, data)
export const deleteCase = (id) => API.delete(`/cases/${id}`)

// Evidence
export const getEvidenceByCase = (caseId) => API.get(`/evidence/case/${caseId}`)
export const addEvidence = (data) => API.post('/evidence', data)
export const updateEvidenceTags = (id, data) => API.put(`/evidence/${id}/tag`, data)
export const deleteEvidence = (id) => API.delete(`/evidence/${id}`)

// Witnesses
export const getWitnessesByCase = (caseId) => API.get(`/witnesses/case/${caseId}`)
export const addWitness = (data) => API.post('/witnesses', data)
export const analyzeWitness = (id) => API.post(`/witnesses/${id}/analyze`)
export const deleteWitness = (id) => API.delete(`/witnesses/${id}`)

// Suspects
export const getSuspectsByCase = (caseId) => API.get(`/suspects/case/${caseId}`)
export const addSuspect = (data) => API.post('/suspects', data)
export const calculateScore = (id) => API.post(`/suspects/${id}/calculate-score`)
export const predictPath = (id, data) => API.post(`/suspects/${id}/predict-path`, data)
export const updateSuspectStatus = (id, status) => API.put(`/suspects/${id}/status`, { status })
export const deleteSuspect = (id) => API.delete(`/suspects/${id}`)

// Timeline
export const getTimeline = (caseId) => API.get(`/timeline/${caseId}`)
export const addTimelineEvent = (data) => API.post('/timeline/event', data)
export const reconstructTimeline = (caseId) => API.post(`/timeline/reconstruct/${caseId}`)

// AI Insights
export const getInsights = (caseId) => API.get(`/insights/case/${caseId}`)
export const generateInsights = (caseId) => API.post(`/insights/generate/${caseId}`)
export const dismissInsight = (id) => API.put(`/insights/${id}/dismiss`)

export default API
