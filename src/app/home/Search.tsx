/** Arama: dükkân, ürün ve atölyeler içinde anında arama */
import { useMemo, useState } from 'react'
import { useNav } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EventCard, ShopCard } from '../components/Cards'
import { EVENTS, PRODUCTS, SHOPS, money, shopById } from '../data/catalog'

const SUGGEST = ['Sourdough', 'Candle', 'Wool', 'Pottery', 'Honey', 'Lamp']

export function Search() {
  const nav = useNav()
  const [q, setQ] = useState('')
  const t = q.trim().toLowerCase()
  const res = useMemo(() => {
    if (!t) return null
    const has = (...s: string[]) => s.some((x) => x.toLowerCase().includes(t))
    return {
      shops: SHOPS.filter((s) => has(s.name, s.owner, s.tagline)),
      products: PRODUCTS.filter((p) => has(p.name, p.desc)),
      events: EVENTS.filter((e) => has(e.title, e.desc)),
    }
  }, [t])
  const empty = res && !res.shops.length && !res.products.length && !res.events.length

  return (
    <Screen>
      <div className="flex items-center gap-[10px] px-[20px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <label className="flex h-[38px] min-w-0 flex-1 items-center gap-[10px] rounded-full border-2 border-orange bg-white px-[14px]">
          <Icon name="search" size={18} className="text-teal" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shops & products" className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:italic placeholder:text-muted" />
        </label>
      </div>

      {!res && (
        <div className="px-[20px] pt-[20px]">
          <p className="text-[14px] font-semibold text-orange">Popular in your neighborhood</p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {SUGGEST.map((s) => (
              <button key={s} onClick={() => setQ(s)} className="pressable rounded-full bg-beige px-[14px] py-[6px] text-[13px]">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {empty && <p className="px-[20px] pt-[30px] text-center text-[14px] font-light">No results for “{q}”. Try another word.</p>}

      {res && res.products.length > 0 && (
        <section className="px-[20px] pt-[18px]">
          <h2 className="pb-[8px] text-[15px] font-semibold text-orange">Products</h2>
          <ul className="flex flex-col gap-[8px]">
            {res.products.map((p) => (
              <li key={p.id}>
                <button onClick={() => nav.push('product', { id: p.id })} className="pressable flex w-full items-center gap-[12px] rounded-card bg-white/85 p-[6px] text-left">
                  <img src={p.image} alt="" className="h-[52px] w-[52px] rounded-[8px] border border-teal object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold">{p.name}</span>
                    <span className="block truncate text-[12px] font-light text-teal">{shopById(p.shopId).name}</span>
                  </span>
                  <span className="text-[14px] font-semibold">{money(p.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {res && res.shops.length > 0 && (
        <section className="px-[20px] pt-[18px]">
          <h2 className="pb-[8px] text-[15px] font-semibold text-teal">Shops</h2>
          <div className="flex flex-col gap-[12px]">
            {res.shops.map((s) => (
              <ShopCard key={s.id} shop={s} wide />
            ))}
          </div>
        </section>
      )}
      {res && res.events.length > 0 && (
        <section className="px-[20px] pt-[18px]">
          <h2 className="pb-[8px] text-[15px] font-semibold text-orange">Workshops</h2>
          <div className="flex flex-col gap-[10px]">
            {res.events.map((e) => (
              <EventCard key={e.id} event={e} wide />
            ))}
          </div>
        </section>
      )}
    </Screen>
  )
}
