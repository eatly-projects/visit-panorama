import { cn } from '@/lib/utils'

/** Wadah section bersusun di dashboard: judul + jumlah + aksi, lalu isi. */
export function Section({ title, count, description, actions, children, className, id }) {
  return (
    <section id={id} className={cn('overflow-hidden rounded-2xl border bg-card', className)}>
      <header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-lg font-bold">
            {title}
            {count !== undefined && (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-sm font-semibold tabular text-muted-foreground">
                {count}
              </span>
            )}
          </h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
