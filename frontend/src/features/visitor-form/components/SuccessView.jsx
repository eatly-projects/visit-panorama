import { LuCheck, LuIdCard, LuRotateCcw } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/format'

/** Layar setelah form terkirim: ditunjukkan tamu ke resepsionis. */
export function SuccessView({ result, onReset }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/25 [animation-iteration-count:2]" aria-hidden />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-in zoom-in-50 duration-500">
          <LuCheck className="size-10" strokeWidth={3} />
        </div>
      </div>

      <p className="text-[15px] font-semibold text-emerald-700 dark:text-emerald-400">Data kunjungan terkirim</p>
      <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
        Terima kasih, {result.visitor_name}
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        Silakan menuju meja resepsionis dan tunjukkan layar ini untuk mendapatkan kartu visitor.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border bg-card p-5 text-left">
        <p className="text-sm text-muted-foreground">Nama tamu</p>
        <p className="text-xl font-bold">{result.visitor_name}</p>
        <p className="mt-3 text-sm text-muted-foreground">Dikirim pada</p>
        <p className="font-semibold">{formatDateTime(result.submitted_at)}</p>
      </div>

      <div className="mt-4 flex w-full max-w-sm items-start gap-3 rounded-2xl bg-brand-soft p-4 text-left">
        <LuIdCard className="mt-0.5 size-5 shrink-0 text-brand-ink" />
        <p className="text-sm leading-relaxed">
          Jangan lupa mengembalikan kartu visitor ke resepsionis sebelum meninggalkan gedung.
        </p>
      </div>

      <Button variant="outline" size="lg" className="mt-8" onClick={onReset}>
        <LuRotateCcw />
        Isi form untuk tamu lain
      </Button>
    </div>
  )
}
