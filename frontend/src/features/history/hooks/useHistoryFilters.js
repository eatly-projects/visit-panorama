import { useSearchParams } from 'react-router-dom'

// Filter riwayat disimpan di alamat halaman, jadi tetap ada saat halaman
// dimuat ulang dan bisa dibagikan ke petugas lain.
const KEYS = ['q', 'phone', 'from', 'to', 'status', 'company_id', 'company_name', 'employee_id', 'employee_name']

export function useHistoryFilters() {
  const [params, setParams] = useSearchParams()
  const filters = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? '']))
  const page = Math.max(1, Number(params.get('page')) || 1)

  function update(changes, { keepPage = false } = {}) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
        if (!keepPage) next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const reset = () => setParams({}, { replace: true })

  /** Parameter yang dikirim ke server (tanpa nama tampilan). */
  const apiParams = {
    q: filters.q,
    phone: filters.phone,
    from: filters.from,
    to: filters.to,
    status: filters.status,
    company_id: filters.company_id,
    employee_id: filters.employee_id,
  }

  const hasAny = Object.values(apiParams).some(Boolean)
  // Hapus sesuai filter wajib memakai salah satu dari ini (docs/PLANNING.md §6.2).
  const canDelete = Boolean(filters.from || filters.to || filters.phone || filters.employee_id)

  return { filters, apiParams, page, update, reset, hasAny, canDelete, setPage: (p) => update({ page: String(p) }, { keepPage: true }) }
}
