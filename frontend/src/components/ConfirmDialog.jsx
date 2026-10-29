import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Dialog konfirmasi sebelum tindakan penting.
 * `tone="danger"` untuk tindakan yang menghapus atau tidak bisa dibatalkan.
 */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, tone = 'default', pending, confirmDisabled, onConfirm, children }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)]! p-6 sm:max-w-md!">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">{title}</AlertDialogTitle>
          {description && <AlertDialogDescription className="text-[15px] leading-relaxed">{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || confirmDisabled}
            variant={tone === 'danger' ? 'danger' : 'default'}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
