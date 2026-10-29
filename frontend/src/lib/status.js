/** Label dan warna setiap status kunjungan. */
export const STATUS = {
  menunggu: {
    label: 'Menunggu persetujuan',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300',
  },
  berkunjung: {
    label: 'Sedang berkunjung',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-400/15 dark:text-orange-300',
  },
  selesai: {
    label: 'Selesai',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
  ditolak: {
    label: 'Ditolak',
    className: 'bg-stone-200 text-stone-700 dark:bg-stone-500/20 dark:text-stone-300',
  },
  tidak_kembali: {
    label: 'Kartu tidak kembali',
    className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
}

export const STATUS_OPTIONS = Object.entries(STATUS).map(([value, { label }]) => ({ value, label }))
