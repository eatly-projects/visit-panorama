/**
 * Aturan nama perusahaan tanpa duplikat (docs/PLANNING.md §7).
 */

// Kata bentuk badan usaha yang diabaikan saat membandingkan nama. Hanya
// dibuang kalau berdiri sendiri sebagai kata, jadi "Ptolemy" tetap utuh.
// Tambahkan di sini kalau ada bentuk lain yang perlu diabaikan.
const LEGAL_FORMS = new Set(['pt', 'cv', 'ud', 'tbk', 'persero', 'firma']);

/** Nama pembanding: huruf kecil, tanpa tanda baca, tanpa PT/CV/Tbk, spasi tunggal. */
export function normalizeCompanyName(name) {
  if (typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((word) => word && !LEGAL_FORMS.has(word))
    .join(' ');
}

/** Nama tampilan: disimpan seperti yang diketik, hanya spasinya dirapikan. */
export function tidyDisplayName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}
