import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { reportFileName } from './reportData'

// Huruf bawaan PDF (Helvetica) tidak punya tanda pisah panjang; ganti dengan "-".
const txt = (s) => String(s ?? '').replace(/[–—]/g, '-')

const ORANGE = [226, 112, 28]
const RED = [237, 28, 36]
const SOFT = [255, 244, 234]
const ZEBRA = [255, 249, 244]
const INK = [28, 25, 23]
const MUTED = [107, 101, 96]
const LINE = [233, 229, 225]

const PAGE_W = 297
const PAGE_H = 210
const M = 14 // margin kiri/kanan

async function logoDataUrl() {
  try {
    const blob = await fetch('/logo-panorama.png').then((r) => r.blob())
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null // tanpa logo pun laporan tetap dibuat
  }
}

function brandBar(doc) {
  doc.setFillColor(...ORANGE)
  doc.rect(0, 0, PAGE_W * 0.82, 3.5, 'F')
  doc.setFillColor(...RED)
  doc.rect(PAGE_W * 0.82, 0, PAGE_W * 0.18, 3.5, 'F')
}

/** Kotak angka ringkasan, berjajar satu baris. */
function summaryBoxes(doc, summary, y) {
  const gap = 3
  const w = (PAGE_W - M * 2 - gap * (summary.length - 1)) / summary.length
  summary.forEach((s, i) => {
    const x = M + i * (w + gap)
    doc.setFillColor(...(s.main ? SOFT : [245, 245, 244]))
    doc.setDrawColor(...(s.main ? [240, 180, 130] : LINE))
    doc.roundedRect(x, y, w, 22, 2.5, 2.5, 'FD')
    doc.setTextColor(...INK)
    const isNumber = typeof s.value === 'number'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(isNumber ? 16 : 10)
    doc.text(txt(isNumber ? s.value.toLocaleString('id-ID') : s.value), x + 3.5, y + (isNumber ? 10 : 9), { maxWidth: w - 7 })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(txt(s.label), x + 3.5, y + 17.5, { maxWidth: w - 7 })
  })
}

/** Grafik batang sederhana "tamu hadir per hari" (PDF tidak bisa disentuh, jadi nilai tertinggi diberi label). */
function dailyChart(doc, perDay, y, h) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Tamu hadir per hari', M, y)
  const top = y + 5
  const chartH = h - 14
  const left = M + 8
  const width = PAGE_W - M - left
  const max = Math.max(1, ...perDay.map((d) => d.hadir))
  const steps = 4
  const tick = Math.max(1, Math.ceil(max / steps))
  const scaleMax = tick * steps

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  for (let i = 0; i <= steps; i++) {
    const gy = top + chartH - (chartH * i) / steps
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.2)
    doc.line(left, gy, left + width, gy)
    doc.setTextColor(...MUTED)
    doc.text(String(tick * i), left - 2, gy + 1, { align: 'right' })
  }

  if (!perDay.length) return
  const slot = width / perDay.length
  const barW = Math.min(6, slot * 0.7)
  const maxIndex = perDay.reduce((best, d, i) => (d.hadir > perDay[best].hadir ? i : best), 0)
  const labelEvery = Math.ceil(perDay.length / 31)
  perDay.forEach((d, i) => {
    const x = left + i * slot + (slot - barW) / 2
    const bh = (chartH * d.hadir) / scaleMax
    if (bh > 0) {
      doc.setFillColor(...ORANGE)
      doc.roundedRect(x, top + chartH - bh, barW, bh, 0.8, 0.8, 'F')
      doc.rect(x, top + chartH - Math.min(bh, 1), barW, Math.min(bh, 1), 'F') // ujung bawah tetap siku
    }
    if (i % labelEvery === 0) {
      doc.setTextColor(...MUTED)
      doc.text(String(Number(d.day.slice(8, 10))), x + barW / 2, top + chartH + 4, { align: 'center' })
    }
    if (i === maxIndex && d.hadir > 0) {
      doc.setTextColor(...INK)
      doc.setFont('helvetica', 'bold')
      doc.text(`${d.hadir} tamu`, x + barW / 2, top + chartH - bh - 1.5, { align: 'center' })
      doc.setFont('helvetica', 'normal')
    }
  })
  doc.setTextColor(...MUTED)
  doc.text('Tanggal', left + width, top + chartH + 8, { align: 'right' })
}

