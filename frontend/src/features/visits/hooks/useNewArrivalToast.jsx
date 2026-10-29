import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { LuBellRing } from 'react-icons/lu'
import { usePending } from '../api/visitsApi'

/**
 * Notifikasi kecil setiap ada tamu baru yang mengisi form, di halaman
 * petugas mana pun. Tidak muncul untuk tamu yang sudah ada saat halaman
 * pertama dibuka.
 */
export function useNewArrivalToast() {
  // Halaman pertama tanpa pencarian = tamu terbaru (diurutkan dari yang terbaru).
  const { data } = usePending()
  const seen = useRef(null)
  useEffect(() => {
    if (!data) return
    if (seen.current) {
      data.items
        .filter((v) => !seen.current.has(v.id))
        .forEach((v) =>
          toast(`Tamu baru: ${v.visitor_name}`, {
            icon: <LuBellRing className="size-5 text-primary" />,
            duration: 6000,
          })
        )
    }
    seen.current = new Set([...(seen.current ?? []), ...data.items.map((v) => v.id)])
  }, [data])
}
