import { cn } from '@/lib/utils'

export function ActiveBadge({ active }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        active
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300'
          : 'bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300'
      )}
    >
      <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-stone-400')} aria-hidden />
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}
