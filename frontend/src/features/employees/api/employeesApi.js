import { api } from '@/lib/axios'

export const employeesApi = {
  list: (params) => api.get('/employees', { params }).then((r) => r.data),
  create: (body) => api.post('/employees', body).then((r) => r.data),
  update: ({ id, ...body }) => api.patch(`/employees/${id}`, body).then((r) => r.data),
}
