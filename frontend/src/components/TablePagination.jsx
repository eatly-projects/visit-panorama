import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { Button } from '@/components/ui/button'

/** "Menampilkan 1–20 dari 134 kunjungan" + tombol halaman. */
export function TablePagination({ page, pageSize, total, noun = 'data', onPageChange }) {
  if (!total) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className="font-semibold text-foreground tabular">{from.toLocaleString('id-ID')}–{to.toLocaleString('id-ID')}</span> dari{' '}
        <span className="font-semibold text-foreground tabular">{total.toLocaleString('id-ID')}</span> {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <LuChevronLeft />
          Sebelumnya
        </Button>
        <span className="px-1 text-sm text-muted-foreground tabular">
          Halaman {page} dari {lastPage}
        </span>
        <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Berikutnya
          <LuChevronRight />
        </Button>
      </div>
    </div>
  )
}
