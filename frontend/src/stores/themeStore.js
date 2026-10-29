import { create } from 'zustand'

// Tema awal sudah dipasang oleh skrip kecil di index.html (supaya tidak
// berkedip); store ini cukup membaca kelas yang sudah ada.
const initial = document.documentElement.classList.contains('dark') ? 'gelap' : 'terang'

export const useThemeStore = create((set, get) => ({
  theme: initial,
  toggle: () => {
    const next = get().theme === 'gelap' ? 'terang' : 'gelap'
    document.documentElement.classList.toggle('dark', next === 'gelap')
    try {
      localStorage.setItem('tema', next)
    } catch {
      // Penyimpanan diblokir browser: tema tetap berubah untuk sesi ini.
    }
    set({ theme: next })
  },
}))
