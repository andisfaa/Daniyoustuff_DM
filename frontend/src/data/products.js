// ============================================================
// Daniyou Stuff – Product Catalog Data
// 4 main product types with configurable variants
// ============================================================

export const CATEGORIES = {
  BULAT: 'Papan Bulat',
  KUBAH: 'Papan Kubah',
  FLOWERBOX: 'Flowerbox',
  BESAR: 'Papan Besar',
};

export const THEMES = [
  { id: 'semhas', label: 'Seminar Hasil (Semhas)' },
  { id: 'wisuda', label: 'Wisuda' },
  { id: 'ulang_tahun', label: 'Ulang Tahun' },
  { id: 'pernikahan', label: 'Pernikahan' },
  { id: 'baby_shower', label: 'Baby Shower' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'lulus_snbp', label: 'Lulus SNBP/SNBT' },
  { id: 'lainnya', label: 'Lainnya' },
];

// Color palette for board visuals (CSS gradient strings)
const PALETTES = {
  'Pink Soft':     'linear-gradient(135deg, #FFB6C1 0%, #FFDDE1 100%)',
  'Pink Merah':    'linear-gradient(135deg, #FF6B9D 0%, #FF8E9E 50%, #FFB6C1 100%)',
  'Kuning':        'linear-gradient(135deg, #FFD700 0%, #FFE44D 50%, #FFF0A0 100%)',
  'Biru':          'linear-gradient(135deg, #4FC3F7 0%, #81D4FA 100%)',
  'Merah':         'linear-gradient(135deg, #EF5350 0%, #FF8A80 100%)',
  'Biru Hijau':    'linear-gradient(135deg, #26C6DA 0%, #4DB6AC 100%)',
  'Merah Hit':     'linear-gradient(135deg, #B71C1C 0%, #424242 50%, #212121 100%)',
  'Biru Navy':     'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%)',
  'Biru Elektrik': 'linear-gradient(135deg, #2979FF 0%, #448AFF 50%, #82B1FF 100%)',
  'Pink Biru':     'linear-gradient(135deg, #FF6B9D 0%, #C77DFF 50%, #4FC3F7 100%)',
  'Ungu':          'linear-gradient(135deg, #9C27B0 0%, #CE93D8 50%, #E1BEE7 100%)',
  'Pink':          'linear-gradient(135deg, #E91E8C 0%, #FF6B9D 50%, #FFB6C1 100%)',
  'Merah Pink':    'linear-gradient(135deg, #EF5350 0%, #FF6B9D 100%)',
  'Biru Soft':     'linear-gradient(135deg, #B3E5FC 0%, #81D4FA 50%, #4FC3F7 100%)',
  'Biru Pink':     'linear-gradient(135deg, #4FC3F7 0%, #C77DFF 50%, #FF6B9D 100%)',
  'Navy':          'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%)',
  'Merah Hitam Putih': 'linear-gradient(135deg, #EF5350 0%, #424242 50%, #FAFAFA 100%)',
};

// Board color for Papan Bulat
const BOARD_COLORS = {
  'Putih': '#FAFAFA',
  'Abu':   '#9E9E9E',
};

// ── Product definitions (4 main products) ──────────────────
export const products = [
  {
    id: 'papan-bulat',
    name: 'Papan Bulat',
    category: CATEGORIES.BULAT,
    size: '60×60 cm',
    price: 60000,
    description: 'Papan bulat elegan dengan berbagai pilihan warna dekorasi. Cocok untuk momen wisuda, semhas, ulang tahun, dan acara spesial lainnya. Dilengkapi custom teks dan dekorasi bunga segar.',
    features: ['Frame kayu premium', 'Dekorasi bunga segar', 'Custom teks & nama', 'Dapat difoto dari semua sisi'],
    gradient: PALETTES['Pink Soft'],
    shape: 'round',
    available: true,
    stock: 5,
    variants: {
      boardColor: ['Putih', 'Abu'],
      decorColor: ['Pink Soft', 'Pink Merah', 'Kuning', 'Biru', 'Merah', 'Biru Hijau', 'Merah Hit', 'Biru Navy', 'Biru Elektrik'],
      layout: ['Lurus', 'Miring'],
    },
    boardColorMap: BOARD_COLORS,
  },
  {
    id: 'papan-kubah',
    name: 'Papan Kubah',
    category: CATEGORIES.KUBAH,
    size: '50×70 cm',
    price: 60000,
    description: 'Papan kubah unik dengan bentuk melengkung yang elegan. Tersedia dalam berbagai pilihan warna yang menawan untuk segala momen istimewamu.',
    features: ['Bentuk kubah unik', 'Dekorasi bunga segar', 'Custom teks & nama', 'Tinggi & menawan'],
    gradient: PALETTES['Biru Navy'],
    shape: 'dome',
    available: true,
    stock: 5,
    variants: {
      warna: ['Biru Navy', 'Pink Biru', 'Pink Soft', 'Kuning', 'Pink Merah', 'Biru', 'Ungu', 'Pink', 'Merah Pink', 'Biru Soft', 'Merah', 'Biru Hijau', 'Biru Pink'],
      layout: ['Lurus', 'Miring'],
    },
  },
  {
    id: 'flowerbox',
    name: 'Flowerbox',
    category: CATEGORIES.FLOWERBOX,
    size: 'Custom',
    price: 70000, // base price (Portrait)
    description: 'Flowerbox eksklusif dengan bunga premium dan kotak elegan. Tersedia dalam model Portrait dan Landscape. Pilihan sempurna untuk hadiah dan dekorasi momen istimewa.',
    features: ['Kotak floral premium', 'Bunga segar pilihan', 'Ribbon dekoratif', 'Cocok untuk hadiah'],
    gradient: PALETTES['Pink'],
    shape: 'box',
    available: true,
    stock: 4,
    variants: {
      warna: ['Pink', 'Merah Pink'],
      model: [
        { name: 'Potrait', price: 70000 },
        { name: 'Landscape', price: 85000 },
      ],
    },
  },
  {
    id: 'papan-besar',
    name: 'Papan Besar',
    category: CATEGORIES.BESAR,
    size: '60×80 cm',
    price: 100000,
    description: 'Papan besar premium ukuran 60×80 cm yang megah dan impactful. Pesan terlihat jelas dari jauh, sempurna untuk wisuda dan acara besar.',
    features: ['Ukuran extra large', 'Frame premium', 'Dekorasi bunga mewah', 'Impactful & megah'],
    gradient: PALETTES['Navy'],
    shape: 'large',
    available: true,
    stock: 2,
    variants: {
      warna: ['Navy', 'Merah Hitam Putih'],
    },
  },
];

export const getProductById = (id) => products.find((p) => p.id === id);
export const getProductsByCategory = (cat) =>
  cat === 'all' ? products : products.filter((p) => p.category === cat);

export const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

export const getGradient = (colorName) => PALETTES[colorName] || PALETTES['Pink Soft'];
export const getBoardColor = (colorName) => BOARD_COLORS[colorName] || BOARD_COLORS['Putih'];

export { PALETTES, BOARD_COLORS };
