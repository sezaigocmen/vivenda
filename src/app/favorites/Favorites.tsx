/**
 * Figma: My Favorites (23:503) – başlık, "Choose" (Shop / Product) ve "Category" açılır menüleri,
 * 96×96 turkuaz çerçeveli görsel + ad (15/600) + alt kategori (15/300) + fiyat.
 * Düzeltmeler: "Favorities" → "Favorites", "Personel Care", boşluksuz "Food& Beverage", açılır menü içeriğin üstüne biniyordu.
 */
import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useNav } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { CATEGORIES, categoryById, distance, money, productById, shopById, type CategoryId } from '../data/catalog'
import { useApp } from '../store'

type Kind = 'product' | 'shop'

export function Favorites() {
  const nav = useNav()
  const favProducts = useApp((s) => s.favProducts)
  const favShops = useApp((s) => s.favShops)
  const toggleProduct = useApp((s) => s.toggleFavProduct)
  const toggleShop = useApp((s) => s.toggleFavShop)
  const addToCart = useApp((s) => s.addToCart)
  const [kind, setKind] = useState<Kind>('product')
  const [cat, setCat] = useState<CategoryId | 'all'>('all')
  const [open, setOpen] = useState<'kind' | 'cat' | null>(null)

  const products = favProducts.map(productById).filter((p) => cat === 'all' || shopById(p.shopId).category === cat)
  const shops = favShops.map(shopById).filter((s) => cat === 'all' || s.category === cat)
  const count = kind === 'product' ? products.length : shops.length

  return (
    <Screen bg={{ crop: 'right', opacity: 0.1 }}>
      {/* Başlık + iki açılır menü (Figma: 85×19, turuncu çerçeve) */}
      <div className="relative z-20 flex items-center justify-between px-[20px] pt-[8px]">
        <h1 className="text-[20px] font-medium leading-[27px] text-teal">My Favorites</h1>
        <div className="flex gap-[8px]">
          <Dropdown label={kind === 'product' ? 'Products' : 'Shops'} open={open === 'kind'} onToggle={() => setOpen(open === 'kind' ? null : 'kind')}>
            {(['product', 'shop'] as Kind[]).map((k) => (
              <Option key={k} on={kind === k} onClick={() => (setKind(k), setOpen(null))}>
                {k === 'product' ? 'Products' : 'Shops'}
              </Option>
            ))}
          </Dropdown>
          <Dropdown label={cat === 'all' ? 'Category' : categoryById(cat).name.split(' ')[0]} open={open === 'cat'} onToggle={() => setOpen(open === 'cat' ? null : 'cat')} wide>
            <Option on={cat === 'all'} onClick={() => (setCat('all'), setOpen(null))}>
              All categories
            </Option>
            {CATEGORIES.map((c) => (
              <Option key={c.id} on={cat === c.id} onClick={() => (setCat(c.id), setOpen(null))}>
                {c.name}
              </Option>
            ))}
          </Dropdown>
        </div>
      </div>
      {open && <button aria-label="Close menu" className="absolute inset-0 z-10 cursor-default" onClick={() => setOpen(null)} />}

      <p className="px-[20px] pt-[6px] text-[12px] font-light text-ink-soft">
        {count} {kind === 'product' ? (count === 1 ? 'product' : 'products') : count === 1 ? 'shop' : 'shops'}
        {cat !== 'all' && ` in ${categoryById(cat).name}`}
      </p>

      <ul className="flex flex-col gap-[20px] px-[20px] pb-4 pt-[14px]">
        <AnimatePresence initial={false}>
          {kind === 'product'
            ? products.map((p) => (
                <motion.li key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, height: 0 }} className="flex gap-[20px]">
                  <button onClick={() => nav.push('product', { id: p.id })} className="pressable h-[96px] w-[96px] shrink-0 overflow-hidden rounded-card border-[0.5px] border-teal bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12)]">
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <button onClick={() => nav.push('product', { id: p.id })} className="pressable text-left">
                      <span className="line-clamp-2 block text-[15px] font-semibold leading-[20px]">{p.name}</span>
                      <span className="block truncate text-[14px] font-light leading-[20px]">{shopById(p.shopId).subs.find((s) => s.id === p.sub)?.name}</span>
                    </button>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-[15px] font-semibold">{money(p.price)}</span>
                      <span className="flex items-center gap-[8px]">
                        <button
                          aria-label="Add to cart"
                          onClick={() => (addToCart(p.id), toast(`Added ${p.name} to your cart`))}
                          className="pressable flex h-[30px] items-center gap-[4px] rounded-full bg-teal px-[10px] text-[12px] font-semibold text-white"
                        >
                          <Icon name="nav-cart" style={{ width: 13, height: 13 }} /> Add
                        </button>
                        <button aria-label="Remove from favorites" onClick={() => (toggleProduct(p.id), toast('Removed from favorites'))} className="pressable flex h-[30px] w-[30px] items-center justify-center rounded-full bg-beige text-orange">
                          <Icon name="heart-on" size={15} />
                        </button>
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))
            : shops.map((s) => (
                <motion.li key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, height: 0 }} className="flex gap-[20px]">
                  <button onClick={() => nav.push('shop', { id: s.id })} className="pressable h-[96px] w-[96px] shrink-0 overflow-hidden rounded-card border-[0.5px] border-teal bg-white shadow-[0_3px_8px_rgb(0_0_0/0.12)]">
                    <img src={s.photo} alt="" className="h-full w-full object-cover" />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <button onClick={() => nav.push('shop', { id: s.id })} className="pressable text-left">
                      <span className="block truncate text-[15px] font-semibold leading-[20px]">{s.name}</span>
                      <span className="block truncate text-[14px] font-light leading-[20px]">{categoryById(s.category).name}</span>
                      <span className="block truncate text-[12px] font-light text-ink-soft">
                        by {s.owner} · {distance(s.distance)}
                      </span>
                    </button>
                    <div className="mt-auto flex items-center justify-end gap-[8px]">
                      <button onClick={() => nav.push('story', { id: s.id })} className="pressable flex h-[30px] items-center gap-[5px] rounded-full border border-orange px-[10px] text-[12px] font-semibold text-orange">
                        <Icon name="play" style={{ width: 8, height: 9 }} /> Story
                      </button>
                      <button aria-label="Remove from favorites" onClick={() => (toggleShop(s.id), toast('Removed from favorites'))} className="pressable flex h-[30px] w-[30px] items-center justify-center rounded-full bg-beige text-orange">
                        <Icon name="heart-on" size={15} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
        </AnimatePresence>
      </ul>

      {count === 0 && (
        <div className="flex flex-col items-center px-[32px] pt-[30px] text-center">
          <Icon name="heart-line" size={40} className="text-orange" />
          <p className="mt-[10px] text-[16px] font-semibold">No favorites here yet</p>
          <p className="mt-[4px] text-[13px] font-light">Tap the heart on any {kind === 'product' ? 'product' : 'shop'} to save it.</p>
          <button onClick={() => nav.setTab('categories')} className="pressable mt-[14px] h-[40px] rounded-card bg-orange px-[18px] text-[14px] font-semibold text-white">
            Explore categories
          </button>
        </div>
      )}
    </Screen>
  )
}

function Dropdown({ label, open, onToggle, wide, children }: { label: string; open: boolean; onToggle: () => void; wide?: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <button onClick={onToggle} aria-expanded={open} className={`pressable flex h-[26px] min-w-[85px] items-center justify-between gap-[6px] rounded-full border border-orange bg-white px-[10px] text-[12px] font-light ${open ? 'bg-beige' : ''}`}>
        {label}
        <Icon name="chevron-down" style={{ width: 8, height: 4 }} className={`text-orange transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-[30px] overflow-hidden rounded-[12px] border border-orange bg-white py-[4px] shadow-[0_6px_18px_rgb(0_0_0/0.12)] ${wide ? 'w-[190px]' : 'w-[120px]'}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Option({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between px-[12px] py-[7px] text-left text-[13px] ${on ? 'bg-beige font-semibold' : 'font-light'}`}>
      {children}
      {on && <span className="text-teal">✓</span>}
    </button>
  )
}
