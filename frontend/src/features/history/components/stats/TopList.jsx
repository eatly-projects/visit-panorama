/**
 * Peringkat sederhana: nama, batang, dan jumlah. Dibuat dengan HTML biasa
 * supaya nama panjang tetap utuh (dibungkus ke baris berikutnya, tidak terpotong).
 */
export function TopList({ items, unit = 'kunjungan', emptyText }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
  const max = Math.max(...items.map((i) => i.count))
  return (
    <ol className="space-y-3.5">
      {items.map((item, idx) => (
        <li key={`${item.name}-${idx}`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 font-medium break-words">{item.name}</span>
            <span className="shrink-0 font-semibold tabular">
              {item.count.toLocaleString('id-ID')} <span className="font-normal text-muted-foreground">{unit}</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted">
            <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
