/**
 * Membuat poster PDF (A4) berisi kode QR menuju form tamu, untuk dicetak dan
 * ditaruh di meja resepsionis. Desain ada di poster.html; skrip ini mengisi
 * teks per bahasa, QR, logo, dan huruf (disisipkan langsung supaya PDF tidak
 * bergantung file luar), lalu mencetaknya ke PDF lewat Microsoft Edge tanpa jendela.
 *
 * Cara pakai (dari folder frontend/):
 *   npm run poster-qr
 *   npm run poster-qr -- https://alamat-lain.vercel.app/
 *
 * Hasil, masing-masing PDF dan .png (versi gambar), di docs/poster/:
 *   Poster-QR-Tamu-Panorama          (Bahasa Indonesia)
 *   Poster-QR-Tamu-Panorama-English  (English)
 * Kalau Edge terpasang di lokasi lain, isi variabel EDGE_PATH.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'

const here = path.dirname(fileURLToPath(import.meta.url))
const formUrl = process.argv[2] ?? 'https://visit-panorama.vercel.app/'
const outputDir = path.resolve(here, '../../../docs/poster')

// Teks poster per bahasa. Versi English diterjemahkan sesuai makna dan memakai
// istilah yang sama dengan form tamu (src/i18n/messages/en.js), misalnya
// tombol "Submit visit details" dan "visitor pass".
const VERSIONS = [
  {
    file: 'Poster-QR-Tamu-Panorama',
    LANG: 'id',
    DOC_TITLE: 'Poster QR Tamu Panorama Building',
    TITLE: 'Selamat datang di Panorama Building',
    LEAD: 'Isi data kunjungan lewat HP Anda. Kartu identitas cukup ditunjukkan, tidak perlu diserahkan.',
    SCAN: 'Scan dengan kamera HP',
    STEPS_TITLE: 'Cara mendaftar',
    STEP_1: '<strong>Scan kode QR</strong> di atas dengan kamera HP Anda.',
    STEP_2: '<strong>Isi data kunjungan</strong>, lalu tekan tombol Kirim data kunjungan.',
    STEP_3: '<strong>Tunjukkan layar HP</strong> dan kartu identitas Anda ke resepsionis untuk mendapatkan kartu visitor.',
    NOTE: '<strong>Mohon siapkan kartu identitas untuk ditunjukkan kepada resepsionis kami.</strong> Kartu hanya diperlihatkan, tidak kami simpan atau tahan.',
    HELP: 'Butuh bantuan? Silakan tanyakan ke resepsionis.',
  },
  {
    file: 'Poster-QR-Tamu-Panorama-English',
    LANG: 'en',
    DOC_TITLE: 'Panorama Building Visitor QR Poster',
    TITLE: 'Welcome to Panorama Building',
    LEAD: 'Register your visit on your phone. You only need to show your ID, not hand it over.',
    SCAN: 'Scan with your phone camera',
    STEPS_TITLE: 'How to register',
    STEP_1: '<strong>Scan the QR code</strong> above with your phone camera, then choose English.',
    STEP_2: '<strong>Fill in your visit details</strong>, then tap Submit visit details.',
    STEP_3: '<strong>Show your phone screen</strong> and your ID to our receptionist to receive a visitor pass.',
    NOTE: '<strong>Please have your ID card or passport ready to show to our receptionist.</strong> We only look at it. We never keep or hold it.',
    HELP: 'Need help? Please ask our receptionist.',
  },
]

const edge =
  process.env.EDGE_PATH ??
  ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(
    existsSync
  )
if (!edge) {
  console.error('Microsoft Edge tidak ditemukan. Isi EDGE_PATH dengan lokasi msedge.exe.')
  process.exit(1)
}

const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(file).toString('base64')}`
const fontDir = path.resolve(here, '../../node_modules/@fontsource-variable/plus-jakarta-sans/files')

// Level koreksi "M" dan tanpa logo di tengah: paling mudah dibaca kamera HP lama.
const qrSvg = renderToStaticMarkup(
  createElement(QRCodeSVG, { value: formUrl, size: 512, level: 'M', marginSize: 0, fgColor: '#1c1917', bgColor: '#ffffff' })
)

const template = readFileSync(path.join(here, 'poster.html'), 'utf8')
  .replace('{{FONT}}', dataUri(path.join(fontDir, 'plus-jakarta-sans-latin-wght-normal.woff2'), 'font/woff2'))
  .replace('{{FONT_ITALIC}}', dataUri(path.join(fontDir, 'plus-jakarta-sans-latin-wght-italic.woff2'), 'font/woff2'))
  .replace('{{LOGO_PUTIH}}', dataUri(path.join(here, 'assets/logo-putih.png'), 'image/png'))
  .replace('{{LOGO_WARNA}}', dataUri(path.join(here, 'assets/logo-warna.png'), 'image/png'))
  .replace('{{QR_SVG}}', qrSvg)
  .replace('{{URL_TEXT}}', formUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))

mkdirSync(outputDir, { recursive: true })
const common = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=5000']

for (const { file, ...texts } of VERSIONS) {
  const html = template.replace(/\{\{([A-Z_0-9]+)\}\}/g, (match, key) => texts[key] ?? match)
  const tempHtml = path.join(os.tmpdir(), `${file}.html`)
  writeFileSync(tempHtml, html)
  const pageUrl = pathToFileURL(tempHtml).href

  const output = path.join(outputDir, `${file}.pdf`)
  execFileSync(edge, [...common, '--no-pdf-header-footer', `--print-to-pdf=${output}`, pageUrl], { stdio: 'ignore' })

  // Versi gambar: A4 pada 96 dpi (794 × 1123 piksel) dikali 3, sekitar 288 dpi,
  // cukup tajam untuk dicetak dan enak dikirim lewat WhatsApp.
  const imageOutput = output.replace(/\.pdf$/, '.png')
  execFileSync(
    edge,
    [...common, '--window-size=794,1123', '--force-device-scale-factor=3', `--screenshot=${imageOutput}`, pageUrl],
    { stdio: 'ignore' }
  )

  console.log(`Poster dibuat: ${output} dan ${path.basename(imageOutput)}`)
}
console.log(`QR mengarah ke: ${formUrl}`)
