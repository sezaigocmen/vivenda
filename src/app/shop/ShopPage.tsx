/**
 * Figma: dükkân sayfası "Cozy Bakery" (25:654) – geri / başlık / sepet, arama, hikâye bannerı,
 * alt kategoriler (yuvarlak), "New Flavors" (turkuaz), "Recommended Products" (koyu turuncu).
 * Tüm dükkânlar bu şablonu kullanır. Düzeltmeler: "Recomended" yazımı, üst üste binen etiketler.
 */
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useNav, type ScreenProps } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EventCard, FavButton } from '../components/Cards'
import { distance, eventsOf, money, productsOf, shopById, type Product } from '../data/catalog'
import { useApp } from '../store'

export function ShopPage({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav()
  const shop = shopById(params.id)
  const all = productsOf(shop.id)
  const events = eventsOf(shop.id)
  const cartCount = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0))
  const [sub, setSub] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const t = q.trim().toLowerCase()
  const filtered = all.filter((p) => (!sub || p.sub === sub) && (!t || p.name.toLowerCase().includes(t)))
  const browsing = !!sub || !!t
  const fresh = all.filter((p) => p.isNew)
  const newRow = fresh.length >= 2 ? fresh : all.slice(0, Math.ceil(all.length / 2))
  const recommended = all.filter((p) => !newRow.includes(p))

  return (
    <Screen bg={{ crop: 'shop', opacity: 0.1 }}>
      {/* Figma: geri (bej daire) · başlık · sepet (bej daire) */}
      <div className="flex items-center justify-between px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate px-2 text-center text-[20px] font-medium text-orange">{shop.name}</h1>
        <button aria-label="Cart" onClick={() => nav.setTab('cart')} className="pressable relative flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-orange">
          <Icon name="cart" style={{ width: 18, height: 19 }} />
          {cartCount > 0 && <span className="absolute -right-[4px] -top-[4px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-orange px-[3px] text-[10px] font-bold text-white">{cartCount}</span>}
        </button>
      </div>

      {/* Figma: 353×34 turuncu çerçeveli arama */}
      {all.length > 0 && (
        <label className="mx-[20px] mt-[15px] flex h-[34px] items-center gap-[10px] rounded-full border border-orange bg-white px-[18px]">
          <Icon name="search" size={18} className="text-teal" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search in ${shop.name}`} className="min-w-0 flex-1 bg-transparent text-[13px] font-light outline-none placeholder:italic placeholder:text-ink-soft" />
          <Icon name="mic" style={{ width: 9, height: 13 }} className="text-teal" />
        </label>
      )}

      {/* Figma: hikâye bannerı 353×122 + "Watch the story of the brand" */}
      <button onClick={() => nav.push('story', { id: shop.id })} className="pressable relative mx-[20px] mt-[20px] block h-[122px] w-[calc(100%-40px)] overflow-hidden rounded-card border border-orange text-left">
        <img src={shop.photo} alt={`${shop.owner} at ${shop.name}`} className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="absolute bottom-[8px] left-[10px] text-white">
          <span className="block text-[13px] font-semibold leading-[17px]">{shop.owner}</span>
          <span className="flex items-center gap-[6px] text-[11px]">
            <Icon name="pin" size={11} /> {distance(shop.distance)} · <Icon name="star" size={11} className="text-orange" /> {shop.rating.toFixed(1)}
          </span>
        </span>
        <span className="absolute bottom-[8px] right-[8px] flex items-center gap-[6px] rounded-full bg-black/35 px-[10px] py-[3px] text-[11px] text-white backdrop-blur-sm">
          <Icon name="play" style={{ width: 9, height: 10 }} /> Watch the story of the brand
        </span>
        <FavButton kind="shop" id={shop.id} className="absolute right-[8px] top-[8px]" />
      </button>
      <p className="mx-[20px] mt-[8px] text-[13px] font-light italic text-ink-soft">“{shop.tagline}”</p>

      {/* Figma: Categories – 55px yuvarlak görseller */}
      {shop.subs.length > 0 && (
        <>
          <Header title="Categories" color="#DC602E" onSeeAll={browsing ? () => (setSub(null), setQ('')) : undefined} seeAllLabel="Show all" />
          <div className="scroll-x flex gap-[12px] px-[20px]" style={{ scrollSnapType: 'none' }}>
            {shop.subs.map((s) => {
              const on = sub === s.id
              return (
                <button key={s.id} onClick={() => setSub(on ? null : s.id)} aria-pressed={on} className="pressable flex w-[62px] shrink-0 flex-col items-center">
                  <span className={`flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded-full bg-white ${on ? 'ring-2 ring-orange' : 'border-[0.5px] border-teal'}`}>
                    <img src={s.image} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className={`mt-[6px] w-full text-center text-[12px] leading-[15px] ${on ? 'font-semibold text-orange' : 'font-light'}`}>{s.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {browsing ? (
          <motion.section key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Header title={`${sub ? shop.subs.find((s) => s.id === sub)!.name : 'Results'} (${filtered.length})`} color="#05A8AA" />
            {filtered.length ? (
              <div className="grid grid-cols-3 gap-x-[12px] gap-y-[14px] px-[20px]">
                {filtered.map((p) => (
                  <Tile key={p.id} p={p} border="#05A8AA" />
                ))}
              </div>
            ) : (
              <p className="px-[20px] text-[14px] font-light">Nothing found — try another word.</p>
            )}
          </motion.section>
        ) : (
          <motion.div key="rows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {newRow.length > 0 && (
              <>
                <Header title={shop.category === 'food' ? 'New Flavors' : 'New Arrivals'} color="#05A8AA" />
                <Row products={newRow} border="#05A8AA" />
              </>
            )}
            {recommended.length > 0 && (
              <>
                <Header title="Recommended Products" color="#BC412B" />
                <Row products={recommended} border="#DC602E" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {events.length > 0 && (
        <>
          <Header title="Workshops" color="#DC602E" />
          <div className="flex flex-col gap-[10px] px-[20px]">
            {events.map((e) => (
              <EventCard key={e.id} event={e} wide />
            ))}
          </div>
        </>
      )}

      <p className="px-[20px] pb-2 pt-[22px] text-center text-[12px] font-light text-ink-soft">
        {shop.name} · by {shop.owner} · local since {shop.since}
      </p>
    </Screen>
  )
}

function Header({ title, color, onSeeAll, seeAllLabel = 'See All' }: { title: string; color: string; onSeeAll?: () => void; seeAllLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-[20px] pb-[10px] pt-[20px]">
      <h2 className="text-[14px] font-semibold" style={{ color }}>
        {title}
      </h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className="pressable text-[13px] font-light" style={{ color }}>
          {seeAllLabel}
        </button>
      )}
    </div>
  )
}

function Row({ products, border }: { products: Product[]; border: string }) {
  return (
    <div className="scroll-x flex gap-[20px] px-[20px] pb-[2px]" style={{ scrollSnapType: 'none' }}>
      {products.map((p) => (
        <Tile key={p.id} p={p} border={border} fixed />
      ))}
    </div>
  )
}

/** Figma: 96×96 beyaz kart, 0.5px çerçeve, köşe 10; altında ad (sol) + fiyat (sağ) */
function Tile({ p, border, fixed }: { p: Product; border: string; fixed?: boolean }) {
  const nav = useNav()
  return (
    <button onClick={() => nav.push('product', { id: p.id })} className={`pressable text-left ${fixed ? 'w-[96px] shrink-0' : 'w-full'}`}>
      <span className="relative block aspect-square overflow-hidden rounded-card bg-white shadow-[0_2px_6px_rgb(0_0_0/0.10)]" style={{ border: `0.5px solid ${border}` }}>
        <img src={p.image} alt="" className="h-full w-full object-cover" />
        {p.isNew && <span className="absolute left-[5px] top-[5px] rounded-full bg-orange px-[5px] text-[10px] font-semibold leading-[15px] text-white">New</span>}
      </span>
      <span className="mt-[5px] flex items-start justify-between gap-[4px]">
        <span className="line-clamp-2 text-[11px] leading-[14px]">{p.name}</span>
        <span className="shrink-0 text-[13px] font-semibold">{money(p.price)}</span>
      </span>
    </button>
  )
}
