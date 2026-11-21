/** Figma: Categories (14:4) – 2×3 kart, turkuaz çerçeve, el çizimi illüstrasyonlar */
import { motion } from 'motion/react'
import { useNav, type ScreenProps } from '../../shell/navigation'
import { PageTitle, Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EventCard, HScroll, ProductCard, SectionHeader, ShopCard } from '../components/Cards'
import { CATEGORIES, EVENTS, PRODUCTS, SHOPS, categoryById, type CategoryId } from '../data/catalog'

export function Categories() {
  const nav = useNav()
  return (
    <Screen>
      <PageTitle>Categories</PageTitle>
      <div className="grid grid-cols-2 gap-x-[19px] gap-y-[25px] px-[20px] pt-[22px]">
        {CATEGORIES.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.35 }}
            onClick={() => nav.push('category', { id: c.id })}
            className="pressable flex aspect-square flex-col items-center justify-end rounded-card border border-teal bg-white pb-[12px] shadow-[0_3px_8px_rgb(0_0_0/0.10)]"
          >
            <img src={c.illus} alt="" className="mb-auto mt-[18px] h-[96px] w-auto max-w-[80%]" />
            <span className="text-[13px] font-semibold">{c.name}</span>
          </motion.button>
        ))}
      </div>
      <div className="h-4" />
    </Screen>
  )
}

/** Kategori → dükkân listesi (Figma'da yoktu) */
export function CategoryShops({ params }: ScreenProps<{ id: CategoryId }>) {
  const nav = useNav()
  const cat = categoryById(params.id)
  const shops = SHOPS.filter((s) => s.category === params.id)
  const events = params.id === 'events' ? [...EVENTS].sort((a, b) => a.inDays - b.inDays) : EVENTS.filter((e) => shops.some((s) => s.id === e.shopId))
  const products = PRODUCTS.filter((p) => shops.some((s) => s.id === p.shopId))

  return (
    <Screen>
      <div className="flex items-center gap-[12px] px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[22px] font-medium text-orange">{cat.name}</h1>
        <img src={cat.illus} alt="" className="h-[44px] w-auto" />
      </div>

      {params.id === 'events' ? (
        <>
          <SectionHeader title="Upcoming workshops" />
          <div className="flex flex-col gap-[10px] px-[20px]">
            {events.map((e) => (
              <EventCard key={e.id} event={e} wide />
            ))}
          </div>
          <SectionHeader title="Studios" color="teal" />
          <div className="flex flex-col gap-[14px] px-[20px]">
            {shops.map((s) => (
              <ShopCard key={s.id} shop={s} wide />
            ))}
          </div>
        </>
      ) : (
        <>
          <SectionHeader title={`${shops.length} local ${shops.length === 1 ? 'shop' : 'shops'} near you`} color="teal" />
          <div className="flex flex-col gap-[14px] px-[20px]">
            {shops.map((s) => (
              <ShopCard key={s.id} shop={s} wide />
            ))}
          </div>
          {products.length > 0 && (
            <>
              <SectionHeader title="Popular products" />
              <HScroll>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </HScroll>
            </>
          )}
          {events.length > 0 && (
            <>
              <SectionHeader title="Workshops" />
              <div className="flex flex-col gap-[10px] px-[20px]">
                {events.map((e) => (
                  <EventCard key={e.id} event={e} wide />
                ))}
              </div>
            </>
          )}
        </>
      )}
      <div className="h-4" />
    </Screen>
  )
}
