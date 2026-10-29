import { useState } from 'react'
import { id as localeId } from 'date-fns/locale'
import { LuFileSpreadsheet } from 'react-icons/lu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDateRange, todayISO } from '@/lib/format'
import { cn } from '@/lib/utils'
import { fromISO, lastMonth, lastWeek, thisMonth, toISO } from '../lib/periods'
import { describeFilters } from '../export/reportData'

const OPTIONS = [
  { value: 'harian', label: 'Harian', hint: 'Satu tanggal yang dipilih' },
  { value: 'minggu-lalu', label: 'Minggu lalu', range: lastWeek },
  { value: 'bulan-ini', label: 'Bulan ini', range: thisMonth },
  { value: 'bulan-lalu', label: 'Bulan lalu', range: lastMonth },
  { value: 'rentang', label: 'Rentang waktu tertentu', hint: 'Pilih tanggal awal dan akhir' },
]

const LIST_FILTER_KEYS = ['q', 'phone', 'status', 'company_id', 'company_name', 'employee']

/**
 * Pilih periode laporan Excel: harian, minggu lalu, bulan ini, bulan lalu,
 * atau rentang tertentu (permintaan Lutfi, 29 Oktober 2026).
 */
export function ExportExcelDialog({ open, onOpenChange, filters, busy, onExport }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92svh] overflow-y-auto sm:max-w-lg"
        // Fokus awal ke pilihan yang sedang terpilih, bukan pilihan pertama,
        // supaya tidak terlihat seperti dua pilihan aktif.
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          e.currentTarget.querySelector('[role="radio"][aria-checked="true"]')?.focus()
        }}
      >
        {open && <ExportForm filters={filters} busy={busy} onExport={onExport} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ExportForm({ filters, busy, onExport, onCancel }) {
  const [choice, setChoice] = useState('bulan-ini')
  const [day, setDay] = useState(todayISO())
  const [range, setRange] = useState({ from: '', to: '' })
  const [withFilters, setWithFilters] = useState(true)

  const listFilters = Object.fromEntries(LIST_FILTER_KEYS.map((k) => [k, filters[k] ?? '']))
  const filterLines = describeFilters(listFilters)

  const option = OPTIONS.find((o) => o.value === choice)
  const period =
    choice === 'harian' ? { from: day, to: day } : choice === 'rentang' ? range : option.range()
  const ready = Boolean(period.from && period.to)
  const today = fromISO(todayISO())

  function submit() {
    const applied = withFilters ? listFilters : {}
    const reportFilters = { ...applied, from: period.from, to: period.to }
    const { company_name: _name, ...apiParams } = reportFilters
    onExport(apiParams, reportFilters)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl">Unduh Excel</DialogTitle>
        <DialogDescription className="text-[15px]">Pilih periode kunjungan yang ingin dimasukkan ke file Excel.</DialogDescription>
      </DialogHeader>

      <div className="my-5 space-y-4">
        <div role="radiogroup" aria-label="Periode laporan" className="grid gap-2">
          {OPTIONS.map((o) => {
            const selected = o.value === choice
            const hint = o.range ? formatDateRange(o.range().from, o.range().to) : o.hint
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setChoice(o.value)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/60',
                  selected && 'border-brand/60 bg-brand-soft hover:bg-brand-soft'
                )}
              >
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-input',
                    selected && 'border-primary'
                  )}
                  aria-hidden
                >
                  {selected && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-muted-foreground">{hint}</span>
                </span>
              </button>
            )
          })}
        </div>

        {choice === 'harian' && (
          <div className="flex justify-center rounded-xl border">
            <Calendar
              mode="single"
              locale={localeId}
              selected={fromISO(day)}
              defaultMonth={fromISO(day)}
              onSelect={(d) => d && setDay(toISO(d))}
              disabled={{ after: today }}
              className="[--cell-size:--spacing(10)]"
            />
          </div>
        )}
        {choice === 'rentang' && (
          <div className="flex justify-center rounded-xl border">
            <Calendar
              mode="range"
              locale={localeId}
              selected={{ from: fromISO(range.from), to: fromISO(range.to) }}
              defaultMonth={fromISO(range.from) ?? today}
              onSelect={(r) => setRange({ from: toISO(r?.from), to: toISO(r?.to ?? r?.from) })}
              disabled={{ after: today }}
              className="[--cell-size:--spacing(10)]"
            />
          </div>
        )}

        <div className="rounded-xl bg-muted/70 px-4 py-3">
          <p className="text-sm text-muted-foreground">Periode yang akan diunduh</p>
          <p className="font-bold">{ready ? formatDateRange(period.from, period.to) : 'Pilih tanggal awal dan akhir di kalender'}</p>
        </div>

        {filterLines.length > 0 && (
          <label htmlFor="ikut-filter" className="flex cursor-pointer gap-3 rounded-xl border p-4">
            <Checkbox
              id="ikut-filter"
              checked={withFilters}
              onCheckedChange={(v) => setWithFilters(v === true)}
              className="mt-0.5 size-5 rounded-md"
            />
            <span className="text-sm">
              <span className="block font-semibold">Terapkan juga filter daftar yang sedang aktif</span>
              <span className="block text-muted-foreground">{filterLines.join('; ')}</span>
            </span>
          </label>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={!!busy}>
          Batal
        </Button>
        <Button type="button" onClick={submit} disabled={!ready || !!busy}>
          <LuFileSpreadsheet />
          {busy === 'excel' ? 'Menyiapkan…' : 'Unduh Excel'}
        </Button>
      </DialogFooter>
    </>
  )
}
