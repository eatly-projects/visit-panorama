import { useState } from 'react'
import { LuFileSpreadsheet, LuFileText } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { useExportReport } from '../hooks/useExportReport'
import { ExportExcelDialog } from './ExportExcelDialog'

/**
 * Unduh Excel: periode dipilih di jendela tersendiri (harian, minggu lalu,
 * bulan ini, bulan lalu, atau rentang tertentu).
 * Unduh PDF: mengikuti periode dan filter yang sedang tampil di halaman.
 */
export function ExportButtons({ filters, apiParams, disabled }) {
  const { busy, run } = useExportReport()
  const [excelOpen, setExcelOpen] = useState(false)

  return (
    <>
      <Button variant="outline" disabled={!!busy} onClick={() => setExcelOpen(true)}>
        <LuFileSpreadsheet className="text-emerald-600 dark:text-emerald-400" />
        Unduh Excel
      </Button>
      <Button variant="outline" disabled={disabled || !!busy} onClick={() => run('pdf', apiParams, filters)}>
        <LuFileText className="text-red-600 dark:text-red-400" />
        {busy === 'pdf' ? 'Menyiapkan…' : 'Unduh PDF'}
      </Button>
      <ExportExcelDialog
        open={excelOpen}
        onOpenChange={setExcelOpen}
        filters={filters}
        busy={busy}
        onExport={async (params, reportFilters) => {
          if (await run('excel', params, reportFilters)) setExcelOpen(false)
        }}
      />
    </>
  )
}
