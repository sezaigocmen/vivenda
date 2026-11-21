/**
 * İşletme modu – Cozy Bakery (Ioana Swarly). Case study B2B: "simple analytics".
 * Emily'nin müşteri tarafında verdiği siparişler burada gerçekten görünür; durumunu buradan değiştirmek
 * müşteri profilindeki sipariş durumunu da günceller (tek uygulama, iki rol).
 */
import { AnimatePresence, motion } from 'motion/react'
import { useNav } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { EVENTS, money, productById, shopById } from '../data/catalog'
import { useApp, type OrderStatus } from '../store'
import { Stat } from './Profile'

const SHOP_ID = 'cozy-bakery'
const MIN = 60_000

type BizOrder = { id: string; customer: string; you?: boolean; at: number; items: { productId: string; qty: number; price: number }[]; total: number; delivery: 'courier' | 'pickup' }

/** Mahalleden gelen demo siparişler */
const DEMO_ORDERS = (now: number): BizOrder[] => [
  { id: 'VV-2104', customer: 'Liam K.', at: now - 25 * MIN, items: [{ productId: 'croissant', qty: 3, price: 3.5 }, { productId: 'chocolate-cake', qty: 1, price: 5 }], total: 15.5, delivery: 'pickup' },
  { id: 'VV-2101', customer: 'Sara M.', at: now - 70 * MIN, items: [{ productId: 'sourdough', qty: 2, price: 8 }, { productId: 'olive-focaccia', qty: 1, price: 9 }], total: 27.5, delivery: 'courier' },
  { id: 'VV-2097', customer: 'Noah T.', at: now - 150 * MIN, items: [{ productId: 'cheesecake', qty: 1, price: 24 }], total: 26.5, delivery: 'courier' },
]
const DEMO_STATUS: Record<string, OrderStatus> = { 'VV-2101': 'ready', 'VV-2097': 'done' }

