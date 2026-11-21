/**
 * Figma: Stories (14:5) – "Stories" başlığı, "Category" filtresi, 2 sütun uzun kartlar (167×329, turuncu çerçeve),
 * altta yarı saydam bilgi şeridi (sahip · dükkân · kategori) ve kalp.
 * Düzeltme: 7–9px yazılar okunur boyuta (11–13px) büyütüldü.
 */
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useNav, type NavApi } from '../../shell/navigation'
import { PageTitle, Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { FavButton } from '../components/Cards'
import { CATEGORIES, SHOPS, categoryById, type CategoryId } from '../data/catalog'
import { useApp } from '../store'

/** Dükkân fotoğraflarında kişinin durduğu yer (dikey kartta yüzü ortalamak için) */
export const FOCUS: Record<string, string> = { 'cozy-bakery': '22% center', 'rainbow-boutique': '64% center', 'kumo-gifts': '40% center', 'green-nook': '50% center', 'pure-roots': '47% center', 'clay-canvas': '52% center' }

export function Stories() {
  const nav = useNav()
  const seen = useApp((s) => s.seenStories)
  const [cat, setCat] = useState<CategoryId | 'all'>('all')
  const list = cat === 'all' ? SHOPS : SHOPS.filter((s) => s.category === cat)

  return (
    <Screen bg={{ crop: 'right', opacity: 0.18 }}>
      <PageTitle color="orange">Stories</PageTitle>
      <div className="flex justify-end px-[20px] pt-[12px]">
        <button onClick={() => pickCategory(nav, cat, setCat)} className="pressable flex h-[26px] items-center gap-[8px] rounded-full border border-orange bg-white px-[12px] text-[12px] font-light">
          {cat === 'all' ? 'Category' : categoryById(cat).name}
          <Icon name="chevron-down" style={{ width: 8, height: 4 }} />
        </button>
      </div>

      <motion.div layout className="grid grid-cols-2 gap-x-[19px] gap-y-[18px] px-[20px] pb-4 pt-[14px]">
        <AnimatePresence initial={false}>
          {list.map((s, i) => (
            <motion.button
              layout
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * i } }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => nav.push('story', { id: s.id })}
              className="pressable relative h-[300px] overflow-hidden rounded-card border border-orange text-left"
            >
              <img src={s.photo} alt="" className="h-full w-full object-cover" style={{ objectPosition: FOCUS[s.id] ?? '50% center' }} />
              {!seen.includes(s.id) && <span className="absolute left-[8px] top-[8px] rounded-full bg-orange px-[8px] text-[11px] font-semibold leading-[18px] text-white">New story</span>}
              <span className="absolute left-1/2 top-[42%] flex h-[40px] w-[40px] -translate-x-1/2 items-center justify-center rounded-full bg-white/80 text-orange shadow">
                <Icon name="play" style={{ width: 12, height: 13 }} />
              </span>
              {/* Figma: 165×40, %52 gri şerit */}
              <span className="absolute inset-x-[1px] bottom-[1px] flex items-center gap-[6px] rounded-[9px] bg-[#d9d9d9]/60 px-[10px] py-[6px] backdrop-blur-md">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] leading-[14px]">{s.owner}</span>
                  <span className="block truncate text-[13px] font-semibold leading-[17px]">{s.name}</span>
                  <span className="block truncate text-[11px] font-light italic leading-[14px] text-ink-soft">{categoryById(s.category).name}</span>
                </span>
                <FavButton kind="shop" id={s.id} className="!h-[26px] !w-[26px]" />
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </Screen>
  )
}

function pickCategory(nav: NavApi, value: CategoryId | 'all', onPick: (v: CategoryId | 'all') => void) {
  nav.openSheet((close) => (
    <div className="flex flex-col pb-4 pt-1">
      <h2 className="px-[20px] pb-[6px] text-[20px] font-medium text-orange">Category</h2>
      {[{ id: 'all' as const, name: 'All stories' }, ...CATEGORIES].map((c) => (
        <button
          key={c.id}
          onClick={() => {
            onPick(c.id)
            close()
          }}
          className="pressable flex h-[50px] items-center justify-between px-[20px] text-left text-[15px]"
        >
          {c.name}
          {value === c.id && <span className="font-semibold text-teal">✓</span>}
        </button>
      ))}
    </div>
  ))
}
