import { QRCodeSVG } from 'qrcode.react'
import { LuPrinter } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'

/** QR tetap yang dicetak dan ditaruh di meja resepsionis; mengarah ke form tamu. */
export function QrPage() {
  const formUrl = `${window.location.origin}/`

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="Kode QR pendaftaran"
          description="Cetak halaman ini dan taruh di meja resepsionis. Tamu cukup scan kode ini dengan kamera HP untuk membuka form kunjungan."
        >
          <Button onClick={() => window.print()}>
            <LuPrinter />
            Cetak
          </Button>
        </PageHeader>
      </div>

      {/* Lembar cetak: putih polos di mode apa pun supaya hasil cetaknya sama. */}
      <div className="qr-sheet mx-auto flex max-w-md flex-col items-center rounded-3xl border bg-white p-8 text-center text-stone-900 shadow-sm sm:p-10 print:max-w-none print:border-0 print:shadow-none">
        <img src="/logo-panorama.png" alt="Panorama" className="h-10 w-auto" />
        <h2 className="mt-8 text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">Selamat datang di Panorama Building</h2>
        <p className="mt-3 text-base text-stone-600">Scan kode ini untuk mengisi data kunjungan, lalu tunjukkan layar HP Anda ke resepsionis.</p>
        <div className="mt-8 rounded-2xl border-4 border-[#F0852F] p-4">
          <QRCodeSVG value={formUrl} size={240} level="M" marginSize={0} fgColor="#1c1917" />
        </div>
        <p className="mt-6 text-sm break-all text-stone-500">{formUrl}</p>
        <div className="mt-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#F0852F] to-[#ED1C24]" aria-hidden />
      </div>
    </div>
  )
}
