import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartCard'

const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const longDateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const asDate = (iso) => new Date(`${iso}T00:00:00Z`)

const AXIS = { fill: 'var(--muted-foreground)', fontSize: 12 }

/**
 * Tamu hadir per hari (atau per bulan untuk periode panjang). Satu seri,
 * jadi judul kartu sudah menjelaskan isinya tanpa legenda.
 */
export function VisitsChart({ series, unit }) {
  const data = series.map((s) => ({
    ...s,
    label: unit === 'month' ? monthFmt.format(asDate(s.date)) : String(Number(s.date.slice(8, 10))),
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" minTickGap={8} />
          <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              const title = unit === 'month' ? monthFmt.format(asDate(d.date)) : longDateFmt.format(asDate(d.date))
              return <ChartTooltip title={title} lines={[`Tamu hadir: ${d.hadir.toLocaleString('id-ID')}`, `Mengisi form: ${d.total.toLocaleString('id-ID')}`]} />
            }}
          />
          <Bar dataKey="hadir" fill="var(--chart-1)" maxBarSize={24} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
