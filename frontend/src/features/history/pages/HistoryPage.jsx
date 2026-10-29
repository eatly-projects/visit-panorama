import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuHistory, LuTrash2 } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { TablePagination } from '@/components/TablePagination'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { useHistoryFilters } from '../hooks/useHistoryFilters'
import { HistoryFilters } from '../components/HistoryFilters'
import { HistoryTable } from '../components/HistoryTable'
import { VisitDetailSheet } from '../components/VisitDetailSheet'
import { DeleteByFilterDialog } from '../components/DeleteByFilterDialog'

export function HistoryPage() {
  const { filters, apiParams, page, update, reset, hasAny, canDelete, setPage } = useHistoryFilters()
  const [openId, setOpenId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, isPending, isError, isPlaceholderData } = useQuery({
    queryKey: ['visits', 'list', apiParams, page],
    queryFn: () => visitsApi.list({ ...apiParams, page }),
    placeholderData: (prev) => prev,
  })

  const deleteButton = (
    <Button
      variant="outline"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={!canDelete}
      onClick={() => setDeleting(true)}
    >
      <LuTrash2 />
      Hapus data sesuai filter
    </Button>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riwayat kunjungan"
        description="Semua tamu yang pernah mengisi form. Klik satu baris untuk melihat detail lengkapnya."
      >
        {canDelete ? (
          deleteButton
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{deleteButton}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-64 text-center">
              Pilih tanggal kunjungan, nomor telepon tamu, atau orang yang ditemui dulu
            </TooltipContent>
          </Tooltip>
        )}
      </PageHeader>

      <HistoryFilters filters={filters} update={update} reset={reset} hasAny={hasAny} />

      <div className={`overflow-hidden rounded-2xl border bg-card transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
        {isPending ? (
          <ListSkeleton rows={5} />
        ) : isError ? (
          <EmptyState icon={LuHistory} title="Riwayat tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
        ) : !data.items.length ? (
          <EmptyState
            icon={LuHistory}
            title={hasAny ? 'Tidak ada kunjungan yang cocok dengan filter' : 'Belum ada riwayat kunjungan'}
            description={hasAny ? 'Coba ubah atau hapus sebagian filter.' : 'Kunjungan akan tercatat di sini setelah tamu mengisi form.'}
          >
            {hasAny && (
              <Button variant="outline" onClick={reset}>
                Hapus semua filter
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <HistoryTable items={data.items} onOpen={setOpenId} />
            <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="kunjungan" onPageChange={setPage} />
          </>
        )}
      </div>

      <VisitDetailSheet
        id={openId}
        onOpenChange={(open) => !open && setOpenId(null)}
        onFilterPhone={(phone) => update({ phone, q: '' })}
      />
      <DeleteByFilterDialog open={deleting} onOpenChange={setDeleting} filters={filters} apiParams={apiParams} />
    </div>
  )
}
