/**
 * Merapikan nomor HP:
 * - Nomor Indonesia disimpan berawalan 0 (10–15 digit), termasuk yang
 *   ditulis +62 atau 62.
 * - Nomor luar negeri (untuk tamu asing) disimpan dengan kode negara:
 *   "+" lalu 7–15 digit, misalnya +6591234567. Awalan 00 dianggap sama dengan +.
 * Mengembalikan null kalau nomornya tidak masuk akal.
 */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return null;
  let digits = raw.replace(/[\s\-().]/g, '');

  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (digits.startsWith('+62')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('+')) return /^\+[1-9]\d{6,14}$/.test(digits) ? digits : null;
  else if (digits.startsWith('62')) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith('8')) digits = `0${digits}`;

  return /^0\d{9,14}$/.test(digits) ? digits : null;
}
