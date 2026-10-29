import { useState } from 'react'
import { LuChevronsUpDown, LuX } from 'react-icons/lu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Filter pilih satu (perusahaan atau orang yang ditemui) dengan pencarian.
 * - items: [{ id, name, detail? }]
 * - onSearch: kalau diisi, pencarian dilakukan di server (bukan disaring lokal)
 */
export function EntityFilter({ placeholder, allLabel, value, onChange, items = [], loading, onSearch, emptyText = 'Tidak ditemukan.' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className={cn('h-11 w-full justify-between font-medium', !value && 'text-muted-foreground', value && 'pr-11')}>
            <span className="truncate">{value?.name ?? allLabel}</span>
            {!value && <LuChevronsUpDown className="size-4 opacity-60" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
          <Command shouldFilter={!onSearch}>
            <CommandInput placeholder={placeholder} onValueChange={onSearch} />
            <CommandList>
              <CommandEmpty>{loading ? 'Memuat…' : emptyText}</CommandEmpty>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.name} ${item.id}`}
                  onSelect={() => {
                    onChange({ id: item.id, name: item.name })
                    setOpen(false)
                  }}
                  className="py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate">{item.name}</p>
                    {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={`Hapus filter ${value.name}`}
        >
          <LuX className="size-4" />
        </button>
      )}
    </div>
  )
}
