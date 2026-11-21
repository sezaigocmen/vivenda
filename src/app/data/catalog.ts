/**
 * Vivenda demo verisi – Emily'nin mahallesi.
 * 6 kategori × 1 dükkân. Dükkân sahibi fotoğrafları ve fırın / ev dekor ürünleri Figma'dan,
 * diğer ürün ve atölye fotoğrafları Unsplash'tan (ücretsiz lisans, bkz. CREDITS.md).
 */
const glob = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([p, url]) => [p.split('/').pop()!.replace(/\.(jpg|png|svg)$/, ''), url]))
const P = glob(import.meta.glob('../../assets/products/*.jpg', { eager: true, import: 'default' }) as Record<string, string>)
const E = glob(import.meta.glob('../../assets/events/*.jpg', { eager: true, import: 'default' }) as Record<string, string>)
const S = glob(import.meta.glob('../../assets/img/*.jpg', { eager: true, import: 'default' }) as Record<string, string>)
const I = glob(import.meta.glob('../../assets/illus/*.svg', { eager: true, import: 'default' }) as Record<string, string>)

export type CategoryId = 'food' | 'home' | 'handicrafts' | 'fashion' | 'personal-care' | 'events'

export const CATEGORIES: { id: CategoryId; name: string; illus: string }[] = [
  { id: 'food', name: 'Food & Beverage', illus: I['cat-food'] },
  { id: 'home', name: 'Home & Decoration', illus: I['cat-home'] },
  { id: 'handicrafts', name: 'Handicrafts & Gifts', illus: I['cat-handicrafts'] },
  { id: 'fashion', name: 'Fashion & Accessories', illus: I['cat-fashion'] },
  { id: 'personal-care', name: 'Personal Care', illus: I['cat-personal-care'] },
  { id: 'events', name: 'Event & Workshop', illus: I['cat-events'] },
]
export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!

export type Shop = {
  id: string
  name: string
  owner: string
  category: CategoryId
  photo: string
  /** metre */
  distance: number
  rating: number
  tagline: string
  since: number
  /** Hikâye slaytları (Stories) */
  story: string[]
  subs: { id: string; name: string; image: string }[]
}

export type Product = { id: string; shopId: string; name: string; sub: string; price: number; image: string; isNew?: boolean; desc: string }

export type Event = { id: string; shopId: string; title: string; inDays: number; time: string; price: number; spots: number; image: string; desc: string }

