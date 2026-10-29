import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { LuSend } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/Field'
import { useAction } from '@/lib/useAction'
import { normalizePhone } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { publicApi } from '../api/publicApi'
import { CompanyField } from './CompanyField'

const PURPOSE_MAX = 1000
const EMPTY = {
  visitor_name: '',
  phone: '',
  purpose: '',
  company: null,
  employee_name: '',
  employee_department: '',
  consent: false,
}

// Urutan kolom di layar, untuk memfokuskan kolom pertama yang salah.
const ORDER = ['visitor_name', 'phone', 'company', 'employee_name', 'employee_department', 'purpose', 'consent']

// Kolom sesuai arahan atasan (29 Oktober 2026): semua wajib; alamat tidak
// diminta karena termasuk data pribadi.
function validate(f) {
  const errors = {}
  if (!f.visitor_name.trim()) errors.visitor_name = 'Nama lengkap wajib diisi'
  if (!f.phone.trim()) errors.phone = 'Nomor HP wajib diisi'
  else if (!normalizePhone(f.phone)) errors.phone = 'Nomor HP tidak valid. Contoh: 0812 3456 7890'
  if (!f.company) errors.company = 'Pilih atau tambahkan perusahaan atau asal Anda'
  if (!f.employee_name.trim()) errors.employee_name = 'Nama karyawan wajib diisi'
  if (!f.employee_department.trim()) errors.employee_department = 'Departemen atau perusahaan wajib diisi'
  if (!f.purpose.trim()) errors.purpose = 'Tujuan kunjungan wajib diisi'
  if (!f.consent) errors.consent = 'Centang persetujuan terlebih dahulu'
  return errors
}

/**
 * Daftar yang belum lengkap, ditampilkan di bawah tombol kirim. Tombol baru
 * aktif setelah daftar ini kosong (permintaan Lutfi, 29 Oktober 2026).
 */
function missingItems(f) {
  const items = []
  if (!f.visitor_name.trim()) items.push('nama lengkap')
  if (!f.phone.trim()) items.push('nomor HP')
  else if (!normalizePhone(f.phone)) items.push('nomor HP yang benar')
  if (!f.company) items.push('perusahaan atau asal')
  if (!f.employee_name.trim()) items.push('nama karyawan')
  if (!f.employee_department.trim()) items.push('departemen atau perusahaan')
  if (!f.purpose.trim()) items.push('tujuan kunjungan')
  if (!f.consent) items.push('centang persetujuan')
  return items
}

/**
 * Form data kunjungan. Dipakai tamu (lewat QR) dan petugas (untuk tamu
 * yang tidak membawa HP; mode="petugas").
 */
