/**
 * STACKLY - BOUTIQUE API SERVICE
 * Connects to DummyJSON Products API
 * STRICT: Fetches Fashion & Apparel Data with 100% Ultra-Realistic Boutique Photography
 */

const API_BASE_URL = 'https://dummyjson.com/products';

// Pure Fashion & Apparel Categories in DummyJSON
const BOUTIQUE_FASHION_CATEGORIES = [
  'womens-dresses',
  'mens-shirts',
  'womens-bags',
  'sunglasses',
  'womens-jewellery',
  'womens-shoes',
  'mens-shoes',
  'tops'
];

// Curated high-resolution, realistic editorial fashion photography matching real boutique websites (Local WebP under 90KB)
const REALISTIC_FASHION_PHOTOS = {
  dresses: [
    'images/products/dress-1.webp',
    'images/products/dress-2.webp',
    'images/products/dress-3.webp',
    'images/products/dress-4.webp',
    'images/products/dress-5.webp',
    'images/products/dress-6.webp',
    'images/products/dress-7.webp'
  ],
  shirts: [
    'images/products/shirt-1.webp',
    'images/products/shirt-2.webp',
    'images/products/shirt-3.webp',
    'images/products/shirt-4.webp',
    'images/products/shirt-5.webp'
  ],
  bags: [
    'images/products/bag-1.webp',
    'images/products/bag-2.webp',
    'images/products/bag-3.webp',
    'images/products/bag-4.webp'
  ],
  sunglasses: [
    'images/products/sunglasses-1.webp',
    'images/products/sunglasses-2.webp',
    'images/products/sunglasses-3.webp',
    'images/products/sunglasses-4.webp'
  ],
  shoes: [
    'images/products/shoe-1.webp',
    'images/products/shoe-2.webp',
    'images/products/shoe-3.webp'
  ],
  jewelry: [
    'images/products/jewelry-1.webp',
    'images/products/jewelry-2.webp',
    'images/products/jewelry-3.webp'
  ]
};

