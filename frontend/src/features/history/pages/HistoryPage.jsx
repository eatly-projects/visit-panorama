import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuHistory, LuTrash2 } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PageHeader } from '@/components/PageHeader'
import { Section } from '@/components/Section'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { TablePagination } from '@/components/TablePagination'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { useHistoryFilters } from '../hooks/useHistoryFilters'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { StatsOverview } from '../components/stats/StatsOverview'
import { HistoryFilters } from '../components/HistoryFilters'
import { HistoryTable } from '../components/HistoryTable'
import { VisitDetailSheet } from '../components/VisitDetailSheet'
import { DeleteByFilterDialog } from '../components/DeleteByFilterDialog'
import { ExportButtons } from '../components/ExportButtons'

/** Riwayat kunjungan: dashboard ringkasan periode, lalu daftar kunjungan lengkap. */
export function HistoryPage() {
  const { filters, apiParams, page, update, reset, hasListFilters, canDelete, setPage } = useHistoryFilters()
  const [openId, setOpenId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['visits', 'list', apiParams, page],
    queryFn: () => visitsApi.list({ ...apiParams, page }),
    placeholderData: (prev) => prev,
  })

  const deleteButton = (
    <Button
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={!canDelete}
      onClick={() => setDeleting(true)}
    >
      <LuTrash2 />
      Hapus data sesuai filter
    </Button>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Riwayat kunjungan"
        description="Ringkasan dan daftar kunjungan tamu. Periode yang dipilih berlaku untuk semua angka, grafik, daftar, dan file unduhan di halaman ini."
      >
        <div className="w-full sm:w-72">
          <p className="mb-1.5 text-sm font-semibold">Periode</p>
          <DateRangeFilter from={filters.from} to={filters.to} onChange={({ from, to }) => update({ from, to })} />
        </div>
      </PageHeader>

      <StatsOverview from={filters.from} to={filters.to} />

      <Section
        id="daftar"
        title="Daftar kunjungan"
        count={data?.total}
        description="Klik satu baris untuk melihat detail lengkapnya."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportButtons filters={filters} apiParams={apiParams} disabled={!data?.total} />
            {canDelete ? (
              deleteButton
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>{deleteButton}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-64 text-center">
                  Pilih periode, nomor HP tamu, atau orang yang ditemui dulu
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        }
      >
        <HistoryFilters filters={filters} update={update} hasListFilters={hasListFilters} />

        <div className={`transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {isPending ? (
            <ListSkeleton rows={5} />
          ) : isError ? (
            <EmptyState icon={LuHistory} title="Riwayat tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
          ) : !data.items.length ? (
            <EmptyState
              icon={LuHistory}
              title="Tidak ada kunjungan yang cocok"
              description="Coba ubah periode di bagian atas atau hapus sebagian filter."
            >
              <Button variant="outline" onClick={reset}>
                Kembali ke bulan ini tanpa filter
              </Button>
            </EmptyState>
          ) : (
            <>
              <HistoryTable items={data.items} onOpen={setOpenId} />
              <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="kunjungan" onPageChange={setPage} />
            </>
          )}
        </div>
      </Section>

      <VisitDetailSheet
        id={openId}
        onOpenChange={(open) => !open && setOpenId(null)}
        onFilterPhone={(phone) => update({ phone, q: '' })}
      />
      <DeleteByFilterDialog open={deleting} onOpenChange={setDeleting} filters={filters} apiParams={apiParams} />
    </div>
  )
}
