import { todayISO } from '@/lib/format'

// Tanggal disimpan sebagai teks "YYYY-MM-DD" (hari menurut WIB). Objek Date di
// sini hanya dipakai untuk menghitung hari, pada tengah malam waktu lokal.
const pad = (n) => String(n).padStart(2, '0')
export const toISO = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '')
export const fromISO = (s) => (s ? new Date(`${s}T00:00:00`) : undefined)

export function shift(iso, days) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function thisMonth() {
  const today = todayISO()
  return { from: `${today.slice(0, 8)}01`, to: today }
}

export function lastMonth() {
  const lastDay = shift(thisMonth().from, -1)
  return { from: `${lastDay.slice(0, 8)}01`, to: lastDay }
}

/** Senin sampai Minggu pekan lalu. */
export function lastWeek() {
  const today = todayISO()
  const mondayThisWeek = shift(today, -((fromISO(today).getDay() + 6) % 7))
  return { from: shift(mondayThisWeek, -7), to: shift(mondayThisWeek, -1) }
}
