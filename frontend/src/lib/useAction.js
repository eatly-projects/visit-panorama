import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { errorMessage } from './axios'

/**
 * useMutation + toast untuk setiap request yang mengubah data.
 * - loading: teks saat proses (opsional)
 * - success: teks atau fungsi (data, variables) => teks
 * - invalidate: daftar queryKey yang dimuat ulang setelah berhasil
 */
export function useAction({ mutationFn, loading, success, invalidate = [], onSuccess, onError }) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: () => (loading ? { toastId: toast.loading(loading) } : {}),
    onSuccess: (data, variables, context) => {
      const message = typeof success === 'function' ? success(data, variables) : success
      if (message) toast.success(message, { id: context?.toastId })
      else if (context?.toastId) toast.dismiss(context.toastId)
      // Dialog langsung ditutup; daftar dimuat ulang di belakang layar tanpa
      // ditunggu (koneksi ke database bisa beberapa detik).
      onSuccess?.(data, variables)
      invalidate.forEach((queryKey) => qc.invalidateQueries({ queryKey }))
    },
    onError: (err, variables, context) => {
      toast.error(errorMessage(err), { id: context?.toastId })
      onError?.(err, variables)
    },
  })
}
