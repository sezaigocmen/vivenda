/**
 * MOBİL WEB APP ŞABLONU – iOS tarzı navigasyon
 * - Her sekmenin kendi sayfa yığını vardır (sekme değiştirince kaldığın yer korunur)
 * - push(): yeni sayfa sağdan kayarak gelir, alttaki sayfa hafifçe sola kayar
 * - pop(): geri; ekranın sol kenarından sağa kaydırarak da geri gidilir
 * - openSheet(): alttan açılan sheet
 * - Tarayıcı / Android geri tuşu da aynı şekilde çalışır
 */
import { animate, AnimatePresence, motion, motionValue, type MotionValue } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useShell } from './context'
import { SheetView } from './Sheet'

export type Route = { key: string; name: string; params: Record<string, unknown> }
export type ScreenProps<P = Record<string, unknown>> = { params: P }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScreenMap = Record<string, ComponentType<ScreenProps<any>>>
export type TabDef = { id: string; screen: string }

type SheetContent = ReactNode | ((close: () => void) => ReactNode)

export interface NavApi {
  tab: string
  setTab: (tab: string) => void
  push: (name: string, params?: Record<string, unknown>) => void
  pop: () => void
  openSheet: (content: SheetContent) => void
  closeSheet: () => void
}

const NavContext = createContext<NavApi | null>(null)
const RouteContext = createContext<{ route: Route; depth: number; isTop: boolean } | null>(null)

export const useNav = () => {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used inside <Navigator>')
  return ctx
}
export const useRoute = () => useContext(RouteContext)!

const EASE = [0.32, 0.72, 0, 1] as const
const DURATION = 0.42
const PARALLAX = 0.3

