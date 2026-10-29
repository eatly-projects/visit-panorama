import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LuBuilding2, LuPlus } from 'react-icons/lu'
import { PickerItem, PickerNote, SearchPicker, useDebounced } from '@/components/SearchPicker'
import { useAction } from '@/lib/useAction'
import { useT } from '@/i18n'
import { friendlyError } from '@/i18n/format'
import { publicApi } from '../api/publicApi'

/**
 * Perusahaan atau asal (wajib): cari yang sudah ada, atau tambahkan baru.
 * Server yang menjaga supaya nama tidak dobel; kalau ada nama yang mirip,
 * tamu ditanya dulu "Apakah maksud Anda…?" (docs/PLANNING.md §7).
 */
export function CompanyField({ value, onChange, invalid }) {
  const { t, lang } = useT()
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
        ? t('company.added', { name: data.company.name })
        : data.status === 'exists'
          ? t('company.exists', { name: data.company.name })
          : null,
    errorText: (err) => friendlyError(err, t, lang),
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
      icon={LuBuilding2}
      placeholder={t('company.placeholder')}
      invalid={invalid}
      selected={value ? { title: value.name } : null}
      onClear={() => onChange(null)}
      query={query}
      onQueryChange={(q) => {
        setQuery(q)
        setSimilar(null)
      }}
      renderResults={() => {
        if (typed.length < 2) return <PickerNote>{t('company.typeMore')}</PickerNote>

        if (similar) {
          return (
            <>
              <PickerNote>{t('company.didYouMean')}</PickerNote>
              {similar.candidates.map((c) => (
                <PickerItem key={c.id} value={`mirip-${c.id}`} title={c.name} icon={LuBuilding2} onSelect={() => choose(c)} />
              ))}
              <PickerItem
                value="tetap-tambah"
                icon={LuPlus}
                title={t('company.addAnyway', { name: similar.name })}
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
            {isFetching && !results.length && <PickerNote>{t('company.searching')}</PickerNote>}
            <PickerItem
              value="tambah-baru"
              icon={LuPlus}
              className="text-brand-ink data-selected:text-brand-ink"
              title={create.isPending ? t('company.checking') : t('company.add', { name: typed })}
              subtitle={!results.length && !isFetching ? t('company.addHint') : undefined}
              onSelect={() => !create.isPending && create.mutate({ name: typed })}
            />
          </>
        )
      }}
    />
  )
}
