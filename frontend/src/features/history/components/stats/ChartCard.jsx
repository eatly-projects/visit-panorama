import { cn } from '@/lib/utils'

/** Wadah satu grafik: judul (sekaligus nama datanya), keterangan, lalu isi. */
export function ChartCard({ title, description, children, className }) {
  return (
    <section className={cn('rounded-2xl border bg-card p-5', className)}>
      <h3 className="font-bold">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Kotak keterangan saat kursor/jari berada di atas batang grafik. */
export function ChartTooltip({ title, lines }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg shadow-black/10">
      <p className="font-semibold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-muted-foreground">
          {line}
        </p>
      ))}
    </div>
  )
}
