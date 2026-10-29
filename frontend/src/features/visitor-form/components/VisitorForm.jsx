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
import { EmployeeField } from './EmployeeField'

const PURPOSE_MAX = 1000
const EMPTY = { visitor_name: '', phone: '', purpose: '', company: null, employee: null, consent: false }

// Urutan kolom di layar, untuk memfokuskan kolom pertama yang salah.
const ORDER = ['visitor_name', 'phone', 'company', 'employee', 'purpose', 'consent']

// Kolom sesuai arahan atasan (29 Oktober 2026): semua wajib; alamat tidak
// diminta karena termasuk data pribadi.
function validate(f) {
  const errors = {}
  if (!f.visitor_name.trim()) errors.visitor_name = 'Nama lengkap wajib diisi'
  if (!f.phone.trim()) errors.phone = 'Nomor HP wajib diisi'
  else if (!normalizePhone(f.phone)) errors.phone = 'Nomor HP tidak valid. Contoh: 0812 3456 7890'
  if (!f.company) errors.company = 'Pilih atau tambahkan perusahaan atau asal Anda'
  if (!f.employee) errors.employee = 'Pilih orang yang ingin ditemui dari daftar'
  if (!f.purpose.trim()) errors.purpose = 'Tujuan kunjungan wajib diisi'
  if (!f.consent) errors.consent = 'Centang persetujuan terlebih dahulu'
  return errors
}

/**
 * Form data kunjungan. Dipakai tamu (lewat QR) dan petugas (untuk tamu
 * yang tidak membawa HP; mode="petugas").
 */
export function VisitorForm({ mode = 'tamu', onSubmitted }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)

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
      formRef.current?.querySelector(`#${first}`)?.focus()
      return
    }
    submit.mutate({
      visitor_name: form.visitor_name.trim(),
      phone: form.phone,
      purpose: form.purpose.trim(),
      company_id: form.company.id,
      employee_id: form.employee.id,
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
          <CompanyField id="company" value={form.company} onChange={set('company')} invalid={!!errors.company} />
        </Field>
        <Field id="employee" label="Bertemu dengan" error={errors.employee} hint="Ketik nama karyawan, lalu pilih nama dan departemennya.">
          <EmployeeField id="employee" value={form.employee} onChange={set('employee')} invalid={!!errors.employee} />
        </Field>
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

      <Button type="submit" size="lg" className="h-14 w-full text-[17px]" disabled={submit.isPending}>
        <LuSend />
        {submit.isPending ? 'Mengirim…' : 'Kirim data kunjungan'}
      </Button>
    </form>
  )
}
