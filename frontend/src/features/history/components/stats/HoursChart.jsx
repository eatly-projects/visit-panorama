import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartCard'

const AXIS = { fill: 'var(--muted-foreground)', fontSize: 12 }
const pad = (h) => String(h).padStart(2, '0')

/** Jumlah tamu menurut jam kedatangan (jam disetujui), untuk melihat jam ramai. */
export function HoursChart({ hours }) {
  const counts = Object.fromEntries(hours.map((h) => [h.hour, h.count]))
  const withData = hours.map((h) => h.hour)
  // Tampilkan jam kerja 08–17, diperluas kalau ada kedatangan di luar itu.
  const first = Math.min(8, ...withData)
  const last = Math.max(17, ...withData)
  const data = Array.from({ length: last - first + 1 }, (_, i) => {
    const hour = first + i
    return { hour, label: `${pad(hour)}.00`, count: counts[hour] ?? 0 }
  })

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" minTickGap={6} />
          <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return <ChartTooltip title={`Pukul ${pad(d.hour)}.00–${pad(d.hour)}.59 WIB`} lines={[`${d.count.toLocaleString('id-ID')} tamu datang`]} />
            }}
          />
          <Bar dataKey="count" fill="var(--chart-1)" maxBarSize={24} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
