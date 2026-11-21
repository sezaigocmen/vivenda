/**
 * Atölye detayı ve kayıt (storyboard: "Emily participated in the workshop, making her bread and meeting the baker").
 * Demo: yer ayırma ücretsiz simüle edilir, ödeme alınmaz.
 */
import { motion } from 'motion/react'
import { useNav, type ScreenProps } from '../../shell/navigation'
import { toast } from '../../shell/toast'
import { Screen } from '../components/Screen'
import { Icon } from '../components/Icon'
import { EVENTS, distance, eventDay, money, shopById } from '../data/catalog'
import { useApp } from '../store'

export function EventDetail({ params }: ScreenProps<{ id: string }>) {
  const nav = useNav()
  const e = EVENTS.find((x) => x.id === params.id)!
  const shop = shopById(e.shopId)
  const joined = useApp((s) => s.joinedEvents.includes(e.id))
  const join = useApp((s) => s.joinEvent)
  const leave = useApp((s) => s.leaveEvent)
  const spots = e.spots - (joined ? 1 : 0)

  return (
    <Screen bg={{ crop: 'center', opacity: 0.18 }}>
      <div className="flex items-center gap-[12px] px-[20px] pt-[2px]">
        <button aria-label="Back" onClick={nav.pop} className="pressable flex h-[36px] w-[36px] items-center justify-center rounded-full bg-beige text-teal">
          <Icon name="back" size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-[20px] font-medium text-orange">Workshop</h1>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-[20px] mt-[14px] overflow-hidden rounded-card border border-orange bg-white">
        <img src={e.image} alt="" className="h-[210px] w-full object-cover" />
      </motion.div>

      <div className="px-[20px] pt-[14px]">
        <h2 className="text-[22px] font-semibold leading-[28px]">{e.title}</h2>
        <button onClick={() => nav.push('shop', { id: shop.id })} className="pressable mt-[4px] flex items-center gap-[8px] text-[14px] text-teal">
          <img src={shop.photo} alt="" className="h-[24px] w-[24px] rounded-full object-cover" />
          {shop.name} · with {shop.owner}
        </button>
        <div className="mt-[12px] grid grid-cols-3 gap-[8px] text-center">
          <Info icon="calendar" top={eventDay(e.inDays)} bottom={e.time} />
          <Info icon="pin" top={distance(shop.distance)} bottom="from you" />
          <Info icon="nav-cart" top={e.price ? money(e.price) : 'Free'} bottom={`${spots} spots left`} />
        </div>
        <p className="mt-[14px] text-[14px] font-light leading-[21px]">{e.desc}</p>
      </div>

      <div className="px-[20px] pb-4 pt-[18px]">
        {joined ? (
          <>
            <div className="flex items-center gap-[10px] rounded-card bg-sage/70 px-[14px] py-[12px]">
              <span className="text-[24px]">🎉</span>
              <span className="text-[14px]">
                <b className="font-semibold">You’re in!</b> See you {eventDay(e.inDays).toLowerCase() === 'today' ? 'today' : `on ${eventDay(e.inDays)}`} at {e.time}.
              </span>
            </div>
            <button onClick={() => (leave(e.id), toast('Booking cancelled'))} className="pressable mx-auto mt-[10px] block text-[13px] font-light text-ink-soft underline underline-offset-2">
              Cancel booking
            </button>
          </>
        ) : (
          <button
            onClick={() => (join(e.id), toast(`Spot booked for ${e.title}`))}
            className="pressable h-[48px] w-full rounded-card bg-orange text-[16px] font-semibold text-white shadow-[0_4px_12px_rgb(220_96_46/0.3)]"
          >
            Book a spot {e.price ? `· ${money(e.price)}` : '· Free'}
          </button>
        )}
        <p className="mt-[8px] text-center text-[12px] font-light text-ink-soft">Demo booking — no payment is taken.</p>
      </div>
    </Screen>
  )
}

function Info({ icon, top, bottom }: { icon: string; top: string; bottom: string }) {
  return (
    <div className="rounded-card bg-beige/80 px-[6px] py-[8px]">
      <Icon name={icon} size={16} className="text-orange" />
      <p className="mt-[2px] text-[13px] font-semibold">{top}</p>
      <p className="text-[11px] font-light">{bottom}</p>
    </div>
  )
}
