import { LuCheck, LuLanguages } from 'react-icons/lu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LANGUAGES, languageByCode } from '@/i18n/languages'
import { useLanguageStore } from '@/i18n'
import { cn } from '@/lib/utils'

/**
 * Jendela pilih bahasa. Muncul otomatis saat tamu pertama kali membuka form,
 * dan bisa dibuka lagi lewat tombol bahasa. Judulnya ditulis dalam semua
 * bahasa yang tersedia supaya terbaca sebelum bahasa dipilih.
 * `required`: tamu harus memilih dulu (tidak bisa ditutup tanpa memilih).
 */
export function LanguageDialog({ open, onOpenChange, required = false }) {
  const { lang, setLang } = useLanguageStore()

  function choose(code) {
    setLang(code)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && required) return // harus memilih bahasa dulu
        onOpenChange(o)
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!required}
        onEscapeKeyDown={(e) => required && e.preventDefault()}
        onPointerDownOutside={(e) => required && e.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
            <LuLanguages className="size-6" />
          </div>
          <DialogTitle className="text-xl leading-snug">
            {LANGUAGES.map((l) => l.messages.language.dialogTitle).join(' / ')}
          </DialogTitle>
          <DialogDescription className="space-y-1 text-[15px]">
            {/* Sebelum bahasa dipilih, keterangan tampil dalam semua bahasa. */}
            {(lang ? [languageByCode(lang)] : LANGUAGES).map((l) => (
              <span key={l.code} lang={l.code} className="block">
                {l.messages.language.dialogHint}
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid gap-2.5" role="radiogroup">
          {LANGUAGES.map((l) => {
            const selected = l.code === lang
            return (
              <button
                key={l.code}
                type="button"
                role="radio"
                aria-checked={selected}
                lang={l.code}
                onClick={() => choose(l.code)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors hover:border-brand/50 hover:bg-brand-soft',
                  selected && 'border-brand/60 bg-brand-soft'
                )}
              >
                <span>
                  <span className="block text-base font-bold">{l.name}</span>
                  <span className="block text-sm text-muted-foreground">{l.otherName}</span>
                </span>
                {selected && <LuCheck className="size-5 text-brand-ink" />}
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
