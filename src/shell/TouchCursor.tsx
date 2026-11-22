/**
 * MOBİL WEB APP ŞABLONU – masaüstünde "parmak" deneyimi.
 * Telefon çerçevesinin içinde fare imleci yerine yarı saydam gri bir parmak izi gösterilir:
 * - basınca küçülür ve koyulaşır, bırakınca halka şeklinde dalga yayılır (dokunma hissi)
 * - basılı tutup sürükleyince liste ve sayfalar parmakla kaydırılır gibi kayar (atalet / momentum dahil)
 * - kaydırma sonrası yanlışlıkla tıklama olmaz
 * Sadece masaüstü çerçevesinde (DeviceFrame) çalışır; telefonda gerçek dokunma kullanılır.
 */
import { useEffect, useRef, useState, type RefObject } from 'react'

type Ripple = { id: number; x: number; y: number }

/** Bir elemandan yukarı doğru, verilen yönde kaydırılabilir ilk kapsayıcıyı bulur */
function scrollParent(el: Element | null, root: Element, axis: 'x' | 'y'): HTMLElement | null {
  while (el && el !== root) {
    const h = el as HTMLElement
    const cs = getComputedStyle(h)
    const ov = axis === 'y' ? cs.overflowY : cs.overflowX
    const can = axis === 'y' ? h.scrollHeight > h.clientHeight + 1 : h.scrollWidth > h.clientWidth + 1
    if (can && (ov === 'auto' || ov === 'scroll')) return h
    el = el.parentElement
  }
  return null
}

/** Snap noktaları arasından, bırakış hızına göre hedefi seçip yumuşakça kaydırır */
function snapTo(el: HTMLElement, axis: 'x' | 'y', v: number, orig: string) {
  const er = el.getBoundingClientRect()
  const cs = getComputedStyle(el)
  const padStart = parseFloat(axis === 'x' ? cs.scrollPaddingLeft : cs.scrollPaddingTop) || 0
  const cur = axis === 'x' ? el.scrollLeft : el.scrollTop
  const max = axis === 'x' ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight
  const points: number[] = []
  for (const c of Array.from(el.children) as HTMLElement[]) {
    const align = getComputedStyle(c).scrollSnapAlign.split(' ').pop() || 'none'
    if (align === 'none') continue
    const cr = c.getBoundingClientRect()
    const off = axis === 'x' ? cr.left - er.left : cr.top - er.top
    const size = axis === 'x' ? cr.width : cr.height
    const view = axis === 'x' ? er.width : er.height
    const p = align === 'center' ? cur + off + size / 2 - view / 2 : align === 'end' ? cur + off + size - view : cur + off - padStart
    points.push(Math.max(0, Math.min(max, p)))
  }
  const projected = cur + v * 220
  let target = points.length ? points.reduce((a, b) => (Math.abs(b - projected) < Math.abs(a - projected) ? b : a)) : cur
  // Küçük bir fiske de bir sonraki karta geçirsin
  if (points.length && Math.abs(target - cur) < 2 && Math.abs(v) > 0.25) {
    const next = v > 0 ? points.filter((p) => p > cur + 2).sort((a, b) => a - b)[0] : points.filter((p) => p < cur - 2).sort((a, b) => b - a)[0]
    if (next !== undefined) target = next
  }
  el.scrollTo({ [axis === 'x' ? 'left' : 'top']: target, behavior: 'smooth' })
  setTimeout(() => (el.style.scrollSnapType = orig), 520)
}

/** Kendi sürükleme hareketi olan öğeler (hikâye kaydırma, sheet tutamacı, kenardan geri kaydırma) */
const OWN_GESTURE = '[style*="touch-action"], .touch-none, [data-own-gesture]'

