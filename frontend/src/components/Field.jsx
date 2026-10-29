import { Label } from '@/components/ui/label'

/** Label + isian + petunjuk atau pesan error di bawahnya. */
export function Field({ id, label, optional, hint, error, children, aside }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-[15px] font-semibold">
          {label}
          {optional && <span className="ml-1.5 font-normal text-muted-foreground">(tidak wajib)</span>}
        </Label>
        {aside}
      </div>
      {children}
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
