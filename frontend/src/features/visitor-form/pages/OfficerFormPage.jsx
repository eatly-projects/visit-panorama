import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { VisitorForm } from '../components/VisitorForm'

/** Petugas mengisi form untuk tamu yang tidak membawa HP. */
export function OfficerFormPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <PageHeader
        title="Isi form untuk tamu"
        description="Untuk tamu yang tidak membawa HP atau tidak ada kuota. Data ini tercatat sebagai diisi oleh Anda, lalu muncul di daftar Menunggu persetujuan."
      />
      <div className="max-w-2xl rounded-2xl border bg-card p-5 sm:p-8">
        <VisitorForm mode="petugas" onSubmitted={() => navigate('/petugas')} />
      </div>
    </div>
  )
}
