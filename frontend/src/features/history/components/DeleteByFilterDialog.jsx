import { useQuery } from '@tanstack/react-query'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/lib/useAction'
import { formatDateRange, formatPhone } from '@/lib/format'
import { STATUS } from '@/lib/status'
import { visitsApi } from '@/features/visits/api/visitsApi'

/** Hapus permanen semua data yang cocok dengan filter aktif (tanpa kotak pencarian nama). */
export function DeleteByFilterDialog({ open, onOpenChange, filters, apiParams }) {
  // Kotak pencarian bebas sengaja tidak ikut (docs/PLANNING.md §6.2).
  const params = { ...apiParams, q: '' }
  const preview = useQuery({
    queryKey: ['visits', 'delete-preview', params],
    queryFn: () => visitsApi.deletePreview(params),
    enabled: open,
    staleTime: 0,
  })

  const remove = useAction({
    mutationFn: () => visitsApi.deleteByFilter(params),
    loading: 'Menghapus data…',
    success: (d) => `${d.deleted.toLocaleString('id-ID')} data kunjungan dihapus permanen`,
    invalidate: [['visits']],
    onSuccess: () => onOpenChange(false),
  })

  const lines = [
    (filters.from || filters.to) && ['Tanggal kunjungan', formatDateRange(filters.from, filters.to)],
    filters.phone && ['Tamu dengan nomor', formatPhone(filters.phone)],
    filters.employee_id && ['Orang yang ditemui', filters.employee_name],
    filters.company_id && ['Perusahaan atau asal', filters.company_name],
    filters.status && ['Status', STATUS[filters.status]?.label],
  ].filter(Boolean)

  const count = preview.data?.count ?? 0

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Hapus data sesuai filter?"
      description="Data yang terhapus tidak bisa dikembalikan. Tamu yang masih menunggu atau sedang berkunjung tidak ikut terhapus."
      confirmLabel={preview.isPending ? 'Menghitung…' : `Hapus ${count.toLocaleString('id-ID')} data permanen`}
      tone="danger"
      pending={remove.isPending}
      confirmDisabled={preview.isPending || count === 0}
      onConfirm={() => remove.mutate()}
    >
      <div className="space-y-3 rounded-xl bg-muted/70 p-4 text-sm">
        <dl className="space-y-1.5">
          {lines.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t pt-3">
          {preview.isPending ? (
            <Skeleton className="h-5 w-40" />
          ) : count === 0 ? (
            <p className="font-semibold">Tidak ada data yang bisa dihapus dengan filter ini.</p>
          ) : (
            <p className="font-semibold text-destructive">
              {count.toLocaleString('id-ID')} data kunjungan akan dihapus permanen.
            </p>
          )}
        </div>
      </div>
    </ConfirmDialog>
  )
}
