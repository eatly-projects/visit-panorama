import { api } from '@/lib/axios'

export const publicApi = {
  searchEmployees: (q) => api.get('/public/employees', { params: { q } }).then((r) => r.data),
  searchCompanies: (q) => api.get('/public/companies', { params: { q } }).then((r) => r.data),
  createCompany: (body) => api.post('/public/companies', body).then((r) => r.data),
  submitVisit: (body) => api.post('/public/visits', body).then((r) => r.data),
}
