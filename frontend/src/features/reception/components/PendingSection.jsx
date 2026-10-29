import { useState } from 'react'
import { LuBuilding2, LuCheck, LuInbox, LuSearch, LuUserRound, LuX } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/Section'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { TablePagination } from '@/components/TablePagination'
import { useDebounced } from '@/components/SearchPicker'
import { formatDuration, formatPhone, formatTime, initials } from '@/lib/format'
import { usePending } from '@/features/visits/api/visitsApi'
import { ApproveDialog } from '@/features/visits/components/ApproveDialog'
import { VisitActionsConfirm } from '@/features/visits/components/VisitActionsConfirm'
import { SectionSearch } from './SectionSearch'

/** Tamu yang baru mengisi form dan menunggu persetujuan. Diperbarui otomatis. */
export function PendingSection({ now }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebounced(query.trim(), 250)
  const { data, isPending, isError } = usePending({ q, page })
  const [approving, setApproving] = useState(null)
  const [action, setAction] = useState(null)

  const visits = data?.items

  return (
    <Section
      id="menunggu"
      title="Menunggu persetujuan"
      count={q ? undefined : data?.total}
      description="Tamu yang baru mengisi form. Daftar ini diperbarui otomatis."
    >
      <SectionSearch
        id="cari-menunggu"
        label="Cari nama tamu yang menunggu persetujuan"
        placeholder="Cari nama tamu"
        value={query}
        onChange={(v) => {
          setQuery(v)
          setPage(1)
        }}
      />

      {isPending ? (
        <ListSkeleton rows={2} />
      ) : isError ? (
        <EmptyState icon={LuInbox} title="Daftar tamu tidak dapat dimuat" description="Periksa koneksi internet. Daftar akan dicoba dimuat ulang otomatis." />
      ) : !visits.length ? (
        q ? (
          <EmptyState icon={LuSearch} title={`Tidak ada tamu menunggu bernama "${q}"`} description="Periksa lagi ejaan namanya." />
        ) : (
          <EmptyState
            icon={LuInbox}
            title="Belum ada tamu yang menunggu"
            description="Tamu yang baru mengisi form akan muncul di sini dengan sendirinya."
          />
        )
      ) : (
        <>
          <ul className="divide-y">
            {visits.map((v) => (
              <li key={v.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-accent-foreground">
                  {initials(v.visitor_name)}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <p className="text-lg font-bold">{v.visitor_name}</p>
                    <p className="text-sm text-muted-foreground tabular">{formatPhone(v.phone)}</p>
                  </div>
                  <p className="flex items-center gap-2 text-[15px]">
                    <LuBuilding2 className="size-4 shrink-0 text-muted-foreground" />
                    {v.company_name ?? <span className="text-muted-foreground">Perusahaan atau asal tidak diisi</span>}
                  </p>
                  <p className="flex items-center gap-2 text-[15px]">
                    <LuUserRound className="size-4 shrink-0 text-muted-foreground" />
                    <span>
                      Ingin bertemu <span className="font-semibold">{v.employee_name}</span>
                      {v.employee_department && <span className="text-muted-foreground"> (Departemen {v.employee_department})</span>}
                    </span>
                  </p>
                  {v.purpose && (
                    <p className="rounded-lg bg-muted/70 px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-line">{v.purpose}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Mengisi form pukul {formatTime(v.submitted_at)}, {formatDuration(v.submitted_at, now)} yang lalu
                    {v.filled_by_name && `. Diisi oleh petugas ${v.filled_by_name}`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                  <Button variant="outline" onClick={() => setAction({ type: 'reject', visit: v })}>
                    <LuX />
                    Tolak
                  </Button>
                  <Button onClick={() => setApproving(v)}>
                    <LuCheck />
                    Setujui
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="tamu" onPageChange={setPage} />
        </>
      )}

      <ApproveDialog visit={approving} onOpenChange={(open) => !open && setApproving(null)} />
      <VisitActionsConfirm action={action} onClose={() => setAction(null)} />
    </Section>
  )
}
