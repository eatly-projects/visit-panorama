import { formatDateRange, formatDateTime, formatDayMonthYear, formatDuration, formatMinutes, formatPhone, formatTime, toISODay } from '@/lib/format'
import { STATUS } from '@/lib/status'

const clock = (value) => (value ? formatTime(value).replace(' WIB', '') : '')
const minutesBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000))

/** Satu baris kunjungan dalam bentuk siap tampil di Excel dan PDF. */
function toRow(v, index) {
  const done = v.status === 'selesai' && v.approved_at && v.returned_at
  return {
    no: index + 1,
    dayISO: toISODay(v.submitted_at),
    tanggal: formatDayMonthYear(v.submitted_at),
    nama: v.visitor_name,
    hp: formatPhone(v.phone),
    perusahaan: v.company_name ?? '',
    bertemu: v.employee_name ?? '',
    departemen: v.employee_department ?? '',
    tujuan: v.purpose ?? '',
    kartu: v.card_number ?? '',
    datang: clock(v.approved_at),
    pulang: clock(v.returned_at),
    lama: done ? formatDuration(v.approved_at, v.returned_at) : '',
    lamaMenit: done ? minutesBetween(v.approved_at, v.returned_at) : '',
    status: STATUS[v.status]?.label ?? v.status,
    disetujuiOleh: v.approved_by_name ?? '',
    diterimaOleh: v.returned_by_name ?? '',
    diisiPetugas: v.filled_by_name ?? '',
  }
}

/** Peringkat 10 teratas; nama dikelompokkan tanpa beda huruf besar/kecil. */
function top(rows, key) {
  const groups = new Map()
  rows.forEach((r) => {
    const name = String(r[key] ?? '').trim()
    if (!name) return
    const k = name.toLowerCase()
    const g = groups.get(k) ?? { count: 0, spellings: new Map() }
    g.count++
    g.spellings.set(name, (g.spellings.get(name) ?? 0) + 1)
    groups.set(k, g)
  })
  return [...groups.values()]
    .map((g) => ({ name: [...g.spellings.entries()].sort((a, b) => b[1] - a[1])[0][0], count: g.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'id'))
    .slice(0, 10)
}

/** Kalimat filter yang sedang aktif, supaya pembaca laporan tahu isinya data apa. */
export function describeFilters(f) {
  const lines = []
  if (f.status) lines.push(`Status: ${STATUS[f.status]?.label}`)
  if (f.company_id) lines.push(`Perusahaan atau asal: ${f.company_name}`)
  if (f.employee) lines.push(`Nama karyawan yang ditemui mengandung "${f.employee}"`)
  if (f.phone) lines.push(`Nomor HP tamu: ${formatPhone(f.phone)}`)
  if (f.q) lines.push(`Pencarian: "${f.q}"`)
  return lines
}

/** Menyusun semua bahan laporan dari baris hasil export. */
export function buildReport(visits, filters) {
  const rows = visits.map(toRow)
  const count = (status) => visits.filter((v) => v.status === status).length
  const durations = rows.filter((r) => r.lamaMenit !== '').map((r) => r.lamaMenit)

  const perDay = new Map()
  rows.forEach((r) => {
    const d = perDay.get(r.dayISO) ?? { total: 0, hadir: 0 }
    d.total++
    if (r.datang) d.hadir++
    perDay.set(r.dayISO, d)
  })

  const period = formatDateRange(filters.from, filters.to) || 'Semua tanggal'
  return {
    rows,
    period,
    generatedAt: formatDateTime(new Date()),
    filterLines: describeFilters(filters),
    summary: [
      { label: 'Tamu mengisi form', value: rows.length },
      { label: 'Tamu hadir', value: visits.filter((v) => v.approved_at).length, main: true },
      { label: 'Sudah pulang', value: count('selesai') },
      { label: 'Sedang berkunjung', value: count('berkunjung') },
      { label: 'Menunggu persetujuan', value: count('menunggu') },
      { label: 'Ditolak', value: count('ditolak') },
      { label: 'Kartu tidak kembali', value: count('tidak_kembali') },
      {
        label: 'Rata-rata lama berkunjung',
        value: durations.length ? formatMinutes(Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)) : 'Belum ada data',
      },
    ],
    perDay: [...perDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, d]) => ({ day, ...d })),
    topCompanies: top(rows, 'perusahaan'),
    topEmployees: top(rows, 'bertemu'),
  }
}

/** Nama file yang mudah dikenali, tanpa karakter yang bermasalah di Windows. */
export function reportFileName(report, ext) {
  return `Laporan Kunjungan Tamu Panorama ${report.period.replace(/–/g, '-')}.${ext}`
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
