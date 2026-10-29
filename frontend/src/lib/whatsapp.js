import { formatDateTime } from './format'

/**
 * Tautan WhatsApp untuk mengingatkan tamu yang belum mengembalikan kartu
 * visitor (docs/PLANNING.md §17). Nomor disimpan berawalan 0, sedangkan
 * wa.me butuh kode negara 62.
 */
export function whatsappReminderLink(visit) {
  const number = `62${visit.phone.slice(1)}`
  const text = [
    `Yth. Bapak/Ibu ${visit.visitor_name},`,
    '',
    `Terima kasih atas kunjungan Bapak/Ibu ke Panorama Head Office pada ${formatDateTime(visit.approved_at)} untuk bertemu dengan ${visit.employee_name}.`,
    '',
    `Berdasarkan catatan kami, kartu visitor nomor ${visit.card_number} yang Bapak/Ibu gunakan belum dikembalikan. Kami mohon kesediaan Bapak/Ibu untuk mengembalikan kartu tersebut ke meja resepsionis Panorama Head Office pada kesempatan pertama.`,
    '',
    'Apabila kartu sudah dikembalikan atau terdapat kendala, mohon kabari kami melalui pesan ini.',
    '',
    'Atas perhatian dan kerja samanya, kami ucapkan terima kasih.',
    '',
    'Hormat kami,',
    'Resepsionis Panorama Head Office',
  ].join('\n')
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
