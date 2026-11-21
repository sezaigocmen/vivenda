/**
 * MOBİL WEB APP ŞABLONU – giriş noktası
 * Telefonda (veya ana ekrandan açılınca) uygulamayı tam ekran gösterir.
 * Bilgisayarda ekranın ortasında iPhone çerçevesi + yanında QR kod paneli gösterir.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { DeviceFrame } from './DeviceFrame'
import { InfoPanel, type ShowcaseMeta } from './InfoPanel'
import { ShellProvider, type DisplayMode } from './context'
import { ToastHost } from './toast'

function detectMode(): DisplayMode {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  const narrow = window.matchMedia('(max-width: 600px)').matches
  const touchPhone = window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600
  return standalone || narrow || touchPhone ? 'phone' : 'desktop'
}

export function AppShell({ meta, children }: { meta: ShowcaseMeta; children: ReactNode }) {
  const [mode, setMode] = useState<DisplayMode>(detectMode)

  useEffect(() => {
    const update = () => setMode(detectMode())
    window.addEventListener('resize', update)
    // iOS: iki parmakla yakınlaştırmayı engelle (native uygulama hissi)
    const block = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', block)
    return () => {
      window.removeEventListener('resize', update)
      document.removeEventListener('gesturestart', block)
    }
  }, [])

  if (mode === 'phone') {
    return (
      <ShellProvider value={{ mode, scale: 1 }}>
        <div className="app-surface">
          {children}
          <ToastHost />
        </div>
      </ShellProvider>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center gap-[clamp(32px,6vw,96px)] overflow-hidden px-6" style={{ background: meta.pageBackground }}>
      <DeviceFrame>{children}</DeviceFrame>
      <InfoPanel meta={meta} />
    </div>
  )
}
