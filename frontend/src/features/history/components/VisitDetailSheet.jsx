import { useState } from 'react'
import { useLastDefined } from '@/hooks/useLastDefined'
import { useQuery } from '@tanstack/react-query'
import { LuHistory, LuTrash2 } from 'react-icons/lu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/StatusBadge'
import { VisitorCardTag } from '@/components/VisitorCardTag'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { formatDateTime, formatDuration, formatPhone } from '@/lib/format'
import { useAction } from '@/lib/useAction'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { WhatsAppButton } from '@/features/visits/components/WhatsAppButton'

function Info({ label, children }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[15px] font-medium break-words whitespace-pre-line">{children}</dd>
    </div>
  )
}

function Step({ title, time, by, tone = 'bg-muted-foreground' }) {
  return (
    <li className="relative pb-5 pl-7 last:pb-0">
      <span className={`absolute top-1.5 left-0 size-3 rounded-full ${tone}`} aria-hidden />
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">
        {formatDateTime(time)}
        {by && `, oleh ${by}`}
      </p>
    </li>
  )
}

/** Detail lengkap satu kunjungan, dibuka dari Riwayat. */
export function VisitDetailSheet({ id, onOpenChange, onFilterPhone }) {
  const shownId = useLastDefined(id)

  const { data: v, isPending } = useQuery({
    queryKey: ['visits', 'detail', shownId],
    queryFn: () => visitsApi.detail(shownId),
    enabled: !!shownId,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const remove = useAction({
    mutationFn: visitsApi.remove,
    loading: 'Menghapus data…',
    success: 'Data kunjungan dihapus',
    invalidate: [['visits']],
    onSuccess: () => {
      setConfirmDelete(false)
      onOpenChange(false)
    },
  })

  const active = v && ['menunggu', 'berkunjung'].includes(v.status)

  return (
    <Sheet open={!!id} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b px-6 pt-6 pb-5">
          <SheetTitle className="text-xl font-bold">{v?.visitor_name ?? 'Detail kunjungan'}</SheetTitle>
          <SheetDescription>{v ? <StatusBadge status={v.status} /> : 'Memuat…'}</SheetDescription>
        </SheetHeader>

        {isPending || !v ? (
          <div className="space-y-4 px-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-7 px-6 pb-8">
            {v.card_number && (
              <div className="flex items-center gap-4">
                <VisitorCardTag number={v.card_number} />
                <div>
                  <p className="text-sm text-muted-foreground">Kartu visitor</p>
                  <p className="text-lg font-bold">Nomor {v.card_number}</p>
                  {v.returned_at && (
                    <p className="text-sm text-muted-foreground">Lama berkunjung {formatDuration(v.approved_at, v.returned_at)}</p>
                  )}
                </div>
              </div>
            )}

            <dl className="grid gap-4 sm:grid-cols-2">
              <Info label="Nomor telepon">{formatPhone(v.phone)}</Info>
              <Info label="Perusahaan atau asal">{v.company_name ?? 'Tidak diisi'}</Info>
              <Info label="Orang yang ditemui">
                {v.employee_name}
                {v.employee_department && <span className="text-muted-foreground"> ({v.employee_department})</span>}
              </Info>
              <div className="sm:col-span-2">
                <Info label="Tujuan kunjungan">{v.purpose ?? <span className="text-muted-foreground">Tidak diisi</span>}</Info>
              </div>
            </dl>

            <div>
              <h3 className="mb-3 font-bold">Perjalanan kunjungan</h3>
              <ol className="relative before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:bg-border">
                <Step title={v.filled_by_name ? 'Form diisi oleh petugas' : 'Tamu mengisi form'} time={v.submitted_at} by={v.filled_by_name} tone="bg-sky-500" />
                {v.approved_at && <Step title="Disetujui, kartu diberikan" time={v.approved_at} by={v.approved_by_name} tone="bg-primary" />}
                {v.returned_at && <Step title="Kartu dikembalikan, tamu pulang" time={v.returned_at} by={v.returned_by_name} tone="bg-emerald-500" />}
                {v.rejected_at && <Step title="Kunjungan ditolak" time={v.rejected_at} by={v.rejected_by_name} tone="bg-stone-400" />}
                {v.card_lost_at && <Step title="Kartu ditandai tidak kembali" time={v.card_lost_at} by={v.card_lost_by_name} tone="bg-destructive" />}
              </ol>
            </div>

            <div className="flex flex-col gap-2 border-t pt-6">
              {['berkunjung', 'tidak_kembali'].includes(v.status) && <WhatsAppButton visit={v} size="default" />}
              <Button
                variant="outline"
                onClick={() => {
                  onFilterPhone(v.phone)
                  onOpenChange(false)
                }}
              >
                <LuHistory />
                Lihat semua kunjungan tamu ini
              </Button>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={active}
                onClick={() => setConfirmDelete(true)}
              >
                <LuTrash2 />
                Hapus data kunjungan ini
              </Button>
              {active && (
                <p className="text-center text-sm text-muted-foreground">
                  Data tamu yang masih menunggu atau sedang berkunjung belum bisa dihapus.
                </p>
              )}
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Hapus data kunjungan ini?"
          description={`Data kunjungan ${v?.visitor_name} dihapus permanen dan tidak bisa dikembalikan.`}
          confirmLabel="Hapus permanen"
          tone="danger"
          pending={remove.isPending}
          onConfirm={() => remove.mutate(v.id)}
        />
      </SheetContent>
    </Sheet>
  )
}
