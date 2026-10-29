import { createBrowserRouter, Navigate } from 'react-router-dom'
import { VisitorFormPage } from '@/features/visitor-form/pages/VisitorFormPage'
import { FullPageLoading } from '@/components/Skeletons'

// Form tamu dimuat langsung (dibuka lewat HP tamu, harus cepat). Halaman
// petugas baru diunduh saat dibutuhkan supaya form tamu tetap ringan.
const page = (load, name) => async () => ({ Component: (await load())[name] })

export const router = createBrowserRouter([
  // Form tamu: alamat utama, tujuan QR di meja resepsionis.
  { path: '/', element: <VisitorFormPage /> },
  { path: '/masuk', lazy: page(() => import('@/features/auth/pages/LoginPage'), 'LoginPage') },
  {
    path: '/petugas',
    lazy: page(() => import('@/features/auth/components/RequireAuth'), 'RequireAuth'),
    HydrateFallback: FullPageLoading,
    children: [
      {
        lazy: page(() => import('@/layouts/DashboardLayout'), 'DashboardLayout'),
        children: [
          { index: true, lazy: page(() => import('@/features/reception/pages/HomePage'), 'HomePage') },
          { path: 'riwayat', lazy: page(() => import('@/features/history/pages/HistoryPage'), 'HistoryPage') },
          { path: 'karyawan', lazy: page(() => import('@/features/employees/pages/EmployeesPage'), 'EmployeesPage') },
          { path: 'perusahaan', lazy: page(() => import('@/features/companies/pages/CompaniesPage'), 'CompaniesPage') },
          { path: 'akun', lazy: page(() => import('@/features/officers/pages/OfficersPage'), 'OfficersPage') },
          { path: 'qr', lazy: page(() => import('@/features/qr/pages/QrPage'), 'QrPage') },
          { path: 'isi-form', lazy: page(() => import('@/features/visitor-form/pages/OfficerFormPage'), 'OfficerFormPage') },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
