/**
 * Enhanced Variant Picker JavaScript
 * Handles conditional purchasing and variant selection logic
 */

class EnhancedVariantPickerManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAddToCartValidation();
  }

  setupEventListeners() {
    // Listen for enhanced variant picker events
    document.addEventListener('enhanced-variant:change', this.handleVariantChange.bind(this));
  }

  setupAddToCartValidation() {
    // Find and intercept add-to-cart buttons
    document.addEventListener('click', (event) => {
      const addToCartButton = event.target.closest('[name="add"], .btn[type="submit"], button[type="submit"]');
      if (!addToCartButton) return;
      
      const form = addToCartButton.closest('form');
      if (!form || !form.action || !form.action.includes('/cart/add')) return;
      
      // Check if this product has size requirements
      const enhancedPicker = document.querySelector('enhanced-variant-picker[data-has-size-requirement="true"]');
      if (!enhancedPicker) return;
      
      // Check if size is selected
      const sizeInputs = enhancedPicker.querySelectorAll('input[data-is-size="true"]');
      const sizeSelected = Array.from(sizeInputs).some(input => input.checked);
      
      if (!sizeSelected) {
        event.preventDefault();
        event.stopPropagation();
        this.showError('Please select a size before adding to cart');
        return false;
      }
    }, true); // Use capture phase to intercept before other handlers
  }


  handleVariantChange(event) {
    const { variant } = event.detail;
    
    // Update price displays
    this.updatePriceDisplays(event.target, variant);
    
    // Update product images if needed
    this.updateProductImages(event.target, variant);
    
    // Trigger theme variant change events for compatibility
    document.dispatchEvent(new CustomEvent('variant:change', {
      detail: { variant }
    }));
  }

  updatePriceDisplays(picker, variant) {
    const productContainer = picker.closest('[data-section-type="product"], .product-details, [class*="product"]');
    if (!productContainer) return;

    const priceElements = productContainer.querySelectorAll('.price, [class*="price"]');
    
    priceElements.forEach(priceEl => {
      if (priceEl.querySelector('.money, [data-money-format]')) {
        // Update the price display
        const priceSpan = priceEl.querySelector('.money, [data-money-format]');
        if (priceSpan && variant.price !== undefined) {
          priceSpan.textContent = this.formatMoney(variant.price);
        }
        
        // Handle compare at price
        const comparePrice = priceEl.querySelector('.price__compare, [class*="compare"]');
        if (comparePrice && variant.compare_at_price && variant.compare_at_price > variant.price) {
          comparePrice.textContent = this.formatMoney(variant.compare_at_price);
          comparePrice.style.display = 'inline';
        } else if (comparePrice) {
          comparePrice.style.display = 'none';
        }
      }
    });
  }

  updateProductImages(picker, variant) {
    if (!variant.featured_image) return;

    const productContainer = picker.closest('[data-section-type="product"], .product-details, [class*="product"]');
    if (!productContainer) return;

    const mainImage = productContainer.querySelector('.product__media img, [class*="media"] img');
    if (mainImage && variant.featured_image.src) {
      mainImage.src = variant.featured_image.src;
      mainImage.alt = variant.featured_image.alt || '';
    }
  }

  async updateCartUI() {
    try {
      // Get current cart
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count
      const cartCounts = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartCounts.forEach(count => {
        count.textContent = cart.item_count;
        count.style.display = cart.item_count > 0 ? 'inline' : 'none';
      });

      // Trigger cart update events for theme compatibility
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { cart }
      }));

    } catch (error) {
      console.error('Cart update error:', error);
    }
  }

  formatMoney(cents) {
    // Basic money formatting - you may want to adapt this based on your theme's format
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `enhanced-notification enhanced-notification--${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      transition: opacity 0.3s ease;
      background-color: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EnhancedVariantPickerManager();
  });
} else {
  new EnhancedVariantPickerManager();
}