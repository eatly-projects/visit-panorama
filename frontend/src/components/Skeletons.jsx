import { Skeleton } from '@/components/ui/skeleton'

/** Kerangka baris daftar saat data sedang dimuat. */
export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <Skeleton className="hidden h-9 w-28 sm:block" />
        </div>
      ))}
    </div>
  )
}

/** Layar penuh saat memeriksa sesi login. */
export function FullPageLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo-panorama.png" alt="" className="h-8 w-auto animate-pulse" />
        <p className="text-sm text-muted-foreground">Memuat…</p>
      </div>
    </div>
  )
}
