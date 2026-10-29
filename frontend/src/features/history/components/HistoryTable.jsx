import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDayMonthYear, formatDuration, formatPhone, formatTime } from '@/lib/format'

const none = <span className="font-normal text-muted-foreground">Belum ada</span>
const clock = (value) => formatTime(value).replace(' WIB', '')

/** Jam datang–pulang dalam satu kolom, plus lama berkunjung. */
function VisitTime({ v }) {
  if (!v.approved_at) return none
  if (!v.returned_at) return <p>Datang {clock(v.approved_at)}</p>
  return (
    <>
      <p>
        {clock(v.approved_at)}–{clock(v.returned_at)}
      </p>
      <p className="text-sm text-muted-foreground">{formatDuration(v.approved_at, v.returned_at)}</p>
    </>
  )
}

/** Daftar riwayat: tabel di layar lebar, kartu di HP dan tablet. Klik untuk melihat detail. */
export function HistoryTable({ items, onOpen }) {
  return (
    <>
      <div className="hidden xl:block">
        <Table className="[&_td]:align-top">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Tanggal</TableHead>
              <TableHead>Tamu</TableHead>
              <TableHead>Perusahaan atau asal</TableHead>
              <TableHead>Bertemu</TableHead>
              <TableHead className="text-center">Kartu</TableHead>
              <TableHead>Jam (WIB)</TableHead>
              <TableHead className="pr-5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow
                key={v.id}
                tabIndex={0}
                onClick={() => onOpen(v.id)}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(v.id)}
                className="cursor-pointer text-[15px]"
              >
                <TableCell className="pl-5 whitespace-nowrap">{formatDayMonthYear(v.submitted_at)}</TableCell>
                <TableCell className="whitespace-normal">
                  <p className="font-semibold">{v.visitor_name}</p>
                  <p className="text-sm text-muted-foreground tabular">{formatPhone(v.phone)}</p>
                </TableCell>
                <TableCell className="whitespace-normal">{v.company_name ?? <span className="text-muted-foreground">Tidak diisi</span>}</TableCell>
                <TableCell className="whitespace-normal">{v.employee_name}</TableCell>
                <TableCell className="text-center font-bold tabular">{v.card_number ?? none}</TableCell>
                <TableCell className="whitespace-nowrap tabular">
                  <VisitTime v={v} />
                </TableCell>
                <TableCell className="pr-5">
                  <StatusBadge status={v.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="divide-y xl:hidden">
        {items.map((v) => (
          <li key={v.id}>
            <button type="button" onClick={() => onOpen(v.id)} className="w-full space-y-2 px-5 py-4 text-left hover:bg-muted/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{v.visitor_name}</p>
                  <p className="text-sm text-muted-foreground">{formatDayMonthYear(v.submitted_at)}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <p className="text-sm">
                {v.company_name ?? 'Perusahaan atau asal tidak diisi'}, bertemu <span className="font-semibold">{v.employee_name}</span>
              </p>
              {v.approved_at && (
                <p className="text-sm text-muted-foreground tabular">
                  Kartu {v.card_number}, datang {formatTime(v.approved_at)}
                  {v.returned_at && `, pulang ${formatTime(v.returned_at)}`}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