const tableTheme = {
  theme: 'grid',
  styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, textColor: INK, lineColor: LINE, lineWidth: 0.2, valign: 'top', overflow: 'linebreak' },
  headStyles: { fillColor: ORANGE, textColor: [255, 255, 255], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: ZEBRA },
}

/** Unduh PDF laporan. */
export default async function exportPdf(report) {
  const doc = await buildPdf(report)
  doc.save(reportFileName(report, 'pdf'))
}

/** PDF A4 mendatar: halaman 1 ringkasan, halaman berikutnya daftar kunjungan. */
export async function buildPdf(report) {
  // compress: isi PDF dimampatkan supaya file tetap kecil walau ratusan baris.
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true })
  const logo = await logoDataUrl()

  // ---- Halaman 1: ringkasan ----
  brandBar(doc)
  if (logo) doc.addImage(logo, 'PNG', M, 10, 38, 7.6, undefined, 'FAST')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...INK)
  doc.text('Laporan Kunjungan Tamu', M, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(...MUTED)
  doc.text(txt(`Panorama Head Office, periode ${report.period}`), M, 36.5)
  const meta = [...report.filterLines, `Dibuat ${report.generatedAt}`].map(txt).join('   |   ')
  doc.setFontSize(8.5)
  doc.text(meta, M, 41.5, { maxWidth: PAGE_W - M * 2 })

  summaryBoxes(doc, report.summary, 47)
  dailyChart(doc, report.perDay, 80, 54)

  const half = (PAGE_W - M * 2 - 8) / 2
  const topY = 142
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Perusahaan atau asal terbanyak', M, topY)
  doc.text('Karyawan yang paling sering dikunjungi', M + half + 8, topY)
  const topRows = (items) => (items.length ? items.slice(0, 5).map((t, i) => [i + 1, txt(t.name), t.count]) : [['', 'Belum ada data', '']])
  const topTable = (items, x, head) =>
    autoTable(doc, {
      ...tableTheme,
      startY: topY + 3,
      margin: { left: x },
      tableWidth: half,
      head: [['No', head, 'Kunjungan']],
      body: topRows(items),
      columnStyles: { 0: { cellWidth: 9 }, 2: { cellWidth: 22, halign: 'right' } },
    })
  topTable(report.topCompanies, M, 'Perusahaan atau asal')
  topTable(report.topEmployees, M + half + 8, 'Nama karyawan')

  // ---- Halaman 2 dan seterusnya: daftar kunjungan ----
  doc.addPage()
  brandBar(doc)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...INK)
  doc.text(txt(`Daftar kunjungan (${report.rows.length.toLocaleString('id-ID')} tamu)`), M, 14)
  autoTable(doc, {
    ...tableTheme,
    startY: 18,
    margin: { left: M, right: M, top: 12, bottom: 16 },
    // Satu kunjungan tidak dibelah ke dua halaman.
    rowPageBreak: 'avoid',
    head: [['No', 'Tanggal', 'Nama tamu', 'Perusahaan atau asal', 'Bertemu dengan', 'Tujuan kunjungan', 'Kartu', 'Datang', 'Pulang', 'Lama', 'Status']],
    body: report.rows.map((r) => [
      r.no,
      txt(r.tanggal),
      `${txt(r.nama)}\n${r.hp}`,
      txt(r.perusahaan),
      r.departemen ? `${txt(r.bertemu)}\n(${txt(r.departemen)})` : txt(r.bertemu),
      txt(r.tujuan),
      r.kartu,
      r.datang,
      r.pulang,
      txt(r.lama),
      txt(r.status),
    ]),
    columnStyles: {
      0: { cellWidth: 9, halign: 'right' },
      1: { cellWidth: 23 },
      2: { cellWidth: 34 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 11, halign: 'center' },
      7: { cellWidth: 13 },
      8: { cellWidth: 13 },
      9: { cellWidth: 21 },
      10: { cellWidth: 24 },
    },
    willDrawPage: (data) => {
      if (data.pageNumber > 1) brandBar(doc)
    },
  })

  // Catatan kaki dan nomor halaman di setiap halaman.
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(txt(`Laporan Kunjungan Tamu Panorama Head Office, periode ${report.period}`), M, PAGE_H - 7)
    doc.text(`Halaman ${i} dari ${pages}`, PAGE_W - M, PAGE_H - 7, { align: 'right' })
  }

  return doc
}
