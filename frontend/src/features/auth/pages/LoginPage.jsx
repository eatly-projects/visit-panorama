import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LuArrowLeft, LuLogIn } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/Field'
import { PasswordInput } from '@/components/PasswordInput'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BrandSwoosh } from '@/components/BrandSwoosh'
import { useAction } from '@/lib/useAction'
import { authApi, useMe } from '../api/authApi'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const { data: officer } = useMe()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useAction({
    mutationFn: authApi.login,
    loading: 'Memeriksa akun…',
    success: (data) => `Selamat datang, ${data.name}`,
    onSuccess: (data) => {
      qc.setQueryData(['me'], data)
      navigate(location.state?.from ?? '/petugas', { replace: true })
    },
  })

  if (officer) return <Navigate to="/petugas" replace />

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <BrandSwoosh className="pointer-events-none absolute -top-24 -right-40 w-[640px] opacity-[0.12] sm:-right-20" />
      <header className="relative flex items-center justify-between px-4 py-4 sm:px-8">
        <Button variant="ghost" asChild>
          <Link to="/">
            <LuArrowLeft />
            Form tamu
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <Logo className="mb-8 h-9" />
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">Masuk sebagai petugas</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Khusus resepsionis dan admin Panorama Head Office untuk menyetujui tamu dan mengelola data kunjungan.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              login.mutate({ email, password })
            }}
          >
            <Field id="email" label="Email">
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
              />
            </Field>
            <Field id="password" label="Password">
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              <LuLogIn />
              {login.isPending ? 'Memeriksa…' : 'Masuk'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
