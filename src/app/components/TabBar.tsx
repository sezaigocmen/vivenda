/**
 * Figma: alt menü – 38×38 turkuaz kareler, ortada büyük turuncu "Categories" butonu.
 * Seçili sekme turuncu olur (Figma: Favorites ve Cart ekranlarında seçili buton turuncu).
 */
import { motion } from 'motion/react'
import type { NavApi } from '../../shell/navigation'
import { Icon } from './Icon'

const TABS = [
  { id: 'home', label: 'Home', icon: 'nav-home', w: 17, h: 19 },
  { id: 'favorites', label: 'Favorites', icon: 'nav-heart', w: 19, h: 16 },
  { id: 'categories', label: 'Categories', icon: 'nav-categories', w: 26, h: 26, big: true },
  { id: 'stories', label: 'Stories', icon: 'nav-stories', w: 20, h: 20 },
  { id: 'cart', label: 'Cart', icon: 'nav-cart', w: 19, h: 20 },
] as const

/** Sayfa içeriğinin alt menünün arkasında kalmaması için bırakılacak boşluk */
export const TAB_BAR_SPACE = 'calc(58px + max(var(--safe-bottom), 8px) + 16px)'

export function TabBar({ nav, badge }: { nav: NavApi; badge?: number }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-[200] bg-nav/80 backdrop-blur-md" style={{ paddingBottom: 'max(var(--safe-bottom), 8px)' }}>
      <div className="flex h-[58px] items-center justify-between px-[20px]">
        {TABS.map((t) => {
          const selected = nav.tab === t.id
          const big = 'big' in t
          return (
            <button
              key={t.id}
              aria-label={t.label}
              aria-current={selected ? 'page' : undefined}
              onClick={() => nav.setTab(t.id)}
              className={`pressable relative flex items-center justify-center rounded-card text-white shadow-[0_2px_6px_rgb(0_0_0/0.12)] ${big ? '-mt-[20px] h-[53px] w-[53px] border border-beige' : 'h-[38px] w-[38px]'}`}
              style={{ background: selected ? '#DC602E' : '#05A8AA' }}
            >
              <Icon name={t.icon} style={{ width: t.w, height: t.h }} />
              {t.id === 'cart' && !!badge && (
                <motion.span key={badge} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="absolute -right-[6px] -top-[6px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-[4px] text-[11px] font-bold text-white ring-2 ring-white">
                  {badge}
                </motion.span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
