import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/Field'
import { useAction } from '@/lib/useAction'
import { companiesApi } from '../api/companiesApi'

export function RenameDialog({ company, onOpenChange }) {
  return (
    <Dialog open={!!company} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{company && <RenameForm company={company} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function RenameForm({ company, onDone }) {
  const [name, setName] = useState(company.name)
  const rename = useAction({
    mutationFn: companiesApi.rename,
    loading: 'Menyimpan…',
    success: (d) => `Nama diubah menjadi "${d.name}"`,
    invalidate: [['companies']],
    onSuccess: onDone,
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) rename.mutate({ id: company.id, name: name.trim() })
      }}
    >
      <DialogHeader>
        <DialogTitle className="text-xl">Ubah nama perusahaan</DialogTitle>
        <DialogDescription>Misalnya untuk merapikan huruf besar kecil atau ejaan. Riwayat kunjungan ikut memakai nama baru.</DialogDescription>
      </DialogHeader>
      <div className="my-6">
        <Field id="company-name" label="Nama perusahaan">
          <Input id="company-name" autoFocus maxLength={150} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={rename.isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={rename.isPending || !name.trim()}>
          {rename.isPending ? 'Menyimpan…' : 'Simpan nama'}
        </Button>
      </DialogFooter>
    </form>
  )
}
