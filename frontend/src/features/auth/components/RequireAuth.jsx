import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useMe } from '../api/authApi'
import { FullPageLoading } from '@/components/Skeletons'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { LuWifiOff } from 'react-icons/lu'

/** Halaman petugas hanya bisa dibuka setelah masuk. */
export function RequireAuth() {
  const location = useLocation()
  const { data: officer, isPending, isError, refetch } = useMe()

  if (isPending) return <FullPageLoading />
  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <EmptyState
          icon={LuWifiOff}
          title="Tidak dapat terhubung ke server"
          description="Periksa koneksi internet, lalu coba lagi."
        >
          <Button onClick={() => refetch()}>Coba lagi</Button>
        </EmptyState>
      </div>
    )
  }
  if (!officer) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />
  return <Outlet />
}
