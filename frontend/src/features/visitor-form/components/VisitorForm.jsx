import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { LuIdCard, LuSend } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/Field'
import { useAction } from '@/lib/useAction'
import { normalizePhone } from '@/lib/phone'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n'
import { friendlyError } from '@/i18n/format'
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
// diminta karena termasuk data pribadi. Teks pesan diambil dari terjemahan.
function validate(f) {
  const errors = {}
  if (!f.visitor_name.trim()) errors.visitor_name = 'name'
  if (!f.phone.trim()) errors.phone = 'phoneRequired'
  else if (!normalizePhone(f.phone)) errors.phone = 'phoneInvalid'
  if (!f.company) errors.company = 'company'
  if (!f.employee_name.trim()) errors.employee_name = 'employeeName'
  if (!f.employee_department.trim()) errors.employee_department = 'employeeDept'
  if (!f.purpose.trim()) errors.purpose = 'purpose'
  if (!f.consent) errors.consent = 'consent'
  return errors
}

/**
 * Yang belum lengkap, ditampilkan di bawah tombol kirim. Tombol baru aktif
 * setelah daftar ini kosong (permintaan Lutfi, 29 Oktober 2026).
 */
function missingItems(f) {
  const items = []
  if (!f.visitor_name.trim()) items.push('name')
  if (!f.phone.trim()) items.push('phone')
  else if (!normalizePhone(f.phone)) items.push('phoneValid')
  if (!f.company) items.push('company')
  if (!f.employee_name.trim()) items.push('employeeName')
  if (!f.employee_department.trim()) items.push('employeeDept')
  if (!f.purpose.trim()) items.push('purpose')
  if (!f.consent) items.push('consent')
  return items
}

/**
 * Form data kunjungan. Dipakai tamu (lewat QR, dua bahasa) dan petugas
 * (untuk tamu yang tidak membawa HP; mode="petugas", selalu Bahasa Indonesia).
 */
export function VisitorForm({ mode = 'tamu', onSubmitted }) {
  const { t, lang, locale } = useT()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)
  const missing = missingItems(form)
  const errorText = (key) => (errors[key] ? t(`form.errors.${errors[key]}`) : undefined)

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = useAction({
    mutationFn: publicApi.submitVisit,
    loading: t('form.toast.sending'),
    success: t('form.toast.sent'),
    invalidate: [['visits']],
    errorText: (err) => friendlyError(err, t, lang),
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
      toast.error(t('form.toast.incomplete'))
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
        <legend className="mb-5 text-lg font-bold">{t('form.sectionYou')}</legend>
        {mode === 'tamu' && (
          <div className="flex gap-3 rounded-xl border border-brand/40 bg-brand-soft p-4">
            <LuIdCard className="mt-0.5 size-5 shrink-0 text-brand-ink" aria-hidden />
            <p className="text-[15px] leading-relaxed font-semibold">{t('form.idNotice')}</p>
          </div>
        )}
        <Field id="visitor_name" label={t('form.name')} error={errorText('visitor_name')} hint={t('form.nameHint')}>
          <Input
            id="visitor_name"
            autoComplete="name"
            maxLength={100}
            value={form.visitor_name}
            onChange={(e) => set('visitor_name')(e.target.value)}
            aria-invalid={!!errors.visitor_name || undefined}
            placeholder={t('form.namePlaceholder')}
          />
        </Field>
        <Field id="phone" label={t('form.phone')} error={errorText('phone')} hint={t('form.phoneHint')}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={22}
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            // Nomor yang salah langsung diberi tahu saat tamu pindah kolom,
            // karena tombol kirim tetap nonaktif selama nomornya salah.
            onBlur={() => {
              if (form.phone.trim() && !normalizePhone(form.phone)) setErrors((e) => ({ ...e, phone: 'phoneInvalid' }))
            }}
            aria-invalid={!!errors.phone || undefined}
            placeholder={t('form.phonePlaceholder')}
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-5 text-lg font-bold">{t('form.sectionVisit')}</legend>
        <Field id="company" label={t('form.company')} error={errorText('company')} hint={t('form.companyHint')}>
          <div id="company">
            <CompanyField value={form.company} onChange={set('company')} invalid={!!errors.company} />
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="employee_name" label={t('form.employeeName')} error={errorText('employee_name')}>
            <Input
              id="employee_name"
              maxLength={100}
              value={form.employee_name}
              onChange={(e) => set('employee_name')(e.target.value)}
              aria-invalid={!!errors.employee_name || undefined}
              placeholder={t('form.employeeNamePlaceholder')}
            />
          </Field>
          <Field id="employee_department" label={t('form.employeeDept')} error={errorText('employee_department')}>
            <Input
              id="employee_department"
              maxLength={100}
              value={form.employee_department}
              onChange={(e) => set('employee_department')(e.target.value)}
              aria-invalid={!!errors.employee_department || undefined}
              placeholder={t('form.employeeDeptPlaceholder')}
            />
          </Field>
        </div>
        <Field
          id="purpose"
          label={t('form.purpose')}
          error={errorText('purpose')}
          aside={
            <span
              className={cn(
                'text-sm tabular text-muted-foreground',
                form.purpose.length >= PURPOSE_MAX && 'font-semibold text-destructive'
              )}
            >
              {form.purpose.length.toLocaleString(locale)}/{PURPOSE_MAX.toLocaleString(locale)}
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
            placeholder={t('form.purposePlaceholder')}
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
          <span className="text-[15px] leading-relaxed">{mode === 'petugas' ? t('form.consentStaff') : t('form.consentGuest')}</span>
        </label>
        {errors.consent && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errorText('consent')}
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
          {submit.isPending ? t('form.submitting') : t('form.submit')}
        </Button>
        {missing.length > 0 && (
          <p id="belum-lengkap" className="text-center text-sm leading-relaxed text-muted-foreground" aria-live="polite">
            {t('form.missingLead')}{' '}
            <span className="font-semibold text-foreground">{missing.map((k) => t(`form.missing.${k}`)).join(', ')}</span>.
          </p>
        )}
      </div>
    </form>
  )
}
