import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/queryClient'

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            className: 'text-[15px] font-medium',
            style: {
              background: 'var(--popover)',
              color: 'var(--popover-foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '10px 14px',
              maxWidth: '420px',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error: { duration: 5000, iconTheme: { primary: 'var(--destructive)', secondary: '#fff' } },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
