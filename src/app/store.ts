/**
 * Uygulama verisi: tarayıcı hafızasında (localStorage) saklanır.
 * Demo verisiyle başlar. Gerçek kişisel bilgi ve ödeme bilgisi toplanmaz.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'vivenda-demo-v1'

interface AppState {
  /** Giriş tamamlandı mı */
  onboarded: boolean
  setOnboarded: (v: boolean) => void
  /** Favoriler */
  favShops: string[]
  favProducts: string[]
  toggleFavShop: (id: string) => boolean
  toggleFavProduct: (id: string) => boolean
  /** Bu ay desteklenen yerel işletmeler (etki sayacı) */
  supported: string[]
  /** Sepet: ürün → adet */
  cart: { productId: string; qty: number }[]
  addToCart: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  clearCart: () => void
  /** İzlenen hikâyeler (Home halkaları soluklaşır) */
  seenStories: string[]
  markStorySeen: (shopId: string) => void
  /** Siparişler (demo ödeme) */
  orders: Order[]
  placeOrder: (o: Omit<Order, 'id' | 'at'>) => Order
  /** Katılınan atölyeler */
  joinedEvents: string[]
  joinEvent: (id: string) => void
  leaveEvent: (id: string) => void
  /** Tek uygulama, iki rol: müşteri (Emily) / işletme (Cozy Bakery – Ioana) */
  mode: 'customer' | 'business'
  setMode: (m: 'customer' | 'business') => void
  /** İşletme tarafında sipariş durumları (sipariş id → durum) */
  orderStatus: Record<string, OrderStatus>
  setOrderStatus: (id: string, s: OrderStatus) => void
}

export type OrderStatus = 'new' | 'ready' | 'done'

export type Order = {
  id: string
  at: number
  items: { productId: string; qty: number; price: number }[]
  shops: string[]
  delivery: 'courier' | 'pickup'
  slot: string
  subtotal: number
  deliveryFee: number
  total: number
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      setOnboarded: (onboarded) => set({ onboarded }),
      favShops: ['cozy-bakery', 'green-nook'],
      favProducts: ['wall-shelf', 'macrame', 'ceramic-vase', 'table-lamp', 'art-prints', 'linen-pillows', 'sourdough'],
      toggleFavShop: (id) => {
        const on = !get().favShops.includes(id)
        set((s) => ({ favShops: on ? [...s.favShops, id] : s.favShops.filter((x) => x !== id) }))
        return on
      },
      toggleFavProduct: (id) => {
        const on = !get().favProducts.includes(id)
        set((s) => ({ favProducts: on ? [...s.favProducts, id] : s.favProducts.filter((x) => x !== id) }))
        return on
      },
      supported: ['rainbow-boutique', 'kumo-gifts'],
      // Figma "My Cart": Cozy Bakery – ekmek ×1, kurabiye ×4, kruvasan ×2 (toplam 7 ürün)
      cart: [
        { productId: 'sourdough', qty: 1 },
        { productId: 'walnut-cookies', qty: 4 },
        { productId: 'croissant', qty: 2 },
      ],
      addToCart: (productId, qty = 1) =>
        set((s) => {
          const has = s.cart.find((c) => c.productId === productId)
          return { cart: has ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: Math.min(20, c.qty + qty) } : c)) : [...s.cart, { productId, qty }] }
        }),
      setQty: (productId, qty) => set((s) => ({ cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty: Math.min(20, qty) } : c)) })),
      clearCart: () => set({ cart: [] }),
      orders: [],
      placeOrder: (o) => {
        const order: Order = { ...o, id: `VV-${Math.floor(1000 + Math.random() * 9000)}`, at: Date.now() }
        set((s) => ({ orders: [order, ...s.orders], cart: [], supported: [...new Set([...s.supported, ...o.shops])] }))
        return order
      },
      mode: 'customer',
      setMode: (mode) => set({ mode }),
      orderStatus: {},
      setOrderStatus: (id, st) => set((s) => ({ orderStatus: { ...s.orderStatus, [id]: st } })),
      joinedEvents: [],
      joinEvent: (id) => set((s) => (s.joinedEvents.includes(id) ? {} : { joinedEvents: [...s.joinedEvents, id] })),
      leaveEvent: (id) => set((s) => ({ joinedEvents: s.joinedEvents.filter((x) => x !== id) })),
      seenStories: [],
      markStorySeen: (id) => set((s) => (s.seenStories.includes(id) ? {} : { seenStories: [...s.seenStories, id] })),
    }),
    { name: STORAGE_KEY },
  ),
)

/** Demoyu ilk haline döndürür. */
export function resetDemo() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* gizli sekme vb. */
  }
  window.location.reload()
}
