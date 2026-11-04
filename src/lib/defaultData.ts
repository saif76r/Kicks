import { Product, ShoeCategory, StoreSettings } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  bkashNumber: '01631025840',
  bkashAccountType: 'Personal',
  nagadNumber: '01706695247',
  nagadAccountType: 'Personal',
  whatsappNumber: '01706695247',
  standardDeliveryCharge: 120,
  freeDeliveryThreshold: 5000,
  storeName: 'KICKS',
  supportPhone: '+880 1706695247',
  supportEmail: 'support@kicksstore.com',
  currencySymbol: '৳'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kicks-prod-1',
    name: "KICKS Nitro Apex 'Electric Fire'",
    brand: 'KICKS Lab',
    category: 'Running Shoes',
    price: 6850,
    originalPrice: 8200,
    stock: 14,
    availableSizes: [40, 41, 42, 43, 44, 45],
    images: [
      '/assets/images/kicks_hero_sneaker_1793611731340.jpg',
      '/assets/images/sneaker_runner_velocity_1793611731024.jpg'
    ],
    description: 'Engineered for high-intensity movement and boundary-pushing road runs. Features dual-density nitrogen-infused foam, structured carbon shank, and hyper-breathable engineered monomesh upper with dynamic stability cradles.',
    featured: true,
    newArrival: true,
    rating: 4.9,
    reviewCount: 48,
    sku: 'KCK-NITRO-01',
    materials: 'Nitrogen Foam Midsole, Engineered Monomesh, High-Abrasion Rubber Outsole'
  },
  {
    id: 'kicks-prod-2',
    name: "Velocity High-Top 'Off-White Charcoal'",
    brand: 'Velocity Studio',
    category: 'Sneakers',
    price: 5400,
    originalPrice: 6200,
    stock: 8,
    availableSizes: [39, 40, 41, 42, 43, 44],
    images: [
      '/assets/images/sneaker_air_pulse_1793611730783.jpg',
      '/assets/images/sneaker_urban_court_1793611730956.jpg'
    ],
    description: 'An elevated street icon. Crafted with full-grain off-white calfskin leather, supple dark charcoal suede overlays, padded ankle collar, and tactile industrial orange rope laces with metal eyelets.',
    featured: true,
    newArrival: true,
    rating: 4.8,
    reviewCount: 62,
    sku: 'VEL-HI-02',
    materials: 'Full-Grain Calfskin, Italian Suede, Vintage Cupsole Rubber'
  },
  {
    id: 'kicks-prod-3',
    name: "SpeedFuel Velocity Elite 'Graphite'",
    brand: 'SpeedFuel',
    category: 'Running Shoes',
    price: 7200,
    originalPrice: 8500,
    stock: 12,
    availableSizes: [40, 41, 42, 43, 44, 45],
    images: [
      '/assets/images/sneaker_runner_velocity_1793611731024.jpg',
      '/assets/images/kicks_hero_sneaker_1793611731340.jpg'
    ],
    description: 'World Athletics regulation race-day shoe. Dual carbon-composite rocker plate designed to propel forward momentum with max-energy return EnergyFoam cushioning.',
    featured: true,
    newArrival: false,
    rating: 4.95,
    reviewCount: 84,
    sku: 'SPF-ELITE-03',
    materials: 'Ultralight Ripstop Mesh, Full-Length Carbon Plate, Pebax Midsole'
  },
  {
    id: 'kicks-prod-4',
    name: "Heritage Court Retro Low 'Chalk & Gum'",
    brand: 'Monochrome',
    category: 'Casual Shoes',
    price: 4600,
    originalPrice: 5100,
    stock: 19,
    availableSizes: [39, 40, 41, 42, 43, 44, 45],
    images: [
      '/assets/images/sneaker_urban_court_1793611730956.jpg',
      '/assets/images/sneaker_air_pulse_1793611730783.jpg'
    ],
    description: 'Timeless minimalism in its purest form. Soft pebble-textured chalk leather, hand-stitched reinforcement panels, vegetable-tanned leather footbed, and honey gum rubber outsole.',
    featured: true,
    newArrival: false,
    rating: 4.75,
    reviewCount: 39,
    sku: 'MNC-CRT-04',
    materials: 'Pebble Leather, Natural Gum Rubber Sole, Cork Ergonomic Insole'
  },
  {
    id: 'kicks-prod-5',
    name: "AeroStrike Pro Basketball High",
    brand: 'HyperCourt',
    category: 'Sports Shoes',
    price: 5900,
    originalPrice: 7000,
    stock: 7,
    availableSizes: [41, 42, 43, 44, 45],
    images: [
      '/assets/images/kicks_hero_sneaker_1793611731340.jpg',
      '/assets/images/sneaker_air_pulse_1793611730783.jpg'
    ],
    description: 'High-octane indoor hardwood court performance. Multidirectional herringbone traction pods, internal TPU torsion bridge, and dynamic lace lock system for lockdown defense.',
    featured: false,
    newArrival: true,
    rating: 4.7,
    reviewCount: 29,
    sku: 'HPR-AERO-05',
    materials: 'Fused Synthetic Armor, Microfiber Tongue, Non-Marking Rubber'
  },
  {
    id: 'kicks-prod-6',
    name: "Kingsman Handcrafted Derby 'Espresso'",
    brand: 'Kingsman Heritage',
    category: 'Formal Shoes',
    price: 8900,
    originalPrice: 10500,
    stock: 5,
    availableSizes: [40, 41, 42, 43, 44],
    images: [
      '/assets/images/sneaker_urban_court_1793611730956.jpg',
      '/assets/images/sneaker_air_pulse_1793611730783.jpg'
    ],
    description: 'Handcrafted Goodyear welted derby shoes made from vegetable-tanned Italian calfskin. Hand-burnished espresso finish with stacked leather heel and Goodyear storm welt.',
    featured: true,
    newArrival: false,
    rating: 5.0,
    reviewCount: 18,
    sku: 'KNG-DERBY-06',
    materials: 'Grade-A Italian Box Calf, Leather Outsole with Brass Nails'
  },
  {
    id: 'kicks-prod-7',
    name: "Pulse Trainer Air Flex 'Eclipse'",
    brand: 'KICKS Lab',
    category: 'Sports Shoes',
    price: 4200,
    originalPrice: 4800,
    stock: 16,
    availableSizes: [40, 41, 42, 43, 44],
    images: [
      '/assets/images/sneaker_runner_velocity_1793611731024.jpg',
      '/assets/images/kicks_hero_sneaker_1793611731340.jpg'
    ],
    description: 'Multi-discipline gym and HIIT cross-trainer. Wide flat heel provides sturdy lifting platform, while flex-grooves on the forefoot allow explosive plyometric sprints.',
    featured: false,
    newArrival: true,
    rating: 4.6,
    reviewCount: 31,
    sku: 'KCK-FLEX-07',
    materials: 'Knit Mesh, Ortholite Sockliner, High-Density EVA'
  },
  {
    id: 'kicks-prod-8',
    name: "Venice Minimalist Loafer 'Sandstone'",
    brand: 'Monochrome',
    category: 'Casual Shoes',
    price: 4900,
    originalPrice: 5600,
    stock: 9,
    availableSizes: [39, 40, 41, 42, 43, 44],
    images: [
      '/assets/images/sneaker_urban_court_1793611730956.jpg',
      '/assets/images/sneaker_air_pulse_1793611730783.jpg'
    ],
    description: 'Effortless slip-on comfort made from water-resistant split suede with unlined vamp for airy breathability during summer days or casual meetings.',
    featured: false,
    newArrival: false,
    rating: 4.8,
    reviewCount: 22,
    sku: 'MNC-LOAF-08',
    materials: 'Italian Split Suede, Cushioned Memory Foam Insole'
  }
];

export const CATEGORIES_METADATA: { name: ShoeCategory; description: string; image: string; count: number }[] = [
  {
    name: 'Sneakers',
    description: 'Iconic street style, heritage silhouettes & limited drops',
    image: '/assets/images/sneaker_air_pulse_1793611730783.jpg',
    count: 24
  },
  {
    name: 'Running Shoes',
    description: 'Nitrogen foam, carbon plates & aerodynamic performance',
    image: '/assets/images/kicks_hero_sneaker_1793611731340.jpg',
    count: 18
  },
  {
    name: 'Sports Shoes',
    description: 'Court-ready grip, basketball lockdown & training support',
    image: '/assets/images/sneaker_runner_velocity_1793611731024.jpg',
    count: 15
  },
  {
    name: 'Casual Shoes',
    description: 'Clean leather low-tops, retro sneakers & slip-ons',
    image: '/assets/images/sneaker_urban_court_1793611730956.jpg',
    count: 21
  },
  {
    name: 'Formal Shoes',
    description: 'Goodyear welted derbies, oxfords & handcrafted leather',
    image: '/assets/images/sneaker_urban_court_1793611730956.jpg',
    count: 9
  }
];
