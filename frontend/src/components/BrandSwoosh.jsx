/**
 * Tiga goresan lengkung yang meniru burung pada logo Panorama, dipakai
 * sebagai hiasan latar yang samar. Hanya dekorasi (aria-hidden).
 */
export function BrandSwoosh({ className }) {
  return (
    <svg viewBox="0 0 640 360" fill="none" className={className} aria-hidden>
      <path
        d="M40 18c120 26 248 92 330 230 4 7 15 6 16-2C350 120 200 40 46 6c-9-2-14 10-6 12Z"
        fill="var(--brand-red)"
      />
      <path d="M402 118c34 46 76 84 122 88 30 2 52-14 66-32 3-4-2-9-6-6-26 22-62 28-98 6-26-16-48-40-66-66-6-8-23 1-18 10Z" fill="var(--brand-red)" />
      <path d="M390 312c84-48 168-74 248-60 6 1 9-8 3-11-88-36-188-14-262 58-6 6 3 17 11 13Z" fill="var(--brand)" />
    </svg>
  )
}
