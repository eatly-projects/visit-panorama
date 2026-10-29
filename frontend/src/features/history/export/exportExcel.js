import ExcelJS from 'exceljs'
import { downloadBlob, reportFileName } from './reportData'

const ORANGE = 'FFE2701C'
const SOFT = 'FFFFF4EA'
const INK = 'FF1C1917'
const MUTED = 'FF6B6560'
const LINE = 'FFE9E5E1'
// [$-421] = format tanggal bahasa Indonesia, apa pun bahasa Excel pembacanya.
const DATE_FORMAT = '[$-421]dddd, d mmmm yyyy'

const thin = { style: 'thin', color: { argb: LINE } }
const border = { top: thin, left: thin, bottom: thin, right: thin }

function styleHeader(row) {
  row.height = 22
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ORANGE } }
    cell.alignment = { vertical: 'middle', wrapText: true }
    cell.border = border
  })
}

function styleBody(row, zebra) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = border
    cell.alignment = { vertical: 'top', wrapText: true, ...cell.alignment }
    if (zebra) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SOFT } }
  })
}

function titleBlock(ws, report, title, lastCol) {
  ws.mergeCells(1, 1, 1, lastCol)
  const t = ws.getCell(1, 1)
  t.value = title
  t.font = { bold: true, size: 16, color: { argb: INK } }
  ws.getRow(1).height = 26
  const info = [`Periode: ${report.period}`, ...report.filterLines, `Dibuat: ${report.generatedAt}`]
  info.forEach((text, i) => {
    ws.mergeCells(2 + i, 1, 2 + i, lastCol)
    const c = ws.getCell(2 + i, 1)
    c.value = text
    c.font = { color: { argb: MUTED } }
  })
  return 2 + info.length + 1 // baris kosong setelah judul
}

/** Tabel kecil (judul + kepala kolom + isi) di sheet Ringkasan. */
function smallTable(ws, startRow, title, headers, rows) {
  ws.getCell(startRow, 1).value = title
  ws.getCell(startRow, 1).font = { bold: true, size: 12 }
  const head = ws.getRow(startRow + 1)
  head.values = headers
  styleHeader(head)
  rows.forEach((values, i) => {
    const row = ws.getRow(startRow + 2 + i)
    row.values = values
    styleBody(row, i % 2 === 1)
  })
  return startRow + 2 + rows.length + 1
}

/** Excel: sheet "Ringkasan" dan sheet "Daftar kunjungan". */
export default async function exportExcel(report) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Panorama Head Office'
  wb.created = new Date()

  // ---- Ringkasan ----
  const sum = wb.addWorksheet('Ringkasan', { views: [{ showGridLines: false }] })
  sum.columns = [{ width: 44 }, { width: 22 }, { width: 18 }]
  let r = titleBlock(sum, report, 'Laporan Kunjungan Tamu Panorama Head Office', 3)
  r = smallTable(
    sum,
    r,
    'Ringkasan',
    ['Keterangan', 'Jumlah'],
    report.summary.map((s) => [s.label, s.value])
  )
  r = smallTable(
    sum,
    r,
    'Kunjungan per hari',
    ['Tanggal', 'Tamu mengisi form', 'Tamu hadir'],
    report.perDay.map((d) => {
      const [y, m, day] = d.day.split('-').map(Number)
      return [new Date(Date.UTC(y, m - 1, day)), d.total, d.hadir]
    })
  )
  // Tanggal di tabel per hari memakai format Indonesia.
  sum.getColumn(1).eachCell((cell) => {
    if (cell.value instanceof Date) cell.numFmt = DATE_FORMAT
  })
  r = smallTable(sum, r, 'Perusahaan atau asal terbanyak', ['Perusahaan atau asal', 'Jumlah kunjungan'], report.topCompanies.map((t) => [t.name, t.count]))
  smallTable(sum, r, 'Karyawan yang paling sering dikunjungi', ['Nama karyawan', 'Jumlah kunjungan'], report.topEmployees.map((t) => [t.name, t.count]))

  // ---- Daftar kunjungan ----
  const columns = [
    { header: 'No', key: 'no', width: 6 },
    { header: 'Tanggal', key: 'tanggal', width: 28 },
    { header: 'Nama tamu', key: 'nama', width: 26 },
    { header: 'Nomor HP', key: 'hp', width: 18 },
    { header: 'Perusahaan atau asal', key: 'perusahaan', width: 28 },
    { header: 'Bertemu dengan', key: 'bertemu', width: 24 },
    { header: 'Departemen atau perusahaan', key: 'departemen', width: 24 },
    { header: 'Tujuan kunjungan', key: 'tujuan', width: 40 },
    { header: 'Nomor kartu', key: 'kartu', width: 10 },
    { header: 'Jam datang (WIB)', key: 'datang', width: 12 },
    { header: 'Jam pulang (WIB)', key: 'pulang', width: 12 },
    { header: 'Lama berkunjung', key: 'lama', width: 18 },
    { header: 'Lama berkunjung (menit)', key: 'lamaMenit', width: 12 },
    { header: 'Status', key: 'status', width: 22 },
    { header: 'Disetujui oleh', key: 'disetujuiOleh', width: 20 },
    { header: 'Kartu diterima oleh', key: 'diterimaOleh', width: 20 },
    { header: 'Form diisi oleh petugas', key: 'diisiPetugas', width: 20 },
  ]
  const list = wb.addWorksheet('Daftar kunjungan')
  list.columns = columns.map(({ key, width }) => ({ key, width }))
  const headerRowNo = titleBlock(list, report, 'Daftar Kunjungan Tamu', columns.length)
  const header = list.getRow(headerRowNo)
  header.values = columns.map((c) => c.header)
  styleHeader(header)

  report.rows.forEach((row, i) => {
    const [y, m, d] = row.dayISO.split('-').map(Number)
    const excelRow = list.getRow(headerRowNo + 1 + i)
    excelRow.values = columns.map((c) => (c.key === 'tanggal' ? new Date(Date.UTC(y, m - 1, d)) : row[c.key]))
    excelRow.getCell(2).numFmt = DATE_FORMAT
    // Nomor HP sebagai teks supaya angka 0 di depan tidak hilang.
    excelRow.getCell(4).value = row.hp
    excelRow.getCell(4).numFmt = '@'
    styleBody(excelRow, i % 2 === 1)
  })

  list.views = [{ state: 'frozen', ySplit: headerRowNo, xSplit: 3 }]
  list.autoFilter = { from: { row: headerRowNo, column: 1 }, to: { row: headerRowNo, column: columns.length } }
  list.pageSetup = { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 }

  const buffer = await wb.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    reportFileName(report, 'xlsx')
  )
}
