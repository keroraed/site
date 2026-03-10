// ============================================================
// Hero Slideshow — crossfade between images
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;
    var current = 0;
    setInterval(function () {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 3000);
});

// ============================================================
// Hamburger Menu — mobile nav toggle
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('hamburgerBtn');
    const links = document.getElementById('navLinks');
    if (!btn || !links) return;

    btn.addEventListener('click', function () {
        const isOpen = links.classList.toggle('is-open');
        btn.classList.toggle('is-open', isOpen);
        btn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when any nav link is clicked
    links.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            links.classList.remove('is-open');
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
});

// ============================================================
// Navbar — transparent → frosted glass on scroll
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const nav = document.getElementById('navbar');
    function updateNav() {
        const scrollY = window.scrollY;
        const ratio = Math.min(scrollY / 120, 1);
        const alpha  = (ratio * 0.85).toFixed(3);
        const blur   = (ratio * 18).toFixed(1);
        const shadow = ratio > 0.05
            ? `0 1px 16px rgba(0,0,0,${(ratio * 0.06).toFixed(3)})`
            : 'none';
        nav.style.background           = `rgba(247, 241, 234, ${alpha})`;
        nav.style.backdropFilter       = `blur(${blur}px)`;
        nav.style.webkitBackdropFilter = `blur(${blur}px)`;
        nav.style.boxShadow            = shadow;
        nav.style.borderBottomColor    = ratio > 0.1
            ? `rgba(0,0,0,${(ratio * 0.06).toFixed(2)})`
            : 'transparent';
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
});
// ============================================================
// Scroll-Triggered Fade-In Entrance Animations
// — Uses Intersection Observer for all sections & elements
// — Supports stagger delay for child groups (e.g. service cards, flip cards)
// — Hero animates immediately on page load
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

    // ── 1. Mark animatable elements with the fade-up class ──
    // NOTE: Hero elements have fade-up in HTML so they're hidden from first paint.
    var fadeTargets = [
        // Packages
        '.section-header',
        // How We Work
        '.process-title',
        '.process-subtitle',
        // Services
        '.services-header',
        // Contact
        '.contact-card',
        // Footer
        '.site-footer .footer-grid',
        '.site-footer .footer-bottom'
    ];

    fadeTargets.forEach(function (selector) {
        var el = document.querySelector(selector);
        if (el) el.classList.add('fade-up');
    });

    // Staggered children: pkg-cards & service cards
    document.querySelectorAll('.pkg-card').forEach(function (card, i) {
        card.classList.add('fade-up');
        card.style.transitionDelay = (i * 0.12) + 's';
    });
    document.querySelectorAll('.srv-card').forEach(function (card, i) {
        card.classList.add('fade-up');
        card.style.transitionDelay = (i * 0.1) + 's';
    });
    // process-step replaced with horizontal scroll cards — no fade-up needed

    // ── 2. Intersection Observer — reveal when 12% visible ──
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // animate only once
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
    });

    // ── 3. Observe every .fade-up element (except hero — handled separately) ──
    document.querySelectorAll('.fade-up').forEach(function (el) {
        if (!el.classList.contains('hero-text-block') && !el.classList.contains('hero-visual')) {
            observer.observe(el);
        }
    });

    // ── 4. Hero — fade in on page load ──
    // fade-up is already in the HTML markup, so the hero renders at opacity:0
    // from the very first paint. We add is-visible after a short delay to
    // guarantee the browser has painted the hidden state before transitioning.
    var heroText   = document.querySelector('.hero-text-block');
    var heroVisual = document.querySelector('.hero-visual');
    setTimeout(function () {
        if (heroText) heroText.classList.add('is-visible');
    }, 100);
    setTimeout(function () {
        if (heroVisual) heroVisual.classList.add('is-visible');
    }, 300);
});

