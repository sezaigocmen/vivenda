/**
 * Home – Figma'da yoktu; onaylı "Mahalleni keşfet" düzeni.
 * Selamlama + arama, hikâye halkaları, yakındaki dükkânlar, bu haftaki etkinlikler, yeni ürünler ve etki kartı.
 */
import { motion } from 'motion/react'
import { useNav } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EventCard, HScroll, ProductCard, SectionHeader, ShopCard } from '../components/Cards'
import { EVENTS, PRODUCTS, SHOPS } from '../data/catalog'
import { useApp } from '../store'

export function Home() {
  const nav = useNav()
  const supported = useApp((s) => s.supported.length)
  const seen = useApp((s) => s.seenStories)
  const near = [...SHOPS].sort((a, b) => a.distance - b.distance)
  const week = [...EVENTS].filter((e) => e.inDays <= 7).sort((a, b) => a.inDays - b.inDays)
  const fresh = PRODUCTS.filter((p) => p.isNew)

  return (
    <Screen>
      {/* Selamlama */}
      <div className="px-[20px] pt-[4px]">
        <p className="text-[24px] font-medium leading-[32px] text-teal">Hi Emily 👋</p>
        <p className="text-[14px] font-light text-ink-soft">Rediscover your neighborhood</p>
      </div>

      {/* Figma (dükkân sayfası): turuncu çerçeveli arama çubuğu */}
      <button onClick={() => nav.push('search')} className="pressable mx-[20px] mt-[14px] flex h-[38px] w-[calc(100%-40px)] items-center gap-[10px] rounded-full border-2 border-orange bg-white/90 px-[16px] text-left">
        <Icon name="search" size={18} className="text-teal" />
        <span className="flex-1 text-[13px] font-light italic text-ink-soft">Search shops & products</span>
        <Icon name="mic" style={{ width: 9, height: 13 }} className="text-teal" />
      </button>

      {/* Hikâye halkaları */}
      <div className="scroll-x mt-[18px] flex gap-[14px] px-[20px]" style={{ scrollSnapType: 'none' }}>
        {SHOPS.map((s, i) => (
          <button key={s.id} onClick={() => nav.push('story', { id: s.id })} className="pressable flex w-[64px] shrink-0 flex-col items-center">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.04 * i }}
              className="rounded-full p-[2.5px]"
              style={{ background: seen.includes(s.id) ? '#D9D9D9' : 'conic-gradient(#DC602E, #05A8AA, #DC602E)' }}
            >
              <span className="block rounded-full bg-white p-[2px]">
                <img src={s.photo} alt="" className="h-[54px] w-[54px] rounded-full object-cover" />
              </span>
            </motion.span>
            <span className="mt-[4px] w-full truncate text-center text-[11px]">{s.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <SectionHeader title="Near you" color="teal" onSeeAll={() => nav.setTab('categories')} />
      <HScroll>
        {near.map((s) => (
          <ShopCard key={s.id} shop={s} />
        ))}
      </HScroll>

      <SectionHeader title="This week" onSeeAll={() => nav.push('category', { id: 'events' })} />
      <HScroll>
        {week.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </HScroll>

      <SectionHeader title="New in your neighborhood" color="teal" />
      <HScroll>
        {fresh.map((p) => (
          <ProductCard key={p.id} product={p} showShop />
        ))}
      </HScroll>

      {/* Etki kartı (storyboard: "You supported 1 local business this month") */}
      <div className="mx-[20px] mt-[24px] flex items-center gap-[14px] rounded-card bg-sage/60 px-[16px] py-[14px]">
        <span className="text-[30px]">💚</span>
        <div>
          <p className="text-[15px] font-semibold leading-[21px]">
            You supported {supported} local {supported === 1 ? 'business' : 'businesses'} this month
          </p>
          <p className="text-[12px] font-light leading-[17px] text-ink-soft">Shopping nearby keeps your neighborhood alive — and cuts delivery emissions.</p>
        </div>
      </div>
      <div className="h-4" />
    </Screen>
  )
}
