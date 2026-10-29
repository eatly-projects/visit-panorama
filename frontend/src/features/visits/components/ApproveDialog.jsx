import { useState } from 'react'
import { useLastDefined } from '@/hooks/useLastDefined'
import { LuCheck } from 'react-icons/lu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VisitorCardTag } from '@/components/VisitorCardTag'
import { useAction } from '@/lib/useAction'
import { errorMessage } from '@/lib/axios'
import { visitsApi } from '../api/visitsApi'

/** Setujui tamu sekaligus mencatat nomor kartu visitor fisik yang diberikan. */
export function ApproveDialog({ visit, onOpenChange }) {
  // Isi tetap tampil selama animasi menutup.
  const shown = useLastDefined(visit)
  return (
    <Dialog open={!!visit} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {shown && <ApproveForm key={shown.id} visit={shown} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function ApproveForm({ visit, onDone }) {
  const [card, setCard] = useState('')
  const [error, setError] = useState('')

  const approve = useAction({
    mutationFn: visitsApi.approve,
    loading: 'Menyimpan persetujuan…',
    success: (data) => `Kartu nomor ${data.card_number} diberikan kepada ${data.visitor_name}`,
    invalidate: [['visits']],
    onSuccess: onDone,
    onError: (err) => setError(errorMessage(err)),
  })

  const digits = card.replace(/\D/g, '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!digits || Number(digits) < 1) {
          setError('Ketik nomor yang tertulis di kartu visitor')
          return
        }
        approve.mutate({ id: visit.id, card_number: Number(digits) })
      }}
    >
      <DialogHeader>
        <DialogTitle className="text-xl">Setujui kunjungan {visit.visitor_name}</DialogTitle>
        <DialogDescription className="text-[15px]">
          Berikan kartu visitor kepada tamu, lalu ketik nomor yang tertulis di kartu tersebut. Jam datang dicatat saat Anda menekan
          Setujui.
        </DialogDescription>
      </DialogHeader>

      <div className="my-6 flex items-center gap-5">
        <VisitorCardTag number={digits} size="lg" />
        <div className="flex-1 space-y-2">
          <Label htmlFor="card_number" className="text-[15px] font-semibold">
            Nomor kartu visitor
          </Label>
          <Input
            id="card_number"
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={card}
            onChange={(e) => {
              setCard(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            aria-invalid={!!error || undefined}
            placeholder="Contoh: 7"
            className="h-14 text-2xl font-bold tabular md:text-2xl"
          />
          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={approve.isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={approve.isPending}>
          <LuCheck />
          {approve.isPending ? 'Menyimpan…' : 'Setujui dan berikan kartu'}
        </Button>
      </DialogFooter>
    </form>
  )
}