// ============================================================
// How We Work — Horizontal scroll-driven card reveal
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var section = document.getElementById('how-we-work');
    if (!section) return;

    var track     = section.querySelector('.process-track');
    var cards     = Array.from(section.querySelectorAll('.process-card'));
    var fill      = section.querySelector('.process-ind__fill');
    var label     = section.querySelector('.process-ind__label');
    var dots      = Array.from(section.querySelectorAll('.process-dot'));
    var n         = cards.length;
    var active    = 0;

    function tx(progress) {
        var vw    = window.innerWidth;
        var pad   = 64;
        var gap   = 28;
        var cw    = cards[0].offsetWidth;
        var initX = vw / 2 - pad - cw / 2;
        var endX  = vw / 2 - (pad + (n - 1) * (cw + gap) + cw / 2);
        var isRTL = document.documentElement.dir !== 'ltr';

        if (isRTL) {
            // RTL track starts from the right-most card visually.
            return endX + progress * (initX - endX);
        }

        // LTR track starts from the first card visually.
        return initX + progress * (endX - initX);
    }

    function update() {
        var rect  = section.getBoundingClientRect();
        var total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var prog  = Math.min(1, Math.max(0, -rect.top / total));

        track.style.transform = 'translateX(' + tx(prog).toFixed(2) + 'px)';
        fill.style.width = (prog * 100).toFixed(1) + '%';

        var step = Math.min(n - 1, Math.round(prog * (n - 1)));
        if (step !== active) {
            active = step;
            cards.forEach(function (c, i) { c.classList.toggle('is-active', i === step); });
            dots.forEach(function (d, i) { d.classList.toggle('is-active', i === step); });
            label.textContent = '0' + (step + 1) + ' / 0' + n;
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            var total = section.offsetHeight - window.innerHeight;
            var targetProg = (n < 2) ? 0 : i / (n - 1);
            window.scrollTo({ top: section.offsetTop + targetProg * total, behavior: 'smooth' });
        });
    });
});

// ============================================================
// Billing Toggle — monthly / yearly
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var toggle      = document.getElementById('billing-switch');
    var saveBadge   = document.getElementById('billing-save');
    var labelMonthly = document.getElementById('label-monthly');
    var labelYearly  = document.getElementById('label-yearly');
    var amounts     = document.querySelectorAll('.pkg-card__amount');

    if (!toggle) return;

    var isYearly = false;

    function updatePrices() {
        amounts.forEach(function (el) {
            var val = isYearly ? el.dataset.yearly : el.dataset.monthly;
            el.style.opacity = '0';
            setTimeout(function () {
                el.textContent = val;
                el.style.opacity = '1';
            }, 200);
        });
    }

    function applyState() {
        toggle.classList.toggle('is-yearly', isYearly);
        toggle.setAttribute('aria-checked', isYearly);
        saveBadge.classList.toggle('visible', isYearly);
        labelMonthly.classList.toggle('active', !isYearly);
        labelYearly.classList.toggle('active', isYearly);
        updatePrices();
    }

    // set initial active label
    labelMonthly.classList.add('active');

    toggle.addEventListener('click', function () {
        isYearly = !isYearly;
        applyState();
    });

    toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            isYearly = !isYearly;
            applyState();
        }
    });
});

// ============================================================
// Scroll Entrance Animations — IntersectionObserver
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var animatedEls = document.querySelectorAll(
        '.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-scale'
    );

    if (!('IntersectionObserver' in window)) {
        animatedEls.forEach(function (el) { el.classList.add('animate-visible'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedEls.forEach(function (el) { observer.observe(el); });
});

// ============================================================
// Pre-select Service from URL param  ?service=N
// — Used when arriving from services.html or service-detail.html
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var params    = new URLSearchParams(window.location.search);
    var serviceId = params.get('service');
    if (!serviceId) return;

    var select  = document.getElementById('service');
    var section = document.getElementById('contact');
    if (!select || !section) return;

    // Pre-select the option
    select.value = serviceId;

    // Pulse-highlight the field so the user notices it
    select.style.transition   = 'box-shadow 0.4s ease, border-color 0.4s ease';
    select.style.borderColor  = '#d42b1e';
    select.style.boxShadow    = '0 0 0 3px rgba(212,43,30,0.20)';
    setTimeout(function () {
        select.style.borderColor = '';
        select.style.boxShadow   = '';
    }, 2200);

    // Smooth-scroll to the contact section
    setTimeout(function () {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
});

// ============================================================
// FAQ Accordion
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            var isOpen = item.classList.contains('active');

            // Close all items first (single-open accordion)
            document.querySelectorAll('.faq-item.active').forEach(function (openItem) {
                openItem.classList.remove('active');
                openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle the clicked one
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
});
