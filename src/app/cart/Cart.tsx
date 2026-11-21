/**
 * Figma: My Cart (14:6) – solda dükkân adı, sağda "My Cart / Total Items", 96×96 turuncu çerçeveli ürünler,
 * bej − / + sayaç, altta "Total" (turkuaz), "Delivery Cost" (turuncu) ve bej "Next" butonu.
 * Düzeltmeler: teslimat ücreti "-$12" değil "+$x" olarak toplama ekleniyor; birden çok dükkân gruplanıyor.
 */
import { AnimatePresence, motion } from 'motion/react'
import { useNav } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { money } from '../data/catalog'
import { useApp } from '../store'
import { round2, useCartSummary } from './cartMath'

export function Cart() {
  const nav = useNav()
  const setQty = useApp((s) => s.setQty)
  const { groups, count, subtotal, courier } = useCartSummary()
  const total = round2(subtotal + courier)

  if (count === 0) {
    return (
      <Screen bg={{ crop: 'right', opacity: 0.1 }}>
        <div className="flex flex-col items-center px-[32px] pt-[90px] text-center">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-beige text-orange">
            <Icon name="cart" style={{ width: 30, height: 32 }} />
          </span>
          <p className="mt-[16px] text-[20px] font-medium text-orange">Your cart is empty</p>
          <p className="mt-[6px] text-[14px] font-light">Fill it with something made just around the corner.</p>
          <button onClick={() => nav.setTab('categories')} className="pressable mt-[18px] h-[44px] rounded-card bg-orange px-[22px] text-[15px] font-semibold text-white">
            Discover local shops
          </button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen bg={{ crop: 'right', opacity: 0.1 }}>
      {/* Figma: başlık satırı */}
      <div className="flex items-start justify-between px-[20px] pt-[10px]">
        <div className="min-w-0">
          <p className="truncate text-[20px] font-medium leading-[27px]">{groups.length === 1 ? groups[0].shop.name : `${groups.length} local shops`}</p>
          <p className="text-[12px] font-light">{groups.length === 1 ? 'Shop' : 'One checkout, every shop'}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[20px] font-medium leading-[27px] text-orange">My Cart</p>
          <p className="text-[12px] font-light">Total Items: {count}</p>
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.shop.id} className="pt-[20px]">
          {groups.length > 1 && (
            <button onClick={() => nav.push('shop', { id: g.shop.id })} className="pressable mx-[20px] mb-[10px] flex items-center gap-[8px] text-[14px] font-semibold text-teal">
              <img src={g.shop.photo} alt="" className="h-[24px] w-[24px] rounded-full object-cover" />
              {g.shop.name}
            </button>
          )}
          <ul className="flex flex-col gap-[25px] px-[20px]">
            <AnimatePresence initial={false}>
              {g.lines.map((l) => (
                <motion.li key={l.productId} layout exit={{ opacity: 0, x: -40 }} className="flex gap-[20px]">
                  <button onClick={() => nav.push('product', { id: l.productId })} className="pressable h-[96px] w-[96px] shrink-0 overflow-hidden rounded-card border-[0.5px] border-orange bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12)]">
                    <img src={l.product.image} alt="" className="h-full w-full object-cover" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-[15px] font-semibold leading-[20px]">{l.product.name}</p>
                    <p className="truncate text-[14px] font-light leading-[20px]">{g.shop.subs.find((s) => s.id === l.product.sub)?.name}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[15px] font-semibold">{money(round2(l.product.price * l.qty))}</span>
                      {/* Figma: bej daire − sayı + */}
                      <span className="flex items-center gap-[10px]">
                        <button aria-label="Decrease" onClick={() => setQty(l.productId, l.qty - 1)} className="pressable flex h-[26px] w-[26px] items-center justify-center rounded-full bg-beige text-[16px] leading-none text-orange">
                          −
                        </button>
                        <span className="w-[16px] text-center text-[13px]">{l.qty}</span>
                        <button aria-label="Increase" onClick={() => setQty(l.productId, l.qty + 1)} className="pressable flex h-[26px] w-[26px] items-center justify-center rounded-full bg-beige text-[16px] leading-none text-orange">
                          +
                        </button>
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}

      {/* Figma: Total / Delivery Cost / Next */}
      <div className="px-[25px] pb-4 pt-[34px]">
        <div className="flex items-baseline justify-between text-[15px] font-light">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        <div className="mt-[4px] flex items-baseline justify-between text-[15px] text-orange">
          <span>Delivery Cost</span>
          <span>+{money(courier)}</span>
        </div>
        <div className="mt-[8px] flex items-baseline justify-between text-teal">
          <span className="text-[24px] font-bold">Total</span>
          <span className="text-[24px] font-bold">{money(total)}</span>
        </div>
        <button onClick={() => nav.push('checkout')} className="pressable mt-[14px] h-[42px] w-full rounded-full bg-orange text-[16px] font-semibold text-white shadow-[0_4px_12px_rgb(220_96_46/0.3)]">
          Next
        </button>
        <p className="mt-[8px] text-center text-[12px] font-light text-ink-soft">Delivered by bike from {groups.length === 1 ? `${groups[0].shop.name}` : 'each shop'} — or pick up for free.</p>
      </div>
    </Screen>
  )
}
