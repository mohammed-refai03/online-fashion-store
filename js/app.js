/**
 * STACKLY - MAIN APPLICATION CONTROLLER
 * Controls Navigation, Hero Slider, Product Rendering, Modal Popups, AOS, and Global Events
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 50
    });
  }

  // Initialize Header, Navigation & Modals
  initNavigation();
  initHeroSlider();
  initTestimonialSlider();
  initSpecialOfferCountdown();
  initGlobalModals();

  // Load and Render Homepage Products
  await loadHomepageProducts();

  // Initialize Badges & Wishlist
  if (window.CartService) {
    CartService.updateBadges();
    CartService.renderCartDrawer();
    CartService.renderWishlistDrawer();
  }
});

/* ==========================================================================
   Navigation & Header Functions
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');

  // Sticky header shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle & scrolling lock
  if (mobileToggle && navMenu) {
    function openMobileMenu() {
      navMenu.classList.add('active');
      document.body.classList.add('nav-menu-open');
      document.body.style.overflow = 'hidden';
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    }

    function closeMobileMenu() {
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-menu-open');
      document.body.style.overflow = '';
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }

    mobileToggle.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Close on clicking any navlink inside the drawer
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Reset if window resizes to desktop view
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991 && navMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  // Cart & Wishlist Drawer open/close
  const cartBtn = document.getElementById('navCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');

  const wishlistBtn = document.getElementById('navWishlistBtn');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  const closeWishlistBtn = document.getElementById('closeWishlistBtn');
  const moveAllWishlistBtn = document.getElementById('moveAllWishlistToBagBtn');

  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', () => {
      if (wishlistDrawer) wishlistDrawer.classList.remove('active');
      cartDrawer.classList.add('active');
      if (cartOverlay) cartOverlay.classList.add('active');
    });
  }

  if (closeCartBtn && cartDrawer) {
    closeCartBtn.addEventListener('click', () => {
      cartDrawer.classList.remove('active');
      if (cartOverlay) cartOverlay.classList.remove('active');
    });
  }

  // Wishlist Drawer open/close
  if (wishlistBtn && window.CartService) {
    wishlistBtn.addEventListener('click', () => {
      CartService.openWishlistDrawer();
    });
  }

  if (closeWishlistBtn && window.CartService) {
    closeWishlistBtn.addEventListener('click', () => {
      CartService.closeWishlistDrawer();
    });
  }

  if (moveAllWishlistBtn && window.CartService) {
    moveAllWishlistBtn.addEventListener('click', () => {
      CartService.moveAllToCart();
    });
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', () => {
      if (cartDrawer) cartDrawer.classList.remove('active');
      if (wishlistDrawer) wishlistDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
    });
  }

  // Coupon apply button
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponInput = document.getElementById('couponCodeInput');
  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      if (couponInput.value) {
        CartService.applyCoupon(couponInput.value);
        couponInput.value = '';
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      CartService.checkout();
    });
  }
}

/* ==========================================================================
   Hero Slider (Auto & Manual Controls)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const dotsContainer = document.getElementById('heroSliderDots');

  if (!slides || slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval = null;

  // Create indicator dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    const dots = document.querySelectorAll('.slider-dot');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoSlide();
    });
  }

  // Auto Slider: 5-second interval
  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    startAutoSlide();
  }

  startAutoSlide();
}

/* ==========================================================================
   Special Offer Countdown Timer
   ========================================================================== */
