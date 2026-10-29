import { useState } from 'react'
import { LuLanguages } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'
import { languageByCode } from '@/i18n/languages'
import { LanguageDialog } from './LanguageDialog'

/** Tombol di kepala halaman tamu untuk membuka jendela pilih bahasa. */
export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const { t, lang } = useT()
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} aria-label={`${t('language.button')}: ${languageByCode(lang).name}`}>
        <LuLanguages className="size-5" />
        {languageByCode(lang).name}
      </Button>
      <LanguageDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
