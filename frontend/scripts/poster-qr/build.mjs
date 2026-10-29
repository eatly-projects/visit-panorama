/**
 * Membuat poster PDF (A4) berisi kode QR menuju form tamu, untuk dicetak dan
 * ditaruh di meja resepsionis. Desain ada di poster.html; skrip ini mengisi
 * QR, logo, dan huruf (disisipkan langsung supaya PDF tidak bergantung file
 * luar), lalu mencetaknya ke PDF lewat Microsoft Edge tanpa jendela.
 *
 * Cara pakai (dari folder frontend/):
 *   npm run poster-qr
 *   npm run poster-qr -- https://alamat-lain.vercel.app/
 *
 * Hasil: docs/poster/Poster-QR-Tamu-Panorama.pdf dan .png (versi gambar)
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
const output = path.resolve(here, '../../../docs/poster/Poster-QR-Tamu-Panorama.pdf')

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

const html = readFileSync(path.join(here, 'poster.html'), 'utf8')
  .replace('{{FONT}}', dataUri(path.join(fontDir, 'plus-jakarta-sans-latin-wght-normal.woff2'), 'font/woff2'))
  .replace('{{FONT_ITALIC}}', dataUri(path.join(fontDir, 'plus-jakarta-sans-latin-wght-italic.woff2'), 'font/woff2'))
  .replace('{{LOGO_PUTIH}}', dataUri(path.join(here, 'assets/logo-putih.png'), 'image/png'))
  .replace('{{LOGO_WARNA}}', dataUri(path.join(here, 'assets/logo-warna.png'), 'image/png'))
  .replace('{{QR_SVG}}', qrSvg)
  .replace('{{URL_TEXT}}', formUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''))

const tempHtml = path.join(os.tmpdir(), 'poster-qr-panorama.html')
writeFileSync(tempHtml, html)
mkdirSync(path.dirname(output), { recursive: true })

const pageUrl = pathToFileURL(tempHtml).href
const common = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=5000']

execFileSync(edge, [...common, '--no-pdf-header-footer', `--print-to-pdf=${output}`, pageUrl], { stdio: 'ignore' })

// Versi gambar: A4 pada 96 dpi (794 × 1123 piksel) dikali 3, sekitar 288 dpi,
// cukup tajam untuk dicetak dan enak dikirim lewat WhatsApp.
const imageOutput = output.replace(/\.pdf$/, '.png')
execFileSync(
  edge,
  [...common, '--window-size=794,1123', '--force-device-scale-factor=3', `--screenshot=${imageOutput}`, pageUrl],
  { stdio: 'ignore' }
)

console.log(`Poster PDF dibuat: ${output}`)
console.log(`Poster gambar dibuat: ${imageOutput}`)
console.log(`QR mengarah ke: ${formUrl}`)
