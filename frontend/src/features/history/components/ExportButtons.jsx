import { useState } from 'react'
import toast from 'react-hot-toast'
import { LuFileSpreadsheet, LuFileText } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/lib/axios'
import { visitsApi } from '@/features/visits/api/visitsApi'
import { buildReport } from '../export/reportData'

/**
 * Unduh laporan Excel atau PDF sesuai periode dan filter yang sedang aktif.
 * Library Excel/PDF baru diunduh saat tombol ditekan supaya halaman tetap ringan.
 */
export function ExportButtons({ filters, apiParams, disabled }) {
  const [busy, setBusy] = useState(null)

  async function run(kind) {
    const label = kind === 'excel' ? 'Excel' : 'PDF'
    setBusy(kind)
    const id = toast.loading(`Menyiapkan file ${label}…`)
    try {
      const data = await visitsApi.exportRows(apiParams)
      if (!data.rows.length) {
        toast.error('Tidak ada kunjungan untuk diunduh dengan periode dan filter ini', { id })
        return
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
    } catch (err) {
      toast.error(err?.response ? errorMessage(err) : `File ${label} gagal dibuat. Silakan coba lagi.`, { id })
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <Button variant="outline" disabled={disabled || !!busy} onClick={() => run('excel')}>
        <LuFileSpreadsheet className="text-emerald-600 dark:text-emerald-400" />
        {busy === 'excel' ? 'Menyiapkan…' : 'Unduh Excel'}
      </Button>
      <Button variant="outline" disabled={disabled || !!busy} onClick={() => run('pdf')}>
        <LuFileText className="text-red-600 dark:text-red-400" />
        {busy === 'pdf' ? 'Menyiapkan…' : 'Unduh PDF'}
      </Button>
    </>
  )
}
