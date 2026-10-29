import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuPencil, LuPower, LuUserCog, LuUserPlus } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { ActiveBadge } from '@/components/ActiveBadge'
import { TablePagination } from '@/components/TablePagination'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAction } from '@/lib/useAction'
import { initials } from '@/lib/format'
import { useMe } from '@/features/auth/api/authApi'
import { officersApi } from '../api/officersApi'
import { OfficerDialog } from '../components/OfficerDialog'

export function OfficersPage() {
  const { data: me } = useMe()
  const [page, setPage] = useState(1)
  const { data, isPending, isError } = useQuery({
    queryKey: ['officers', page],
    queryFn: () => officersApi.list({ page }),
    placeholderData: (prev) => prev,
  })
  const officers = data?.items
  const [editing, setEditing] = useState(null) // {} = tambah, officer = ubah
  const [deactivating, setDeactivating] = useState(null)

  const toggle = useAction({
    mutationFn: officersApi.update,
    loading: 'Menyimpan…',
    success: (d) => (d.is_active ? `Akun ${d.name} diaktifkan kembali` : `Akun ${d.name} dinonaktifkan`),
    invalidate: [['officers']],
    onSuccess: () => setDeactivating(null),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akun petugas"
        description="Akun resepsionis dan admin yang bisa masuk ke dashboard ini. Semua akun punya akses yang sama."
      >
        <Button onClick={() => setEditing({})}>
          <LuUserPlus />
          Tambah akun
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isPending ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <EmptyState icon={LuUserCog} title="Daftar akun tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
        ) : (
          <>
          <ul className="divide-y">
            {officers.map((o) => {
              const isMe = o.id === me?.id
              return (
                <li key={o.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                      {initials(o.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{o.name}</p>
                        {isMe && <span className="text-sm text-muted-foreground">(akun Anda)</span>}
                        <ActiveBadge active={o.is_active} />
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{o.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(o)}>
                      <LuPencil />
                      Ubah
                    </Button>
                    {!isMe &&
                      (o.is_active ? (
                        <Button variant="ghost" size="sm" onClick={() => setDeactivating(o)}>
                          <LuPower />
                          Nonaktifkan
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: o.id, is_active: true })}>
                          <LuPower />
                          Aktifkan
                        </Button>
                      ))}
                  </div>
                </li>
              )
            })}
          </ul>
          <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="akun" onPageChange={setPage} />
          </>
        )}
      </div>

      <OfficerDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} officer={editing?.id ? editing : null} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(o) => !o && setDeactivating(null)}
        title={`Nonaktifkan akun ${deactivating?.name ?? ''}?`}
        description="Akun ini langsung tidak bisa masuk ke dashboard. Riwayat persetujuan yang pernah dibuatnya tetap tersimpan."
        confirmLabel="Nonaktifkan akun"
        tone="danger"
        pending={toggle.isPending}
        onConfirm={() => toggle.mutate({ id: deactivating.id, is_active: false })}
      />
    </div>
  )
}
