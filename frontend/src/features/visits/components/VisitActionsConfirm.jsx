import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useLastDefined } from '@/hooks/useLastDefined'
import { useAction } from '@/lib/useAction'
import { formatTime } from '@/lib/format'
import { visitsApi } from '../api/visitsApi'

/**
 * Konfirmasi untuk Tolak, Kartu dikembalikan, dan Kartu tidak kembali.
 * `action` = { type: 'reject' | 'return' | 'lost', visit } atau null.
 */
export function VisitActionsConfirm({ action, onClose }) {
  // Isi dialog tetap memakai aksi terakhir selama animasi menutup,
  // supaya teksnya tidak berubah sesaat sebelum hilang.
  const shown = useLastDefined(action)
  const visit = shown?.visit
  const common = { invalidate: [['visits']], onSuccess: onClose }

  const reject = useAction({
    ...common,
    mutationFn: visitsApi.reject,
    loading: 'Menolak kunjungan…',
    success: (d) => `Kunjungan ${d.visitor_name} ditolak`,
  })
  const returnCard = useAction({
    ...common,
    mutationFn: visitsApi.returnCard,
    loading: 'Mencatat kartu kembali…',
    success: (d) => `Kartu nomor ${d.card_number} sudah kembali. ${d.visitor_name} tercatat pulang.`,
  })
  const lost = useAction({
    ...common,
    mutationFn: visitsApi.cardLost,
    loading: 'Mencatat kartu tidak kembali…',
    success: (d) => `Kartu nomor ${d.card_number} ditandai tidak kembali`,
  })

  const config = {
    reject: {
      title: `Tolak kunjungan ${visit?.visitor_name}?`,
      description: 'Data tetap tersimpan dengan status Ditolak. Kalau tamu tetap ingin berkunjung, tamu perlu mengisi form lagi.',
      confirmLabel: 'Tolak kunjungan',
      tone: 'danger',
      mutation: reject,
    },
    return: {
      title: `Terima kartu nomor ${visit?.card_number} dari ${visit?.visitor_name}?`,
      description: `Jam pulang dicatat sekarang, pukul ${formatTime(new Date())}.`,
      confirmLabel: 'Ya, kartu sudah kembali',
      mutation: returnCard,
    },
    lost: {
      title: 'Tandai kartu tidak kembali?',
      description: `Pakai ini kalau ${visit?.visitor_name} sudah pulang tanpa mengembalikan kartu nomor ${visit?.card_number}, atau kartunya hilang. Nomor kartu ini langsung bisa dipakai tamu lain. Sebaiknya hubungi tamu lewat WhatsApp lebih dulu.`,
      confirmLabel: 'Tandai kartu tidak kembali',
      tone: 'danger',
      mutation: lost,
    },
  }[shown?.type ?? 'reject']

  return (
    <ConfirmDialog
      open={!!action}
      onOpenChange={(open) => !open && onClose()}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      tone={config.tone}
      pending={config.mutation.isPending}
      onConfirm={() => config.mutation.mutate(visit.id)}
    />
  )
}
