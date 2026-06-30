// Step 23 — Seed realistic Algerian electronics catalog.
// WARNING: wipes the Products collection before inserting.
// Usage: npm run seed
//
// Slugs are generated manually here because insertMany bypasses the
// pre-save hook that would normally auto-generate them.

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const slug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PRODUCTS = [
  // ── Phones ────────────────────────────────────────────────────────
  {
    name: 'Samsung Galaxy S25 Ultra',
    slug: slug('Samsung Galaxy S25 Ultra'),
    description: 'Smartphone haut de gamme avec stylet S Pen intégré, appareil photo 200 MP et processeur Snapdragon 8 Elite.',
    category: 'phones', brand: 'Samsung',
    price: 185000, salePrice: 175000,
    stock: 5, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 24,
    tags: ['flagship', '5g', 's-pen'],
    specs: { Écran: '6.9" Dynamic AMOLED 2X', RAM: '12 Go', Stockage: '256 Go', Batterie: '5000 mAh', OS: 'Android 15' },
    images: [],
  },
  {
    name: 'iPhone 15 Pro Max',
    slug: slug('iPhone 15 Pro Max'),
    description: 'Titanium design, puce A17 Pro, système de caméra Pro avec zoom optique 5x.',
    category: 'phones', brand: 'Apple',
    price: 210000, salePrice: null,
    stock: 3, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['flagship', '5g', 'ios'],
    specs: { Écran: '6.7" Super Retina XDR', Puce: 'A17 Pro', Stockage: '256 Go', Batterie: '4422 mAh', OS: 'iOS 17' },
    images: [],
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro',
    slug: slug('Xiaomi Redmi Note 13 Pro'),
    description: 'Excellent rapport qualité-prix avec écran AMOLED 120 Hz et charge rapide 67W.',
    category: 'phones', brand: 'Xiaomi',
    price: 58000, salePrice: 52000,
    stock: 12, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['milieu-de-gamme', '5g'],
    specs: { Écran: '6.67" AMOLED 120Hz', RAM: '8 Go', Stockage: '256 Go', Batterie: '5100 mAh' },
    images: [],
  },
  {
    name: 'Samsung Galaxy A55',
    slug: slug('Samsung Galaxy A55'),
    description: 'Design élégant, appareil photo polyvalent et grande autonomie pour un usage quotidien.',
    category: 'phones', brand: 'Samsung',
    price: 72000, salePrice: 65000,
    stock: 8, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 24,
    tags: ['milieu-de-gamme', '5g'],
    specs: { Écran: '6.6" Super AMOLED 120Hz', RAM: '8 Go', Stockage: '128 Go', Batterie: '5000 mAh' },
    images: [],
  },
  {
    name: 'IRIS Speed 7 Pro',
    slug: slug('IRIS Speed 7 Pro'),
    description: 'Smartphone algérien robuste avec grande batterie, idéal pour un usage intensif.',
    category: 'phones', brand: 'IRIS',
    price: 28000, salePrice: null,
    stock: 20, isFeatured: false, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['algerien', 'budget'],
    specs: { Écran: '6.5" IPS LCD', RAM: '4 Go', Stockage: '64 Go', Batterie: '5000 mAh' },
    images: [],
  },
  {
    name: 'Oppo Reno 12 Pro',
    slug: slug('Oppo Reno 12 Pro'),
    description: 'Design premium ultra-fin, appareil photo avec IA et recharge rapide SUPERVOOC 80W.',
    category: 'phones', brand: 'Oppo',
    price: 95000, salePrice: 88000,
    stock: 6, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['milieu-haut-de-gamme', '5g'],
    specs: { Écran: '6.7" AMOLED 120Hz', RAM: '12 Go', Stockage: '256 Go', Batterie: '5000 mAh' },
    images: [],
  },
  {
    name: 'Infinix Hot 40 Pro',
    slug: slug('Infinix Hot 40 Pro'),
    description: 'Grand écran, bonne autonomie et triple caméra à un prix accessible.',
    category: 'phones', brand: 'Infinix',
    price: 32000, salePrice: null,
    stock: 15, isFeatured: false, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['budget'],
    specs: { Écran: '6.78" AMOLED 90Hz', RAM: '8 Go', Stockage: '256 Go', Batterie: '5000 mAh' },
    images: [],
  },

  // ── Accessories ───────────────────────────────────────────────────
  {
    name: 'Écouteurs JBL Tune 510BT',
    slug: slug('Ecouteurs JBL Tune 510BT'),
    description: 'Son JBL Pure Bass, 40h d\'autonomie, Bluetooth 5.0 et repliable pour la mobilité.',
    category: 'accessories', brand: 'JBL',
    price: 8500, salePrice: 7200,
    stock: 25, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['audio', 'bluetooth', 'sans-fil'],
    specs: { Type: 'Supra-auriculaire', Autonomie: '40 heures', Connectivité: 'Bluetooth 5.0', Micro: 'Intégré' },
    images: [],
  },
  {
    name: 'Chargeur Rapide Anker 65W GaN',
    slug: slug('Chargeur Rapide Anker 65W GaN'),
    description: 'Chargeur compact GaN 65W compatible USB-C Power Delivery, charge rapide multi-appareils.',
    category: 'accessories', brand: 'Anker',
    price: 4500, salePrice: null,
    stock: 30, isFeatured: false, isActive: true,
    condition: 'new', warrantyMonths: 18,
    tags: ['chargeur', 'usb-c', 'charge-rapide'],
    specs: { Puissance: '65W', Ports: 'USB-C + USB-A', Technologie: 'GaN III', Poids: '118g' },
    images: [],
  },
  {
    name: 'Batterie externe Baseus 20000mAh',
    slug: slug('Batterie externe Baseus 20000mAh'),
    description: 'Grande capacité 20000mAh, charge rapide 22.5W, 2 ports USB et 1 port USB-C.',
    category: 'accessories', brand: 'Baseus',
    price: 6000, salePrice: 5200,
    stock: 18, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['batterie-externe', 'charge-rapide'],
    specs: { Capacité: '20000 mAh', Charge: '22.5W', Ports: '2x USB-A + 1x USB-C', Poids: '390g' },
    images: [],
  },

  // ── TVs ───────────────────────────────────────────────────────────
  {
    name: 'Samsung 55" 4K UHD Smart TV',
    slug: slug('Samsung 55 4K UHD Smart TV'),
    description: 'Téléviseur 55 pouces 4K Crystal UHD avec Tizen OS, HDR10+ et accès aux applications streaming.',
    category: 'tvs', brand: 'Samsung',
    price: 125000, salePrice: 112000,
    stock: 4, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 24,
    tags: ['4k', 'smart-tv', 'hdr'],
    specs: { Taille: '55 pouces', Résolution: '4K UHD (3840×2160)', HDR: 'HDR10+', OS: 'Tizen', 'Taux de rafraîchissement': '60Hz' },
    images: [],
  },
  {
    name: 'LG 50" NanoCell 4K Smart TV',
    slug: slug('LG 50 NanoCell 4K Smart TV'),
    description: 'Technologie NanoCell pour des couleurs précises, processeur α7 Gen6 et WebOS 23.',
    category: 'tvs', brand: 'LG',
    price: 105000, salePrice: null,
    stock: 3, isFeatured: false, isActive: true,
    condition: 'new', warrantyMonths: 24,
    tags: ['4k', 'smart-tv', 'nanocell'],
    specs: { Taille: '50 pouces', Résolution: '4K UHD', Technologie: 'NanoCell', OS: 'WebOS 23' },
    images: [],
  },

  // ── Gaming ────────────────────────────────────────────────────────
  {
    name: 'PlayStation 5 Slim',
    slug: slug('PlayStation 5 Slim'),
    description: 'Console next-gen plus compacte avec SSD ultra-rapide, ray tracing et 4K 120fps.',
    category: 'gaming', brand: 'Sony',
    price: 98000, salePrice: null,
    stock: 2, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['console', 'next-gen', '4k'],
    specs: { CPU: 'AMD Zen 2 8 cœurs', GPU: 'AMD RDNA 2 10.3 TFLOPS', SSD: '1 To', 'Sortie vidéo': '4K 120fps' },
    images: [],
  },
  {
    name: 'Manette Xbox Series Wireless',
    slug: slug('Manette Xbox Series Wireless'),
    description: 'Manette Xbox Series avec grip texturé, bouton partage et Bluetooth pour PC/Xbox/mobile.',
    category: 'gaming', brand: 'Microsoft',
    price: 12000, salePrice: 10500,
    stock: 10, isFeatured: false, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['manette', 'xbox', 'bluetooth'],
    specs: { Compatibilité: 'Xbox Series X|S, Xbox One, PC, Mobile', Connectivité: 'Bluetooth + USB-C', Autonomie: '40 heures' },
    images: [],
  },

  // ── Laptops ───────────────────────────────────────────────────────
  {
    name: 'HP 15 AMD Ryzen 5',
    slug: slug('HP 15 AMD Ryzen 5'),
    description: 'PC portable 15,6 pouces performant avec Ryzen 5, idéal pour le travail et les études.',
    category: 'laptops', brand: 'HP',
    price: 78000, salePrice: 72000,
    stock: 5, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['pc-portable', 'amd', 'travail'],
    specs: { Processeur: 'AMD Ryzen 5 7520U', RAM: '8 Go DDR5', Stockage: '512 Go SSD NVMe', Écran: '15.6" FHD IPS', OS: 'Windows 11' },
    images: [],
  },
  {
    name: 'Lenovo IdeaPad Gaming 3',
    slug: slug('Lenovo IdeaPad Gaming 3'),
    description: 'PC portable gamer abordable avec GPU RTX 3050, écran 144Hz et clavier rétroéclairé.',
    category: 'laptops', brand: 'Lenovo',
    price: 115000, salePrice: 105000,
    stock: 3, isFeatured: true, isActive: true,
    condition: 'new', warrantyMonths: 12,
    tags: ['gaming', 'rtx', '144hz'],
    specs: { Processeur: 'Intel Core i5-12450H', GPU: 'NVIDIA RTX 3050 4Go', RAM: '16 Go DDR5', Stockage: '512 Go SSD', Écran: '15.6" FHD 144Hz' },
    images: [],
  },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('⚠️  Wiping Products collection...');
  await Product.deleteMany({});
  console.log('✓ Collection cleared.');

  const inserted = await Product.insertMany(PRODUCTS);
  console.log(`✓ Seeded ${inserted.length} products.`);

  const featured = inserted.filter((p) => p.isFeatured).length;
  console.log(`  • ${featured} featured  |  ${inserted.length - featured} not featured`);

  await mongoose.disconnect();
  console.log('Done.');
}).catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
