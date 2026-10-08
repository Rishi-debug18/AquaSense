import api from './client'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = async (email: string, password: string) => {
  const form = new FormData()
  form.append('username', email)
  form.append('password', password)
  const response = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const logout = async () => {
  try { await api.post('/auth/logout') } catch {}
  localStorage.removeItem('aquasense_token')
  localStorage.removeItem('aquasense_user')
}

// ─── Household ───────────────────────────────────────────────────────────────
export const getHouseholdDashboard = () =>
  api.get('/household/me').then(r => r.data)

export const getConsumptionHistory = (period: string) =>
  api.get(`/household/me/history?period=${period}`).then(r => r.data)

export const getMyBills = () =>
  api.get('/household/me/bills').then(r => r.data)

export const getBillDetail = (id: string) =>
  api.get(`/household/me/bills/${id}`).then(r => r.data)

export const getMyAlerts = () =>
  api.get('/household/me/alerts').then(r => r.data)

export const markAlertRead = (id: string) =>
  api.patch(`/household/me/alerts/${id}/read`).then(r => r.data)

export const getMyMessages = () =>
  api.get('/household/me/messages').then(r => r.data)

export const markMessageRead = (id: string) =>
  api.patch(`/household/me/messages/${id}/read`).then(r => r.data)

export const getMyNotifications = () =>
  api.get('/household/me/notifications').then(r => r.data)

export const submitFeedback = (data: {
  message: string
  conversation_history?: { role: string; content: string }[]
  feedback_id?: string
}) => api.post('/household/me/feedback', data).then(r => r.data)

export const createTicket = (feedbackId: string) =>
  api.post(`/household/me/feedback/${feedbackId}/ticket`).then(r => r.data)

// ─── Admin Analytics ─────────────────────────────────────────────────────────
export const getAdminOverview = () =>
  api.get('/admin/analytics/overview').then(r => r.data)

export const getConsumptionTrend = (days = 30) =>
  api.get(`/admin/analytics/consumption-trend?days=${days}`).then(r => r.data)

export const getAreaComparison = () =>
  api.get('/admin/analytics/area-comparison').then(r => r.data)

export const getTopConsumers = (limit = 10) =>
  api.get(`/admin/analytics/top-consumers?limit=${limit}`).then(r => r.data)

// ─── Admin Households ────────────────────────────────────────────────────────
export const getHouseholds = (params?: {
  page?: number; per_page?: number; search?: string; area_id?: string
}) => api.get('/admin/households', { params }).then(r => r.data)

export const getHouseholdDetail = (id: string) =>
  api.get(`/admin/households/${id}`).then(r => r.data)

// ─── Admin Billing ───────────────────────────────────────────────────────────
export const getBills = (params?: {
  period?: string; status?: string; page?: number; per_page?: number
}) => api.get('/admin/bills', { params }).then(r => r.data)

export const generateBills = (billing_period: string) =>
  api.post('/admin/bills/generate', { billing_period }).then(r => r.data)

export const getTariffs = () =>
  api.get('/admin/tariffs').then(r => r.data)

export const createTariff = (data: object) =>
  api.post('/admin/tariffs', data).then(r => r.data)

export const activateTariff = (id: string) =>
  api.post(`/admin/tariffs/${id}/activate`).then(r => r.data)

// ─── Admin Leakage ───────────────────────────────────────────────────────────
export const getPipelines = () =>
  api.get('/admin/pipelines').then(r => r.data)

export const getPipelineHistory = (id: string, hours = 24) =>
  api.get(`/admin/pipelines/${id}/history?hours=${hours}`).then(r => r.data)

export const getLeakageAlerts = () =>
  api.get('/admin/leakage/alerts').then(r => r.data)

// ─── Admin Alerts ────────────────────────────────────────────────────────────
export const getAdminAlerts = (params?: {
  alert_type?: string; severity?: string; page?: number; per_page?: number
}) => api.get('/admin/alerts', { params }).then(r => r.data)

export const dismissAlert = (id: string) =>
  api.patch(`/admin/alerts/${id}/dismiss`).then(r => r.data)

export const markAdminAlertRead = (id: string) =>
  api.patch(`/admin/alerts/${id}/read`).then(r => r.data)

// ─── Admin Messaging ─────────────────────────────────────────────────────────
export const sendMessage = (data: {
  title: string; body: string; target_type: string
  target_area_id?: string; target_household_id?: string; priority?: string
}) => api.post('/admin/messages', data).then(r => r.data)

export const getSentMessages = () =>
  api.get('/admin/messages').then(r => r.data)

// ─── Admin Tickets ───────────────────────────────────────────────────────────
export const getTickets = (params?: {
  status?: string; category?: string; priority?: string; page?: number
}) => api.get('/admin/tickets', { params }).then(r => r.data)

export const updateTicket = (id: string, data: object) =>
  api.put(`/admin/tickets/${id}`, data).then(r => r.data)

// ─── Admin Settings ──────────────────────────────────────────────────────────
export const getSettings = () =>
  api.get('/admin/settings').then(r => r.data)

export const updateSetting = (key: string, value: string) =>
  api.put(`/admin/settings/${key}`, { value }).then(r => r.data)

// ─── Admin Audit ─────────────────────────────────────────────────────────────
export const getAuditLog = (page = 1, per_page = 50) =>
  api.get(`/admin/audit?page=${page}&per_page=${per_page}`).then(r => r.data)

// ─── Demo ────────────────────────────────────────────────────────────────────
export const startSimulation = (household_id: string, category?: string) =>
  api.post('/demo/simulate/start', { household_id, category }).then(r => r.data)

export const stopSimulation = (household_id: string) =>
  api.post('/demo/simulate/stop', { household_id }).then(r => r.data)

export const simulateLeak = (pipeline_id: string, duration_seconds = 120) =>
  api.post('/demo/simulate/leak', { pipeline_id, duration_seconds }).then(r => r.data)

export const getSimulationStatus = () =>
  api.get('/demo/simulate/status').then(r => r.data)
