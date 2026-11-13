/**
 * STACKLY - FORM VALIDATION & STRICT INPUT RESTRICTION MODULE
 * 
 * Rules:
 * 1. Name input fields: ONLY accepts alphabets and spaces (/^[A-Za-z\s]+$/).
 * 2. Phone number fields: ONLY accepts numbers (/^[0-9]+$/), max 10 digits.
 * 3. Real-time error messages and visual indicators for all form inputs.
 */

const ValidationService = {
  init() {
    this.bindNameInputRestrictions();
    this.bindPhoneInputRestrictions();
    this.bindFormValidations();
  },

  /**
   * Enforces strict alphabet-only restriction on name fields
   */
  bindNameInputRestrictions() {
    const nameInputs = document.querySelectorAll('input[data-type="name"], input[name="fullName"], input[name="name"], #loginName, #registerName, #contactName');
    
    nameInputs.forEach(input => {
      // Prevent typing numbers and symbols
      input.addEventListener('keydown', (e) => {
        // Allow backspace, tab, delete, arrow keys
        if (['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
          return;
        }
        // Allow space
        if (e.key === ' ') return;

        // Reject if not an alphabet
        if (!/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();
          this.showError(input, 'Name field accepts alphabets only (no numbers or special characters).');
        }
      });

      // Filter paste / autocomplete values
      input.addEventListener('input', (e) => {
        const originalVal = e.target.value;
        const sanitizedVal = originalVal.replace(/[^A-Za-z\s]/g, '');

        if (originalVal !== sanitizedVal) {
          e.target.value = sanitizedVal;
          this.showError(input, 'Numbers & special characters removed! Alphabets only.');
        } else if (sanitizedVal.trim().length > 0) {
          this.clearError(input);
        }
      });

      input.addEventListener('blur', () => {
        if (!input.value.trim() && input.hasAttribute('required')) {
          this.showError(input, 'Full Name is required.');
        } else if (input.value.trim().length < 2 && input.value.trim().length > 0) {
          this.showError(input, 'Name must be at least 2 characters long.');
        } else if (input.value.trim().length >= 2) {
          this.clearError(input);
        }
      });
    });
  },

  /**
   * Enforces strict numbers-only restriction on phone fields
   */
  bindPhoneInputRestrictions() {
    const phoneInputs = document.querySelectorAll('input[type="tel"], input[data-type="phone"], input[name="phone"], #contactPhone, #checkoutPhone');

    phoneInputs.forEach(input => {
      // Prevent typing non-numeric characters
      input.addEventListener('keydown', (e) => {
        // Allow navigation/editing keys
        if (['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
          return;
        }

        // Reject anything that is not 0-9
        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          this.showError(input, 'Phone number accepts numbers only (no alphabets or symbols).');
        }
      });

      // Handle paste / input
      input.addEventListener('input', (e) => {
        const originalVal = e.target.value;
        let sanitizedVal = originalVal.replace(/[^0-9]/g, '');
        
        // Limit to 10 digits
        if (sanitizedVal.length > 10) {
          sanitizedVal = sanitizedVal.slice(0, 10);
        }

        if (originalVal !== sanitizedVal) {
          e.target.value = sanitizedVal;
          this.showError(input, 'Alphabets & symbols removed! Only numbers allowed (max 10 digits).');
        } else if (sanitizedVal.length === 10) {
          this.clearError(input);
        }
      });

      input.addEventListener('blur', () => {
        const val = input.value.trim();
        if (!val && input.hasAttribute('required')) {
          this.showError(input, 'Phone number is required.');
        } else if (val.length > 0 && val.length !== 10) {
          this.showError(input, 'Please enter a valid 10-digit phone number.');
        } else if (val.length === 10) {
          this.clearError(input);
        }
      });
    });
  },

  /**
   * General Form validation on submit and real-time inputs
   */
  bindFormValidations() {
    // Email inputs validation
    const emailInputs = document.querySelectorAll('input[type="email"], #loginEmail, #registerEmail, #contactEmail, #newsletterEmail');
    emailInputs.forEach(input => {
      input.addEventListener('blur', () => {
        const val = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val && input.hasAttribute('required')) {
          this.showError(input, 'Email address is required.');
        } else if (val && !emailRegex.test(val)) {
          this.showError(input, 'Please enter a valid email address (e.g. name@domain.com).');
        } else if (val && emailRegex.test(val)) {
          this.clearError(input);
        }
      });
    });

    // Password inputs
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      input.addEventListener('blur', () => {
        const val = input.value;
        if (!val && input.hasAttribute('required')) {
          this.showError(input, 'Password is required.');
        } else if (val && val.length < 6) {
          this.showError(input, 'Password must be at least 6 characters.');
        } else if (val && val.length >= 6) {
          this.clearError(input);
        }
      });
    });

    // Handle Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateContainer(loginForm)) {
          loginForm.reset();
          window.location.href = '404.html';
        }
      });
    }

    // Handle Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateContainer(registerForm)) {
          registerForm.reset();
          window.location.href = '404.html';
        }
      });
    }

    // Handle Newsletter Forms
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
          this.showError(emailInput, 'Please provide a valid email address.');
        } else {
          this.clearError(emailInput);
          form.reset();
          window.location.href = '404.html';
        }
      });
    });

    // Handle Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateContainer(contactForm)) {
          contactForm.reset();
          window.location.href = '404.html';
        }
      });
    }
  },

  /**
   * Validates all inputs within a form container
   */
  validateContainer(container) {
    let isValid = true;
    const inputs = container.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
      const val = input.value.trim();

      // Check required
      if (!val) {
        this.showError(input, 'This field is required.');
        isValid = false;
        return;
      }

      // Check Alphabet name rule
      if (input.dataset.type === 'name' || input.name === 'fullName' || input.name === 'name' || input.id.includes('Name')) {
        if (!/^[A-Za-z\s]+$/.test(val)) {
          this.showError(input, 'Name field accepts alphabets only.');
          isValid = false;
          return;
        }
      }

      // Check Phone number rule
      if (input.type === 'tel' || input.dataset.type === 'phone' || input.name === 'phone' || input.id.includes('Phone')) {
        if (!/^[0-9]{10}$/.test(val)) {
          this.showError(input, 'Phone number must be exactly 10 digits (numbers only).');
          isValid = false;
          return;
        }
      }

      // Check Email rule
      if (input.type === 'email' || input.id.includes('Email')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          this.showError(input, 'Please enter a valid email address.');
          isValid = false;
          return;
        }
      }

      // If valid, clear
      this.clearError(input);
    });

    return isValid;
  },

  showError(input, message) {
    input.classList.add('input-error');
    
    // Find or create error element
    let errorEl = input.parentNode.querySelector('.form-error-msg');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error-msg visible';
      input.parentNode.appendChild(errorEl);
    }

    errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    errorEl.classList.add('visible');
  },

  clearError(input) {
    input.classList.remove('input-error');
    const errorEl = input.parentNode.querySelector('.form-error-msg');
    if (errorEl) {
      errorEl.classList.remove('visible');
      errorEl.innerHTML = '';
    }
  }
};

window.ValidationService = ValidationService;

document.addEventListener('DOMContentLoaded', () => {
  ValidationService.init();
});
