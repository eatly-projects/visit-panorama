import { cn } from '@/lib/utils'

const SIZES = {
  sm: { box: 'w-12 pt-3 pb-1.5 rounded-md', slot: 'top-1.5 w-4 h-1', num: 'text-lg', label: 'text-[9px]' },
  md: { box: 'w-16 pt-4 pb-2 rounded-lg', slot: 'top-2 w-5 h-1.5', num: 'text-2xl', label: 'text-[10px]' },
  lg: { box: 'w-28 pt-6 pb-3 rounded-xl', slot: 'top-3 w-8 h-2', num: 'text-5xl', label: 'text-xs' },
}

/**
 * Nomor kartu visitor digambar seperti kartu fisik bertali (ada lubang tali
 * di atas). Angkanya tebal miring, meniru gaya tulisan logo Panorama.
 * Ini tampilan di layar petugas saja; kartu aslinya tetap kartu fisik.
 */
export function VisitorCardTag({ number, size = 'md', className }) {
  const s = SIZES[size]
  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col items-center border border-brand/40 bg-gradient-to-b from-brand-soft to-card shadow-[0_1px_2px_rgb(240_133_47/0.15)]',
        s.box,
        className
      )}
      aria-label={number ? `Kartu visitor nomor ${number}` : 'Kartu visitor'}
    >
      <span className={cn('absolute rounded-full bg-brand/35', s.slot)} aria-hidden />
      <span className={cn('font-semibold text-brand-ink/80', s.label)}>Kartu</span>
      <span className={cn('tabular -skew-x-6 leading-none font-extrabold text-brand-ink', s.num)}>
        {number || '–'}
      </span>
      <span className="absolute inset-x-0 bottom-0 h-1 rounded-b-[inherit] bg-gradient-to-r from-brand to-brand-red" aria-hidden />
    </div>
  )
}