export function VisitorForm({ mode = 'tamu', onSubmitted }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)
  const missing = missingItems(form)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = useAction({
    mutationFn: publicApi.submitVisit,
    loading: 'Mengirim data kunjungan…',
    success: 'Data kunjungan terkirim',
    invalidate: [['visits']],
    onSuccess: (data) => {
      setForm(EMPTY)
      onSubmitted?.(data)
    },
  })

  function handleSubmit(e) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    const first = ORDER.find((k) => found[k])
    if (first) {
      toast.error('Masih ada data yang perlu dilengkapi')
      // Kolom perusahaan memakai komponen pencarian yang id-nya ada di wadah,
      // jadi fokuskan isian di dalamnya.
      const target = formRef.current?.querySelector(`#${first}`)
      ;(target?.matches('input, textarea, button') ? target : target?.querySelector('input'))?.focus()
      return
    }
    submit.mutate({
      visitor_name: form.visitor_name.trim(),
      phone: form.phone,
      purpose: form.purpose.trim(),
      company_id: form.company.id,
      employee_name: form.employee_name.trim(),
      employee_department: form.employee_department.trim(),
      consent: true,
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="mb-5 text-lg font-bold">Data diri</legend>
        <Field id="visitor_name" label="Nama lengkap" error={errors.visitor_name}>
          <Input
            id="visitor_name"
            autoComplete="name"
            maxLength={100}
            value={form.visitor_name}
            onChange={(e) => set('visitor_name')(e.target.value)}
            aria-invalid={!!errors.visitor_name || undefined}
            placeholder="Contoh: Budi Santoso"
          />
        </Field>
        <Field
          id="phone"
          label="Nomor HP atau WhatsApp"
          error={errors.phone}
          hint="Dipakai resepsionis untuk menghubungi Anda bila diperlukan."
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            // Nomor yang salah langsung diberi tahu saat tamu pindah kolom,
            // karena tombol kirim tetap nonaktif selama nomornya salah.
            onBlur={() => {
              if (form.phone.trim() && !normalizePhone(form.phone)) {
                setErrors((e) => ({ ...e, phone: 'Nomor HP tidak valid. Contoh: 0812 3456 7890' }))
              }
            }}
            aria-invalid={!!errors.phone || undefined}
            placeholder="0812 3456 7890"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 text-lg font-bold">Kunjungan</legend>
        <Field
          id="company"
          label="Perusahaan atau asal"
          error={errors.company}
          hint="Tulis nama perusahaan atau instansi Anda. Kalau datang atas nama pribadi, tulis asal Anda, misalnya nama kota."
        >
          <div id="company">
            <CompanyField value={form.company} onChange={set('company')} invalid={!!errors.company} />
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="employee_name" label="Nama karyawan yang ingin ditemui" error={errors.employee_name}>
            <Input
              id="employee_name"
              maxLength={100}
              value={form.employee_name}
              onChange={(e) => set('employee_name')(e.target.value)}
              aria-invalid={!!errors.employee_name || undefined}
              placeholder="Contoh: Budi Hartono"
            />
          </Field>
          <Field id="employee_department" label="Departemen atau perusahaan" error={errors.employee_department}>
            <Input
              id="employee_department"
              maxLength={100}
              value={form.employee_department}
              onChange={(e) => set('employee_department')(e.target.value)}
              aria-invalid={!!errors.employee_department || undefined}
              placeholder="Contoh: Keuangan"
            />
          </Field>
        </div>
        <Field
          id="purpose"
          label="Tujuan kunjungan"
          error={errors.purpose}
          aside={
            <span
              className={cn(
                'text-sm tabular text-muted-foreground',
                form.purpose.length >= PURPOSE_MAX && 'font-semibold text-destructive'
              )}
            >
              {form.purpose.length.toLocaleString('id-ID')}/{PURPOSE_MAX.toLocaleString('id-ID')}
            </span>
          }
        >
          <Textarea
            id="purpose"
            maxLength={PURPOSE_MAX}
            rows={4}
            value={form.purpose}
            onChange={(e) => set('purpose')(e.target.value)}
            aria-invalid={!!errors.purpose || undefined}
            placeholder="Contoh: rapat penawaran kerja sama paket wisata"
          />
        </Field>
      </fieldset>

      <div className="space-y-2">
        <label
          htmlFor="consent"
          className={cn(
            'flex cursor-pointer gap-3.5 rounded-xl border bg-muted/60 p-4 transition-colors',
            form.consent && 'border-brand/50 bg-brand-soft',
            errors.consent && 'border-destructive'
          )}
        >
          <Checkbox
            id="consent"
            checked={form.consent}
            onCheckedChange={(v) => set('consent')(v === true)}
            className="mt-0.5 size-5 rounded-md"
            aria-invalid={!!errors.consent || undefined}
          />
          <span className="text-[15px] leading-relaxed">
            {mode === 'petugas'
              ? 'Tamu sudah membaca dan menyetujui bahwa datanya digunakan oleh Panorama Group untuk pencatatan tamu dan keamanan kantor. Data disimpan selama diperlukan dan dihapus secara berkala.'
              : 'Saya setuju data di atas digunakan oleh Panorama Group untuk pencatatan tamu dan keamanan kantor. Data disimpan selama diperlukan dan dihapus secara berkala.'}
          </span>
        </label>
        {errors.consent && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errors.consent}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          size="lg"
          className="h-14 w-full text-[17px] disabled:opacity-40"
          disabled={submit.isPending || missing.length > 0}
          aria-describedby={missing.length ? 'belum-lengkap' : undefined}
        >
          <LuSend />
          {submit.isPending ? 'Mengirim…' : 'Kirim data kunjungan'}
        </Button>
        {missing.length > 0 && (
          <p id="belum-lengkap" className="text-center text-sm leading-relaxed text-muted-foreground" aria-live="polite">
            Tombol aktif setelah semua terisi. Yang belum: <span className="font-semibold text-foreground">{missing.join(', ')}</span>.
          </p>
        )}
      </div>
    </form>
  )
}
