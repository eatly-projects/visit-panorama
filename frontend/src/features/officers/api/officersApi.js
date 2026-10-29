import { api } from '@/lib/axios'

export const officersApi = {
  list: (params) => api.get('/officers', { params }).then((r) => r.data),
  create: (body) => api.post('/officers', body).then((r) => r.data),
  update: ({ id, ...body }) => api.patch(`/officers/${id}`, body).then((r) => r.data),
}
