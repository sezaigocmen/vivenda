/** Masaüstünde çerçevenin yanındaki tanıtım paneli: uygulama adı, açıklama, QR kod, linkler. */
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export interface ShowcaseMeta {
  name: string
  tagline: string
  description: string
  logo?: string
  accent: string
  pageBackground: string
  designer: string
  links: { label: string; href: string }[]
  /** Demo verilerini sıfırlayan fonksiyon (isteğe bağlı) */
  onReset?: () => void
}

/** QR kodun açacağı adres: geliştirmede bilgisayarın yerel ağ adresi, yayında sitenin kendi adresi. */
function shareUrl() {
  const { hostname, pathname } = window.location
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
  if (isLocal && __LAN_URL__) return __LAN_URL__ + pathname
  return window.location.origin + pathname
}

export function InfoPanel({ meta }: { meta: ShowcaseMeta }) {
  const [qr, setQr] = useState('')
  const url = shareUrl()

  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#0000' } }).then(setQr)
  }, [url])

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col gap-7 text-[#111] min-[860px]:flex" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="flex items-center gap-3">
        {meta.logo && <img src={meta.logo} alt="" className="h-11 w-auto" />}
        <h1 className="text-[34px] font-semibold leading-none tracking-[-0.5px]">{meta.name}</h1>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[17px] font-medium leading-snug">{meta.tagline}</p>
        <p className="text-[14px] leading-relaxed text-black/60">{meta.description}</p>
      </div>

      <div className="flex items-center gap-4 rounded-[24px] bg-white/80 p-4 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur">
        <div className="h-[104px] w-[104px] shrink-0 rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} />
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-semibold">Scan to open on your phone</span>
          <span className="text-[12px] leading-snug text-black/55">
            Best on iPhone. Tap <b>Share → Add to Home Screen</b> for the full‑screen app experience.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {meta.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline" style={{ color: meta.accent }}>
            {l.label} ↗
          </a>
        ))}
        {meta.onReset && (
          <button onClick={meta.onReset} className="cursor-pointer text-black/50 underline-offset-4 hover:underline">
            Restart demo
          </button>
        )}
      </div>

      <p className="text-[12px] text-black/40">Designed by {meta.designer} · Demo data only.</p>
    </aside>
  )
}
