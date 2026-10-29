import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BrandSwoosh } from '@/components/BrandSwoosh'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LanguageDialog } from '@/components/LanguageDialog'
import { useLanguageStore, useT } from '@/i18n'
import { VisitorForm } from '../components/VisitorForm'
import { SuccessView } from '../components/SuccessView'

/** Halaman yang dibuka tamu setelah scan QR di meja resepsionis (Bahasa Indonesia atau English). */
export function VisitorFormPage() {
  const [result, setResult] = useState(null)
  const { t, lang } = useT()
  // Tamu yang belum pernah memilih bahasa langsung diminta memilih dulu.
  const hasChosen = useLanguageStore((s) => s.lang !== null)
  const [askLanguage, setAskLanguage] = useState(!hasChosen)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('meta.title')
  }, [lang, t])

  return (
    <div className="relative min-h-svh overflow-x-clip bg-background">
      <BrandSwoosh className="pointer-events-none absolute -top-10 -right-56 w-[560px] opacity-[0.14] sm:-right-24 sm:w-[720px] dark:opacity-[0.18]" />

      <header className="relative mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 pt-5 sm:px-6 sm:pt-8">
        <Logo className="h-6 sm:h-8" />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        {result ? (
          <SuccessView
            result={result}
            onReset={() => {
              setResult(null)
              window.scrollTo({ top: 0 })
            }}
          />
        ) : (
          <>
            <div className="mb-8 sm:mb-10">
              <h1 className="max-w-lg text-[32px] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl">{t('page.welcome')}</h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">{t('page.lead')}</p>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-[0_24px_60px_-30px_rgb(240_133_47/0.35)] sm:p-8">
              <VisitorForm
                onSubmitted={(data) => {
                  setResult(data)
                  window.scrollTo({ top: 0 })
                }}
              />
            </div>
          </>
        )}
      </main>

      <footer className="relative mx-auto flex max-w-2xl flex-col gap-2 border-t px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <p>{t('page.footerNote')}</p>
        <Link to="/masuk" className="shrink-0 font-medium underline-offset-4 hover:text-foreground hover:underline">
          {t('page.staffLogin')}
        </Link>
      </footer>

      <LanguageDialog open={askLanguage} onOpenChange={setAskLanguage} required={!hasChosen} />
    </div>
  )
}
