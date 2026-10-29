import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const visitsApi = {
  summary: () => api.get('/visits/summary').then((r) => r.data),
  pending: (params) => api.get('/visits/pending', { params }).then((r) => r.data),
  active: (params) => api.get('/visits/active', { params }).then((r) => r.data),
  list: (params) => api.get('/visits', { params }).then((r) => r.data),
  detail: (id) => api.get(`/visits/${id}`).then((r) => r.data),
  approve: ({ id, card_number }) => api.post(`/visits/${id}/approve`, { card_number }).then((r) => r.data),
  reject: (id) => api.post(`/visits/${id}/reject`).then((r) => r.data),
  returnCard: (id) => api.post(`/visits/${id}/return`).then((r) => r.data),
  cardLost: (id) => api.post(`/visits/${id}/card-lost`).then((r) => r.data),
  remove: (id) => api.delete(`/visits/${id}`),
  deletePreview: (params) => api.get('/visits/delete-preview', { params }).then((r) => r.data),
  deleteByFilter: (filters) => api.post('/visits/delete-by-filter', filters).then((r) => r.data),
  stats: (params) => api.get('/visits/stats', { params }).then((r) => r.data),
  exportRows: (params) => api.get('/visits/export', { params, timeout: 60_000 }).then((r) => r.data),
}

// Daftar di beranda diperbarui otomatis tanpa refresh (docs/PLANNING.md §6.1).
export const LIVE_INTERVAL = 5000

export function useSummary() {
  return useQuery({ queryKey: ['visits', 'summary'], queryFn: visitsApi.summary, refetchInterval: LIVE_INTERVAL })
}

/** Daftar tamu menunggu (dengan pencarian nama dan halaman), diperbarui otomatis. */
export function usePending({ q = '', page = 1 } = {}) {
  return useQuery({
    queryKey: ['visits', 'pending', q, page],
    queryFn: () => visitsApi.pending({ q, page }),
    refetchInterval: LIVE_INTERVAL,
    placeholderData: (prev) => prev,
  })
}
