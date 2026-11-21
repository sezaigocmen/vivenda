/**
 * Ödeme – Figma'da yoktu (storyboard: "checks the delivery option… fast and secure shopping").
 * Teslimat (bisikletli kurye / mağazadan teslim), zaman aralığı, demo ödeme yöntemi, özet ve "Pay".
 * DEMO GÜVENLİĞİ: kart numarası ya da adres girilmez; ödeme simüle edilir, ücret alınmaz.
 */
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useNav } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { money } from '../data/catalog'
import { useApp } from '../store'
import { round2, useCartSummary } from './cartMath'

const SLOTS = ['Today · 16:00–18:00', 'Today · 18:00–20:00', 'Tomorrow · 09:00–11:00']

export function Checkout() {
  const nav = useNav()
  const placeOrder = useApp((s) => s.placeOrder)
  const { lines, groups, count, subtotal, courier } = useCartSummary()
  const [delivery, setDelivery] = useState<'courier' | 'pickup'>('courier')
  const [slot, setSlot] = useState(SLOTS[0])
  const [pay, setPay] = useState<'apple' | 'card'>('apple')
  const [paying, setPaying] = useState(false)
  const fee = delivery === 'courier' ? courier : 0
  const total = round2(subtotal + fee)

  const submit = () => {
    if (paying || !count) return
    setPaying(true)
    setTimeout(() => {
      const order = placeOrder({
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty, price: l.product.price })),
        shops: groups.map((g) => g.shop.id),
        delivery,
        slot: delivery === 'courier' ? slot : 'Ready for pickup in 30 min',
        subtotal,
        deliveryFee: fee,
        total,
      })
      nav.pop()
      setTimeout(() => nav.push('order', { id: order.id }), 560)
    }, 1500)
  }

  return (
    <Screen bg={{ crop: 'right', opacity: 0.1 }}>
      <div className="flex items-center gap-[12px] px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <h1 className="text-[20px] font-medium text-orange">Checkout</h1>
      </div>

      <Section title="Delivery">
        <div className="grid grid-cols-2 gap-[10px]">
          <Choice on={delivery === 'courier'} onClick={() => setDelivery('courier')} title="🚲 Bike courier" sub={`+${money(courier)} · low-emission`} />
          <Choice on={delivery === 'pickup'} onClick={() => setDelivery('pickup')} title="🛍️ Pick up" sub="Free · say hi to the maker" />
        </div>
        {delivery === 'courier' ? (
          <>
            <div className="mt-[10px] flex items-center gap-[10px] rounded-card border border-teal bg-white/85 px-[12px] py-[10px]">
              <Icon name="pin" size={18} className="text-teal" />
              <span className="min-w-0 flex-1 text-[13px]">
                <b className="font-semibold">Home</b> · 12 Rose Lane, Apt 3
                <span className="block text-[11px] font-light text-ink-soft">Demo address</span>
              </span>
            </div>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {SLOTS.map((s) => (
                <button key={s} onClick={() => setSlot(s)} className={`pressable rounded-full px-[12px] py-[6px] text-[12px] ${slot === s ? 'bg-teal font-semibold text-white' : 'bg-beige'}`}>
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-[10px] text-[13px] font-light">
            Pick up from {groups.map((g) => g.shop.name).join(', ')} — ready in about 30 minutes.
          </p>
        )}
      </Section>

      <Section title="Payment">
        <div className="flex flex-col gap-[8px]">
          <Choice on={pay === 'apple'} onClick={() => setPay('apple')} title=" Apple Pay" sub="Demo — no real payment" row />
          <Choice on={pay === 'card'} onClick={() => setPay('card')} title="Visa •••• 4242" sub="Demo card on file" row />
        </div>
      </Section>

      <Section title="Summary">
        <div className="rounded-card bg-white/85 p-[12px] text-[14px]">
          {lines.map((l) => (
            <div key={l.productId} className="flex justify-between py-[2px] font-light">
              <span className="truncate pr-2">
                {l.qty} × {l.product.name}
              </span>
              <span>{money(round2(l.qty * l.product.price))}</span>
            </div>
          ))}
          <div className="mt-[6px] flex justify-between border-t border-beige pt-[6px] text-orange">
            <span>Delivery</span>
            <span>{fee ? `+${money(fee)}` : 'Free'}</span>
          </div>
          <div className="mt-[4px] flex justify-between text-[18px] font-bold text-teal">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </Section>

      <div className="px-[20px] pb-4 pt-[18px]">
        <button onClick={submit} disabled={paying} className="pressable flex h-[48px] w-full items-center justify-center gap-2 rounded-card bg-orange text-[16px] font-semibold text-white shadow-[0_4px_12px_rgb(220_96_46/0.3)]">
          {paying ? (
            <>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="h-[18px] w-[18px] rounded-full border-2 border-white border-t-transparent" />
              Processing…
            </>
          ) : (
            `Pay ${money(total)}`
          )}
        </button>
        <p className="mt-[8px] text-center text-[12px] font-light text-ink-soft">🔒 Portfolio demo — you won’t be charged.</p>
      </div>
    </Screen>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-[20px] pt-[18px]">
      <h2 className="pb-[8px] text-[15px] font-medium text-teal">{title}</h2>
      {children}
    </section>
  )
}

function Choice({ on, onClick, title, sub, row }: { on: boolean; onClick: () => void; title: string; sub: string; row?: boolean }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={`pressable flex rounded-card border bg-white/90 px-[12px] py-[10px] text-left ${on ? 'border-orange ring-1 ring-orange' : 'border-beige'} ${row ? 'items-center justify-between' : 'flex-col'}`}>
      <span>
        <span className="block text-[14px] font-semibold">{title}</span>
        <span className="block text-[12px] font-light text-ink-soft">{sub}</span>
      </span>
      {row && <span className={`h-[18px] w-[18px] rounded-full border-2 ${on ? 'border-orange bg-orange shadow-[inset_0_0_0_3px_white]' : 'border-muted'}`} />}
    </button>
  )
}
