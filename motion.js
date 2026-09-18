/**
 * Aura Motion — Apple / iOS-inspired Motion Design System
 * Architecture:
 * - motionConfig
 * - pageMotion
 * - scrollMotion
 * - heroPointerMotion
 * - revealMotion
 * - cardMotion
 * - buttonMotion
 * - shopMotion
 * - modalMotion
 * - bookingMotion
 * - ambientMotion
 * - reducedMotion
 */
(() => {
  'use strict';

  // 1. MOTION CONFIG & TOKENS
  const motionConfig = {
    fast: 180,
    base: 320,
    medium: 520,
    slow: 800,
    easeIOS: 'cubic-bezier(.22, 1, .36, 1)',
    easeSoft: 'cubic-bezier(.16, 1, .3, 1)',
    easeSpring: 'cubic-bezier(.2, .85, .22, 1.15)',
    easeSpringSnappy: 'cubic-bezier(.175, .885, .32, 1.275)',
    easeExit: 'cubic-bezier(.4, 0, 1, 1)',
    get reduced() {
      return matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    get isFinePointer() {
      return matchMedia('(hover: hover) and (pointer: fine)').matches;
    },
    get isTouch() {
      return matchMedia('(hover: none) or (pointer: coarse)').matches;
    }
  };

  const seen = new Set();
  let signature = '';
  let scrollObserver;

  // Helper runner for Web Animations API
  const animate = (el, keyframes, options = {}) => {
    if (!el || motionConfig.reduced || !el.animate) return null;
    return el.animate(keyframes, {
      duration: options.duration || motionConfig.medium,
      easing: options.easing || motionConfig.easeIOS,
      fill: options.fill || 'forwards',
      ...options
    });
  };

  // 2. PAGE MOTION (Entrada cinematográfica orquestrada da página)
  const pageMotion = {
    init() {
      if (motionConfig.reduced) return;

      const header = document.querySelector('header');
      const hero = document.querySelector('#hero-course');
      const photo = document.querySelector('.hero-photo');
      const badge = document.querySelector('.hero-badge');
      const h1 = document.querySelector('.hero h1');
      const desc = document.querySelector('.hero-copy > p:not(.eyebrow)');
      const features = document.querySelectorAll('.hero-features > span');
      const actions = document.querySelectorAll('.hero-actions > a');
      const quick = document.querySelector('.quick');

      // 1. Header entra suavemente (0ms)
      if (header) {
        animate(header, [
          { opacity: 0, transform: 'translateY(-10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 520, easing: motionConfig.easeIOS });
      }

      // 2. Hero ganha profundidade (50ms)
      if (hero) {
        animate(hero, [
          { opacity: 0, transform: 'scale(.986)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 680, delay: 50, easing: motionConfig.easeIOS });
      }

      // 3. Imagem do hero com scale(1.06 -> 1) + opacity (100ms)
      if (photo) {
        animate(photo, [
          { opacity: 0, transform: 'scale(1.06)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 900, delay: 100, easing: motionConfig.easeIOS });
      }

      // 4. Badge entra com spring (220ms)
      if (badge) {
        animate(badge, [
          { opacity: 0, transform: 'translateY(8px) scale(.96)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 500, delay: 220, easing: motionConfig.easeSpring });
      }

      // 5. Headline reveal com clip-path e translateY (320ms)
      if (h1) {
        animate(h1, [
          { opacity: 0, transform: 'translateY(14px)', clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0% 0)' }
        ], { duration: 750, delay: 320, easing: motionConfig.easeIOS });
      }

      // 6. Subtítulo aparece (460ms)
      if (desc) {
        animate(desc, [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 560, delay: 460, easing: motionConfig.easeIOS });
      }

      // 7. Features entram em stagger (540ms+)
      features.forEach((feat, i) => {
        animate(feat, [
          { opacity: 0, transform: 'translateY(8px) scale(.98)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 480, delay: 540 + i * 65, easing: motionConfig.easeIOS });
      });

      // 8. CTAs aparecem com spring (720ms+)
      actions.forEach((btn, i) => {
        animate(btn, [
          { opacity: 0, transform: 'translateY(12px) scale(.95)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 520, delay: 720 + i * 80, easing: motionConfig.easeSpring });
      });

      // 9. Faixa de informações (marquee) entra por último (920ms)
      if (quick) {
        animate(quick, [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 600, delay: 920, easing: motionConfig.easeIOS });
      }
    }
  };

  // 3. SCROLL-DRIVEN MOTION COM INÉRCIA (RAF Loop Central)
  const scrollMotion = {
    targetScroll: 0,
    currentScroll: 0,
    headerEl: null,
    heroPhoto: null,
    heroEl: null,
    floatingEl: null,
    rafId: null,

    init() {
      this.headerEl = document.querySelector('header');
      this.heroPhoto = document.querySelector('.hero-photo');
      this.heroEl = document.querySelector('#hero-course');
      this.floatingEl = document.querySelector('#floating');

      window.addEventListener('scroll', () => {
        this.targetScroll = window.scrollY || window.pageYOffset;
      }, { passive: true });

      this.loop = this.loop.bind(this);
      this.rafId = requestAnimationFrame(this.loop);
    },

    loop() {
      if (!motionConfig.reduced) {
        // Interpolação suave de inércia (lerp)
        this.currentScroll += (this.targetScroll - this.currentScroll) * 0.085;

        // 1. Header Compact State
        if (this.headerEl) {
          const shouldCompact = this.targetScroll > 28;
          if (this.headerEl.classList.contains('header-scrolled') !== shouldCompact) {
            this.headerEl.classList.toggle('header-scrolled', shouldCompact);
          }
        }

        // 2. Desktop Hero Parallax
        if (motionConfig.isFinePointer && this.heroPhoto && this.heroEl) {
          const heroRect = this.heroEl.getBoundingClientRect();
          if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
            const scrollOffset = Math.max(0, -heroRect.top);
            // Parallax sutil: a foto permanece ligeiramente presa (deslocamento max 22px)
            const py = Math.min(scrollOffset * 0.12, 22);
            this.heroPhoto.style.setProperty('--scroll-parallax-y', `${py.toFixed(1)}px`);
          }
        }
      }

      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  // 4. HERO POINTER TRACKING (Parallax em camadas no desktop)
  const heroPointerMotion = {
    hero: null,
    photo: null,
    badge: null,
    copy: null,
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    rafId: null,

    init() {
      this.hero = document.querySelector('#hero-course');
      if (!this.hero) return;
      this.photo = this.hero.querySelector('.hero-photo');
      this.badge = this.hero.querySelector('.hero-badge');
      this.copy = this.hero.querySelector('.hero-copy');

      if (!motionConfig.isFinePointer) return;

      this.hero.addEventListener('mousemove', e => {
        const rect = this.hero.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        this.targetX = nx;
        this.targetY = ny;
      }, { passive: true });

      this.hero.addEventListener('mouseleave', () => {
        this.targetX = 0;
        this.targetY = 0;
      });

      const tick = () => {
        if (!motionConfig.reduced && motionConfig.isFinePointer) {
          this.currX += (this.targetX - this.currX) * 0.08;
          this.currY += (this.targetY - this.currY) * 0.08;

          const scrollPy = parseFloat(this.photo?.style.getPropertyValue('--scroll-parallax-y') || 0);

          if (this.photo) {
            this.photo.style.transform = `translate3d(${(-this.currX * 6).toFixed(1)}px, ${(scrollPy + -this.currY * 5).toFixed(1)}px, 0)`;
          }
          if (this.badge) {
            this.badge.style.transform = `translate3d(${(this.currX * 3.5).toFixed(1)}px, ${(this.currY * 3).toFixed(1)}px, 0)`;
          }
          if (this.copy) {
            this.copy.style.transform = `translate3d(${(this.currX * 1.5).toFixed(1)}px, ${(this.currY * 1.5).toFixed(1)}px, 0)`;
          }
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }
  };

  // 5. REVEAL MOTION (Scroll reveal hierárquico das seções)
  const revealMotion = {
    init() {
      scrollObserver?.disconnect();
      if (motionConfig.reduced || !('IntersectionObserver' in window)) return;

      scrollObserver = new IntersectionObserver(entries => {
        let stagger = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          const key = el.dataset.motionKey || el.id || el.className;

          if (!seen.has(key)) {
            seen.add(key);
            this.revealElement(el, Math.min(stagger++ * 50, 220));
          }
          scrollObserver.unobserve(el);
        }
      }, { threshold: 0.1 });

      this.observeAll();
    },

    revealElement(el, delay = 0) {
      if (motionConfig.reduced) return;

      if (el.classList.contains('card') || el.classList.contains('product')) {
        animate(el, [
          { opacity: 0, transform: 'translateY(22px) scale(.975)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ], { duration: 580, delay, easing: motionConfig.easeIOS });
      } else if (el.classList.contains('how')) {
        const iconEl = el.querySelector('i');
        const h3El = el.querySelector('h3');
        const pEl = el.querySelector('p');

        animate(el, [
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 520, delay, easing: motionConfig.easeIOS });

        if (iconEl) {
          animate(iconEl, [
            { opacity: 0, transform: 'scale(.8)' },
            { opacity: 1, transform: 'scale(1)' }
          ], { duration: 420, delay: delay + 60, easing: motionConfig.easeSpring });
        }
        if (h3El) {
          animate(h3El, [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 450, delay: delay + 120, easing: motionConfig.easeIOS });
        }
        if (pEl) {
          animate(pEl, [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 450, delay: delay + 180, easing: motionConfig.easeIOS });
        }
      } else if (el.tagName === 'FOOTER') {
        animate(el, [
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 500, delay, easing: motionConfig.easeIOS });
      } else {
        animate(el, [
          { opacity: 0, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 520, delay, easing: motionConfig.easeIOS });
      }
    },

    observeAll() {
      if (!scrollObserver || motionConfig.reduced) return;

      document.querySelectorAll('.card').forEach((el, i) => {
        el.dataset.motionKey = 'card-' + (el.querySelector('[data-detail]')?.dataset.detail || i);
        scrollObserver.observe(el);
      });

      document.querySelectorAll('.product').forEach((el, i) => {
        el.dataset.motionKey = 'product-' + (el.id || i);
        scrollObserver.observe(el);
      });

      document.querySelectorAll('.how, footer, .intro, .shop-heading').forEach((el, i) => {
        el.dataset.motionKey = 'section-' + (el.id || el.className || i);
        scrollObserver.observe(el);
      });
    },

    refresh() {
      const next = (document.querySelector('#list-title')?.textContent || '') + (document.querySelector('#search')?.value || '');
      if (signature !== next) {
        seen.clear();
        signature = next;
        if (!motionConfig.reduced) {
          document.querySelectorAll('#grid .card').forEach((card, i) => {
            animate(card, [
              { opacity: 0, transform: 'translateY(16px) scale(.982)' },
              { opacity: 1, transform: 'translateY(0) scale(1)' }
            ], {
              duration: 440,
              delay: Math.min(i * 35, 180),
              easing: motionConfig.easeIOS
            });
          });
        }
      }
      this.observeAll();
    }
  };

  // 6. CARD MOTION & MICRO PARALLAX NAS FOTOS DOS CARDS
  const cardMotion = {
    init() {
      if (!motionConfig.isFinePointer) return;

      // Micro parallax nos cards ao passar o mouse (moldura estática, foto se move 3-5px)
      document.addEventListener('mousemove', e => {
        const card = e.target.closest('.card, .product');
        if (!card) return;

        const img = card.querySelector('.photo img, .product-photo img');
        if (!img) return;

        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;

        img.style.transform = `scale(1.045) translate3d(${(nx * 6).toFixed(1)}px, ${(ny * 5 - 2).toFixed(1)}px, 0)`;
      }, { passive: true });

      document.addEventListener('mouseout', e => {
        const card = e.target.closest('.card, .product');
        if (!card) return;
        const img = card.querySelector('.photo img, .product-photo img');
        if (img && !card.contains(e.relatedTarget)) {
          img.style.transform = '';
        }
      });
    }
  };

  // 7. BUTTON MOTION & MAGNETIC HOVER SUTIL NO DESKTOP
  const buttonMotion = {
    init() {
      // Touch and pointer physical press feedback
      document.addEventListener('pointerdown', e => {
        if (e.target.closest('.card, .product')) return;
        const btn = e.target.closest('button, .hero-course-btn, .hero-link-btn');
        if (!btn || btn.disabled) return;
        btn.style.transform = 'scale(.972)';
      }, { passive: true });

      const release = e => {
        const btn = e.target.closest('button, .hero-course-btn, .hero-link-btn');
        if (btn) btn.style.transform = '';
      };
      document.addEventListener('pointerup', release, { passive: true });
      document.addEventListener('pointercancel', release, { passive: true });

      // Magnetic hover sutil (2–4px) nos CTAs principais no desktop
      if (motionConfig.isFinePointer) {
        const magneticTargets = ['.hero-course-btn', '.hero-link-btn', '#floating > button', '.shop-cart'];

        document.addEventListener('mousemove', e => {
          const btn = e.target.closest(magneticTargets.join(','));
          if (!btn || motionConfig.reduced) return;

          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const distx = (e.clientX - cx) / (rect.width / 2);
          const disty = (e.clientY - cy) / (rect.height / 2);

          const mx = Math.max(-3.5, Math.min(3.5, distx * 3.5));
          const my = Math.max(-3.5, Math.min(3.5, disty * 3.5));

          btn.style.transform = `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0)`;
        }, { passive: true });

        document.addEventListener('mouseout', e => {
          const btn = e.target.closest(magneticTargets.join(','));
          if (btn && !btn.contains(e.relatedTarget)) {
            btn.style.transform = '';
          }
        });
      }
    }
  };

  // 8. MICROINTERACTIONS (Adicionar serviço, favoritos, sacola, dock)
  const microInteractions = {
    init() {
      document.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;

        // 1. Serviço Adicionado / Removido (data-select)
        if (button.dataset.select) {
          requestAnimationFrame(() => {
            // Spring no botão clicado
            animate(button, [
              { transform: 'scale(.88)' },
              { transform: 'scale(1.14)', offset: 0.6 },
              { transform: 'scale(1)' }
            ], { duration: 400, easing: motionConfig.easeSpring });

            // Resposta de continuidade no badge de agendamento do header
            const scheduleBadge = document.querySelector('header [data-action="booking"] .badge');
            if (scheduleBadge) {
              scheduleBadge.classList.remove('badge-pop');
              void scheduleBadge.offsetWidth;
              scheduleBadge.classList.add('badge-pop');
            }

            // Resposta de continuidade no dock flutuante (breathing feedback)
            const dock = document.querySelector('#floating');
            if (dock && !dock.hidden) {
              dock.classList.remove('breathing');
              void dock.offsetWidth;
              dock.classList.add('breathing');
            }
          });
        }

        // 2. Favorito alternado (data-favorite)
        if (button.dataset.favorite) {
          requestAnimationFrame(() => {
            animate(button, [
              { transform: 'scale(.84)' },
              { transform: 'scale(1.15)', offset: 0.6 },
              { transform: 'scale(1)' }
            ], { duration: 380, easing: motionConfig.easeSpring });
          });
        }

        // 3. Produto adicionado na KR Nail Shop (data-product)
        if (button.dataset.product) {
          requestAnimationFrame(() => {
            animate(button, [
              { transform: 'scale(.86)' },
              { transform: 'scale(1.12)', offset: 0.6 },
              { transform: 'scale(1)' }
            ], { duration: 380, easing: motionConfig.easeSpring });

            // Resposta na sacola do header
            const bagBadge = document.querySelector('.bag-button .shop-count');
            if (bagBadge) {
              bagBadge.classList.remove('badge-pop');
              void bagBadge.offsetWidth;
              bagBadge.classList.add('badge-pop');
            }
          });
        }

        // 4. Quantidade do carrinho (data-qty)
        if (button.dataset.qty) {
          const row = button.closest('.bag-row');
          const span = row?.querySelector('.quantity span');
          if (span) {
            animate(span, [
              { transform: 'scale(.85)', opacity: 0.6 },
              { transform: 'scale(1.08)', opacity: 1, offset: 0.6 },
              { transform: 'scale(1)', opacity: 1 }
            ], { duration: 280, easing: motionConfig.easeSpring });
          }
        }
      }, true);
    }
  };

  // 9. MODAL MOTION (iOS Sheets e Modais)
  const modalMotion = {
    init() {
      // Monkey-patch showModal on dialog elements to guarantee clean state
      if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype._auraPatched) {
        HTMLDialogElement.prototype._auraPatched = true;
        const origShowModal = HTMLDialogElement.prototype.showModal;
        const self = this;
        HTMLDialogElement.prototype.showModal = function() {
          self.clean(this);
          if (!this.open) {
            try {
              origShowModal.call(this);
            } catch (err) {
              console.warn('showModal fallback error', err);
            }
          }
        };
      }

      document.querySelectorAll('dialog').forEach(dialog => {
        dialog.addEventListener('cancel', e => {
          e.preventDefault();
          this.close(dialog);
        });

        // Click outside on backdrop closes dialog
        dialog.addEventListener('click', e => {
          const rect = dialog.getBoundingClientRect();
          const isInDialog = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );
          if (!isInDialog) {
            this.close(dialog);
          }
        });
      });
    },

    clean(dialog) {
      if (!dialog) return;
      if (dialog._closingAnim) {
        try { dialog._closingAnim.cancel(); } catch {}
        dialog._closingAnim = null;
      }
      if (dialog.getAnimations) {
        try {
          dialog.getAnimations().forEach(a => {
            try { a.cancel(); } catch {}
          });
        } catch {}
      }
      delete dialog.dataset.closing;
      dialog.style.opacity = '';
      dialog.style.transform = '';
    },

    open(dialog) {
      if (!dialog) return;
      this.clean(dialog);
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {}
      }
    },

    close(dialog) {
      if (!dialog) return;
      if (!dialog.open && !dialog.dataset.closing) {
        this.clean(dialog);
        return;
      }
      if (dialog.dataset.closing && dialog._closingAnim) return;

      if (motionConfig.reduced || !dialog.animate) {
        this.clean(dialog);
        if (dialog.open) {
          try { dialog.close(); } catch {}
        }
        return;
      }

      dialog.dataset.closing = 'true';
      const isMobile = window.innerWidth <= 540;

      const keyframes = isMobile
        ? [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(60px)' }
          ]
        : [
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(16px) scale(.98)' }
          ];

      const anim = dialog.animate(keyframes, {
        duration: 180,
        easing: motionConfig.easeExit,
        fill: 'none' // CRITICAL: Never fill forwards so styles don't persist!
      });
      dialog._closingAnim = anim;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        this.clean(dialog);
        if (dialog.open) {
          try { dialog.close(); } catch {}
        }
      };

      if (anim) {
        anim.onfinish = finish;
        anim.oncancel = finish;
        setTimeout(finish, 220); // Safety fallback
      } else {
        finish();
      }
    }
  };

  // 10. PAGE TRANSITION (Troca entre catálogo e agendamento)
  const bookingMotion = {
    page(el) {
      if (!el || motionConfig.reduced) return;
      animate(el, [
        { opacity: 0.25, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 420, easing: motionConfig.easeIOS });
    }
  };

  // 11. REDUCED MOTION SAFEGUARD
  const reducedMotion = {
    init() {
      const query = matchMedia('(prefers-reduced-motion: reduce)');
      query.addEventListener('change', () => {
        if (query.matches) {
          document.getAnimations().forEach(a => a.cancel());
        }
        revealMotion.refresh();
      });
    }
  };

  // INITIALIZATION
  function start() {
    pageMotion.init();
    scrollMotion.init();
    heroPointerMotion.init();
    revealMotion.init();
    cardMotion.init();
    buttonMotion.init();
    microInteractions.init();
    modalMotion.init();
    reducedMotion.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // PUBLIC AURA MOTION API
  window.auraMotion = {
    refresh() {
      revealMotion.refresh();
    },
    page(el) {
      bookingMotion.page(el);
    },
    open(dialog) {
      modalMotion.open(dialog);
    },
    close(dialog) {
      modalMotion.close(dialog);
    },
    clean(dialog) {
      modalMotion.clean(dialog);
    }
  };
})();