const ApiService = {
  cachedProducts: null,

  /**
   * Fetches only fashion apparel and boutique items
   */
  async getAllProducts(limit = 30) {
    if (this.cachedProducts && this.cachedProducts.length >= 15) {
      return this.cachedProducts;
    }

    try {
      // Fetch multiple fashion categories in parallel for 100% pure fashion content
      const categoryPromises = BOUTIQUE_FASHION_CATEGORIES.map(cat => 
        fetch(`${API_BASE_URL}/category/${cat}?limit=5`)
          .then(res => res.ok ? res.json() : { products: [] })
          .catch(() => ({ products: [] }))
      );

      const categoryResults = await Promise.all(categoryPromises);
      let combinedProducts = [];

      categoryResults.forEach(res => {
        if (res.products && Array.isArray(res.products)) {
          combinedProducts.push(...res.products);
        }
      });

      // If category endpoints return products, use them
      if (combinedProducts.length >= 15) {
        this.cachedProducts = this.enrichProductData(combinedProducts.slice(0, limit));
        return this.cachedProducts;
      }

      // Fallback: fetch products and filter out non-fashion
      const res = await fetch(`${API_BASE_URL}?limit=50`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const fashionFiltered = data.products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return BOUTIQUE_FASHION_CATEGORIES.some(f => cat.includes(f.replace('womens-', '').replace('mens-', ''))) ||
               cat.includes('dress') || cat.includes('shirt') || cat.includes('shoe') || 
               cat.includes('bag') || cat.includes('jewel') || cat.includes('sunglasses') || cat.includes('clothing');
      });

      this.cachedProducts = this.enrichProductData(fashionFiltered.length >= 15 ? fashionFiltered : data.products);
      return this.cachedProducts;
    } catch (error) {
      console.error('Failed to fetch fashion products from DummyJSON:', error);
      throw error;
    }
  },

  /**
   * Search products by query term
   */
  async searchProducts(query) {
    const all = await this.getAllProducts(30);
    const q = query.toLowerCase().trim();
    return all.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  },

  /**
   * Enriches API products with realistic boutique photography and metadata
   */
  enrichProductData(products) {
    return products.map(p => this.formatSingleProduct(p));
  },

  formatSingleProduct(p) {
    const originalPrice = parseFloat(p.price) || 49.99;
    const discount = p.discountPercentage ? parseFloat(p.discountPercentage) : 15;
    const struckPrice = (originalPrice / (1 - (discount / 100))).toFixed(2);
    
    // Human-friendly category label
    let catLabel = p.category ? p.category.replace(/-/g, ' ') : 'Boutique Couture';
    catLabel = catLabel.replace(/\b\w/g, c => c.toUpperCase());

    // Resolve ultra-realistic, authentic boutique photography
    const rawCat = (p.category || '').toLowerCase();
    const titleLower = (p.title || '').toLowerCase();
    const id = p.id || Math.floor(Math.random() * 100);

    let realisticPhoto = '';
    let galleryImages = [];

    // 1. Direct title-specific matching for 100% exact, proper boutique photos
    if (titleLower.includes('black') && (titleLower.includes('gown') || titleLower.includes('dress'))) {
      realisticPhoto = 'images/products/dress-2.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/dress-4.webp',
        'images/products/dress-1.webp'
      ];
    } else if (titleLower.includes('corset') && titleLower.includes('leather')) {
      realisticPhoto = 'images/products/corset-leather.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/corset-skirt.webp',
        'images/products/dress-5.webp'
      ];
    } else if (titleLower.includes('corset') || (titleLower.includes('skirt') && titleLower.includes('black'))) {
      realisticPhoto = 'images/products/corset-skirt.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/dress-5.webp',
        'images/products/dress-4.webp'
      ];
    } else if (titleLower.includes('pea') || (titleLower.includes('dress') && (titleLower.includes('floral') || titleLower.includes('summer')))) {
      realisticPhoto = 'images/products/dress-3.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/dress-6.webp',
        'images/products/dress-1.webp'
      ];
    } else if (titleLower.includes('marni') || (titleLower.includes('red') && titleLower.includes('black') && (titleLower.includes('suit') || titleLower.includes('dress')))) {
      realisticPhoto = 'images/products/dress-5.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/dress-1.webp'
      ];
    } else if (titleLower.includes('blue') && titleLower.includes('check')) {
      realisticPhoto = 'images/products/shirt-4.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shirt-3.webp'
      ];
    } else if (titleLower.includes('tshirt') || titleLower.includes('t-shirt') || titleLower.includes('aorus')) {
      realisticPhoto = 'images/products/tshirt-aorus.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shirt-3.webp'
      ];
    } else if (titleLower.includes('plaid')) {
      realisticPhoto = 'images/products/shirt-1.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shirt-4.webp'
      ];
    } else if (titleLower.includes('short sleeve')) {
      realisticPhoto = 'images/products/shirt-short-sleeve.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shirt-3.webp'
      ];
    } else if (titleLower.includes('check shirt') || titleLower.includes('check-shirt')) {
      realisticPhoto = 'images/products/shirt-3.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shirt-4.webp'
      ];
    } else if (titleLower.includes('blue') && (titleLower.includes('bag') || titleLower.includes('handbag'))) {
      realisticPhoto = 'images/products/bag-blue.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/bag-1.webp'
      ];
    } else if (titleLower.includes('leather bag') || titleLower.includes('heshe') || (titleLower.includes('women') && titleLower.includes('bag'))) {
      realisticPhoto = 'images/products/bag-2.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/bag-3.webp'
      ];
    } else if (titleLower.includes('heel') || titleLower.includes('calvin klein')) {
      realisticPhoto = 'images/products/shoes-heels.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shoe-1.webp'
      ];
    } else if (titleLower.includes('jordan') || (titleLower.includes('nike') && (titleLower.includes('red') || titleLower.includes('shoe')))) {
      realisticPhoto = 'images/products/shoes-jordan.webp';
      galleryImages = [
        realisticPhoto,
        'images/products/shoe-2.webp'
      ];
    } else {
      // 2. Strict category isolation (no accidental "women" matching "men")
      const isWomensBags = rawCat === 'womens-bags' || (rawCat.includes('bag') && !rawCat.includes('shoe')) || titleLower.includes('handbag') || titleLower.includes('tote') || (titleLower.includes('bag') && !titleLower.includes('shirt'));
      const isShoes = rawCat.includes('shoe') || titleLower.includes('shoe') || titleLower.includes('heel') || titleLower.includes('boot') || titleLower.includes('sneaker') || titleLower.includes('trainer') || titleLower.includes('jordan');
      const isSunglasses = rawCat.includes('sunglasses') || titleLower.includes('sunglasses') || titleLower.includes('shades');
      const isJewelry = rawCat.includes('jewel') || titleLower.includes('jewel') || titleLower.includes('ring') || titleLower.includes('necklace') || titleLower.includes('earring');
      const isMensClothing = (rawCat === 'mens-shirts' || (rawCat.includes('men') && !rawCat.includes('women') && !rawCat.includes('shoe')) || titleLower.includes('shirt') || titleLower.includes('tshirt') || titleLower.includes('suit') || titleLower.includes('blazer')) && !isWomensBags && !isShoes && !isJewelry;

      if (isWomensBags) {
        const idx = id % REALISTIC_FASHION_PHOTOS.bags.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.bags[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.bags[(idx + 1) % REALISTIC_FASHION_PHOTOS.bags.length]
        ];
      } else if (isShoes) {
        const idx = id % REALISTIC_FASHION_PHOTOS.shoes.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.shoes[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.shoes[(idx + 1) % REALISTIC_FASHION_PHOTOS.shoes.length]
        ];
      } else if (isSunglasses) {
        const idx = id % REALISTIC_FASHION_PHOTOS.sunglasses.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.sunglasses[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.sunglasses[(idx + 1) % REALISTIC_FASHION_PHOTOS.sunglasses.length]
        ];
      } else if (isJewelry) {
        const idx = id % REALISTIC_FASHION_PHOTOS.jewelry.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.jewelry[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.jewelry[(idx + 1) % REALISTIC_FASHION_PHOTOS.jewelry.length]
        ];
      } else if (isMensClothing) {
        const idx = id % REALISTIC_FASHION_PHOTOS.shirts.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.shirts[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.shirts[(idx + 1) % REALISTIC_FASHION_PHOTOS.shirts.length],
          REALISTIC_FASHION_PHOTOS.shirts[(idx + 2) % REALISTIC_FASHION_PHOTOS.shirts.length]
        ];
      } else {
        const idx = id % REALISTIC_FASHION_PHOTOS.dresses.length;
        realisticPhoto = REALISTIC_FASHION_PHOTOS.dresses[idx];
        galleryImages = [
          realisticPhoto,
          REALISTIC_FASHION_PHOTOS.dresses[(idx + 1) % REALISTIC_FASHION_PHOTOS.dresses.length],
          REALISTIC_FASHION_PHOTOS.dresses[(idx + 2) % REALISTIC_FASHION_PHOTOS.dresses.length]
        ];
      }
    }

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: catLabel,
      rawCategory: p.category || '',
      price: originalPrice,
      originalPrice: parseFloat(struckPrice),
      discountPercentage: Math.round(discount),
      rating: p.rating || 4.7,
      stock: p.stock || 20,
      brand: p.brand || 'Stackly Boutique',
      thumbnail: realisticPhoto,
      images: galleryImages,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['#2B1810', '#A75D37', '#D4A373', '#EAE0D5']
    };
  }
};

window.ApiService = ApiService;
