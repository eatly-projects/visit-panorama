import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LuBuilding2, LuHistory, LuHouse, LuLogOut, LuMenu, LuQrCode, LuUserCog, LuUsers } from 'react-icons/lu'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useMe, authApi } from '@/features/auth/api/authApi'
import { useSummary } from '@/features/visits/api/visitsApi'
import { useNewArrivalToast } from '@/features/visits/hooks/useNewArrivalToast'
import { LanguageProvider } from '@/i18n'
import { useAction } from '@/lib/useAction'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

// `hidden`: menu disembunyikan tapi halamannya tetap ada, supaya bisa
// dimunculkan lagi cukup dengan menghapus tanda ini.
const NAV = [
  { to: '/petugas', end: true, label: 'Beranda', icon: LuHouse, badgeKey: 'menunggu' },
  { to: '/petugas/riwayat', label: 'Riwayat kunjungan', icon: LuHistory },
  // Disembunyikan 29 Oktober 2026: tamu sekarang mengetik sendiri nama karyawan
  // dan departemen, jadi daftar karyawan tidak dipakai di form tamu.
  { to: '/petugas/karyawan', label: 'Karyawan', icon: LuUsers, hidden: true },
  { to: '/petugas/perusahaan', label: 'Perusahaan', icon: LuBuilding2 },
  { to: '/petugas/akun', label: 'Akun petugas', icon: LuUserCog },
  { to: '/petugas/qr', label: 'Kode QR pendaftaran', icon: LuQrCode },
].filter((item) => !item.hidden)

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: officer } = useMe()
  const { data: summary } = useSummary()

  const logout = useAction({
    mutationFn: authApi.logout,
    success: 'Anda sudah keluar',
    onSuccess: () => {
      qc.setQueryData(['me'], null)
      qc.removeQueries({ queryKey: ['visits'] })
      navigate('/masuk', { replace: true })
    },
  })

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6 pb-5">
        <Logo className="h-7" />
        <p className="mt-2 text-sm font-medium text-muted-foreground">Buku tamu Panorama Building</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Menu utama">
        {NAV.map((item) => {
          const badge = item.badgeKey ? summary?.[item.badgeKey] : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular"
                  aria-label={`${badge} tamu menunggu persetujuan`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-3 border-t p-3">
        <ThemeToggle withLabel className="w-full justify-start text-muted-foreground" />
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials(officer?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{officer?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{officer?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LuLogOut />
          Keluar
        </Button>
      </div>
    </div>
  )
}

/** Kerangka halaman petugas: sidebar tetap setinggi layar di desktop, menu lipat di HP dan tablet. */
export function DashboardLayout() {
  const [open, setOpen] = useState(false)
  useNewArrivalToast()

  // Halaman petugas selalu Bahasa Indonesia, apa pun bahasa yang dipilih tamu
  // di browser yang sama.
  return (
    <LanguageProvider lang="id">
    <div className="min-h-svh bg-background lg:flex">
      <aside className="no-print sticky top-0 hidden h-svh w-72 shrink-0 border-r bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Buka menu">
          <LuMenu className="size-6" />
        </Button>
        <Logo className="h-6" />
        <ThemeToggle />
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[300px] max-w-[85vw] bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Pindah halaman dashboard petugas</SheetDescription>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
    </LanguageProvider>
  )
}
