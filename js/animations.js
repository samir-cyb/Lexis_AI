// ============================================
// LexisAI — GSAP Animations
// 3D-like, smooth, interactive animations
// ============================================

const LexisAnimations = {
  init() {
    // Register GSAP plugins
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      this.initNavbar();
      this.initHero();
      this.initFeatures();
      this.initSteps();
      this.initPricing();
      this.initCTA();
      this.initFooter();
    }
  },

  // ---- Navbar scroll effect ----
  initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 80) {
          navbar.classList.add('scrolled');
        } else if (self.scroll() <= 80) {
          navbar.classList.remove('scrolled');
        }
      }
    });

    // Nav link animations
    gsap.from('.nav-logo', {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    gsap.from('.nav-links li', {
      y: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.nav-actions', {
      y: -20,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      delay: 0.4
    });
  },

  // ---- Hero animations ----
  initHero() {
    const heroTl = gsap.timeline({ delay: 0.5 });

    heroTl
      .from('.hero-badge', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      })
      .from('.hero h1 .line1', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero h1 .line2', {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.4')
      .from('.hero > .container > .hero-content > p', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero-actions .btn', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=0.2');

    // 3D card entrance
    gsap.from('.hero-3d-card', {
      scale: 0.8,
      opacity: 0,
      rotationY: 15,
      duration: 1,
      ease: 'power3.out',
      delay: 0.8
    });

    // Floating elements
    gsap.from('.hero-float-element', {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      delay: 1.2
    });

    // Parallax on gradient orbs
    gsap.to('.hero-gradient-orb.orb1', {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    gsap.to('.hero-gradient-orb.orb2', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // 3D card mouse follow
    const card = document.querySelector('.hero-3d-card');
    if (card) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = ((centerY - y) / centerY) * 10;

        gsap.to(card, {
          rotateY: rotateY,
          rotateX: rotateX,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: -5,
          rotateX: 5,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    }
  },

  // ---- Features animations ----
  initFeatures() {
    gsap.from('.section-header', {
      scrollTrigger: {
        trigger: '.features',
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%'
      },
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // Feature icon hover animation
    document.querySelectorAll('.feature-icon').forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          scale: 1.1,
          rotation: 5,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });

      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  },

  // ---- Steps animation ----
  initSteps() {
    gsap.from('.step', {
      scrollTrigger: {
        trigger: '.steps',
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Connecting line animation
    gsap.from('.steps::before', {
      scaleX: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.steps',
        start: 'top 80%'
      }
    });
  },

  // ---- Pricing animations ----
  initPricing() {
    gsap.from('.pricing-card', {
      scrollTrigger: {
        trigger: '.pricing-grid',
        start: 'top 80%'
      },
      y: 60,
      opacity: 0,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power3.out'
    });

    // Price counter animation
    document.querySelectorAll('.pricing-amount').forEach(el => {
      const text = el.textContent;
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      const prefix = text.replace(/[0-9.,]/g, '');

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => {
          gsap.from(el, {
            textContent: 0,
            duration: 1.5,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate: function() {
              el.textContent = prefix + Math.round(parseFloat(el.textContent.replace(/[^0-9.]/g, '')) * 100) / 100;
            }
          });
        },
        once: true
      });
    });
  },

  // ---- CTA animations ----
  initCTA() {
    gsap.from('.cta-card', {
      scrollTrigger: {
        trigger: '.cta',
        start: 'top 80%'
      },
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  },

  // ---- Footer animations ----
  initFooter() {
    gsap.from('.footer-content > div', {
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%'
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  },

  // ---- Page transition ----
  pageTransition(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--bg-primary, #0a0a1e);
      z-index: 9999;
      transform: scaleY(0);
      transform-origin: bottom;
    `;
    document.body.appendChild(overlay);

    const tl = gsap.timeline({
      onComplete: () => {
        if (callback) callback();
        gsap.to(overlay, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => overlay.remove()
        });
      }
    });

    tl.to(overlay, {
      scaleY: 1,
      duration: 0.5,
      ease: 'power3.inOut'
    });
  },

  // ---- Button ripple effect ----
  rippleEffect(event) {
    const btn = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
    `;

    btn.appendChild(ripple);

    gsap.to(ripple, {
      scale: 2,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  },

  // ---- 3D tilt effect for cards ----
  init3DTilt() {
    document.querySelectorAll('.card-3d').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = ((centerY - y) / centerY) * 8;

        gsap.to(card, {
          rotateY,
          rotateX,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  },

  // ---- Particle background ----
  initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.vx -= dx / dist * 0.02;
          this.vy -= dy / dist * 0.02;
        }

        // Bounds
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123, 47, 247, ${this.opacity})`;
        ctx.fill();
      }
    }

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(123, 47, 247, ${0.1 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      drawConnections();
      requestAnimationFrame(animate);
    }

    animate();
  },

  // ---- Score counter animation ----
  animateScore(element, target, duration = 1) {
    gsap.to(element, {
      innerText: target,
      duration,
      ease: 'power2.out',
      snap: { innerText: 1 },
      onUpdate: function() {
        element.textContent = Math.round(parseFloat(element.textContent));
      }
    });
  },

  // ---- Celebration effect ----
  celebrate(x, y, isKid = false) {
    const colors = isKid
      ? ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6']
      : ['#7B2FF7', '#00D4FF', '#FF2D95', '#00FF88'];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4;
      const angle = (Math.PI * 2 / 20) * i;
      const velocity = 50 + Math.random() * 100;

      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${isKid ? '50%' : '2px'};
        pointer-events: none;
        z-index: 10000;
      `;

      document.body.appendChild(particle);

      gsap.to(particle, {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity - 50,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 360,
        duration: 0.8 + Math.random() * 0.5,
        ease: 'power2.out',
        onComplete: () => particle.remove()
      });
    }
  }
};
