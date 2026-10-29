import { useState } from 'react'

/**
 * Mengembalikan nilai terakhir yang tidak kosong. Dipakai dialog supaya isinya
 * tetap tampil selama animasi menutup, walau datanya sudah dikosongkan.
 */
export function useLastDefined(value) {
  const [last, setLast] = useState(value)
  if (value != null && value !== last) setLast(value)
  return value ?? last
}