export function TouchCursor({ screen, scale }: { screen: RefObject<HTMLDivElement | null>; scale: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [down, setDown] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const scaleRef = useRef(scale)
  scaleRef.current = scale

  useEffect(() => {
    const root = screen.current
    if (!root) return
    let drag: { x: number; y: number; t: number; target: Element; sx: HTMLElement | null; sy: HTMLElement | null; axis: 'x' | 'y' | null; vx: number; vy: number; moved: boolean; snapEl?: HTMLElement; snapOrig?: string } | null = null
    let raf = 0

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      const s = scaleRef.current
      return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      setPos(local(e))
      if (!drag) return
      const s = scaleRef.current
      const dx = (e.clientX - drag.x) / s
      const dy = (e.clientY - drag.y) / s
      if (!drag.moved && Math.hypot(dx, dy) < 6) return
      if (!drag.axis) {
        // İlk hareketin yönüne göre eksen seç (yatay liste mi, dikey sayfa mı)
        drag.axis = Math.abs(dx) > Math.abs(dy) ? (drag.sx ? 'x' : drag.sy ? 'y' : null) : drag.sy ? 'y' : drag.sx ? 'x' : null
        if (!drag.axis) {
          drag = null
          return
        }
        // Mıknatıslı (scroll-snap) sıralarda sürüklerken mıknatısı kapat; bırakınca en yakın karta otur
        const el = drag.axis === 'y' ? drag.sy : drag.sx
        if (el && getComputedStyle(el).scrollSnapType !== 'none') {
          drag.snapEl = el
          drag.snapOrig = el.style.scrollSnapType
          el.style.scrollSnapType = 'none'
        }
      }
      drag.moved = true
      const now = performance.now()
      const dt = Math.max(1, now - drag.t)
      if (drag.axis === 'y' && drag.sy) {
        drag.sy.scrollTop -= dy
        drag.vy = -dy / dt
      } else if (drag.axis === 'x' && drag.sx) {
        drag.sx.scrollLeft -= dx
        drag.vx = -dx / dt
      }
      drag.x = e.clientX
      drag.y = e.clientY
      drag.t = now
      e.preventDefault()
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      cancelAnimationFrame(raf)
      setDown(true)
      const p = local(e)
      setRipples((r) => [...r, { id: performance.now(), ...p }])
      const target = e.target as Element
      if (target.closest('input, textarea, select, [contenteditable]') || target.closest(OWN_GESTURE)) return
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), target, sx: scrollParent(target, root, 'x'), sy: scrollParent(target, root, 'y'), axis: null, vx: 0, vy: 0, moved: false }
    }

    const onUp = () => {
      setDown(false)
      if (!drag) return
      const d = drag
      drag = null
      if (!d.moved) return
      // Kaydırmadan sonra gelen tıklamayı yut
      const swallow = (ev: Event) => {
        ev.stopPropagation()
        ev.preventDefault()
      }
      window.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 50)
      // Mıknatıslı sıra: hız yönünde en yakın karta yumuşakça otur
      if (d.snapEl) {
        snapTo(d.snapEl, d.axis!, d.axis === 'y' ? d.vy : d.vx, d.snapOrig ?? '')
        return
      }
      // Atalet: parmağı bırakınca bir süre daha kayar
      let v = d.axis === 'y' ? d.vy : d.vx
      const el = d.axis === 'y' ? d.sy : d.sx
      if (!el || Math.abs(v) < 0.05) return
      let last = performance.now()
      const step = (now: number) => {
        const dt = now - last
        last = now
        if (d.axis === 'y') el.scrollTop += v * dt
        else el.scrollLeft += v * dt
        v *= Math.pow(0.94, dt / 16)
        if (Math.abs(v) > 0.02) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    const onLeave = () => {
      setPos(null)
      setDown(false)
    }

    root.addEventListener('pointermove', onMove, { passive: false })
    root.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    root.addEventListener('pointerleave', onLeave)
    // Sürüklerken metin seçimi / görsel sürükleme olmasın
    const noDrag = (e: Event) => e.preventDefault()
    root.addEventListener('dragstart', noDrag)
    return () => {
      cancelAnimationFrame(raf)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('dragstart', noDrag)
    }
  }, [screen])

  // Dalgaları kısa süre sonra temizle
  useEffect(() => {
    if (!ripples.length) return
    const t = setTimeout(() => setRipples((r) => r.slice(1)), 450)
    return () => clearTimeout(t)
  }, [ripples])

  return (
    <div className="pointer-events-none absolute inset-0 z-[1100] overflow-hidden" aria-hidden>
      {ripples.map((r) => (
        <span key={r.id} className="touch-ripple absolute rounded-full" style={{ left: r.x, top: r.y }} />
      ))}
      {pos && (
        <span
          className="absolute rounded-full transition-[width,height,background-color] duration-100"
          style={{
            left: pos.x,
            top: pos.y,
            width: down ? 22 : 28,
            height: down ? 22 : 28,
            transform: 'translate(-50%, -50%)',
            background: down ? 'rgb(40 40 40 / 0.45)' : 'rgb(60 60 60 / 0.28)',
            border: '1.5px solid rgb(255 255 255 / 0.65)',
            boxShadow: '0 1px 6px rgb(0 0 0 / 0.25)',
          }}
        />
      )}
    </div>
  )
}
