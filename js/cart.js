/**
 * STACKLY - CART & WISHLIST SERVICE
 * Manages LocalStorage persistence for Cart, Wishlist, Coupons, and Order History.
 */

const STORAGE_KEYS = {
  CART: 'stackly_cart',
  WISHLIST: 'stackly_wishlist',
  ORDERS: 'stackly_orders',
  COUPON: 'stackly_coupon'
};

const AVAILABLE_COUPONS = {
  'STACKLY20': { discount: 0.20, type: 'percent', label: '20% Off Order' },
  'WELCOME10': { discount: 0.10, type: 'percent', label: '10% Off Welcome' },
  'FREESHIP': { discount: 0.00, type: 'shipping', label: 'Free Express Shipping' }
};

const CartService = {
  // Get cart items from LocalStorage
  getCart() {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.CART);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.error('Error reading cart from LocalStorage:', e);
      return [];
    }
  },

  // Save cart items to LocalStorage
  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.updateBadges();
    this.renderCartDrawer();
  },

  // Add product to cart
  addToCart(product, quantity = 1, size = 'M') {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: quantity,
        size: size,
        category: product.category
      });
    }

    this.saveCart(cart);
    this.showToast(`Added "${product.title}" (${size}) to shopping bag!`, 'success');
  },

  // Remove item from cart
  removeFromCart(id, size) {
    let cart = this.getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size));
    this.saveCart(cart);
    this.showToast('Item removed from shopping bag.', 'info');
  },

  // Update item quantity in cart
  updateQuantity(id, size, delta) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        return this.removeFromCart(id, size);
      }
      this.saveCart(cart);
      this.renderCartDrawer();
    }
  },

  // Wishlist Handling
  getWishlist() {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  },

  saveWishlist(list) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    this.updateBadges();
    this.renderWishlistDrawer();
  },

  toggleWishlist(product) {
    let list = this.getWishlist();
    const index = list.findIndex(item => item.id === product.id);

    if (index > -1) {
      list.splice(index, 1);
      this.showToast(`Removed "${product.title}" from wishlist.`, 'info');
    } else {
      list.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        rating: product.rating
      });
      this.showToast(`Saved "${product.title}" to wishlist!`, 'success');
    }

    this.saveWishlist(list);
    this.syncWishlistIcons();
  },

  isInWishlist(productId) {
    return this.getWishlist().some(item => item.id === productId);
  },

  // Apply Coupon
  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    if (AVAILABLE_COUPONS[cleanCode]) {
      localStorage.setItem(STORAGE_KEYS.COUPON, cleanCode);
      this.showToast(`Coupon "${cleanCode}" applied!`, 'success');
      this.renderCartDrawer();
      return true;
    } else {
      this.showToast('Invalid coupon code. Try "STACKLY20"!', 'error');
      return false;
    }
  },

  getActiveCoupon() {
    return localStorage.getItem(STORAGE_KEYS.COUPON) || null;
  },

  removeCoupon() {
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    this.showToast('Coupon removed.', 'info');
    this.renderCartDrawer();
  },

  // Subtotal, Discount, Shipping, Total calculations
  getCalculations() {
    const cart = this.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = 0;
    const activeCouponCode = this.getActiveCoupon();
    let shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;

    if (activeCouponCode && AVAILABLE_COUPONS[activeCouponCode]) {
      const coupon = AVAILABLE_COUPONS[activeCouponCode];
      if (coupon.type === 'percent') {
        discount = subtotal * coupon.discount;
      } else if (coupon.type === 'shipping') {
        shipping = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      couponCode: activeCouponCode
    };
  },

  // Checkout & Order Placement
  checkout() {
    const cart = this.getCart();
    if (cart.length === 0) {
      this.showToast('Your cart is empty!', 'error');
      return;
    }

    const calc = this.getCalculations();
    const newOrder = {
      orderId: 'STK-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      items: cart,
      subtotal: calc.subtotal,
      discount: calc.discount,
      shipping: calc.shipping,
      total: calc.total,
      status: 'Confirmed'
    };

    // Store in orders
    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Clear cart and coupon
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    this.updateBadges();
    this.renderCartDrawer();

    // Show confirmation modal
    this.showOrderConfirmationModal(newOrder);
  },

  getOrders() {
    try {
      const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return orders ? JSON.parse(orders) : [];
    } catch (e) {
      return [];
    }
  },

  showOrderConfirmationModal(order) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;

    const modalBody = document.getElementById('orderModalBody');
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 20px 0;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #EAFAF1; color: #27AE60; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 16px;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size: 1.8rem; margin-bottom: 8px;">Order Confirmed!</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 24px;">Thank you for shopping at Stackly. Your order <strong>#${order.orderId}</strong> has been placed.</p>
        
        <div style="background: var(--color-bg-surface); padding: 18px; border-radius: var(--radius-sm); text-align: left; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
            <span>Order Date:</span>
            <strong>${order.date}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
            <span>Items Count:</span>
            <strong>${order.items.length} items</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; color: var(--color-primary); border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 8px;">
            <span>Total Paid:</span>
            <span>$${order.total}</span>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 24px;">
          <i class="fa-solid fa-location-dot" style="color: var(--color-gold);"></i> Delivery Address: Chinna Thirupathi, Salem, Tamil Nadu 636008
        </p>

        <a href="index.html" class="btn btn-primary btn-pill" style="width: 100%;">
          <i class="fa-solid fa-bag-shopping"></i> Continue Shopping
        </a>
      </div>
    `;

    modal.classList.add('active');
  },

  // Update header count badges
  updateBadges() {
    const cart = this.getCart();
    const wishlist = this.getWishlist();
    
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishCount = wishlist.length;

    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) cartBadge.textContent = cartCount;

    const wishBadge = document.getElementById('wishlistBadge');
    if (wishBadge) wishBadge.textContent = wishCount;
  },

  // Sync wishlist heart icon states
  syncWishlistIcons() {
    const list = this.getWishlist();
    const wishIds = new Set(list.map(i => i.id));

    document.querySelectorAll('.btn-wishlist-toggle').forEach(btn => {
      const pid = parseInt(btn.dataset.productId);
      const icon = btn.querySelector('i');
      if (wishIds.has(pid)) {
        btn.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-regular');
          icon.classList.add('fa-solid');
        }
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.classList.remove('fa-solid');
          icon.classList.add('fa-regular');
        }
      }
    });
  },

  // Render Cart Drawer
  renderCartDrawer() {
    const container = document.getElementById('cartDrawerItems');
    if (!container) return;

    const cart = this.getCart();
    const calc = this.getCalculations();

    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 0; color: var(--color-text-muted);">
          <div style="font-size: 3rem; color: var(--color-gold); margin-bottom: 16px;">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
          <h4 style="font-size: 1.2rem; margin-bottom: 8px;">Your Shopping Bag is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 20px;">Explore our collections and add boutique items.</p>
          <a href="#bentoSection" class="btn btn-primary btn-sm" onclick="document.getElementById('cartDrawer').classList.remove('active'); document.getElementById('cartOverlay').classList.remove('active');">Explore Collections</a>
        </div>
      `;
    } else {
      container.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 4px;">Size: ${item.size}</div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="CartService.updateQuantity(${item.id}, '${item.size}', -1)">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="CartService.updateQuantity(${item.id}, '${item.size}', 1)">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
          <button class="cart-remove-btn" onclick="CartService.removeFromCart(${item.id}, '${item.size}')" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `).join('');
    }

    // Update summary values
    const subtotalEl = document.getElementById('cartSubtotal');
    if (subtotalEl) subtotalEl.textContent = `$${calc.subtotal}`;

    const discountEl = document.getElementById('cartDiscount');
    if (discountEl) discountEl.textContent = `-$${calc.discount}`;

    const shippingEl = document.getElementById('cartShipping');
    if (shippingEl) shippingEl.textContent = calc.shipping === '0.00' ? 'FREE' : `$${calc.shipping}`;

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `$${calc.total}`;

    const couponStatusEl = document.getElementById('appliedCouponStatus');
    if (couponStatusEl) {
      if (calc.couponCode) {
        couponStatusEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #EAFAF1; color: #27AE60; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 10px;">
            <span><i class="fa-solid fa-ticket"></i> ${calc.couponCode} applied</span>
            <button onclick="CartService.removeCoupon()" style="color: #C0392B;"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      } else {
        couponStatusEl.innerHTML = '';
      }
    }
  },

  // Render Wishlist Drawer
  renderWishlistDrawer() {
    const container = document.getElementById('wishlistDrawerItems');
    const headerCount = document.getElementById('wishlistDrawerCount');
    const footer = document.getElementById('wishlistDrawerFooter');
    if (!container) return;

    const wishlist = this.getWishlist();
    if (headerCount) headerCount.textContent = wishlist.length;

    if (wishlist.length === 0) {
      if (footer) footer.style.display = 'none';
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--color-text-muted);">
          <div style="font-size: 3rem; color: var(--color-accent); margin-bottom: 16px;">
            <i class="fa-regular fa-heart"></i>
          </div>
          <h4 style="font-size: 1.25rem; margin-bottom: 8px; color: var(--color-primary);">Your Wishlist is Empty</h4>
          <p style="font-size: 0.9rem; margin-bottom: 24px; line-height: 1.5;">Save your favorite couture gowns, tailored suits, and designer accessories to revisit anytime.</p>
          <a href="#bentoSection" class="btn btn-primary btn-sm btn-pill" onclick="CartService.closeWishlistDrawer()">Explore Collections</a>
        </div>
      `;
    } else {
      if (footer) footer.style.display = 'block';
      container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
          <img src="${item.thumbnail}" alt="${item.title}" class="wishlist-item-img">
          <div class="wishlist-item-info">
            <h4 class="wishlist-item-title" title="${item.title}">${item.title}</h4>
            <div class="wishlist-item-price">$${Number(item.price).toFixed(2)}</div>
            <div class="wishlist-item-actions">
              <button type="button" class="btn-wishlist-move" onclick="CartService.moveToCart(${item.id})">
                <i class="fa-solid fa-bag-shopping"></i> Move to Bag
              </button>
              <button type="button" class="btn-wishlist-del" onclick="CartService.removeFromWishlist(${item.id})" title="Remove from wishlist">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  },

  openCartDrawer() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-menu-open');
      document.body.style.overflow = '';
      if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    }

    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    const wishlistDrawer = document.getElementById('wishlistDrawer');
    if (wishlistDrawer) wishlistDrawer.classList.remove('active');

    this.renderCartDrawer();
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
  },

  closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  closeAllDrawers() {
    this.closeCartDrawer();
    this.closeWishlistDrawer();
  },

  openWishlistDrawer() {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.body.classList.remove('nav-menu-open');
      document.body.style.overflow = '';
      if (mobileToggle) {
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    }

    const drawer = document.getElementById('wishlistDrawer');
    const overlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) cartDrawer.classList.remove('active');

    this.renderWishlistDrawer();
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
  },

  closeWishlistDrawer() {
    const drawer = document.getElementById('wishlistDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  removeFromWishlist(productId) {
    let list = this.getWishlist();
    const item = list.find(i => i.id === productId);
    const title = item ? item.title : 'Item';
    list = list.filter(i => i.id !== productId);
    this.saveWishlist(list);
    this.syncWishlistIcons();
    this.showToast(`Removed "${title}" from wishlist.`, 'info');
  },

  moveToCart(productId) {
    const wishlist = this.getWishlist();
    const item = wishlist.find(i => i.id === productId);
    if (!item) return;

    this.addToCart(item, 1, 'M');
    this.removeFromWishlist(productId);
    this.showToast(`Moved "${item.title}" to your Shopping Bag!`, 'success');
  },

  moveAllToCart() {
    const wishlist = this.getWishlist();
    if (wishlist.length === 0) {
      this.showToast('Your wishlist is empty!', 'info');
      return;
    }

    wishlist.forEach(item => {
      this.addToCart(item, 1, 'M');
    });

    this.saveWishlist([]);
    this.syncWishlistIcons();
    this.renderWishlistDrawer();
    this.renderCartDrawer();
    this.showToast('All wishlist items moved to your Shopping Bag!', 'success');

    setTimeout(() => {
      this.closeWishlistDrawer();
      const cartDrawer = document.getElementById('cartDrawer');
      const overlay = document.getElementById('cartOverlay');
      if (cartDrawer) cartDrawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
    }, 350);
  },

  // Toast notification
  showToast(message, type = 'info') {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.className = `toast-notice ${type} show`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
};

window.CartService = CartService;
