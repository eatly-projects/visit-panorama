import { formatDateTime } from '@/lib/format'

const TZ = 'Asia/Jakarta'
const enDate = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const enTime = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false })

/**
 * Tanggal dan jam lengkap sesuai bahasa:
 * id → "Kamis, 29 Oktober 2026 pukul 09.15 WIB"
 * en → "Thursday 29 October 2026 at 09:15 WIB"
 */
export function formatDateTimeIn(lang, value) {
  if (!value) return ''
  if (lang !== 'en') return formatDateTime(value)
  const d = new Date(value)
  return `${enDate.format(d)} at ${enTime.format(d)} WIB`
}

/** Pesan error yang ramah untuk tamu, dalam bahasa yang dipilih. */
export function friendlyError(err, t, lang) {
  if (err?.code === 'ECONNABORTED') return t('errors.timeout')
  if (!err?.response) return t('errors.network')
  if (err.response.status === 429) return t('errors.tooMany')
  // Pesan dari server berbahasa Indonesia; untuk bahasa lain pakai pesan umum.
  if (err.response.status < 500 && lang === 'id' && err.response.data?.error) return err.response.data.error
  return err.response.status < 500 ? t('errors.checkData') : t('errors.generic')
}
