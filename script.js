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
        // Services
        '.services-title',
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
    document.querySelectorAll('.service-card').forEach(function (card, i) {
        card.classList.add('fade-up');
        card.style.transitionDelay = (i * 0.12) + 's';
    });

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