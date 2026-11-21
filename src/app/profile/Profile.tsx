/**
 * Profil – Figma'da yoktu. Projenin ana fikri: müşteri ve işletme sahibi TEK uygulamayı kullanır.
 * Üstteki "Customer / Business" anahtarı rolü değiştirir (onaylı: müşteri profili + siparişler + etki özeti,
 * işletme tarafında Dashboard).
 */
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useNav } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EVENTS, eventDay, money, productById, shopById } from '../data/catalog'
import { resetDemo, useApp } from '../store'
import { BusinessDashboard } from './BusinessDashboard'

export function Profile() {
  const nav = useNav()
  const mode = useApp((s) => s.mode)
  const setMode = useApp((s) => s.setMode)

  return (
    <Screen bg={{ crop: 'center', opacity: 0.18 }}>
      <div className="flex items-center gap-[12px] px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <h1 className="text-[20px] font-medium text-orange">Profile</h1>
      </div>

      {/* Rol anahtarı */}
      <div className="mx-[20px] mt-[14px] flex rounded-full border border-orange bg-white p-[3px]">
        {(['customer', 'business'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              if (m === mode) return
              setMode(m)
              toast(m === 'business' ? 'Switched to Business · Cozy Bakery' : 'Switched to Customer · Emily')
            }}
            className="relative h-[34px] flex-1 rounded-full text-[14px] font-semibold"
          >
            {mode === m && <motion.span layoutId="role" className="absolute inset-0 rounded-full bg-orange" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className={`relative ${mode === m ? 'text-white' : 'text-ink-soft'}`}>{m === 'customer' ? '🛍️ Customer' : '🏪 Business'}</span>
          </button>
        ))}
      </div>
      <p className="px-[20px] pt-[6px] text-center text-[12px] font-light text-ink-soft">One app for neighbours and the shops they love.</p>

      <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {mode === 'customer' ? <CustomerProfile /> : <BusinessDashboard />}
      </motion.div>

      <div className="flex gap-[10px] px-[20px] pb-4 pt-[24px]">
        <button onClick={resetDemo} className="pressable h-[42px] flex-1 rounded-card bg-beige text-[14px] font-semibold">
          Restart demo
        </button>
        <button onClick={() => useApp.getState().setOnboarded(false)} className="pressable h-[42px] flex-1 rounded-card border border-orange text-[14px] font-semibold text-orange">
          Log out
        </button>
      </div>
    </Screen>
  )
}

/* ── Müşteri: Emily ── */
function CustomerProfile() {
  const nav = useNav()
  const supported = useApp((s) => s.supported)
  const orders = useApp((s) => s.orders)
  const status = useApp((s) => s.orderStatus)
  const joined = useApp((s) => s.joinedEvents)
  const favShops = useApp((s) => s.favShops.length)

  // Etki özeti: bisikletli teslimat başına ~0.6 kg CO₂ tasarruf (demo hesap) + geçmiş aylardan 1.8 kg
  const courierOrders = orders.filter((o) => o.delivery === 'courier').length
  const co2 = (1.8 + courierOrders * 0.6).toFixed(1)
  const localSpend = 86 + orders.reduce((a, o) => a + o.subtotal, 0)

  return (
    <>
      <div className="mt-[18px] flex items-center gap-[14px] px-[20px]">
        <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-teal text-[26px] font-semibold text-white">E</span>
        <div>
          <p className="text-[20px] font-medium leading-[26px]">Emily Parker</p>
          <p className="text-[13px] font-light">emily@vivenda.app · Maple District</p>
          <p className="text-[12px] font-light text-teal">Member since 2025 · {favShops} favourite shops</p>
        </div>
      </div>

      {/* Etki özeti */}
      <Section title="Your local impact" color="text-teal">
        <div className="grid grid-cols-3 gap-[8px]">
          <Stat big={String(supported.length)} label="local businesses supported" />
          <Stat big={money(Math.round(localSpend))} label="spent in your neighbourhood" />
          <Stat big={`${co2} kg`} label="CO₂ saved with bike delivery" />
        </div>
        <div className="mt-[8px] flex -space-x-[8px]">
          {supported.map((id) => (
            <img key={id} src={shopById(id).photo} alt={shopById(id).name} title={shopById(id).name} className="h-[30px] w-[30px] rounded-full border-2 border-white object-cover" />
          ))}
          <span className="pl-[14px] text-[12px] font-light leading-[30px]">this month</span>
        </div>
      </Section>

      {/* Siparişler */}
      <Section title="My orders" color="text-orange">
        {orders.length === 0 ? (
          <p className="rounded-card bg-white/85 px-[12px] py-[10px] text-[13px] font-light">No orders yet — your first local order will show up here.</p>
        ) : (
          <ul className="flex flex-col gap-[8px]">
            {orders.map((o) => {
              const st = status[o.id] ?? 'new'
              return (
                <li key={o.id}>
                  <button onClick={() => nav.push('order', { id: o.id })} className="pressable flex w-full items-center gap-[10px] rounded-card border border-beige bg-white/90 p-[8px] text-left">
                    <img src={productById(o.items[0].productId).image} alt="" className="h-[46px] w-[46px] rounded-[8px] object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{o.shops.map((s) => shopById(s).name).join(', ')}</span>
                      <span className="block truncate text-[12px] font-light">
                        {o.id} · {o.items.reduce((a, i) => a + i.qty, 0)} items · {money(o.total)}
                      </span>
                    </span>
                    <StatusChip st={st} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      {/* Atölyeler */}
      <Section title="My workshops" color="text-orange">
        {joined.length === 0 ? (
          <button onClick={() => nav.push('category', { id: 'events' })} className="pressable w-full rounded-card bg-white/85 px-[12px] py-[10px] text-left text-[13px] font-light">
            No bookings yet — <span className="font-semibold text-teal">browse workshops →</span>
          </button>
        ) : (
          <ul className="flex flex-col gap-[8px]">
            {joined.map((id) => {
              const e = EVENTS.find((x) => x.id === id)!
              return (
                <li key={id}>
                  <button onClick={() => nav.push('event', { id })} className="pressable flex w-full items-center gap-[10px] rounded-card border border-beige bg-white/90 p-[8px] text-left">
                    <img src={e.image} alt="" className="h-[46px] w-[46px] rounded-[8px] object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{e.title}</span>
                      <span className="block truncate text-[12px] font-light">
                        {eventDay(e.inDays)} · {e.time} · {shopById(e.shopId).name}
                      </span>
                    </span>
                    <span className="rounded-full bg-sage px-[8px] py-[2px] text-[11px] font-semibold">Booked</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </>
  )
}

export function StatusChip({ st }: { st: 'new' | 'ready' | 'done' }) {
  const map = { new: ['Preparing', 'bg-beige text-orange'], ready: ['On its way', 'bg-teal/15 text-teal'], done: ['Delivered', 'bg-sage text-ink'] } as const
  return <span className={`shrink-0 rounded-full px-[8px] py-[2px] text-[11px] font-semibold ${map[st][1]}`}>{map[st][0]}</span>
}

function Section({ title, color, children }: { title: string; color: string; children: ReactNode }) {
  return (
    <section className="px-[20px] pt-[20px]">
      <h2 className={`pb-[8px] text-[15px] font-medium ${color}`}>{title}</h2>
      {children}
    </section>
  )
}

export function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="rounded-card border border-beige bg-white/90 px-[8px] py-[10px] text-center">
      <p className="text-[18px] font-semibold leading-[24px] text-teal">{big}</p>
      <p className="mt-[2px] text-[11px] font-light leading-[14px]">{label}</p>
    </div>
  )
}
