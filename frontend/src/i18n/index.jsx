import { createContext, useCallback, useContext, useEffect } from 'react'
import { create } from 'zustand'
import { DEFAULT_LANGUAGE, LANGUAGES, languageByCode } from './languages'

const STORAGE_KEY = 'bahasa'

function readSaved() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return LANGUAGES.some((l) => l.code === saved) ? saved : null
  } catch {
    return null
  }
}

/**
 * Bahasa pilihan tamu, tersimpan di browser. `lang` bernilai null kalau tamu
 * belum pernah memilih, sehingga jendela pilih bahasa muncul.
 */
export const useLanguageStore = create((set) => ({
  lang: readSaved(),
  setLang: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Penyimpanan diblokir browser: bahasa tetap berlaku untuk sesi ini.
    }
    set({ lang })
  },
}))

// Halaman petugas memaksa Bahasa Indonesia lewat LanguageProvider, apa pun
// pilihan bahasa yang tersimpan di browser.
const LanguageContext = createContext(null)

export function LanguageProvider({ lang, children }) {
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = languageByCode(lang).messages.meta.title
  }, [lang])
  return <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
}

function lookup(messages, key) {
  return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), messages)
}

/** t('form.name') atau t('success.thanks', { name }) untuk teks dengan isian. */
export function useT() {
  const forced = useContext(LanguageContext)
  const saved = useLanguageStore((s) => s.lang)
  const lang = forced ?? saved ?? DEFAULT_LANGUAGE
  const language = languageByCode(lang)

  const t = useCallback(
    (key, vars) => {
      const text = lookup(language.messages, key) ?? lookup(languageByCode(DEFAULT_LANGUAGE).messages, key) ?? key
      return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text
    },
    [language]
  )

  return { t, lang, locale: language.locale }
}
