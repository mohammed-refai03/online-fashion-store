/**
 * STACKLY - GSAP 404 CONTINUOUS ANIMATIONS
 * Features continuous floating, rotating, and pulsing animations
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP library not loaded, using fallback CSS animations.');
    return;
  }

  // 1. Continuous Floating and 3D Tilting on 404 Typography
  gsap.to('.anim-404-number', {
    y: -18,
    rotation: 1.5,
    duration: 2.4,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  // 2. Floating Fashion Hanger & Bag Icons with staggered sway
  gsap.to('.anim-floating-hanger', {
    y: -14,
    rotation: -4,
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  gsap.to('.anim-floating-bag', {
    y: 12,
    rotation: 5,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  // 3. Continuous Gentle Pulsing Glow Backdrop
  gsap.to('.anim-glow-circle', {
    scale: 1.15,
    opacity: 0.85,
    duration: 3.5,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  // 4. Subtle Shimmer on the Subtitle & Staggered Entry
  gsap.from('.error-content > *', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 1,
    ease: 'power2.out'
  });
});
