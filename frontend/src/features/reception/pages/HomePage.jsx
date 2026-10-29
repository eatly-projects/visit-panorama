import { Link } from 'react-router-dom'
import { LuCircleCheck, LuClipboardPen, LuHourglass, LuIdCard } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe } from '@/features/auth/api/authApi'
import { useSummary } from '@/features/visits/api/visitsApi'
import { useNow } from '@/features/visits/hooks/useNow'
import { formatDate, formatTime, greeting } from '@/lib/format'
import { PendingSection } from '../components/PendingSection'
import { ActiveSection } from '../components/ActiveSection'

/** Beranda resepsionis: ringkasan hari ini, tamu menunggu, dan tamu yang sedang berkunjung. */
export function HomePage() {
  const now = useNow()
  const { data: officer } = useMe()
  const { data: summary, isPending } = useSummary()

  const stats = [
    { key: 'menunggu', label: 'Menunggu persetujuan', icon: LuHourglass, href: '#menunggu', tone: 'text-sky-600 dark:text-sky-400' },
    { key: 'berkunjung', label: 'Sedang berkunjung', icon: LuIdCard, href: '#berkunjung', tone: 'text-brand-ink' },
    { key: 'selesai_hari_ini', label: 'Sudah pulang hari ini', icon: LuCircleCheck, tone: 'text-emerald-600 dark:text-emerald-400' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[15px] font-medium text-muted-foreground">
            {formatDate(now)}, {formatTime(now)}
          </p>
          <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">
            {greeting()}, {officer?.name?.split(' ')[0]}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {isPending ? 'Memuat ringkasan hari ini…' : `Hari ini ada ${summary?.total_hari_ini ?? 0} tamu yang mengisi form.`}
          </p>
        </div>
        <Button variant="outline" size="lg" asChild>
          <Link to="/petugas/isi-form">
            <LuClipboardPen />
            Isi form untuk tamu
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Tag = s.href ? 'a' : 'div'
          return (
            <Tag
              key={s.key}
              href={s.href}
              className="flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 transition-colors hover:border-brand/40"
            >
              <s.icon className={`size-7 shrink-0 ${s.tone}`} />
              <div>
                {isPending ? (
                  <Skeleton className="mb-1 h-8 w-10" />
                ) : (
                  <p className="text-3xl leading-none font-extrabold tabular">{summary?.[s.key] ?? 0}</p>
                )}
                <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
            </Tag>
          )
        })}
      </div>

      <PendingSection now={now} />
      <ActiveSection now={now} />
    </div>
  )
}
