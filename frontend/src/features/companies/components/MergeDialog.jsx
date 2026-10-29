import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuArrowDown, LuBuilding2, LuMerge } from 'react-icons/lu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PickerItem, PickerNote, SearchPicker, useDebounced } from '@/components/SearchPicker'
import { useAction } from '@/lib/useAction'
import { companiesApi } from '../api/companiesApi'

/** Gabungkan perusahaan dobel: semua kunjungan dipindah ke perusahaan tujuan. */
export function MergeDialog({ company, onOpenChange }) {
  return (
    <Dialog open={!!company} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">{company && <MergeForm company={company} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function MergeForm({ company, onDone }) {
  const [target, setTarget] = useState(null)
  const [query, setQuery] = useState('')
  const term = useDebounced(query.trim())
  const { data, isFetching } = useQuery({
    queryKey: ['companies', 'merge-target', term],
    queryFn: () => companiesApi.list({ q: term }),
    enabled: term.length >= 1,
  })
  const options = (data?.items ?? []).filter((c) => c.id !== company.id)

  const merge = useAction({
    mutationFn: companiesApi.merge,
    loading: 'Menggabungkan…',
    success: (d) => `Digabungkan ke "${d.target.name}". ${d.moved.toLocaleString('id-ID')} kunjungan dipindahkan.`,
    invalidate: [['companies'], ['visits']],
    onSuccess: onDone,
  })

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-xl">Gabungkan perusahaan</DialogTitle>
        <DialogDescription>
          Pakai ini kalau ada dua nama untuk perusahaan yang sama. Semua kunjungan dipindahkan ke perusahaan tujuan, lalu nama yang lama
          dihapus.
        </DialogDescription>
      </DialogHeader>

      <div className="my-6 space-y-3">
        <div className="flex items-center gap-3 rounded-lg border bg-muted/60 px-3.5 py-3">
          <LuBuilding2 className="size-5 text-muted-foreground" />
          <div>
            <p className="font-semibold">{company.name}</p>
            <p className="text-sm text-muted-foreground">{company.visit_count.toLocaleString('id-ID')} kunjungan, nama ini akan dihapus</p>
          </div>
        </div>
        <div className="flex justify-center text-muted-foreground">
          <LuArrowDown className="size-5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="merge-target" className="font-semibold">
            Gabungkan ke
          </Label>
          <SearchPicker
            id="merge-target"
            icon={LuBuilding2}
            placeholder="Cari perusahaan tujuan"
            selected={target ? { title: target.name, subtitle: `${target.visit_count.toLocaleString('id-ID')} kunjungan` } : null}
            onClear={() => setTarget(null)}
            query={query}
            onQueryChange={setQuery}
            renderResults={({ close }) =>
              !options.length ? (
                <PickerNote>{isFetching || term !== query.trim() ? 'Mencari…' : 'Perusahaan tidak ditemukan.'}</PickerNote>
              ) : (
                options.map((c) => (
                  <PickerItem
                    key={c.id}
                    value={c.id}
                    title={c.name}
                    subtitle={`${c.visit_count.toLocaleString('id-ID')} kunjungan`}
                    icon={LuBuilding2}
                    onSelect={() => {
                      setTarget(c)
                      setQuery('')
                      close()
                    }}
                  />
                ))
              )
            }
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={merge.isPending}>
          Batal
        </Button>
        <Button disabled={!target || merge.isPending} onClick={() => merge.mutate({ id: company.id, target_id: target.id })}>
          <LuMerge />
          {merge.isPending ? 'Menggabungkan…' : 'Gabungkan'}
        </Button>
      </DialogFooter>
    </div>
  )
}
