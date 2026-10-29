import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuBuilding2, LuPlus } from 'react-icons/lu'
import { PickerItem, PickerNote, SearchPicker, useDebounced } from '@/components/SearchPicker'
import { useAction } from '@/lib/useAction'
import { publicApi } from '../api/publicApi'

/**
 * Perusahaan atau asal (wajib): cari yang sudah ada, atau tambahkan baru.
 * Server yang menjaga supaya nama tidak dobel; kalau ada nama yang mirip,
 * tamu ditanya dulu "Apakah maksud Anda…?" (docs/PLANNING.md §7).
 */
export function CompanyField({ id, value, onChange, invalid }) {
  const [query, setQuery] = useState('')
  const [similar, setSimilar] = useState(null)
  const term = useDebounced(query.trim())

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['public-companies', term],
    queryFn: () => publicApi.searchCompanies(term),
    enabled: term.length >= 2 && !value,
    staleTime: 30_000,
  })

  const create = useAction({
    mutationFn: publicApi.createCompany,
    success: (data) =>
      data.status === 'created'
        ? `"${data.company.name}" ditambahkan`
        : data.status === 'exists'
          ? `"${data.company.name}" sudah terdaftar dan langsung dipilih`
          : null,
    onSuccess: (data) => {
      if (data.status === 'similar') {
        setSimilar({ name: query.trim(), candidates: data.candidates })
      } else {
        choose(data.company)
      }
    },
  })

  function choose(company) {
    onChange(company)
    setQuery('')
    setSimilar(null)
  }

  const typed = query.trim()

  return (
    <SearchPicker
      id={id}
      icon={LuBuilding2}
      placeholder="Ketik nama perusahaan"
      invalid={invalid}
      selected={value ? { title: value.name } : null}
      onClear={() => onChange(null)}
      query={query}
      onQueryChange={(q) => {
        setQuery(q)
        setSimilar(null)
      }}
      renderResults={() => {
        if (typed.length < 2) return <PickerNote>Ketik minimal 2 huruf untuk mencari.</PickerNote>

        if (similar) {
          return (
            <>
              <PickerNote>Apakah maksud Anda salah satu nama ini?</PickerNote>
              {similar.candidates.map((c) => (
                <PickerItem key={c.id} value={`mirip-${c.id}`} title={c.name} icon={LuBuilding2} onSelect={() => choose(c)} />
              ))}
              <PickerItem
                value="tetap-tambah"
                icon={LuPlus}
                title={`Bukan, tetap tambahkan "${similar.name}"`}
                onSelect={() => create.mutate({ name: similar.name, force: true })}
              />
            </>
          )
        }

        return (
          <>
            {results.map((c) => (
              <PickerItem key={c.id} value={c.id} title={c.name} icon={LuBuilding2} onSelect={() => choose(c)} />
            ))}
            {isFetching && !results.length && <PickerNote>Mencari…</PickerNote>}
            <PickerItem
              value="tambah-baru"
              icon={LuPlus}
              className="text-brand-ink data-selected:text-brand-ink"
              title={create.isPending ? 'Memeriksa nama…' : `Tambahkan "${typed}"`}
              subtitle={!results.length && !isFetching ? 'Belum terdaftar. Tekan untuk menambahkannya.' : undefined}
              onSelect={() => !create.isPending && create.mutate({ name: typed })}
            />
          </>
        )
      }}
    />
  )
}
