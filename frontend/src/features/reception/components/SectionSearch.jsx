import { LuSearch } from 'react-icons/lu'
import { Input } from '@/components/ui/input'

/** Kotak pencarian besar di bagian atas section beranda. */
export function SectionSearch({ id, label, placeholder, value, onChange }) {
  return (
    <div className="border-b bg-muted/40 px-5 py-4">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <LuSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 bg-card pl-12 text-base md:text-base"
          autoComplete="off"
        />
      </div>
    </div>
  )
}
