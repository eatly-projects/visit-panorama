import axios from 'axios'
import { queryClient } from './queryClient'

// Selalu path relatif /api: saat dev diteruskan Vite ke backend lokal, di
// Vercel diteruskan rewrite frontend/vercel.json. Cookie sesi jadi cookie
// pihak pertama dan diterima semua browser, termasuk Safari di iPhone.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20_000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? ''
    // Sesi habis saat memakai dashboard: kosongkan data petugas, lalu
    // RequireAuth otomatis mengarahkan ke halaman masuk.
    if (err.response?.status === 401 && !url.startsWith('/auth/') && !url.startsWith('/public/')) {
      queryClient.setQueryData(['me'], null)
    }
    return Promise.reject(err)
  }
)

/** Pesan error yang bisa dibaca orang awam. */
export function errorMessage(err) {
  if (err?.response?.data?.error) return err.response.data.error
  if (err?.code === 'ECONNABORTED') return 'Server terlalu lama merespons. Silakan coba lagi.'
  if (!err?.response) return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
  return 'Terjadi kesalahan. Silakan coba lagi.'
}
