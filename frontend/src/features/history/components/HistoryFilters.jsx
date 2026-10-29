import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuPhone, LuRotateCcw, LuSearch, LuUserRound } from 'react-icons/lu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounced } from '@/components/SearchPicker'
import { STATUS_OPTIONS } from '@/lib/status'
import { api } from '@/lib/axios'
import { normalizePhone } from '@/lib/phone'
import { EntityFilter } from './EntityFilter'

const LIST_FILTERS = { q: '', phone: '', status: '', company_id: '', company_name: '', employee: '' }

/** Isian teks yang baru menerapkan filter setelah berhenti mengetik. */
function DebouncedInput({ value, onCommit, ...props }) {
  const [text, setText] = useState(value)
  const debounced = useDebounced(text, 400)
  useEffect(() => setText(value), [value])
  useEffect(() => {
    if (debounced !== value) onCommit(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])
  return <Input value={text} onChange={(e) => setText(e.target.value)} {...props} />
}

/** Filter daftar kunjungan. Periode dipilih terpisah di bagian atas halaman. */
export function HistoryFilters({ filters, update, hasListFilters }) {
  const [companyQuery, setCompanyQuery] = useState('')
  const companyTerm = useDebounced(companyQuery, 300)
  const companies = useQuery({
    queryKey: ['companies', 'filter', companyTerm],
    queryFn: () => api.get('/companies', { params: { q: companyTerm } }).then((r) => r.data.items),
  })

  return (
    <div className="space-y-4 border-b bg-muted/30 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
          <Label htmlFor="cari" className="font-semibold">
            Cari tamu
          </Label>
          <div className="relative">
            <LuSearch className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
            <DebouncedInput id="cari" value={filters.q} onCommit={(q) => update({ q })} placeholder="Nama atau nomor HP" className="bg-card pl-11" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold">Status</Label>
          <Select value={filters.status || 'semua'} onValueChange={(v) => update({ status: v === 'semua' ? '' : v })}>
            <SelectTrigger className="h-11! w-full bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold">Perusahaan atau asal</Label>
          <EntityFilter
            placeholder="Cari perusahaan atau asal"
            allLabel="Semua perusahaan dan asal"
            value={filters.company_id ? { id: filters.company_id, name: filters.company_name } : null}
            onChange={(v) => update({ company_id: v?.id, company_name: v?.name })}
            items={companies.data ?? []}
            loading={companies.isFetching}
            onSearch={setCompanyQuery}
            emptyText="Tidak ditemukan."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="employee-filter" className="font-semibold">
            Orang yang ditemui
          </Label>
          <div className="relative">
            <LuUserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <DebouncedInput
              id="employee-filter"
              value={filters.employee}
              onCommit={(employee) => update({ employee: employee.trim() })}
              placeholder="Nama karyawan"
              className="bg-card pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone-filter" className="font-semibold">
            Nomor HP tamu
          </Label>
          <div className="relative">
            <LuPhone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <DebouncedInput
              id="phone-filter"
              type="tel"
              inputMode="tel"
              value={filters.phone}
              // Baru diterapkan setelah nomornya lengkap (cocok persis, bukan sebagian).
              onCommit={(phone) => {
                const normalized = normalizePhone(phone)
                if (!phone.trim() || normalized) update({ phone: normalized ?? '' })
              }}
              placeholder="Nomor lengkap"
              className="bg-card pl-10"
            />
          </div>
        </div>
      </div>

      {hasListFilters && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => update(LIST_FILTERS)}>
            <LuRotateCcw />
            Hapus filter daftar
          </Button>
        </div>
      )}
    </div>
  )
}
