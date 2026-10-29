import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuBuilding2, LuMerge, LuPencil, LuSearch, LuTrash2 } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { TablePagination } from '@/components/TablePagination'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useDebounced } from '@/components/SearchPicker'
import { useAction } from '@/lib/useAction'
import { formatDayMonthYear } from '@/lib/format'
import { companiesApi } from '../api/companiesApi'
import { RenameDialog } from '../components/RenameDialog'
import { MergeDialog } from '../components/MergeDialog'

export function CompaniesPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebounced(query.trim())
  const { data, isPending, isError } = useQuery({
    queryKey: ['companies', 'list', q, page],
    queryFn: () => companiesApi.list({ q, page }),
    placeholderData: (prev) => prev,
  })

  const [renaming, setRenaming] = useState(null)
  const [merging, setMerging] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const remove = useAction({
    mutationFn: companiesApi.remove,
    loading: 'Menghapus…',
    success: 'Perusahaan dihapus',
    invalidate: [['companies']],
    onSuccess: () => setDeleting(null),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perusahaan"
        description="Nama perusahaan yang diisi tamu. Kalau ada nama yang dobel, gabungkan supaya datanya rapi."
      />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b p-4">
          <div className="relative">
            <LuSearch className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari nama perusahaan"
              className="pl-11"
              aria-label="Cari perusahaan"
            />
          </div>
        </div>

        {isPending ? (
          <ListSkeleton rows={4} />
        ) : isError ? (
          <EmptyState icon={LuBuilding2} title="Daftar perusahaan tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
        ) : !data.items.length ? (
          <EmptyState
            icon={LuBuilding2}
            title={q ? `Tidak ada perusahaan dengan nama "${q}"` : 'Belum ada perusahaan'}
            description={q ? 'Coba kata pencarian lain.' : 'Nama perusahaan akan tercatat di sini saat tamu menambahkannya lewat form.'}
          />
        ) : (
          <>
            <ul className="divide-y">
              {data.items.map((c) => (
                <li key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.visit_count ? `${c.visit_count.toLocaleString('id-ID')} kunjungan` : 'Belum ada kunjungan'}, ditambahkan{' '}
                      {formatDayMonthYear(c.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setRenaming(c)}>
                      <LuPencil />
                      Ubah nama
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setMerging(c)}>
                      <LuMerge />
                      Gabungkan
                    </Button>
                    {c.visit_count === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(c)}
                      >
                        <LuTrash2 />
                        Hapus
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="perusahaan" onPageChange={setPage} />
          </>
        )}
      </div>

      <RenameDialog company={renaming} onOpenChange={(o) => !o && setRenaming(null)} />
      <MergeDialog company={merging} onOpenChange={(o) => !o && setMerging(null)} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Hapus "${deleting?.name ?? ''}"?`}
        description="Perusahaan ini belum punya kunjungan, jadi aman dihapus. Nama ini tidak muncul lagi di form tamu."
        confirmLabel="Hapus perusahaan"
        tone="danger"
        pending={remove.isPending}
        onConfirm={() => remove.mutate(deleting.id)}
      />
    </div>
  )
}
