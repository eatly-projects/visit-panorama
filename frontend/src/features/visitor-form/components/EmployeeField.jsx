import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuUserRound } from 'react-icons/lu'
import { PickerItem, PickerNote, SearchPicker, useDebounced } from '@/components/SearchPicker'
import { publicApi } from '../api/publicApi'

/** Orang yang ingin ditemui: wajib dipilih dari daftar karyawan, tidak diketik bebas. */
export function EmployeeField({ id, value, onChange, invalid }) {
  const [query, setQuery] = useState('')
  const term = useDebounced(query.trim())

  const { data: results = [], isFetching, isError } = useQuery({
    queryKey: ['public-employees', term],
    queryFn: () => publicApi.searchEmployees(term),
    enabled: term.length >= 2 && !value,
    staleTime: 30_000,
  })

  const typed = query.trim()
  const waiting = typed !== term || isFetching

  return (
    <SearchPicker
      id={id}
      icon={LuUserRound}
      placeholder="Ketik nama karyawan"
      invalid={invalid}
      selected={value ? { title: value.name, subtitle: value.department ? `Departemen ${value.department}` : undefined } : null}
      onClear={() => onChange(null)}
      query={query}
      onQueryChange={setQuery}
      renderResults={({ close }) => {
        if (typed.length < 2) return <PickerNote>Ketik minimal 2 huruf untuk mencari.</PickerNote>
        if (isError) return <PickerNote>Daftar karyawan tidak dapat dimuat. Periksa koneksi internet Anda.</PickerNote>
        if (!results.length) {
          return <PickerNote>{waiting ? 'Mencari…' : 'Nama tidak ditemukan. Silakan tanyakan ke resepsionis.'}</PickerNote>
        }
        return results.map((e) => (
          <PickerItem
            key={e.id}
            value={e.id}
            title={e.name}
            subtitle={e.department ? `Departemen ${e.department}` : undefined}
            icon={LuUserRound}
            onSelect={() => {
              onChange(e)
              setQuery('')
              close()
            }}
          />
        ))
      }}
    />
  )
}
