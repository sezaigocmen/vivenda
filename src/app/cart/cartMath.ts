/** Sepet hesapları – tek yerden (Figma'daki "-$12" ve teslimatsız toplam hatası burada düzeltildi) */
import { productById, shopById } from '../data/catalog'
import { useApp } from '../store'

/** Dükkân başına bisikletli kurye ücreti (1 km altı / üstü) */
export const courierFee = (distanceM: number) => (distanceM < 1000 ? 2.5 : 3.5)
export const round2 = (v: number) => Math.round(v * 100) / 100

export function useCartSummary() {
  const cart = useApp((s) => s.cart)
  const lines = cart.map((c) => ({ ...c, product: productById(c.productId) }))
  const shopIds = [...new Set(lines.map((l) => l.product.shopId))]
  const groups = shopIds.map((id) => ({ shop: shopById(id), lines: lines.filter((l) => l.product.shopId === id) }))
  const count = lines.reduce((a, l) => a + l.qty, 0)
  const subtotal = round2(lines.reduce((a, l) => a + l.qty * l.product.price, 0))
  const courier = round2(groups.reduce((a, g) => a + courierFee(g.shop.distance), 0))
  return { lines, groups, count, subtotal, courier }
}
