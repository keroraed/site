// ============================================================
// Flip Cards — tap to flip on touch/mobile devices
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.flip-card').forEach(function (card) {
        // Touch tap: toggle flipped state
        card.addEventListener('click', function () {
            card.classList.toggle('is-flipped');
        });
        // Keyboard: space / enter to flip
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('is-flipped');
            }
        });
    });
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
// Hero — subtle entrance animation
// ============================================================
window.addEventListener('load', function () {
    const heroText = document.querySelector('.hero-text-block');
    const heroVisual = document.querySelector('.hero-visual');
    if (heroText) {
        heroText.style.opacity = '0';
        heroText.style.transform = 'translateY(24px)';
        heroText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        requestAnimationFrame(function () {
            heroText.style.opacity = '1';
            heroText.style.transform = 'translateY(0)';
        });
    }
    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateY(32px)';
        heroVisual.style.transition = 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s';
        requestAnimationFrame(function () {
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateY(0)';
        });
    }
});