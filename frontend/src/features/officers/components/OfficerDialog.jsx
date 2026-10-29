import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/Field'
import { PasswordInput } from '@/components/PasswordInput'
import { useAction } from '@/lib/useAction'
import { officersApi } from '../api/officersApi'

/** Tambah akun petugas (officer = null) atau ubah nama/password akun yang ada. */
export function OfficerDialog({ open, onOpenChange, officer }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{open && <OfficerForm officer={officer} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function OfficerForm({ officer, onDone }) {
  const [name, setName] = useState(officer?.name ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const save = useAction({
    mutationFn: officer ? officersApi.update : officersApi.create,
    loading: 'Menyimpan…',
    success: (d) => (officer ? `Akun ${d.name} diperbarui` : `Akun ${d.name} dibuat`),
    invalidate: [['officers'], ['me']],
    onSuccess: onDone,
  })

  function submit(e) {
    e.preventDefault()
    const found = {}
    if (!name.trim()) found.name = 'Nama wajib diisi'
    if (!officer && !email.trim()) found.email = 'Email wajib diisi'
    if (!officer && password.length < 8) found.password = 'Password minimal 8 karakter'
    if (officer && password && password.length < 8) found.password = 'Password minimal 8 karakter'
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(
      officer
        ? { id: officer.id, name: name.trim(), ...(password ? { password } : {}) }
        : { name: name.trim(), email: email.trim(), password }
    )
  }

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle className="text-xl">{officer ? `Ubah akun ${officer.name}` : 'Tambah akun petugas'}</DialogTitle>
        <DialogDescription>
          {officer
            ? 'Kosongkan password kalau tidak ingin menggantinya.'
            : 'Akun ini bisa menyetujui tamu dan mengelola semua data, sama seperti akun petugas lainnya.'}
        </DialogDescription>
      </DialogHeader>
      <div className="my-6 space-y-5">
        <Field id="off-name" label="Nama" error={errors.name}>
          <Input id="off-name" autoFocus maxLength={100} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} />
        </Field>
        {officer ? (
          <Field id="off-email" label="Email" hint="Email tidak bisa diubah.">
            <Input id="off-email" value={officer.email} disabled />
          </Field>
        ) : (
          <Field id="off-email" label="Email" error={errors.email} hint="Dipakai untuk masuk ke dashboard.">
            <Input
              id="off-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email || undefined}
              placeholder="nama@perusahaan.com"
            />
          </Field>
        )}
        <Field
          id="off-password"
          label={officer ? 'Password baru' : 'Password'}
          optional={!!officer}
          error={errors.password}
          hint="Minimal 8 karakter."
        >
          <PasswordInput
            id="off-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password || undefined}
          />
        </Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Menyimpan…' : officer ? 'Simpan perubahan' : 'Buat akun'}
        </Button>
      </DialogFooter>
    </form>
  )
}
