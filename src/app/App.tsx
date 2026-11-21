import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { Navigator, type NavApi, type ScreenMap, type TabDef } from '../shell/navigation'
import { TabBar } from './components/TabBar'
import { Splash } from './onboarding/Splash'
import { Login } from './onboarding/Login'
import { useApp } from './store'
import { Home } from './home/Home'
import { Search } from './home/Search'
import { Categories, CategoryShops } from './categories/Categories'
import { ShopPage } from './shop/ShopPage'
import { ProductDetail } from './shop/ProductDetail'
import { Stories } from './stories/Stories'
import { Favorites } from './favorites/Favorites'
import { Cart } from './cart/Cart'
import { Checkout } from './cart/Checkout'
import { OrderConfirmed } from './cart/OrderConfirmed'
import { EventDetail } from './shop/EventDetail'
import { Profile } from './profile/Profile'
import { StoryViewer } from './stories/StoryViewer'

/* ── 1) Giriş akışı: (açılış) → Log In (alt menü yok) ── */
const introTabs: TabDef[] = [{ id: 'intro', screen: 'login' }]
const introScreens: ScreenMap = { login: Login }

/* ── 2) Ana uygulama: 5 sekme (Figma alt menüsü: Home, Favorites, Categories, Stories, Cart) ── */
const tabs: TabDef[] = [
  { id: 'home', screen: 'home' },
  { id: 'favorites', screen: 'favorites' },
  { id: 'categories', screen: 'categories' },
  { id: 'stories', screen: 'stories' },
  { id: 'cart', screen: 'cart' },
]
const screens: ScreenMap = {
  home: Home,
  search: Search,
  favorites: Favorites,
  categories: Categories,
  category: CategoryShops,
  shop: ShopPage,
  product: ProductDetail,
  story: StoryViewer,
  event: EventDetail,
  stories: Stories,
  cart: Cart,
  checkout: Checkout,
  order: OrderConfirmed,
  profile: Profile,
}

export function App() {
  const onboarded = useApp((s) => s.onboarded)
  const [splash, setSplash] = useState(!onboarded)
  const hideSplash = useCallback(() => setSplash(false), [])

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={onboarded ? 'main' : 'intro'}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          {onboarded ? (
            <Navigator tabs={tabs} initialTab="home" screens={screens} tabBar={(nav, { route }) => (NO_TAB_BAR.has(route) ? null : <CartTabBar nav={nav} />)} />
          ) : (
            <Navigator tabs={introTabs} initialTab="intro" screens={introScreens} />
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{splash && <Splash key="splash" onDone={hideSplash} />}</AnimatePresence>
    </>
  )
}

/** Tam ekran sayfalar: alt menü gizlenir */
const NO_TAB_BAR = new Set(['story'])

/** Alt menü + sepet rozeti (sepetteki toplam ürün sayısı) */
function CartTabBar({ nav }: { nav: NavApi }) {
  const count = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0))
  return <TabBar nav={nav} badge={count} />
}
