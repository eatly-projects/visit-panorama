import { FaWhatsapp } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { whatsappReminderLink } from '@/lib/whatsapp'

/** Membuka WhatsApp ke nomor tamu dengan pesan pengingat pengembalian kartu. */
export function WhatsAppButton({ visit, size = 'sm', className }) {
  return (
    <Button variant="outline" size={size} asChild className={className}>
      <a href={whatsappReminderLink(visit)} target="_blank" rel="noopener noreferrer">
        <FaWhatsapp className="text-[#25D366]" />
        Hubungi lewat WhatsApp
      </a>
    </Button>
  )
}
