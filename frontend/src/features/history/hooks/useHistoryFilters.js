import { useSearchParams } from 'react-router-dom'
import { todayISO } from '@/lib/format'

// Filter riwayat disimpan di alamat halaman, jadi tetap ada saat halaman
// dimuat ulang dan bisa dibagikan ke petugas lain.
const KEYS = ['q', 'phone', 'from', 'to', 'status', 'company_id', 'company_name', 'employee']

/** Periode bawaan: bulan ini (tanggal 1 sampai hari ini). Permintaan Lutfi. */
function thisMonth() {
  const today = todayISO()
  return { from: `${today.slice(0, 8)}01`, to: today }
}

export function useHistoryFilters() {
  const [params, setParams] = useSearchParams()
  const raw = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? '']))
  // `semua=1` berarti petugas sengaja memilih "Semua tanggal".
  const allDates = params.get('semua') === '1'
  const usingDefault = !allDates && !raw.from && !raw.to
  const filters = usingDefault ? { ...raw, ...thisMonth() } : raw
  const page = Math.max(1, Number(params.get('page')) || 1)

  function update(changes, { keepPage = false } = {}) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
        if ('from' in changes || 'to' in changes) {
          if (!changes.from && !changes.to) next.set('semua', '1')
          else next.delete('semua')
        }
        if (!keepPage) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  /** Kembali ke keadaan awal: bulan ini, tanpa filter lain. */
  const reset = () => setParams({}, { replace: true })

  /** Parameter yang dikirim ke server (tanpa nama tampilan). */
  const apiParams = {
    q: filters.q,
    phone: filters.phone,
    from: filters.from,
    to: filters.to,
    status: filters.status,
    company_id: filters.company_id,
    employee: filters.employee,
  }

  // Filter selain periode, untuk tombol "Hapus semua filter" di daftar.
  const hasListFilters = Boolean(filters.q || filters.phone || filters.status || filters.company_id || filters.employee)
  // Hapus sesuai filter wajib memakai salah satu dari ini (docs/PLANNING.md §6.2).
  const canDelete = Boolean(filters.from || filters.to || filters.phone || filters.employee)

  return {
    filters,
    apiParams,
    page,
    update,
    reset,
    hasListFilters,
    canDelete,
    setPage: (p) => update({ page: String(p) }, { keepPage: true }),
  }
}
