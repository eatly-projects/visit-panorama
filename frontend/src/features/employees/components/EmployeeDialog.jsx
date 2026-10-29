import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/Field'
import { useAction } from '@/lib/useAction'
import { employeesApi } from '../api/employeesApi'

/** Tambah karyawan (employee = null) atau ubah karyawan yang ada. */
export function EmployeeDialog({ open, onOpenChange, employee }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <EmployeeForm employee={employee} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function EmployeeForm({ employee, onDone }) {
  const [name, setName] = useState(employee?.name ?? '')
  const [department, setDepartment] = useState(employee?.department ?? '')
  const [errors, setErrors] = useState({})

  const save = useAction({
    mutationFn: employee ? employeesApi.update : employeesApi.create,
    loading: 'Menyimpan…',
    success: (d) => (employee ? `Data ${d.name} diperbarui` : `${d.name} ditambahkan ke daftar karyawan`),
    invalidate: [['employees']],
    onSuccess: onDone,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const found = {}
        if (!name.trim()) found.name = 'Nama karyawan wajib diisi'
        if (!department.trim()) found.department = 'Departemen atau bagian wajib diisi'
        setErrors(found)
        if (Object.keys(found).length) return
        save.mutate({ id: employee?.id, name: name.trim(), department: department.trim() })
      }}
    >
      <DialogHeader>
        <DialogTitle className="text-xl">{employee ? 'Ubah data karyawan' : 'Tambah karyawan'}</DialogTitle>
        <DialogDescription>Nama dan departemen ini muncul di form tamu pada pilihan Bertemu dengan.</DialogDescription>
      </DialogHeader>
      <div className="my-6 space-y-5">
        <Field id="emp-name" label="Nama lengkap" error={errors.name}>
          <Input
            id="emp-name"
            autoFocus
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name || undefined}
          />
        </Field>
        <Field id="emp-dept" label="Departemen atau bagian" error={errors.department}>
          <Input
            id="emp-dept"
            maxLength={100}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            aria-invalid={!!errors.department || undefined}
            placeholder="Contoh: Keuangan"
          />
        </Field>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Batal
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? 'Menyimpan…' : employee ? 'Simpan perubahan' : 'Tambah karyawan'}
        </Button>
      </DialogFooter>
    </form>
  )
}
