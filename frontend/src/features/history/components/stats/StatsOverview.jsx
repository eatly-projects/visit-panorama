import { useQuery } from '@tanstack/react-query'
import {
  LuBan,
  LuChartColumn,
  LuCircleCheck,
  LuCircleX,
  LuClipboardPen,
  LuClock,
  LuHourglass,
  LuIdCard,
  LuUserCheck,
} from 'react-icons/lu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/EmptyState'
import { formatDateRange, formatMinutes } from '@/lib/format'
import { cn } from '@/lib/utils'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { ChartCard } from './ChartCard'
import { VisitsChart } from './VisitsChart'
import { HoursChart } from './HoursChart'
import { TopList } from './TopList'

const TILES = [
  { key: 'total', label: 'Tamu mengisi form', hint: 'Semua form yang dikirim', icon: LuClipboardPen },
  { key: 'hadir', label: 'Tamu hadir', hint: 'Disetujui dan menerima kartu', icon: LuUserCheck, main: true },
  { key: 'berkunjung_sekarang', label: 'Sedang berkunjung', hint: 'Saat ini, di luar periode', icon: LuIdCard },
  { key: 'selesai', label: 'Sudah pulang', hint: 'Kartu sudah dikembalikan', icon: LuCircleCheck },
  { key: 'menunggu', label: 'Menunggu persetujuan', hint: 'Belum disetujui resepsionis', icon: LuHourglass },
  { key: 'ditolak', label: 'Ditolak', hint: 'Tidak disetujui resepsionis', icon: LuCircleX },
  { key: 'tidak_kembali', label: 'Kartu tidak kembali', hint: 'Kartu hilang atau terbawa', icon: LuBan },
  { key: 'rata_rata_menit', label: 'Rata-rata lama berkunjung', hint: 'Dari tamu yang sudah pulang', icon: LuClock, duration: true },
]

/** Ringkasan dashboard untuk periode yang dipilih. */
export function StatsOverview({ from, to }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['visits', 'stats', from, to],
    queryFn: () => visitsApi.stats({ from, to }),
    placeholderData: (prev) => prev,
  })

  if (isError) {
    return (
      <div className="rounded-2xl border bg-card">
        <EmptyState icon={LuChartColumn} title="Ringkasan tidak dapat dimuat" description="Periksa koneksi internet, lalu muat ulang halaman." />
      </div>
    )
  }

  const t = data?.totals
  const empty = data && t.total === 0

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">
        Ringkasan periode <span className="font-semibold text-foreground">{data ? formatDateRange(data.period.from, data.period.to) : '…'}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILES.map((tile) => {
          const value = t?.[tile.key]
          const text = tile.duration ? formatMinutes(value) : value?.toLocaleString('id-ID')
          return (
            <div key={tile.key} className={cn('rounded-2xl border bg-card p-4', tile.main && 'border-brand/40 bg-brand-soft')}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-snug font-semibold">{tile.label}</p>
                <tile.icon className={cn('size-5 shrink-0 text-muted-foreground', tile.main && 'text-brand-ink')} aria-hidden />
              </div>
              {isPending ? (
                <Skeleton className="mt-3 h-8 w-16" />
              ) : (
                <p className={cn('mt-2 font-extrabold tabular', tile.duration ? 'text-xl leading-tight' : 'text-3xl leading-none')}>
                  {text ?? <span className="text-base font-semibold text-muted-foreground">Belum ada data</span>}
                </p>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">{tile.hint}</p>
            </div>
          )
        })}
      </div>

      {isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : empty ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={LuChartColumn}
            title="Belum ada kunjungan pada periode ini"
            description="Grafik akan muncul setelah ada tamu yang mengisi form. Coba pilih periode lain di bagian atas."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            className="lg:col-span-2 xl:col-span-3"
            title={data.period.unit === 'month' ? 'Tamu hadir per bulan' : 'Tamu hadir per hari'}
            description="Arahkan kursor atau sentuh batang untuk melihat angkanya."
          >
            <VisitsChart series={data.series} unit={data.period.unit} />
          </ChartCard>
          <ChartCard
            className="lg:col-span-2 xl:col-span-1"
            title="Jam kedatangan"
            description="Jumlah tamu menurut jam datang (WIB), untuk melihat jam paling ramai."
          >
            <HoursChart hours={data.hours} />
          </ChartCard>
          <ChartCard title="Perusahaan atau asal terbanyak">
            <TopList items={data.top_companies} emptyText="Belum ada data perusahaan." />
          </ChartCard>
          <ChartCard title="Karyawan yang paling sering dikunjungi">
            <TopList items={data.top_employees} emptyText="Belum ada data karyawan." />
          </ChartCard>
        </div>
      )}
    </div>
  )
}
