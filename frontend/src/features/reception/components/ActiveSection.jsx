import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuBuilding2, LuCircleCheck, LuClock, LuSearch, LuTriangleAlert, LuUserRound, LuIdCard, LuBan } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/Section'
import { TablePagination } from '@/components/TablePagination'
import { SectionSearch } from './SectionSearch'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { VisitorCardTag } from '@/components/VisitorCardTag'
import { useDebounced } from '@/components/SearchPicker'
import { formatDate, formatDuration, formatPhone, formatTime, isBeforeToday } from '@/lib/format'
import { LIVE_INTERVAL, visitsApi } from '@/features/visits/api/visitsApi'
import { VisitActionsConfirm } from '@/features/visits/components/VisitActionsConfirm'
import { WhatsAppButton } from '@/features/visits/components/WhatsAppButton'

/** Tamu yang sedang memegang kartu visitor. Dicari pakai nama atau nomor kartu. */
export function ActiveSection({ now }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebounced(query.trim(), 250)
  const { data, isPending, isError } = useQuery({
    queryKey: ['visits', 'active', q, page],
    queryFn: () => visitsApi.active({ q, page }),
    refetchInterval: LIVE_INTERVAL,
    placeholderData: (prev) => prev,
  })
  const [action, setAction] = useState(null)
  const visits = data?.items

  return (
    <Section
      id="berkunjung"
      title="Sedang berkunjung"
      count={q ? undefined : data?.total}
      description="Tamu yang masih memegang kartu visitor. Tekan Kartu dikembalikan saat tamu pulang."
    >
      <SectionSearch
        id="cari-kartu"
        label="Cari nama atau nomor kartu visitor"
        placeholder="Cari nama atau nomor kartu visitor"
        value={query}
        onChange={(v) => {
          setQuery(v)
          setPage(1)
        }}
      />

      {isPending ? (
        <ListSkeleton rows={2} />
      ) : isError ? (
        <EmptyState icon={LuIdCard} title="Daftar tamu tidak dapat dimuat" description="Periksa koneksi internet. Daftar akan dicoba dimuat ulang otomatis." />
      ) : !visits.length ? (
        q ? (
          <EmptyState icon={LuSearch} title={`Tidak ada tamu dengan nama atau nomor kartu "${q}"`} description="Periksa lagi ejaan nama atau nomor kartunya." />
        ) : (
          <EmptyState icon={LuIdCard} title="Tidak ada tamu yang sedang berkunjung" description="Semua kartu visitor sudah kembali." />
        )
      ) : (
        <>
        <ul className="divide-y">
          {visits.map((v) => {
            const overdue = isBeforeToday(v.approved_at)
            return (
              <li key={v.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 gap-4">
                  <VisitorCardTag number={v.card_number} />
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
                        Bertemu <span className="font-semibold">{v.employee_name}</span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LuClock className="size-4 shrink-0" />
                      Datang pukul {formatTime(v.approved_at)}, sudah {formatDuration(v.approved_at, now)}
                    </p>
                    {overdue && (
                      <p className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                        <LuTriangleAlert className="size-4 shrink-0" />
                        Belum kembali sejak {formatDate(v.approved_at)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:w-56 sm:shrink-0">
                  <Button onClick={() => setAction({ type: 'return', visit: v })}>
                    <LuCircleCheck />
                    Kartu dikembalikan
                  </Button>
                  <WhatsAppButton visit={v} size="default" />
                  <Button
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setAction({ type: 'lost', visit: v })}
                  >
                    <LuBan />
                    Kartu tidak kembali
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
        <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="tamu" onPageChange={setPage} />
        </>
      )}

      <VisitActionsConfirm action={action} onClose={() => setAction(null)} />
    </Section>
  )
}