function initSpecialOfferCountdown() {
  const daysEl = document.getElementById('offerDays');
  const hoursEl = document.getElementById('offerHours');
  const minsEl = document.getElementById('offerMins');
  const secsEl = document.getElementById('offerSecs');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  // Target 4 days in future
  const targetDate = new Date().getTime() + (4 * 24 * 60 * 60 * 1000);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   Load Homepage Products from DummyJSON API
   ========================================================================== */
let allLoadedProducts = [];

async function loadHomepageProducts() {
  const newArrivalsGrid = document.getElementById('newArrivalsGrid');
  const trendingGrid = document.getElementById('trendingGrid');
  const bestSellersGrid = document.getElementById('bestSellersGrid');

  // Render skeleton loaders first
  renderSkeletons(newArrivalsGrid, 4);
  renderSkeletons(trendingGrid, 8);
  renderSkeletons(bestSellersGrid, 4);

  try {
    allLoadedProducts = await ApiService.getAllProducts(30);

    if (allLoadedProducts.length === 0) {
      throw new Error('No products received from API');
    }

    // 1. New Arrivals: 4 items (highest IDs)
    const newArrivals = allLoadedProducts.slice(0, 4);
    renderProductCards(newArrivalsGrid, newArrivals, 'New');

    // 2. Trending Products: initialized with search, category filters & sorting
    initTrendingControls();
    applyTrendingFilters();

    // 3. Best Sellers: 4 items (sorted by highest rating)
    const bestSellers = [...allLoadedProducts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    renderProductCards(bestSellersGrid, bestSellers, 'Top Rated');

    // Sync wishlist heart states
    if (window.CartService) {
      CartService.syncWishlistIcons();
    }

  } catch (error) {
    console.error('Error rendering homepage products:', error);
    showApiError(newArrivalsGrid);
    showApiError(trendingGrid);
    showApiError(bestSellersGrid);
  }
}

function renderSkeletons(container, count = 4) {
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="product-card">
      <div class="product-thumb-wrap skeleton" style="height: 280px;"></div>
      <div class="product-body">
        <div class="skeleton" style="height: 14px; width: 40%; margin-bottom: 8px;"></div>
        <div class="skeleton" style="height: 18px; width: 80%; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 14px; width: 60%; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 24px; width: 35%;"></div>
      </div>
    </div>
  `).join('');
}

function showApiError(container) {
  if (!container) return;
  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #FFF; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: var(--color-danger); margin-bottom: 12px;"></i>
      <h4 style="font-size: 1.2rem; margin-bottom: 8px;">Unable to load products</h4>
      <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 16px;">Please check your connection or retry loading DummyJSON data.</p>
      <button class="btn btn-primary btn-sm" onclick="loadHomepageProducts()">
        <i class="fa-solid fa-rotate-right"></i> Retry Loading
      </button>
    </div>
  `;
}

function renderProductCards(container, products, badgeLabel = '') {
  if (!container) return;

  container.innerHTML = products.map(product => {
    // Generate star rating icons (strictly FontAwesome)
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fa-solid fa-star"></i>';
    }
    if (halfStar) {
      starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="fa-regular fa-star"></i>';
    }

    const isInWish = CartService && CartService.isInWishlist(product.id);

    return `
      <div class="product-card" data-aos="fade-up">
        <div class="product-thumb-wrap">
          <div class="product-badges">
            ${badgeLabel ? `<span class="badge-tag badge-new">${badgeLabel}</span>` : ''}
            <span class="badge-tag badge-discount">-${product.discountPercentage}%</span>
          </div>
          <img src="${product.thumbnail}" alt="${product.title}" loading="lazy">
          <div class="product-actions-hover">
            <button class="action-btn btn-quick-view" onclick="openQuickViewModal(${product.id})" title="Quick View">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn btn-wishlist-toggle ${isInWish ? 'active' : ''}" data-product-id="${product.id}" onclick="handleWishlistClick(${product.id})" title="Save to Wishlist">
              <i class="${isInWish ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <button class="action-btn" onclick="handleAddToCartClick(${product.id})" title="Add to Bag">
              <i class="fa-solid fa-bag-shopping"></i>
            </button>
          </div>
        </div>
        <div class="product-body">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title" title="${product.title}">${product.title}</h3>
          <div class="product-rating">
            ${starsHtml}
            <span>(${product.rating})</span>
          </div>
          <div class="product-price-box">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            <span class="original-price">$${product.originalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Trending Controls (Search, Category Filters & Sorting System)
   ========================================================================== */
let currentTrendingCategory = 'all';
let currentTrendingSearch = '';
let currentTrendingSort = 'featured';

function initTrendingControls() {
  const searchInput = document.getElementById('trendingSearchInput');
  const clearBtn = document.getElementById('trendingSearchClear');
  const tabs = document.querySelectorAll('#trendingTabs .filter-pill');
  const sortSelect = document.getElementById('trendingSortSelect');

  if (searchInput && !searchInput.dataset.initialized) {
    searchInput.dataset.initialized = 'true';
    searchInput.addEventListener('input', (e) => {
      currentTrendingSearch = (e.target.value || '').trim().toLowerCase();
      if (clearBtn) {
        clearBtn.style.display = currentTrendingSearch ? 'flex' : 'none';
      }
      applyTrendingFilters();
    });
  }

  if (clearBtn && !clearBtn.dataset.initialized) {
    clearBtn.dataset.initialized = 'true';
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentTrendingSearch = '';
        clearBtn.style.display = 'none';
        applyTrendingFilters();
        searchInput.focus();
      }
    });
  }

  tabs.forEach(tab => {
    if (!tab.dataset.initialized) {
      tab.dataset.initialized = 'true';
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTrendingCategory = tab.dataset.filter || 'all';
        applyTrendingFilters();
      });
    }
  });

  if (sortSelect && !sortSelect.dataset.initialized) {
    sortSelect.dataset.initialized = 'true';
    sortSelect.addEventListener('change', (e) => {
      currentTrendingSort = e.target.value || 'featured';
      applyTrendingFilters();
    });
  }
}

function applyTrendingFilters() {
  const trendingGrid = document.getElementById('trendingGrid');
  const countBadge = document.getElementById('trendingCountBadge');
  if (!trendingGrid) return;

  let results = [...allLoadedProducts];

  // 1. Category Filter
  if (currentTrendingCategory === 'women') {
    results = results.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const raw = (p.rawCategory || '').toLowerCase();
      return raw.includes('women') || cat.includes('women') || cat.includes('dress') || cat.includes('skirt') || raw.includes('dress');
    });
  } else if (currentTrendingCategory === 'men') {
    results = results.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const raw = (p.rawCategory || '').toLowerCase();
      return raw.includes('men') || cat.includes('men') || cat.includes('shirt') || cat.includes('suit') || raw.includes('shirt');
    });
  } else if (currentTrendingCategory === 'accessories') {
    results = results.filter(p => {
      const cat = (p.category || '').toLowerCase();
      const raw = (p.rawCategory || '').toLowerCase();
      return cat.includes('bag') || cat.includes('jewel') || cat.includes('sunglasses') || cat.includes('shoe') ||
             raw.includes('bag') || raw.includes('jewellery') || raw.includes('sunglasses') || raw.includes('shoes');
    });
  }

  // 2. Search Filter (by title, category, description)
  if (currentTrendingSearch) {
    results = results.filter(p => {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return title.includes(currentTrendingSearch) || cat.includes(currentTrendingSearch) || desc.includes(currentTrendingSearch);
    });
  }

  // 3. Sorting Function
  if (currentTrendingSort === 'price-low') {
    results.sort((a, b) => a.price - b.price);
  } else if (currentTrendingSort === 'price-high') {
    results.sort((a, b) => b.price - a.price);
  } else if (currentTrendingSort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (currentTrendingSort === 'name') {
    results.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  // Update Live Count Badge
  if (countBadge) {
    countBadge.textContent = `${results.length} Style${results.length === 1 ? '' : 's'}`;
  }

  // Render or Luxury Empty State
  if (results.length === 0) {
    const queryDisplay = currentTrendingSearch || currentTrendingCategory;
    const sanitized = queryDisplay.replace(/[&<>"']/g, '');
    trendingGrid.innerHTML = `
      <div class="trending-empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
        </div>
        <h3>No Boutique Styles Found</h3>
        <p>We couldn't find any styles matching "${sanitized}". Try refining your search keyword or selecting another fashion category.</p>
        <button type="button" class="btn btn-primary btn-sm btn-pill" onclick="resetTrendingFilters()">
          <i class="fa-solid fa-rotate-left"></i> Reset Search & Filters
        </button>
      </div>
    `;
  } else {
    renderProductCards(trendingGrid, results, 'Trending');
  }

  if (window.CartService) {
    CartService.syncWishlistIcons();
  }
}

function resetTrendingFilters() {
  const searchInput = document.getElementById('trendingSearchInput');
  const clearBtn = document.getElementById('trendingSearchClear');
  const sortSelect = document.getElementById('trendingSortSelect');
  const tabs = document.querySelectorAll('#trendingTabs .filter-pill');

  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  if (sortSelect) sortSelect.value = 'featured';

  tabs.forEach(t => {
    if (t.dataset.filter === 'all') t.classList.add('active');
    else t.classList.remove('active');
  });

  currentTrendingCategory = 'all';
  currentTrendingSearch = '';
  currentTrendingSort = 'featured';

  applyTrendingFilters();
}

window.resetTrendingFilters = resetTrendingFilters;

/* ==========================================================================
   Cart & Wishlist Global Handlers
   ========================================================================== */
function handleAddToCartClick(productId) {
  const product = allLoadedProducts.find(p => p.id === productId);
  if (product && window.CartService) {
    CartService.addToCart(product, 1, 'M');
  }
}

function handleWishlistClick(productId) {
  const product = allLoadedProducts.find(p => p.id === productId);
  if (product && window.CartService) {
    CartService.toggleWishlist(product);
  }
}

/* ==========================================================================
   Quick View Modal
   ========================================================================== */
function openQuickViewModal(productId) {
  const product = allLoadedProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quickViewModal');
  const container = document.getElementById('quickViewContent');
  if (!modal || !container) return;

  let starsHtml = '';
  const fullStars = Math.floor(product.rating);
  for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
  if (product.rating % 1 >= 0.5) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 32px; align-items: start;">
      <div>
        <div style="border-radius: var(--radius-sm); overflow: hidden; background: #F8F6F2; border: 1px solid var(--color-border); height: 360px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <img id="quickModalMainImg" src="${product.thumbnail}" alt="${product.title}" style="max-height: 90%; max-width: 90%; object-fit: contain;">
        </div>
        <div style="display: flex; gap: 10px;">
          ${product.images.slice(0, 4).map(img => `
            <img src="${img}" alt="Thumb" onclick="document.getElementById('quickModalMainImg').src='${img}'" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border); cursor: pointer;">
          `).join('')}
        </div>
      </div>
      <div>
        <span class="section-tag" style="margin-bottom: 8px;">${product.category}</span>
        <h2 style="font-size: 1.6rem; margin-bottom: 10px;">${product.title}</h2>
        
        <div class="product-rating" style="margin-bottom: 16px;">
          ${starsHtml}
          <span>(${product.rating} / 5.0)</span>
          <span style="color: var(--color-success); font-weight: 600; margin-left: 12px;"><i class="fa-solid fa-check"></i> In Stock (${product.stock} units)</span>
        </div>

        <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px;">
          <span style="font-size: 1.8rem; font-weight: 700; color: var(--color-primary);">$${product.price.toFixed(2)}</span>
          <span style="font-size: 1.1rem; color: var(--color-text-light); text-decoration: line-through;">$${product.originalPrice.toFixed(2)}</span>
          <span class="badge-tag badge-discount">Save ${product.discountPercentage}%</span>
        </div>

        <p style="font-size: 0.92rem; color: var(--color-text-muted); line-height: 1.65; margin-bottom: 24px;">
          ${product.description}
        </p>

        <!-- Size Selection -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Select Size:</label>
          <div style="display: flex; gap: 8px;" id="modalSizeGroup">
            ${['XS', 'S', 'M', 'L', 'XL'].map((s, idx) => `
              <button type="button" class="btn-size ${idx === 2 ? 'active' : ''}" onclick="selectModalSize(this, '${s}')" style="width: 38px; height: 38px; border: 1.5px solid ${idx === 2 ? 'var(--color-primary)' : 'var(--color-border)'}; background: ${idx === 2 ? 'var(--color-primary)' : '#FFF'}; color: ${idx === 2 ? '#FFF' : 'var(--color-primary)'}; font-weight: 600; font-size: 0.85rem; border-radius: 4px;">${s}</button>
            `).join('')}
          </div>
        </div>

        <!-- Add to Bag & Quantity -->
        <div style="display: flex; gap: 14px; align-items: center; margin-top: 24px;">
          <button class="btn btn-primary" onclick="CartService.addToCart(allLoadedProducts.find(p=>p.id===${product.id}), 1, selectedQuickSize); document.getElementById('quickViewModal').classList.remove('active');" style="flex-grow: 1;">
            <i class="fa-solid fa-bag-shopping"></i> Add to Shopping Bag
          </button>
          <button class="action-btn" onclick="CartService.toggleWishlist(allLoadedProducts.find(p=>p.id===${product.id}))" title="Save to Wishlist">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

let selectedQuickSize = 'M';
function selectModalSize(btn, size) {
  selectedQuickSize = size;
  document.querySelectorAll('#modalSizeGroup .btn-size').forEach(b => {
    b.style.background = '#FFF';
    b.style.color = 'var(--color-primary)';
    b.style.borderColor = 'var(--color-border)';
  });
  btn.style.background = 'var(--color-primary)';
  btn.style.color = '#FFF';
  btn.style.borderColor = 'var(--color-primary)';
}

/* ==========================================================================
   Global Modals Management (Auth, QuickView, Order)
   ========================================================================== */
function initGlobalModals() {
  // Login Button in Navbar
  const loginNavBtn = document.getElementById('loginNavBtn');
  const authModal = document.getElementById('authModal');
  const closeAuthBtn = document.getElementById('closeAuthBtn');

  if (loginNavBtn && authModal) {
    loginNavBtn.addEventListener('click', () => {
      authModal.classList.add('active');
    });
  }

  if (closeAuthBtn && authModal) {
    closeAuthBtn.addEventListener('click', () => {
      authModal.classList.remove('active');
    });
  }

  // Quick View Close
  const closeQuickBtn = document.getElementById('closeQuickModalBtn');
  const quickModal = document.getElementById('quickViewModal');
  if (closeQuickBtn && quickModal) {
    closeQuickBtn.addEventListener('click', () => {
      quickModal.classList.remove('active');
    });
  }

  // Order Confirmation Modal Close
  const closeOrderBtn = document.getElementById('closeOrderModalBtn');
  const orderModal = document.getElementById('orderModal');
  if (closeOrderBtn && orderModal) {
    closeOrderBtn.addEventListener('click', () => {
      orderModal.classList.remove('active');
    });
  }

  // Close modals on clicking overlay outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Switch between Login and Register tabs
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabRegister = document.getElementById('tabAuthRegister');
  const boxLogin = document.getElementById('boxAuthLogin');
  const boxRegister = document.getElementById('boxAuthRegister');

  if (tabLogin && tabRegister && boxLogin && boxRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      boxLogin.style.display = 'block';
      boxRegister.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      boxLogin.style.display = 'none';
      boxRegister.style.display = 'block';
    });
  }
}

/* ==========================================================================
   Unique Testimonial Slider (Auto & Manual Engine)
   ========================================================================== */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('testiPrevBtn');
  const nextBtn = document.getElementById('testiNextBtn');
  const dotsContainer = document.getElementById('testiDots');
  const counterEl = document.getElementById('testiCounter');
  const carousel = document.getElementById('testimonialCarousel');

  if (!track) return;

  const slides = track.querySelectorAll('.testimonial-slide-item');
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  let currentIndex = 0;
  let autoSlideTimer = null;

  // Build Pagination Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `testi-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.testi-dot');
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === currentIndex);
      });
    }

    // Update Counter (e.g. 01 / 04)
    if (counterEl) {
      const currentFormatted = String(currentIndex + 1).padStart(2, '0');
      const totalFormatted = String(totalSlides).padStart(2, '0');
      counterEl.textContent = `${currentFormatted} / ${totalFormatted}`;
    }
  }

  function goToSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    updateSlider();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  // Manual Prev / Next Click Handlers
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartTimer();
    });
  }

  // Auto-Slide Engine (every 4.5 seconds with pause on hover)
  function startTimer() {
    autoSlideTimer = setInterval(nextSlide, 4500);
  }

  function pauseTimer() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function restartTimer() {
    pauseTimer();
    startTimer();
  }

  if (carousel) {
    carousel.addEventListener('mouseenter', pauseTimer);
    carousel.addEventListener('mouseleave', startTimer);
  }

  // Initial State
  updateSlider();
  startTimer();
}

// Expose handlers globally
window.openQuickViewModal = openQuickViewModal;
window.handleAddToCartClick = handleAddToCartClick;
window.handleWishlistClick = handleWishlistClick;
window.selectModalSize = selectModalSize;
window.loadHomepageProducts = loadHomepageProducts;