export const SHOPS: Shop[] = [
  {
    id: 'cozy-bakery',
    name: 'Cozy Bakery',
    owner: 'Ioana Swarly',
    category: 'food',
    photo: S['shop-bakery'],
    distance: 350,
    rating: 4.9,
    since: 2011,
    tagline: 'Slow-fermented bread, baked every morning at 5.',
    story: [
      'I started Cozy Bakery with one oven and my grandmother’s sourdough starter.',
      'Every loaf rests for 36 hours — that’s where the flavour comes from.',
      'Our flour comes from a mill 40 km away, and leftovers go to the food bank each night.',
      'Come and bake with us at our Saturday sourdough workshop!',
    ],
    subs: [
      { id: 'breads', name: 'Breads', image: P['sub-breads'] },
      { id: 'pastries', name: 'Pastries', image: P['sub-pastries'] },
      { id: 'cookies', name: 'Cookies', image: P['sub-cookies'] },
      { id: 'cakes', name: 'Cakes & Desserts', image: P['sub-cakes'] },
      { id: 'gluten-free', name: 'Gluten Free', image: P['banana-cake'] },
    ],
  },
  {
    id: 'green-nook',
    name: 'Green Nook',
    owner: 'Leo Hart',
    category: 'home',
    photo: S['shop-grocer'],
    distance: 600,
    rating: 4.8,
    since: 2018,
    tagline: 'Calm, natural pieces for slow living.',
    story: [
      'Green Nook began in my garage with reclaimed wood and a lot of plants.',
      'Most of our decor is made within 100 km by small makers I know personally.',
      'We repair what we sell — bring it back any time.',
    ],
    subs: [
      { id: 'wall', name: 'Wall Decoration', image: P['macrame'] },
      { id: 'lighting', name: 'Lighting', image: P['table-lamp'] },
      { id: 'vases', name: 'Vases', image: P['ceramic-vase'] },
      { id: 'textiles', name: 'Textiles', image: P['linen-pillows'] },
    ],
  },
  {
    id: 'kumo-gifts',
    name: 'Kumo Gift Shop',
    owner: 'Kenji Mori',
    category: 'handicrafts',
    photo: S['shop-gifts'],
    distance: 850,
    rating: 4.7,
    since: 2016,
    tagline: 'Small gifts made by hand, wrapped with care.',
    story: [
      'Kumo means “cloud” — light, simple gifts that make someone’s day.',
      'Every mug and journal comes from a local artisan we visit ourselves.',
      'We wrap with recycled paper and stamps carved in the shop.',
    ],
    subs: [
      { id: 'ceramics', name: 'Ceramics', image: P['stoneware-cup'] },
      { id: 'pantry', name: 'Pantry', image: P['wildflower-honey'] },
      { id: 'paper', name: 'Paper Goods', image: P['leather-journal'] },
    ],
  },
  {
    id: 'rainbow-boutique',
    name: 'Rainbow Boutique',
    owner: 'Robin Hutson',
    category: 'fashion',
    photo: S['shop-boutique'],
    distance: 450,
    rating: 4.8,
    since: 2019,
    tagline: 'Hand-knitted colour for every season.',
    story: [
      'I learned to knit from my mum and never stopped.',
      'Our yarn is undyed wool from two family farms, coloured with plants in the back room.',
      'Thursday nights the shop turns into a knitting circle — beginners welcome.',
    ],
    subs: [
      { id: 'knitwear', name: 'Knitwear', image: P['rust-sweater'] },
      { id: 'accessories', name: 'Accessories', image: P['knit-scarf'] },
      { id: 'bags', name: 'Bags', image: P['canvas-tote'] },
    ],
  },
  {
    id: 'pure-roots',
    name: 'Pure Roots Apothecary',
    owner: 'Daniel Cruz',
    category: 'personal-care',
    photo: S['shop-apothecary'],
    distance: 1200,
    rating: 4.6,
    since: 2020,
    tagline: 'Plastic-free care, cold-pressed in small batches.',
    story: [
      'Pure Roots started as a soap experiment for my sensitive skin.',
      'Everything is plastic-free and made in batches of 40 in our back room.',
      'Bring your empty bottles back for a refill discount.',
    ],
    subs: [
      { id: 'soaps', name: 'Soaps', image: P['olive-soap'] },
      { id: 'body', name: 'Body Care', image: P['body-oil'] },
      { id: 'home-spa', name: 'Home Spa', image: P['bath-salts'] },
    ],
  },
  {
    id: 'clay-canvas',
    name: 'Clay & Canvas Studio',
    owner: 'Mira & Tom Ellis',
    category: 'events',
    photo: S['shop-couple'],
    distance: 700,
    rating: 4.9,
    since: 2015,
    tagline: 'Pottery, painting and good company.',
    story: [
      'We met at a pottery class — now we run one.',
      'Our studio is open to everyone: no experience, no problem.',
      'Each month we host a free community evening for the neighbourhood.',
    ],
    subs: [],
  },
]
export const shopById = (id: string) => SHOPS.find((s) => s.id === id)!

const p = (shopId: string, id: string, name: string, sub: string, price: number, desc: string, isNew = false): Product => ({ id, shopId, name, sub, price, image: P[id], desc, isNew })

