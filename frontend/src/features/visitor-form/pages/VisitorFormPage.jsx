import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BrandSwoosh } from '@/components/BrandSwoosh'
import { VisitorForm } from '../components/VisitorForm'
import { SuccessView } from '../components/SuccessView'

/** Halaman yang dibuka tamu setelah scan QR di meja resepsionis. */
export function VisitorFormPage() {
  const [result, setResult] = useState(null)

  return (
    <div className="relative min-h-svh overflow-x-clip bg-background">
      <BrandSwoosh className="pointer-events-none absolute -top-10 -right-56 w-[560px] opacity-[0.14] sm:-right-24 sm:w-[720px] dark:opacity-[0.18]" />

      <header className="relative mx-auto flex max-w-2xl items-center justify-between px-4 pt-5 sm:px-6 sm:pt-8">
        <Logo className="h-7 sm:h-8" />
        <ThemeToggle />
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
              <h1 className="max-w-lg text-[32px] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl">
                Selamat datang di Panorama Head Office
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Isi data kunjungan di bawah ini. Setelah terkirim, tunjukkan layar Anda ke resepsionis untuk mendapatkan kartu
                visitor.
              </p>
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
        <p>Panorama Group. Kartu identitas Anda tidak kami minta, simpan, atau tahan.</p>
        <Link to="/masuk" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
          Masuk petugas
        </Link>
      </footer>
    </div>
  )
}
