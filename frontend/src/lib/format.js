/**
 * Format tanggal, jam, durasi, dan nomor telepon untuk layar. Semua waktu
 * ditampilkan dalam WIB (Asia/Jakarta), dengan nama hari dan bulan lengkap.
 */

const TZ = 'Asia/Jakarta'

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  timeZone: TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const dayMonthYearFmt = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' })
const dayMonthFmt = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })
const isoDayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ })
const hourFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hour12: false })

/** "Kamis, 29 Oktober 2026" */
export const formatDate = (value) => (value ? dateFmt.format(new Date(value)) : '')

/** "29 Oktober 2026" */
export const formatDayMonthYear = (value) => (value ? dayMonthYearFmt.format(new Date(value)) : '')

/** "09.15 WIB" */
export const formatTime = (value) => (value ? `${timeFmt.format(new Date(value))} WIB` : '')

/** "Kamis, 29 Oktober 2026 pukul 09.15 WIB" */
export const formatDateTime = (value) => (value ? `${formatDate(value)} pukul ${formatTime(value)}` : '')

/** Tanggal hari ini (WIB) dalam format YYYY-MM-DD. */
export const todayISO = () => isoDayFmt.format(new Date())

/** Tanggal (WIB) dari sebuah waktu, format YYYY-MM-DD. */
export const toISODay = (value) => isoDayFmt.format(new Date(value))

/** Apakah waktu ini terjadi sebelum hari ini (WIB)? */
export const isBeforeToday = (value) => (value ? toISODay(value) < todayISO() : false)

/** "1 jam 20 menit"; kalau `end` kosong dihitung sampai sekarang. */
export function formatDuration(start, end) {
  if (!start) return ''
  const minutes = Math.max(0, Math.floor((new Date(end ?? Date.now()) - new Date(start)) / 60000))
  if (minutes < 1) return 'kurang dari 1 menit'
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  const parts = []
  if (days) parts.push(`${days} hari`)
  if (hours) parts.push(`${hours} jam`)
  if (mins && !days) parts.push(`${mins} menit`)
  return parts.join(' ')
}

/** 81 (menit) → "1 jam 21 menit". null kalau belum ada data. */
export function formatMinutes(minutes) {
  if (minutes == null) return null
  if (minutes < 1) return 'kurang dari 1 menit'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return [h && `${h} jam`, m && `${m} menit`].filter(Boolean).join(' ')
}

/** "Selamat pagi" / "Selamat siang" / "Selamat sore" / "Selamat malam" menurut jam WIB. */
export function greeting() {
  const hour = Number(hourFmt.format(new Date()))
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

/** "081234567890" → "0812 3456 7890" */
export const formatPhone = (phone) => (phone ? phone.replace(/(\d{4})(?=\d)/g, '$1 ') : '')

/**
 * Rentang tanggal lengkap dari dua string YYYY-MM-DD:
 * "1–7 September 2026", "28 Agustus–3 September 2026", "29 Oktober 2026".
 */
export function formatDateRange(from, to) {
  const toDate = (iso) => new Date(`${iso}T12:00:00+07:00`)
  if (from && to) {
    if (from === to) return formatDayMonthYear(toDate(from))
    const a = toDate(from)
    const b = toDate(to)
    const sameYear = from.slice(0, 4) === to.slice(0, 4)
    const sameMonth = sameYear && from.slice(5, 7) === to.slice(5, 7)
    if (sameMonth) return `${Number(from.slice(8, 10))}–${formatDayMonthYear(b)}`
    if (sameYear) return `${dayMonthFmt.format(a)}–${formatDayMonthYear(b)}`
    return `${formatDayMonthYear(a)}–${formatDayMonthYear(b)}`
  }
  if (from) return `Sejak ${formatDayMonthYear(toDate(from))}`
  if (to) return `Sampai ${formatDayMonthYear(toDate(to))}`
  return ''
}

/** Huruf depan nama untuk lingkaran inisial. */
export const initials = (name) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
