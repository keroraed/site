tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', 'sans-serif'],
            },
            colors: {
                brand: {
                    red: '#e63946',
                    orange: '#f4a261',
                    gradientStart: '#ff4b4b',
                    gradientEnd: '#ff8f3d'
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #ff4b4b 0%, #ff8f3d 100%)',
                'soft-warm': 'linear-gradient(135deg, #fdfbf7 0%, #fff0e6 50%, #ffe6e6 100%)',
                'dotted-pattern': 'radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)'
            }
        }
    }
};

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