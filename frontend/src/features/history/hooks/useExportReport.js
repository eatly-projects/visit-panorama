import { useState } from 'react'
import toast from 'react-hot-toast'
import { errorMessage } from '@/lib/axios'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { buildReport } from '../export/reportData'

/**
 * Mengambil data kunjungan lalu membuat file Excel atau PDF.
 * Library Excel/PDF baru diunduh saat dipakai supaya halaman tetap ringan.
 * - apiParams: filter yang dikirim ke server (termasuk from/to)
 * - filters: filter yang sama beserta nama tampilan, untuk keterangan di file
 */
export function useExportReport() {
  const [busy, setBusy] = useState(null)

  async function run(kind, apiParams, filters) {
    const label = kind === 'excel' ? 'Excel' : 'PDF'
    setBusy(kind)
    const id = toast.loading(`Menyiapkan file ${label}…`)
    try {
      const data = await visitsApi.exportRows(apiParams)
      if (!data.rows.length) {
        toast.error('Tidak ada kunjungan pada periode dan filter ini, jadi tidak ada yang diunduh', { id })
        return false
      }
      const report = buildReport(data.rows, filters)
      const build = kind === 'excel' ? (await import('../export/exportExcel')).default : (await import('../export/exportPdf')).default
      await build(report)
      toast.success(
        data.truncated
          ? `File ${label} diunduh. Isinya dibatasi ${data.limit.toLocaleString('id-ID')} kunjungan pertama; persempit periode untuk sisanya.`
          : `File ${label} diunduh (${data.rows.length.toLocaleString('id-ID')} kunjungan)`,
        { id, duration: 6000 }
      )
      return true
    } catch (err) {
      toast.error(err?.response ? errorMessage(err) : `File ${label} gagal dibuat. Silakan coba lagi.`, { id })
      return false
    } finally {
      setBusy(null)
    }
  }

  return { busy, run }
}
