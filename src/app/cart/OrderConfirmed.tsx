/**
 * Sipariş onayı – storyboard: "After payment is confirmed, Emily sees a bread-making workshop…"
 * ve "You supported 1 local business this month". Onay animasyonu, teslimat bilgisi, etki kartı, atölye önerisi.
 */
import { motion } from 'motion/react'
import { useNav, type ScreenProps } from '../../shell/navigation'
import { Screen } from '../components/Screen'
import { EventCard } from '../components/Cards'
import { EVENTS, money, shopById } from '../data/catalog'
import { useApp } from '../store'

export function OrderConfirmed({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav()
  const order = useApp((s) => s.orders.find((o) => o.id === params.id))
  const supported = useApp((s) => s.supported.length)
  if (!order) return <Screen>{null}</Screen>
  const shops = order.shops.map(shopById)
  const events = EVENTS.filter((e) => order.shops.includes(e.shopId))
  const suggest = events.length ? events : EVENTS.slice(0, 1)

  return (
    <Screen bg={{ crop: 'center', opacity: 0.18 }}>
      <div className="flex flex-col items-center px-[24px] pt-[18px] text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }} className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-teal text-white shadow-[0_8px_24px_rgb(5_168_170/0.35)]">
          <motion.svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.45 }} />
          </motion.svg>
        </motion.div>
        <h1 className="mt-[16px] text-[26px] font-medium text-orange">Order placed!</h1>
        <p className="mt-[4px] text-[14px] font-light">
          {shops.map((s) => s.name).join(' & ')} {shops.length > 1 ? 'are' : 'is'} preparing your order.
        </p>
        <div className="mt-[16px] w-full rounded-card border border-teal bg-white/90 p-[14px] text-left text-[14px]">
          <div className="flex justify-between">
            <span className="font-light">Order</span>
            <span className="font-semibold">{order.id}</span>
          </div>
          <div className="mt-[4px] flex justify-between">
            <span className="font-light">{order.delivery === 'courier' ? '🚲 Bike delivery' : '🛍️ Pick up'}</span>
            <span className="font-semibold">{order.slot}</span>
          </div>
          <div className="mt-[4px] flex justify-between">
            <span className="font-light">Paid (demo)</span>
            <span className="font-semibold text-teal">{money(order.total)}</span>
          </div>
        </div>

        {/* Etki – storyboard'daki mesaj */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-[14px] flex w-full items-center gap-[12px] rounded-card bg-sage/70 px-[14px] py-[12px] text-left">
          <span className="text-[28px]">💚</span>
          <span>
            <span className="block text-[15px] font-semibold leading-[20px]">
              You supported {supported} local {supported === 1 ? 'business' : 'businesses'} this month
            </span>
            <span className="block text-[12px] font-light">Thanks for keeping your neighborhood alive.</span>
          </span>
        </motion.div>
      </div>

      <h2 className="px-[20px] pb-[10px] pt-[22px] text-[15px] font-medium text-orange">Meet the makers</h2>
      <div className="flex flex-col gap-[10px] px-[20px]">
        {suggest.map((e) => (
          <EventCard key={e.id} event={e} wide />
        ))}
      </div>

      <div className="flex gap-[10px] px-[20px] pb-4 pt-[20px]">
        <button onClick={() => (nav.pop(), setTimeout(() => nav.setTab('home'), 300))} className="pressable h-[46px] flex-1 rounded-card bg-beige text-[15px] font-semibold">
          Back to Home
        </button>
        <button onClick={() => nav.push('story', { id: order.shops[0] })} className="pressable h-[46px] flex-1 rounded-card bg-orange text-[15px] font-semibold text-white">
          Watch their story
        </button>
      </div>
    </Screen>
  )
}