export const PRODUCTS: Product[] = [
  // Cozy Bakery
  p('cozy-bakery', 'sourdough', 'Fresh Sourdough Bread', 'breads', 8, 'Our signature loaf — 36-hour fermentation, crisp crust and an open, tangy crumb.'),
  p('cozy-bakery', 'olive-focaccia', 'Olive Focaccia', 'breads', 9, 'Fluffy focaccia with Kalamata olives, rosemary and plenty of olive oil.', true),
  p('cozy-bakery', 'croissant', 'Handmade Croissant', 'pastries', 3.5, 'All-butter, laminated by hand over three days.'),
  p('cozy-bakery', 'cheese-pastry', 'Cheese Danish', 'pastries', 4.5, 'Flaky pastry filled with a light cream-cheese custard.'),
  p('cozy-bakery', 'walnut-cookies', 'Whole Wheat Walnut Cookies', 'cookies', 6, 'Pack of 4. Whole-wheat flour, toasted walnuts, a little brown sugar.'),
  p('cozy-bakery', 'chocolate-cookies', 'Double Chocolate Cookies', 'cookies', 7, 'Pack of 4. Dark chocolate dough with chocolate chunks.', true),
  p('cozy-bakery', 'banana-cake', 'Gluten Free Banana Cake', 'gluten-free', 18, 'Made with almond and oat flour, naturally sweet. Serves 8.', true),
  p('cozy-bakery', 'chocolate-cake', 'Chocolate Cake Slice', 'cakes', 5, 'Rich chocolate sponge with ganache — pairs well with a slice of banana bread.'),
  p('cozy-bakery', 'cheesecake', 'Vanilla Cheesecake', 'cakes', 24, 'Baked New York style on a biscuit base. Serves 8.'),
  // Green Nook
  p('green-nook', 'wall-shelf', 'Handmade Wooden Wall Shelf', 'wall', 65, 'Two-tier oak shelf hung on cotton rope. Made from reclaimed wood.'),
  p('green-nook', 'macrame', 'Woven Macrame Wall Ornament', 'wall', 30, 'Hand-knotted organic cotton on a driftwood rod.'),
  p('green-nook', 'ceramic-vase', 'Ceramic Decorative Vase', 'vases', 52, 'Matte stoneware vase, wheel-thrown by a local potter.', true),
  p('green-nook', 'table-lamp', 'Minimalist Table Lamp', 'lighting', 42, 'Ceramic base with a linen shade. Warm LED bulb included.'),
  p('green-nook', 'art-prints', 'Hand Painted Painting Set', 'wall', 18, 'Set of two abstract acrylic paintings in natural tones.'),
  p('green-nook', 'linen-pillows', 'Sustainable Cotton Pillowcase', 'textiles', 24, 'Organic cotton and linen blend, stonewashed for softness.', true),
  // Kumo Gift Shop
  p('kumo-gifts', 'stoneware-cup', 'Speckled Stoneware Cup', 'ceramics', 16, 'Hand-thrown cup with a speckled glaze. Each one is unique.', true),
  p('kumo-gifts', 'stacked-cups', 'Stacking Cup Set', 'ceramics', 38, 'Set of three nesting cups in soft white clay.'),
  p('kumo-gifts', 'wildflower-honey', 'Wildflower Honey', 'pantry', 12, 'Raw honey from hives on the edge of town.'),
  p('kumo-gifts', 'herbal-tea', 'Herbal Tea Trio', 'pantry', 15, 'Rose, chamomile and mint blends in glass jars.'),
  p('kumo-gifts', 'leather-journal', 'Leather Travel Journal', 'paper', 28, 'Vegetable-tanned leather cover with refillable paper.'),
  p('kumo-gifts', 'soy-candles', 'Soy Candle Set', 'ceramics', 22, 'Three small soy candles: fig, cedar and orange blossom.'),
  // Rainbow Boutique
  p('rainbow-boutique', 'rust-sweater', 'Rust Wool Sweater', 'knitwear', 85, 'Hand-knitted from undyed wool, coloured with madder root.', true),
  p('rainbow-boutique', 'knit-hoodie', 'Chunky Knit Hoodie', 'knitwear', 92, 'Oversized and warm, in a soft merino blend.'),
  p('rainbow-boutique', 'knit-scarf', 'Mustard Knit Scarf', 'accessories', 34, 'Long ribbed scarf in plant-dyed yellow.'),
  p('rainbow-boutique', 'wool-beanie', 'Wool Beanie', 'accessories', 22, 'Classic rib beanie — made in the shop.'),
  p('rainbow-boutique', 'wool-socks', 'Hand-knit Wool Socks', 'accessories', 18, 'Cosy grey socks with a reinforced heel.'),
  p('rainbow-boutique', 'canvas-tote', 'Canvas Market Tote', 'bags', 14, 'Heavy organic cotton tote for your local shopping.'),
  // Pure Roots
  p('pure-roots', 'olive-soap', 'Lavender Olive Oil Soap', 'soaps', 7, 'Cold-process soap with olive oil and lavender from local fields.', true),
  p('pure-roots', 'herbal-soap', 'Herbal Soap Duo', 'soaps', 12, 'Rosemary and green clay bars, wrapped in paper.'),
  p('pure-roots', 'body-oil', 'Nourishing Body Oil', 'body', 24, 'Sweet almond and jojoba oil in a refillable glass bottle.'),
  p('pure-roots', 'bath-salts', 'Lavender Bath Salts', 'home-spa', 16, 'Mineral salts with dried lavender buds.'),
  p('pure-roots', 'wooden-brush', 'Bamboo Hair Brush', 'body', 15, 'Plastic-free brush with bamboo pins.'),
  p('pure-roots', 'amber-candle', 'Amber Soy Candle', 'home-spa', 19, 'Hand-poured soy wax in an amber jar — 40 hours burn time.'),
]
export const productById = (id: string) => PRODUCTS.find((x) => x.id === id)!
export const productsOf = (shopId: string) => PRODUCTS.filter((x) => x.shopId === shopId)

