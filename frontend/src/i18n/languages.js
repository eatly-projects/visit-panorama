/**
 * Bahasa yang tersedia di halaman tamu. Untuk menambah bahasa baru: buat file
 * terjemahan di folder messages/ (salin en.js lalu terjemahkan per kalimat
 * sesuai makna, bukan kata per kata), lalu daftarkan di sini.
 */
import id from './messages/id'
import en from './messages/en'

export const LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', otherName: 'Indonesian', locale: 'id-ID', messages: id },
  { code: 'en', name: 'English', otherName: 'Bahasa Inggris', locale: 'en-GB', messages: en },
]

export const DEFAULT_LANGUAGE = 'id'

export const languageByCode = (code) => LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
