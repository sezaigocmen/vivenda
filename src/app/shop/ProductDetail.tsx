/**
 * Ürün detayı – Figma'da yoktu (storyboard: Emily ekşi mayalı ekmeği görür, sepete ekler).
 * Figma dilinde: turkuaz çerçeveli büyük görsel, bej adet seçici (sepet ekranındaki gibi), turuncu buton.
 */
import { motion } from 'motion/react'
import { useState } from 'react'
import { useNav, type ScreenProps } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { FavButton, Rating } from '../components/Cards'
import { distance, money, productById, productsOf, shopById } from '../data/catalog'
import { useApp } from '../store'

export function ProductDetail({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav()
  const p = productById(params.id)
  const shop = shopById(p.shopId)
  const sub = shop.subs.find((s) => s.id === p.sub)
  const addToCart = useApp((s) => s.addToCart)
  const inCart = useApp((s) => s.cart.find((c) => c.productId === p.id)?.qty ?? 0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const more = productsOf(shop.id).filter((x) => x.id !== p.id).slice(0, 6)

  const add = () => {
    addToCart(p.id, qty)
    setAdded(true)
    toast(`Added ${qty} × ${p.name} to your cart`)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Screen bg={{ crop: 'shop', opacity: 0.1 }}>
      <div className="flex items-center justify-between px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <button onClick={() => nav.push('shop', { id: shop.id })} className="pressable min-w-0 flex-1 truncate px-2 text-center text-[16px] font-medium text-orange">
          {shop.name}
        </button>
        <FavButton kind="product" id={p.id} className="!h-[36px] !w-[36px] !bg-beige" />
      </div>

      {/* Görsel */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-[20px] mt-[16px] overflow-hidden rounded-card border border-teal bg-white shadow-[0_4px_12px_rgb(0_0_0/0.10)]">
        <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
        {p.isNew && <span className="absolute left-[10px] top-[10px] rounded-full bg-orange px-[10px] text-[12px] font-semibold leading-[22px] text-white">New</span>}
      </motion.div>

      {/* Bilgi */}
      <div className="px-[20px] pt-[16px]">
        <p className="text-[13px] font-light text-teal">{sub?.name ?? 'Handmade'}</p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[20px] font-semibold leading-[27px]">{p.name}</h1>
          <span className="text-[22px] font-semibold text-orange">{money(p.price)}</span>
        </div>
        <p className="mt-[8px] text-[14px] font-light leading-[21px]">{p.desc}</p>

        {/* Dükkân satırı */}
        <button onClick={() => nav.push('shop', { id: shop.id })} className="pressable mt-[14px] flex w-full items-center gap-[12px] rounded-card bg-beige/70 p-[8px] text-left">
          <img src={shop.photo} alt="" className="h-[44px] w-[44px] rounded-full object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold">{shop.name}</span>
            <span className="flex items-center gap-[8px] text-[12px] font-light">
              by {shop.owner} · <Icon name="pin" size={11} className="text-teal" /> {distance(shop.distance)} <Rating value={shop.rating} />
            </span>
          </span>
          <Icon name="chevron-right" size={18} className="text-orange" />
        </button>
        <p className="mt-[10px] text-[12px] font-light text-ink-soft">🚲 Local delivery today · or pick up in store</p>
      </div>

      {/* Adet + Sepete ekle */}
      <div className="mx-[20px] mt-[16px] flex items-center gap-[14px]">
        <div className="flex items-center gap-[12px]">
          <button aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="pressable flex h-[32px] w-[32px] items-center justify-center rounded-full bg-beige text-[20px] leading-none text-orange">
            −
          </button>
          <span className="w-[18px] text-center text-[16px] font-semibold">{qty}</span>
          <button aria-label="Increase" onClick={() => setQty(Math.min(20, qty + 1))} className="pressable flex h-[32px] w-[32px] items-center justify-center rounded-full bg-beige text-[20px] leading-none text-orange">
            +
          </button>
        </div>
        <button onClick={add} className={`pressable flex h-[46px] flex-1 items-center justify-center gap-2 rounded-card text-[15px] font-semibold text-white shadow-[0_4px_12px_rgb(220_96_46/0.3)] ${added ? 'bg-teal' : 'bg-orange'}`}>
          {added ? '✓ Added' : `Add to Cart · ${money(Math.round(p.price * qty * 100) / 100)}`}
        </button>
      </div>
      {inCart > 0 && (
        <button onClick={() => nav.setTab('cart')} className="pressable mx-auto mt-[8px] block text-[12px] font-light text-teal underline-offset-2">
          {inCart} in your cart · View cart
        </button>
      )}

      {/* Aynı dükkândan */}
      {more.length > 0 && (
        <>
          <h2 className="px-[20px] pb-[10px] pt-[22px] text-[14px] font-semibold text-teal">More from {shop.name}</h2>
          <div className="scroll-x flex gap-[16px] px-[20px]" style={{ scrollSnapType: 'none' }}>
            {more.map((m) => (
              <button key={m.id} onClick={() => nav.push('product', { id: m.id })} className="pressable w-[96px] shrink-0 text-left">
                <span className="block aspect-square overflow-hidden rounded-card border-[0.5px] border-teal bg-white shadow-[0_2px_6px_rgb(0_0_0/0.10)]">
                  <img src={m.image} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="mt-[5px] flex items-start justify-between gap-[4px]">
                  <span className="line-clamp-2 text-[11px] leading-[14px]">{m.name}</span>
                  <span className="shrink-0 text-[13px] font-semibold">{money(m.price)}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="h-4" />
    </Screen>
  )
}
