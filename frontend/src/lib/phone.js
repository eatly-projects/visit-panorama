/**
 * Aturan yang sama dengan backend (backend/src/shared/utils/phone.js):
 * nomor dirapikan jadi berawalan 0, 10–15 digit; null kalau tidak valid.
 */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return null
  let digits = raw.replace(/[\s\-().]/g, '')
  if (digits.startsWith('+62')) digits = `0${digits.slice(3)}`
  else if (digits.startsWith('62')) digits = `0${digits.slice(2)}`
  else if (digits.startsWith('8')) digits = `0${digits}`
  return /^0\d{9,14}$/.test(digits) ? digits : null
}
