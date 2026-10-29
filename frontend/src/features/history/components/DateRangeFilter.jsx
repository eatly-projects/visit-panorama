import { useState } from 'react'
import { id as localeId } from 'date-fns/locale'
import { LuCalendarRange } from 'react-icons/lu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { formatDateRange, todayISO } from '@/lib/format'
import { cn } from '@/lib/utils'
import { fromISO, lastMonth, shift, thisMonth, toISO } from '../lib/periods'

function presets() {
  const today = todayISO()
  return [
    { label: 'Hari ini', from: today, to: today },
    { label: 'Kemarin', from: shift(today, -1), to: shift(today, -1) },
    { label: '7 hari terakhir', from: shift(today, -6), to: today },
    { label: 'Bulan ini', ...thisMonth() },
    { label: 'Bulan lalu', ...lastMonth() },
  ]
}

/** Pilih rentang tanggal kunjungan, dengan pilihan cepat. */
export function DateRangeFilter({ from, to, onChange }) {
  const [open, setOpen] = useState(false)
  const label = formatDateRange(from, to) || 'Semua tanggal'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('h-11 w-full justify-start font-medium', !from && !to && 'text-muted-foreground')}>
          <LuCalendarRange className="size-5" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-wrap gap-1.5 border-b p-3 sm:w-40 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0">
            {presets().map((p) => (
              <Button
                key={p.label}
                variant={p.from === from && p.to === to ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start"
                onClick={() => {
                  onChange({ from: p.from, to: p.to })
                  setOpen(false)
                }}
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => {
                onChange({ from: '', to: '' })
                setOpen(false)
              }}
            >
              Semua tanggal
            </Button>
          </div>
          <Calendar
            mode="range"
            locale={localeId}
            numberOfMonths={1}
            defaultMonth={fromISO(from) ?? new Date()}
            selected={{ from: fromISO(from), to: fromISO(to) }}
            onSelect={(range) => onChange({ from: toISO(range?.from), to: toISO(range?.to ?? range?.from) })}
            className="[--cell-size:--spacing(10)]"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
