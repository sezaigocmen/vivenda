/**
 * Figma: tüm ekranlarda ortak üst bar (solda küçük logo + "Vivenda", sağda bildirim ve profil)
 * ve arkada Figma ile aynı yerleşim ve soluklukta şehir/pazar illüstrasyonu.
 */
import type { ReactNode } from 'react'
import { useNav } from '../../shell/navigation'
import { Icon } from './Icon'
import { toast } from '../../shell/toast'
import { TAB_BAR_SPACE } from './TabBar'
import logo from '../../assets/brand/logo-small.svg'
import city from '../../assets/img/city-bg.jpg'

/**
 * Figma: "Rectangle 33" – şehir illüstrasyonu. Ekranın altına yaslı 393×649 alan (üstten 203px boşluk),
 * görsel yüksekliğe sığdırılır (649px → genişlik ≈1190px) ve yatayda Figma'daki kırpma noktasından gösterilir.
 * - 'center' (Log In, Categories): FILL, ortalı, %18
 * - 'shop'   (dükkân sayfası): STRETCH, görselin %40'ından başlar, %10
 * - 'right'  (Stories %18, Cart / Favorites %10): görselin %55'inden başlar
 */
export type CityBgVariant = { crop: 'center' | 'shop' | 'right'; opacity: number }
const CROP_X = { center: 'center', shop: '-475px', right: '-658px' }

export function CityBg({ crop = 'center', opacity = 0.18 }: Partial<CityBgVariant>) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[649px]"
      style={{ backgroundImage: `url(${city})`, backgroundSize: 'auto 100%', backgroundRepeat: 'no-repeat', backgroundPosition: `${CROP_X[crop]} bottom`, opacity }}
    />
  )
}

export function Screen({ children, tabBar = true, header = true, bg = { crop: 'center', opacity: 0.18 } }: { children: ReactNode; tabBar?: boolean; header?: boolean; bg?: CityBgVariant | false }) {
  return (
    <div className="relative flex h-full flex-col bg-bg text-ink">
      {bg && <CityBg {...bg} />}
      {header && <TopBar />}
      <main className="scroll-y relative min-h-0 flex-1" style={{ paddingBottom: tabBar ? TAB_BAR_SPACE : 'max(var(--safe-bottom), 16px)' }}>
        {children}
      </main>
    </div>
  )
}

function TopBar() {
  const nav = useNav()
  return (
    <header className="relative shrink-0" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="flex h-[56px] items-center justify-between px-[20px]">
        <button onClick={() => nav.setTab('home')} className="pressable flex items-center gap-[2px]" aria-label="Vivenda home">
          <img src={logo} alt="" className="h-[28px] w-[38px]" />
          <span className="text-[15px] font-semibold text-teal">Vivenda</span>
        </button>
        <div className="flex items-center gap-[16px] text-orange">
          <button aria-label="Notifications" onClick={() => toast('You’re all caught up 🎉')} className="pressable -m-1 p-1">
            <Icon name="bell" style={{ width: 20, height: 22 }} />
          </button>
          <button aria-label="Profile" onClick={() => nav.push('profile')} className="pressable -m-1 p-1">
            <Icon name="user" style={{ width: 21, height: 21 }} />
          </button>
        </div>
      </div>
    </header>
  )
}

/** Sayfa başlığı (Figma: 32px turkuaz, ortalı) */
export function PageTitle({ children, color = 'teal' }: { children: ReactNode; color?: 'teal' | 'orange' }) {
  return <h1 className={`pt-[8px] text-center text-[32px] font-medium leading-[44px] ${color === 'teal' ? 'text-teal' : 'text-orange'}`}>{children}</h1>
}