export function Navigator({
  tabs,
  initialTab,
  screens,
  tabBar,
}: {
  tabs: TabDef[]
  initialTab: string
  screens: ScreenMap
  /** Alt menü; info.route en üstteki ekranın adı (ör. sohbet ekranında menüyü gizlemek için) */
  tabBar?: (nav: NavApi, info: { depth: number; route: string }) => ReactNode
}) {
  const { scale } = useShell()
  const [tab, setTabState] = useState(initialTab)
  const [stacks, setStacks] = useState<Record<string, Route[]>>(() =>
    Object.fromEntries(tabs.map((t) => [t.id, [{ key: t.id, name: t.screen, params: {} }]])),
  )
  const [sheet, setSheet] = useState<{ id: number; content: SheetContent } | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const xs = useRef(new Map<string, MotionValue<number>>())
  const busy = useRef(false)
  const historyDepth = useRef(0)
  const live = useRef({ tab, stacks, sheet })
  live.current = { tab, stacks, sheet }

  const width = () => rootRef.current?.clientWidth ?? 393
  const getX = (key: string, initial = 0) => {
    let mv = xs.current.get(key)
    if (!mv) {
      mv = motionValue(initial)
      xs.current.set(key, mv)
    }
    return mv
  }

  const pushHistory = () => {
    history.pushState({ nav: Date.now() }, '')
    historyDepth.current++
  }

  /** Animasyonlu geri gitme (kaydırma hareketi yarıda bırakıldıysa oradan devam eder) */
  const animatePop = useCallback(() => {
    const t = live.current.tab
    const stack = live.current.stacks[t]
    if (stack.length < 2) return
    const top = stack[stack.length - 1]
    const below = stack[stack.length - 2]
    const W = width()
    busy.current = true
    animate(getX(below.key), 0, { duration: DURATION * 0.85, ease: EASE })
    animate(getX(top.key), W, { duration: DURATION * 0.85, ease: EASE }).then(() => {
      xs.current.delete(top.key)
      setStacks((s) => ({ ...s, [t]: s[t].filter((r) => r.key !== top.key) }))
      busy.current = false
    })
  }, [])

  // Tarayıcı geri tuşu / Android geri / Safari kaydırma
  useEffect(() => {
    const onPop = () => {
      historyDepth.current = Math.max(0, historyDepth.current - 1)
      if (live.current.sheet) setSheet(null)
      else animatePop()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [animatePop])

  const push = useCallback((name: string, params: Record<string, unknown> = {}) => {
    if (busy.current) return
    const t = live.current.tab
    const stack = live.current.stacks[t]
    const W = width()
    const key = `${name}-${Date.now()}`
    const newX = getX(key, W)
    const belowX = getX(stack[stack.length - 1].key)
    busy.current = true
    setStacks((s) => ({ ...s, [t]: [...s[t], { key, name, params }] }))
    requestAnimationFrame(() => {
      animate(belowX, -W * PARALLAX, { duration: DURATION, ease: EASE })
      animate(newX, 0, { duration: DURATION, ease: EASE }).then(() => (busy.current = false))
    })
    pushHistory()
  }, [])

  const pop = useCallback(() => {
    if (busy.current) return
    if (historyDepth.current > 0) history.back()
    else animatePop()
  }, [animatePop])

  const setTab = useCallback((next: string) => {
    if (next === live.current.tab) {
      // Aktif sekmeye tekrar dokununca en başa dön (iOS davranışı)
      setStacks((s) => {
        s[next].slice(1).forEach((r) => xs.current.delete(r.key))
        getX(s[next][0].key).set(0)
        return { ...s, [next]: s[next].slice(0, 1) }
      })
      return
    }
    setTabState(next)
  }, [])

  const openSheet = useCallback((content: SheetContent) => {
    setSheet({ id: Date.now(), content })
    pushHistory()
  }, [])

  const closeSheet = useCallback(() => {
    if (!live.current.sheet) return
    if (historyDepth.current > 0) history.back()
    else setSheet(null)
  }, [])

  const api = useMemo<NavApi>(() => ({ tab, setTab, push, pop, openSheet, closeSheet }), [tab, setTab, push, pop, openSheet, closeSheet])

  /** Sol kenardan sağa kaydırarak geri gitme */
  const onEdgePointerDown = (e: ReactPointerEvent<HTMLDivElement>, topKey: string, belowKey: string) => {
    if (busy.current) return
    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)
    const W = width()
    const startX = e.clientX
    const top = getX(topKey)
    const below = getX(belowKey)
    let lastX = startX
    let lastT = performance.now()
    let velocity = 0

    const move = (ev: PointerEvent) => {
      const dx = Math.min(W, Math.max(0, (ev.clientX - startX) / scale))
      top.set(dx)
      below.set(-W * PARALLAX * (1 - dx / W))
      const now = performance.now()
      velocity = (ev.clientX - lastX) / scale / Math.max(0.001, (now - lastT) / 1000)
      lastX = ev.clientX
      lastT = now
    }
    const end = () => {
      target.removeEventListener('pointermove', move)
      target.removeEventListener('pointerup', end)
      target.removeEventListener('pointercancel', end)
      if (top.get() > W * 0.35 || (velocity > 500 && top.get() > 10)) pop()
      else {
        animate(top, 0, { duration: 0.3, ease: EASE })
        animate(below, -W * PARALLAX, { duration: 0.3, ease: EASE })
      }
    }
    target.addEventListener('pointermove', move)
    target.addEventListener('pointerup', end)
    target.addEventListener('pointercancel', end)
  }

  const depth = stacks[tab].length - 1

  return (
    <NavContext.Provider value={api}>
      <div ref={rootRef} className="absolute inset-0 overflow-hidden">
        {tabs.map((t) => (
          <div key={t.id} className="absolute inset-0" style={{ display: t.id === tab ? 'block' : 'none' }}>
            {stacks[t.id].map((r, i, arr) => {
              const Screen = screens[r.name]
              const isTop = i === arr.length - 1
              return (
                <motion.div
                  key={r.key}
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    x: getX(r.key),
                    zIndex: i,
                    background: 'var(--app-bg)',
                    boxShadow: i > 0 ? '-10px 0 30px rgb(0 0 0 / 0.10)' : undefined,
                  }}
                >
                  <RouteContext.Provider value={{ route: r, depth: i, isTop }}>
                    {Screen ? <Screen params={r.params} /> : <MissingScreen name={r.name} />}
                  </RouteContext.Provider>
                  {isTop && i > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 z-[100] w-5"
                      style={{ touchAction: 'none' }}
                      onPointerDown={(e) => onEdgePointerDown(e, r.key, arr[i - 1].key)}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}

        {tabBar?.(api, { depth, route: stacks[tab][depth].name })}

        <AnimatePresence>
          {sheet && (
            <SheetView key={sheet.id} onClose={closeSheet}>
              {typeof sheet.content === 'function' ? sheet.content(closeSheet) : sheet.content}
            </SheetView>
          )}
        </AnimatePresence>
      </div>
    </NavContext.Provider>
  )
}

function MissingScreen({ name }: { name: string }) {
  return <div className="p-6 pt-24 text-center text-sm text-black/50">Screen “{name}” not found</div>
}
