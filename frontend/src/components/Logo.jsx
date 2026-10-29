import { cn } from '@/lib/utils'

/** Logo Panorama (oranye dan merah, latar transparan; terbaca di mode terang dan gelap). */
export function Logo({ className }) {
  return <img src="/logo-panorama.png" alt="Panorama" className={cn('h-7 w-auto select-none', className)} draggable={false} />
}
