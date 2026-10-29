import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuPencil, LuPower, LuSearch, LuUserPlus, LuUsers } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ListSkeleton } from '@/components/Skeletons'
import { ActiveBadge } from '@/components/ActiveBadge'
import { TablePagination } from '@/components/TablePagination'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useDebounced } from '@/components/SearchPicker'
import { useAction } from '@/lib/useAction'
import { employeesApi } from '../api/employeesApi'
import { EmployeeDialog } from '../components/EmployeeDialog'

export function EmployeesPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('semua')
  const [page, setPage] = useState(1)
  const q = useDebounced(query.trim())
  const { data, isPending, isError } = useQuery({
    queryKey: ['employees', 'list', q, status, page],
    queryFn: () => employeesApi.list({ q, status, page }),
    placeholderData: (prev) => prev,
  })
  const employees = data?.items

  const [editing, setEditing] = useState(null) // null = tertutup, {} = tambah, employee = ubah
  const [deactivating, setDeactivating] = useState(null)

  const toggle = useAction({
    mutationFn: employeesApi.update,
    loading: 'Menyimpan…',
    success: (d) => (d.is_active ? `${d.name} diaktifkan kembali` : `${d.name} dinonaktifkan`),
    invalidate: [['employees']],
    onSuccess: () => setDeactivating(null),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karyawan"
        description="Orang yang bisa dipilih tamu sebagai orang yang ingin ditemui. Karyawan yang sudah tidak bekerja cukup dinonaktifkan supaya riwayat kunjungannya tetap utuh."
      >
        <Button onClick={() => setEditing({})}>
          <LuUserPlus />
          Tambah karyawan
        </Button>
      </PageHeader>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <LuSearch className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari nama atau departemen"
              className="pl-11"
              aria-label="Cari karyawan"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-11! w-full sm:w-52" aria-label="Saring status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua karyawan</SelectItem>
              <SelectItem value="aktif">Aktif saja</SelectItem>
              <SelectItem value="nonaktif">Nonaktif saja</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isPending ? (
          <ListSkeleton rows={4} />
        ) : isError ? (
          <EmptyState icon={LuUsers} title="Daftar karyawan tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
        ) : !employees.length ? (
          <EmptyState
            icon={LuUsers}
            title={q || status !== 'semua' ? 'Tidak ada karyawan yang cocok' : 'Belum ada karyawan'}
            description={q || status !== 'semua' ? 'Coba kata pencarian lain.' : 'Tambahkan karyawan supaya tamu bisa memilih orang yang ingin ditemui.'}
          >
            {!q && status === 'semua' && (
              <Button onClick={() => setEditing({})}>
                <LuUserPlus />
                Tambah karyawan
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
          <ul className="divide-y">
            {employees.map((e) => (
              <li key={e.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{e.name}</p>
                    <ActiveBadge active={e.is_active} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {e.department ? `Departemen ${e.department}` : 'Departemen belum diisi'}, {e.visit_count.toLocaleString('id-ID')} kunjungan
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(e)}>
                    <LuPencil />
                    Ubah
                  </Button>
                  {e.is_active ? (
                    <Button variant="ghost" size="sm" onClick={() => setDeactivating(e)}>
                      <LuPower />
                      Nonaktifkan
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: e.id, is_active: true })}>
                      <LuPower />
                      Aktifkan
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <TablePagination page={data.page} pageSize={data.page_size} total={data.total} noun="karyawan" onPageChange={setPage} />
          </>
        )}
      </div>

      <EmployeeDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} employee={editing?.id ? editing : null} />
      <ConfirmDialog
        open={!!deactivating}
        onOpenChange={(o) => !o && setDeactivating(null)}
        title={`Nonaktifkan ${deactivating?.name ?? ''}?`}
        description="Nama ini tidak muncul lagi di form tamu. Riwayat kunjungannya tetap tersimpan, dan karyawan bisa diaktifkan kembali kapan saja."
        confirmLabel="Nonaktifkan"
        pending={toggle.isPending}
        onConfirm={() => toggle.mutate({ id: deactivating.id, is_active: false })}
      />
    </div>
  )
}
