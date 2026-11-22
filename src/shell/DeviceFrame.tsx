/**
 * Masaüstünde uygulamayı saran iPhone çerçevesi (393×852, iPhone 15/16 ölçüsü).
 * Pencere küçükse çerçeve orantılı küçülür.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ShellProvider } from './context'
import { StatusBar } from './StatusBar'
import { ToastHost } from './toast'
import { TouchCursor } from './TouchCursor'

const SCREEN_W = 393
const SCREEN_H = 852
const BEZEL = 12
const FRAME_W = SCREEN_W + BEZEL * 2
const FRAME_H = SCREEN_H + BEZEL * 2

function useFitScale() {
  const calc = () => Math.min(1, (window.innerHeight - 48) / FRAME_H, (window.innerWidth - 48) / FRAME_W)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const onResize = () => setScale(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  const scale = useFitScale()
  const screen = useRef<HTMLDivElement>(null)

  const screenVars = {
    '--safe-top': '59px',
    '--safe-bottom': '34px',
  } as CSSProperties

  return (
    <div className="shrink-0" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
      <div
        className="relative origin-top-left"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
          borderRadius: 64,
          padding: BEZEL,
          background: 'linear-gradient(145deg, #2c2c2e, #0d0d0f)',
          boxShadow: '0 0 0 2px #48484a, 0 40px 80px -20px rgb(0 0 0 / 0.45), 0 20px 40px -20px rgb(0 0 0 / 0.3)',
        }}
      >
        {/* Yan tuşlar */}
        <span className="absolute -left-[3px] top-[170px] h-[32px] w-[3px] rounded-l bg-[#3a3a3c]" />
        <span className="absolute -left-[3px] top-[225px] h-[60px] w-[3px] rounded-l bg-[#3a3a3c]" />
        <span className="absolute -left-[3px] top-[298px] h-[60px] w-[3px] rounded-l bg-[#3a3a3c]" />
        <span className="absolute -right-[3px] top-[250px] h-[96px] w-[3px] rounded-r bg-[#3a3a3c]" />

        <div ref={screen} className="touch-frame relative h-full w-full overflow-hidden" style={{ ...screenVars, borderRadius: 52, transform: 'translateZ(0)' }}>
          <ShellProvider value={{ mode: 'desktop', scale }}>
            <div className="app-surface">
              {children}
              <ToastHost />
            </div>
          </ShellProvider>

          {/* Durum çubuğu + Dynamic Island + alt çizgi (dokunmayı engellemez) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000]">
            <StatusBar color="var(--status-fg, #000)" />
            <div className="absolute left-1/2 top-[11px] h-[37px] w-[125px] -translate-x-1/2 rounded-full bg-black" />
          </div>
          <TouchCursor screen={screen} scale={scale} />
          <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-[1000] h-[5px] w-[139px] -translate-x-1/2 rounded-full" style={{ background: "var(--status-fg, #000)", opacity: 0.85 }} />
        </div>
      </div>
    </div>
  )
}
