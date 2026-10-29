import { useState } from 'react'
import { LuEye, LuEyeOff } from 'react-icons/lu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Kolom password dengan tombol lihat/sembunyikan. */
export function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={visible ? 'Sembunyikan password' : 'Lihat password'}
      >
        {visible ? <LuEyeOff className="size-5" /> : <LuEye className="size-5" />}
      </button>
    </div>
  )
}
