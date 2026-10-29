import { useEffect, useState } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { LuSearch, LuX } from 'react-icons/lu'
import { Command, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Nilai yang baru dipakai setelah pengguna berhenti mengetik sejenak. */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * Kolom pencarian dengan daftar hasil yang tampil langsung di bawahnya
 * (bukan melayang), supaya tetap nyaman di HP saat keyboard terbuka.
 *
 * - selected: { title, subtitle } yang sedang dipilih, atau null
 * - renderResults({ query, close }): isi daftar (CommandItem) saat mengetik
 */
export function SearchPicker({ id, placeholder, selected, onClear, query, onQueryChange, renderResults, invalid, icon: Icon = LuSearch }) {
  const [focused, setFocused] = useState(false)

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-brand/40 bg-brand-soft px-3.5 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{selected.title}</p>
          {selected.subtitle && <p className="truncate text-sm text-muted-foreground">{selected.subtitle}</p>}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} aria-label="Ganti pilihan">
          <LuX />
          Ganti
        </Button>
      </div>
    )
  }

  const open = focused && query.trim().length > 0

  return (
    <Command shouldFilter={false} loop className="overflow-visible rounded-lg bg-transparent p-0">
      <div
        className={cn(
          'flex h-11 items-center gap-2 rounded-lg border border-input px-3.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
          invalid && 'border-destructive ring-3 ring-destructive/20'
        )}
      >
        <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <CommandPrimitive.Input
          id={id}
          value={query}
          onValueChange={onQueryChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          className="h-full w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-[15px]"
        />
      </div>
      {open && (
        // preventDefault di mousedown: kolom ketik tetap fokus saat hasil
        // diklik, jadi daftar tidak tertutup sebelum pilihan tercatat.
        <CommandList
          className="mt-2 max-h-80 rounded-lg border bg-popover p-1 shadow-lg shadow-black/5"
          onMouseDown={(e) => e.preventDefault()}
        >
          {renderResults({ close: () => setFocused(false) })}
        </CommandList>
      )}
    </Command>
  )
}

/** Baris hasil pencarian dengan judul dan keterangan. */
export function PickerItem({ title, subtitle, icon: Icon, onSelect, value, className }) {
  return (
    <CommandItem value={value} onSelect={onSelect} className={cn('cursor-pointer gap-3 rounded-md px-3 py-2.5 text-[15px]', className)}>
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </CommandItem>
  )
}

/** Teks keterangan di dalam daftar hasil (memuat, tidak ditemukan, dan sejenisnya). */
export function PickerNote({ children }) {
  return <div className="px-3 py-3 text-sm text-muted-foreground">{children}</div>
}