export function BusinessDashboard() {
  const nav = useNav()
  const shop = shopById(SHOP_ID)
  const myOrders = useApp((s) => s.orders)
  const status = useApp((s) => s.orderStatus)
  const setStatus = useApp((s) => s.setOrderStatus)
  const isFav = useApp((s) => s.favShops.includes(SHOP_ID))
  const seen = useApp((s) => s.seenStories.includes(SHOP_ID))
  const joined = useApp((s) => s.joinedEvents.includes('ev-sourdough'))

  // Emily'nin bu dükkândan aldığı ürünler → gerçek gelen sipariş
  const emily: BizOrder[] = myOrders
    .filter((o) => o.shops.includes(SHOP_ID))
    .map((o) => {
      const items = o.items.filter((i) => productById(i.productId).shopId === SHOP_ID)
      return { id: o.id, customer: 'Emily P.', you: true, at: o.at, items, total: Math.round(items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100, delivery: o.delivery }
    })
  const orders = [...emily, ...DEMO_ORDERS(Date.now())].sort((a, b) => b.at - a.at)
  const st = (id: string): OrderStatus => status[id] ?? DEMO_STATUS[id] ?? 'new'

  const today = 186 + orders.reduce((a, o) => a + o.total, 0)
  const week = [212, 248, 196, 274, 305, 331, Math.round(today)]
  const max = Math.max(...week)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return i === 6 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short' })
  })
  const workshop = EVENTS.find((e) => e.id === 'ev-sourdough')!
  const booked = 8 - workshop.spots + (joined ? 1 : 0)

  const advance = (o: BizOrder) => {
    const cur = st(o.id)
    const next: OrderStatus = cur === 'new' ? 'ready' : 'done'
    setStatus(o.id, next)
    toast(next === 'ready' ? `${o.id} is ready${o.delivery === 'courier' ? ' — courier on the way' : ' for pickup'}` : `${o.id} completed`)
  }

  return (
    <div className="px-[20px]">
      {/* Dükkân kartı */}
      <div className="mt-[16px] flex items-center gap-[12px] rounded-card border border-orange bg-white/90 p-[10px]">
        <img src={shop.photo} alt="" className="h-[56px] w-[56px] rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold leading-[22px]">{shop.name}</p>
          <p className="text-[12px] font-light">Signed in as {shop.owner} · Owner</p>
        </div>
        <button onClick={() => nav.push('shop', { id: SHOP_ID })} className="pressable shrink-0 rounded-full bg-beige px-[10px] py-[4px] text-[12px] font-semibold text-orange">
          View shop
        </button>
      </div>

      {/* KPI'lar */}
      <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
        <Stat big={money(Math.round(today))} label="sales today" />
        <Stat big={String(9 + orders.length)} label="orders today" />
        <Stat big={String(312 + (seen ? 1 : 0))} label="story views this week" />
        <Stat big={String(128 + (isFav ? 1 : 0))} label="neighbours follow you" />
      </div>

      {/* Haftalık satış grafiği */}
      <section className="mt-[18px] rounded-card border border-beige bg-white/90 p-[12px]">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-medium text-teal">Sales this week</h3>
          <span className="text-[12px] font-light">{money(week.reduce((a, b) => a + b, 0))} total</span>
        </div>
        <div className="mt-[12px] flex h-[110px] items-end gap-[8px]">
          {week.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-[4px]">
              <span className="text-[10px] font-light">{i === 6 ? money(v) : ''}</span>
              <motion.span initial={{ height: 0 }} animate={{ height: `${(v / max) * 78}px` }} transition={{ duration: 0.6, delay: 0.04 * i }} className={`w-full rounded-t-[6px] ${i === 6 ? 'bg-orange' : 'bg-teal/70'}`} />
              <span className={`text-[11px] ${i === 6 ? 'font-semibold text-orange' : 'font-light'}`}>{days[i]}</span>
            </div>
          ))}
        </div>
        <p className="mt-[10px] text-[12px] font-light">🏘️ 78% of your customers live within 1 km.</p>
      </section>

      {/* Gelen siparişler */}
      <h3 className="pb-[8px] pt-[18px] text-[15px] font-medium text-orange">Incoming orders</h3>
      <ul className="flex flex-col gap-[8px]">
        <AnimatePresence initial={false}>
          {orders.map((o) => {
            const s = st(o.id)
            return (
              <motion.li key={o.id} layout className={`rounded-card border bg-white/95 p-[10px] ${o.you ? 'border-teal' : 'border-beige'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold">
                    {o.customer} {o.you && <span className="ml-[4px] rounded-full bg-teal px-[6px] text-[10px] font-semibold text-white">from your demo order</span>}
                  </span>
                  <span className="text-[12px] font-light">{ago(o.at)}</span>
                </div>
                <p className="mt-[2px] text-[12px] font-light">
                  {o.items.map((i) => `${i.qty}× ${productById(i.productId).name}`).join(', ')}
                </p>
                <div className="mt-[8px] flex items-center justify-between">
                  <span className="text-[12px]">
                    {o.delivery === 'courier' ? '🚲 Courier' : '🛍️ Pickup'} · <b className="font-semibold">{money(o.total)}</b>
                  </span>
                  {s === 'done' ? (
                    <span className="rounded-full bg-sage px-[10px] py-[3px] text-[12px] font-semibold">Completed</span>
                  ) : (
                    <button onClick={() => advance(o)} className={`pressable rounded-full px-[12px] py-[5px] text-[12px] font-semibold text-white ${s === 'new' ? 'bg-orange' : 'bg-teal'}`}>
                      {s === 'new' ? 'Mark as ready' : 'Mark as delivered'}
                    </button>
                  )}
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {/* En çok satanlar + atölye */}
      <div className="mt-[18px] grid grid-cols-2 gap-[8px]">
        <div className="rounded-card border border-beige bg-white/90 p-[10px]">
          <p className="text-[13px] font-medium text-teal">Top this week</p>
          {[
            ['sourdough', 42],
            ['croissant', 37],
            ['chocolate-cookies', 21],
          ].map(([id, n]) => (
            <p key={id} className="mt-[4px] flex justify-between text-[12px] font-light">
              <span className="truncate pr-1">{productById(id as string).name}</span>
              <b className="font-semibold">{n}</b>
            </p>
          ))}
        </div>
        <button onClick={() => nav.push('event', { id: workshop.id })} className="pressable rounded-card border border-beige bg-white/90 p-[10px] text-left">
          <p className="text-[13px] font-medium text-orange">{workshop.title}</p>
          <p className="mt-[4px] text-[22px] font-semibold leading-none">
            {booked}
            <span className="text-[13px] font-light">/8 booked</span>
          </p>
          <span className="mt-[6px] block h-[6px] overflow-hidden rounded-full bg-beige">
            <span className="block h-full bg-orange" style={{ width: `${(booked / 8) * 100}%` }} />
          </span>
          {joined && <p className="mt-[4px] text-[11px] font-light">incl. Emily P.</p>}
        </button>
      </div>
    </div>
  )
}

function ago(at: number) {
  const m = Math.max(0, Math.round((Date.now() - at) / MIN))
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  return `${Math.round(m / 60)} h ago`
}
