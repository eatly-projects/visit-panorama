import { api } from '@/lib/axios'

export const companiesApi = {
  list: (params) => api.get('/companies', { params }).then((r) => r.data),
  rename: ({ id, name }) => api.patch(`/companies/${id}`, { name }).then((r) => r.data),
  merge: ({ id, target_id }) => api.post(`/companies/${id}/merge`, { target_id }).then((r) => r.data),
  remove: (id) => api.delete(`/companies/${id}`),
}
