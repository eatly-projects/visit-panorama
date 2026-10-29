import { STATUS } from '@/lib/status'
import { cn } from '@/lib/utils'

export function StatusBadge({ status, className }) {
  const s = STATUS[status]
  if (!s) return null
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', s.className, className)}>
      {s.label}
    </span>
  )
}
