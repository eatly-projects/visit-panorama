import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export const authApi = {
  me: () => api.get('/auth/me').then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
}

/** Petugas yang sedang login; null kalau belum/sudah tidak login. */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () =>
      authApi.me().catch((err) => {
        if (err.response?.status === 401) return null
        throw err
      }),
    retry: false,
    staleTime: 5 * 60_000,
  })
}