export const EVENTS: Event[] = [
  { id: 'ev-sourdough', shopId: 'cozy-bakery', title: 'Sourdough Workshop', inDays: 2, time: '10:00', price: 35, spots: 4, image: E['bread-workshop'], desc: 'Learn to feed a starter, shape and score your own loaf — and take it home warm.' },
  { id: 'ev-knitting', shopId: 'rainbow-boutique', title: 'Knitting Night', inDays: 5, time: '19:00', price: 0, spots: 8, image: E['knitting-night'], desc: 'A relaxed knitting circle for all levels. Needles and tea provided.' },
  { id: 'ev-pottery', shopId: 'clay-canvas', title: 'Pottery Wheel Basics', inDays: 3, time: '18:30', price: 45, spots: 3, image: E['pottery-wheel'], desc: 'Two hours on the wheel with Tom. Your pieces are fired and ready a week later.' },
  { id: 'ev-painting', shopId: 'clay-canvas', title: 'Paint & Sip Evening', inDays: 6, time: '19:30', price: 30, spots: 10, image: E['painting-night'], desc: 'Paint a still life with Mira — all materials and a drink included.' },
  { id: 'ev-handbuild', shopId: 'clay-canvas', title: 'Hand-building with Clay', inDays: 9, time: '11:00', price: 40, spots: 6, image: E['pottery-hands'], desc: 'Make a set of small bowls without a wheel. Great for beginners.' },
]
export const eventsOf = (shopId: string) => EVENTS.filter((e) => e.shopId === shopId)

/** "Today", "Tomorrow", "Sat 23 Nov" */
export function eventDay(inDays: number, now = new Date()) {
  if (inDays === 0) return 'Today'
  if (inDays === 1) return 'Tomorrow'
  const d = new Date(now)
  d.setDate(d.getDate() + inDays)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const money = (v: number) => `$${v % 1 ? v.toFixed(2) : v}`
export const distance = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`)
