/** Ortak kartlar: bölüm başlığı, dükkân, etkinlik ve ürün kartları (Figma: turkuaz/turuncu çerçeveli kartlar) */
import type { ReactNode } from 'react'
import { useNav } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Icon } from './Icon'
import { categoryById, distance, eventDay, money, shopById, type Event, type Product, type Shop } from '../data/catalog'
import { useApp } from '../store'

/** Figma: "Categories ··· See All" – 15px semibold başlık, sağda See All */
export function SectionHeader({ title, color = 'orange', onSeeAll }: { title: string; color?: 'orange' | 'teal'; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between px-[20px] pb-[10px] pt-[22px]">
      <h2 className={`text-[15px] font-medium ${color === 'orange' ? 'text-orange' : 'text-teal'}`}>{title}</h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className={`pressable text-[13px] font-light ${color === 'orange' ? 'text-orange' : 'text-teal'}`}>
          See All
        </button>
      )}
    </div>
  )
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-x flex gap-[12px] px-[20px] pb-[4px]" style={{ scrollSnapType: 'none' }}>
      {children}
    </div>
  )
}

export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[2px] text-[12px] font-semibold text-ink-soft">
      <Icon name="star" size={12} className="text-orange" />
      {value.toFixed(1)}
    </span>
  )
}

/** Favori kalbi (dükkân veya ürün) */
export function FavButton({ kind, id, className = '' }: { kind: 'shop' | 'product'; id: string; className?: string }) {
  const on = useApp((s) => (kind === 'shop' ? s.favShops : s.favProducts).includes(id))
  const toggle = useApp((s) => (kind === 'shop' ? s.toggleFavShop : s.toggleFavProduct))
  return (
    <button
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation()
        const v = toggle(id)
        toast(v ? '♥ Added to your favorites' : 'Removed from favorites')
      }}
      className={`pressable flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 shadow-sm ${on ? 'text-orange' : 'text-ink-soft'} ${className}`}
    >
      <Icon name={on ? 'heart-on' : 'heart-line'} size={16} />
    </button>
  )
}

/** Yakındaki dükkân kartı (yatay liste) */
export function ShopCard({ shop, wide }: { shop: Shop; wide?: boolean }) {
  const nav = useNav()
  return (
    <button onClick={() => nav.push('shop', { id: shop.id })} className={`pressable relative shrink-0 overflow-hidden rounded-card border border-teal bg-white text-left ${wide ? 'w-full' : 'w-[200px]'}`}>
      <img src={shop.photo} alt="" className={`w-full object-cover ${wide ? 'h-[150px]' : 'h-[112px]'}`} />
      <FavButton kind="shop" id={shop.id} className="absolute right-[8px] top-[8px]" />
      <span className="block px-[10px] pb-[10px] pt-[8px]">
        <span className="block truncate text-[15px] font-semibold">{shop.name}</span>
        <span className="block truncate text-[12px] font-light text-ink-soft">{wide ? shop.tagline : categoryById(shop.category).name}</span>
        <span className="mt-[4px] flex items-center gap-[8px] text-[12px] text-ink-soft">
          <span className="inline-flex items-center gap-[2px]">
            <Icon name="pin" size={12} className="text-teal" />
            {distance(shop.distance)}
          </span>
          <Rating value={shop.rating} />
          {wide && <span className="font-light">· by {shop.owner}</span>}
        </span>
      </span>
    </button>
  )
}

/** Etkinlik / atölye kartı */
export function EventCard({ event, wide }: { event: Event; wide?: boolean }) {
  const nav = useNav()
  const shop = shopById(event.shopId)
  return (
    <button onClick={() => nav.push('event', { id: event.id })} className={`pressable flex shrink-0 items-center gap-[12px] overflow-hidden rounded-card border border-orange bg-white p-[8px] text-left ${wide ? 'w-full' : 'w-[290px]'}`}>
      <img src={event.image} alt="" className="h-[72px] w-[72px] shrink-0 rounded-[8px] object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold">{event.title}</span>
        <span className="block truncate text-[12px] font-light text-ink-soft">{shop.name}</span>
        <span className="mt-[4px] flex items-center gap-[6px] text-[12px] font-semibold text-orange">
          <Icon name="calendar" size={13} />
          {eventDay(event.inDays)} · {event.time}
          <span className="font-light text-ink-soft">· {event.price ? money(event.price) : 'Free'}</span>
        </span>
      </span>
    </button>
  )
}

/** Figma: "New Flavors" ürün kartı – 96×96 görsel, ad + fiyat */
export function ProductCard({ product, showShop }: { product: Product; showShop?: boolean }) {
  const nav = useNav()
  return (
    <button onClick={() => nav.push('product', { id: product.id })} className="pressable relative w-[112px] shrink-0 text-left">
      <span className="relative block h-[112px] w-[112px] overflow-hidden rounded-card border border-teal bg-white shadow-[0_2px_6px_rgb(0_0_0/0.08)]">
        <img src={product.image} alt="" className="h-full w-full object-cover" />
        {product.isNew && <span className="absolute left-[6px] top-[6px] rounded-full bg-orange px-[6px] text-[10px] font-semibold leading-[16px] text-white">New</span>}
      </span>
      <span className="mt-[6px] flex items-start justify-between gap-[4px]">
        <span className="line-clamp-2 text-[12px] font-light leading-[16px]">{product.name}</span>
        <span className="shrink-0 text-[13px] font-semibold">{money(product.price)}</span>
      </span>
      {showShop && <span className="block truncate text-[11px] font-light text-teal">{shopById(product.shopId).name}</span>}
    </button>
  )
}
