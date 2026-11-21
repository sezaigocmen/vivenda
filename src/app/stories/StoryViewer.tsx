/**
 * Hikâye izleyici – "video" yerine onaylı çözüm: Instagram hikâyesi gibi tam ekran, kendiliğinden ilerleyen
 * fotoğraf slaytları (yavaş yakınlaşma = Ken Burns). Sağa/sola dokununca ileri/geri, basılı tutunca durur.
 * Storyboard: "Emily watches a story video about the bakery's bread-making process."
 */
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useNav, type ScreenProps } from '../../shell/navigation'

import { FavButton } from '../components/Cards'
import { SHOPS, eventsOf, productsOf, shopById } from '../data/catalog'
import { useApp } from '../store'
import { FOCUS } from './Stories'

const DURATION = 4800

function ShopStory({ shopId, onShop, wasDragged }: { shopId: string; onShop: (dir: 1 | -1) => void; wasDragged: () => boolean }) {
  const nav = useNav()
  const shop = shopById(shopId)
  const markSeen = useApp((s) => s.markStorySeen)
  const products = productsOf(shop.id)
  const event = eventsOf(shop.id)[0]

  // Slayt görselleri: dükkân → ürünler → atölye
  const images = [shop.photo, ...products.slice(0, 2).map((p) => p.image), event?.image].filter(Boolean) as string[]
  const slides = shop.story.map((text, i) => ({ text, image: images[i % images.length], isShop: i % images.length === 0 }))

  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const last = i === slides.length - 1
  const started = useRef(0)
  const elapsed = useRef(0)

  useEffect(() => markSeen(shop.id), [markSeen, shop.id])

  // İlerleme zamanlayıcısı (duraklatılabilir)
  useEffect(() => {
    if (paused) return
    started.current = performance.now() - elapsed.current
    let raf = 0
    const tick = () => {
      const t = performance.now() - started.current
      elapsed.current = t
      setProgress(Math.min(1, t / DURATION))
      if (t >= DURATION) {
        go(1)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i, paused]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d: number) => {
    const n = i + d
    if (n < 0) return onShop(-1)
    if (n >= slides.length) return onShop(1)
    elapsed.current = 0
    setProgress(0)
    setI(n)
  }

  const s = slides[i]
  const origin = ['30% 40%', '70% 50%', '50% 30%', '40% 60%'][i % 4]

  return (
    <div className="relative h-full w-full overflow-hidden bg-black text-white select-none">
      {/* Görsel – yavaş yakınlaşma */}
      <AnimatePresence initial={false}>
        <motion.img
          key={i}
          src={s.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transformOrigin: origin, objectPosition: s.isShop ? FOCUS[shop.id] : 'center' }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: paused ? undefined : 1.14 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.45 }, scale: { duration: DURATION / 1000 + 0.6, ease: 'linear' } }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

      {/* Dokunma alanları: sol = geri, sağ = ileri, basılı tut = dur */}
      <div
        className="absolute inset-0 z-10 flex"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        <button aria-label="Previous" className="h-full w-1/3" onClick={() => !wasDragged() && go(-1)} />
        <button aria-label="Next" className="h-full w-2/3" onClick={() => !wasDragged() && go(1)} />
      </div>

      {/* Üst: ilerleme çubukları + dükkân + kapat */}
      <div className="absolute inset-x-0 top-0 z-20 px-[12px]" style={{ paddingTop: 'calc(var(--safe-top) + 8px)' }}>
        <div className="flex gap-[4px]">
          {slides.map((_, k) => (
            <span key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
              <span className="block h-full bg-white" style={{ width: `${k < i ? 100 : k === i ? progress * 100 : 0}%` }} />
            </span>
          ))}
        </div>
        <div className="mt-[10px] flex items-center gap-[10px]">
          <img src={shop.photo} alt="" className="h-[36px] w-[36px] rounded-full border-2 border-orange object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold leading-[18px]">{shop.name}</p>
            <p className="truncate text-[12px] font-light leading-[16px] opacity-85">
              {shop.owner} · local since {shop.since}
            </p>
          </div>
          <button aria-label="Close" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-black/25 text-[22px] leading-none">
            ×
          </button>
        </div>
      </div>

      {/* Alt: hikâye metni + son slaytta dükkâna git */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-[20px]" style={{ paddingBottom: 'calc(max(var(--safe-bottom), 12px) + 16px)' }}>
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="text-[20px] font-medium leading-[28px] [text-shadow:0_1px_8px_rgb(0_0_0/0.5)]">
            “{s.text}”
          </motion.p>
        </AnimatePresence>
        <p className="mt-[6px] text-[13px] font-light opacity-85">— {shop.owner}</p>
        <div className="mt-[16px] flex items-center gap-[10px]">
          <button onClick={() => nav.push('shop', { id: shop.id })} className={`pressable h-[44px] flex-1 rounded-card text-[15px] font-semibold ${last ? 'bg-orange text-white' : 'bg-white/20 text-white backdrop-blur'}`}>
            Visit {shop.name}
          </button>
          <FavButton kind="shop" id={shop.id} className="!h-[44px] !w-[44px]" />
        </div>
      </div>

      {paused && <span className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-1 text-[12px]">Paused</span>}
    </div>
  )
}


/**
 * Dükkânlar arası geçiş (Instagram gibi): sağa/sola kaydırınca bir önceki / sonraki dükkânın hikâyesi gelir.
 * Bir hikâye bitince sıradaki dükkâna kendiliğinden geçer; son dükkândan sonra kapanır.
 */
export function StoryViewer({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav()
  const [idx, setIdx] = useState(() => Math.max(0, SHOPS.findIndex((s) => s.id === params.id)))
  const [dir, setDir] = useState<1 | -1>(1)
  const dragged = useRef(0)

  const goShop = (d: 1 | -1) => {
    const n = idx + d
    if (n < 0) return
    if (n >= SHOPS.length) return nav.pop()
    setDir(d)
    setIdx(n)
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={SHOPS[idx].id}
          custom={dir}
          className="absolute inset-0"
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', scale: 0.92, opacity: 0.6 }),
            center: { x: 0, scale: 1, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? '-35%' : '35%', scale: 0.9, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragStart={() => (dragged.current = Date.now())}
          onDragEnd={(_, info) => {
            dragged.current = Date.now()
            if (info.offset.x < -70 || info.velocity.x < -450) goShop(1)
            else if (info.offset.x > 70 || info.velocity.x > 450) goShop(-1)
          }}
        >
          <ShopStory shopId={SHOPS[idx].id} onShop={goShop} wasDragged={() => Date.now() - dragged.current < 250} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
