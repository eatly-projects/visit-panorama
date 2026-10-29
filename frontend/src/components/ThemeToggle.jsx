import { LuMoon, LuSun } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useThemeStore } from '@/stores/themeStore'

/** Tombol ganti mode terang / gelap. `withLabel` menampilkan teks di sebelah ikon. */
export function ThemeToggle({ withLabel = false, className }) {
  const { theme, toggle } = useThemeStore()
  const nextLabel = theme === 'gelap' ? 'Pakai mode terang' : 'Pakai mode gelap'
  const Icon = theme === 'gelap' ? LuSun : LuMoon

  if (withLabel) {
    return (
      <Button variant="ghost" onClick={toggle} className={className}>
        <Icon />
        {nextLabel}
      </Button>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label={nextLabel} className={className}>
          <Icon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{nextLabel}</TooltipContent>
    </Tooltip>
  )
}
