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

// ============================================================
// Portfolio Filter — Two-layer spring system
//   .pf-active-pill  light orange — locked to selected category
//   .pf-slider       strong orange — follows cursor, hidden on leave
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    var filterBars = document.querySelectorAll('.portfolio-filters, .aw-filters');
    var items      = document.querySelectorAll('.pf-item');

    // ── Inject Behance + arrow actions into every card ──
    document.querySelectorAll('.pf-item__inner').forEach(function (inner) {
        var actions = document.createElement('div');
        actions.className = 'pf-item__actions';

        // Arrow wrap: label + icon
        var arrowWrap = document.createElement('div');
        arrowWrap.className = 'pf-item__arrow-wrap';

        var label = document.createElement('span');
        label.className = 'pf-item__view-label';
        label.textContent = '\u0639\u0631\u0636 \u0627\u0644\u0639\u0645\u0644';

        var arrowIcon = document.createElement('i');
        arrowIcon.className = 'ri-arrow-right-up-line pf-item__arrow-icon';
        arrowIcon.setAttribute('aria-hidden', 'true');

        arrowWrap.appendChild(label);
        arrowWrap.appendChild(arrowIcon);

        // Behance link (following sibling so CSS ~ selector works)
        var behance = document.createElement('a');
        behance.className = 'pf-item__behance';
        behance.href = 'https://www.behance.net/rosomat';
        behance.target = '_blank';
        behance.rel = 'noopener noreferrer';
        behance.setAttribute('aria-label', 'Behance');

        var bImg = document.createElement('img');
        bImg.src = 'images/behance-logo.png';
        bImg.alt = 'Behance';
        bImg.width = 17;

        behance.appendChild(bImg);
        actions.appendChild(arrowWrap);
        actions.appendChild(behance);
        inner.appendChild(actions);
    });

    // ── Spring integrator ──
    function springStep(cur, target, vel, stiffness, damping, dt) {
        dt = Math.min(dt, 0.05);
        var acc = -stiffness * (cur - target) - damping * vel;
        vel = vel + acc * dt;
        cur = cur + vel * dt;
        return { pos: cur, vel: vel };
    }

    filterBars.forEach(function (bar) {
        var slider     = bar.querySelector('.pf-slider');
        var activePill = bar.querySelector('.pf-active-pill');
        var buttons    = Array.from(bar.querySelectorAll('.pf-filter'));
        if (!slider || !buttons.length) return;

        // Hover slider spring state
        var hX = 0, hW = 0, hVX = 0, hVW = 0, hTX = 0, hTW = 0;
        // Active pill spring state
        var aX = 0, aW = 0, aVX = 0, aVW = 0, aTX = 0, aTW = 0;

        var rafId = null, lastT = 0;
        var hoveredBtn = null;

        function btnRect(btn) {
            var barL = bar.getBoundingClientRect().left;
            var b    = btn.getBoundingClientRect();
            return { x: b.left - barL, w: b.width };
        }

        function applySlider() {
            slider.style.transform = 'translateX(' + hX.toFixed(2) + 'px)';
            slider.style.width     = Math.max(0, hW).toFixed(2) + 'px';
        }

        function applyPill() {
            if (!activePill) return;
            activePill.style.transform = 'translateX(' + aX.toFixed(2) + 'px)';
            activePill.style.width     = Math.max(0, aW).toFixed(2) + 'px';
        }

        function settled(cur, tgt, vel) {
            return Math.abs(cur - tgt) < 0.15 && Math.abs(vel) < 0.5;
        }

        function startAnim() {
            if (rafId) return;
            lastT = 0;
            rafId = requestAnimationFrame(function loop(now) {
                if (!lastT) lastT = now;
                var dt = (now - lastT) / 1000;
                lastT = now;

                // Animate hover slider (snappier spring)
                var rx = springStep(hX, hTX, hVX, 320, 26, dt);
                var rw = springStep(hW, hTW, hVW, 320, 26, dt);
                hX = rx.pos; hVX = rx.vel;
                hW = rw.pos; hVW = rw.vel;
                applySlider();

                // Animate active pill (slightly slower spring)
                var ax = springStep(aX, aTX, aVX, 200, 22, dt);
                var aw = springStep(aW, aTW, aVW, 200, 22, dt);
                aX = ax.pos; aVX = ax.vel;
                aW = aw.pos; aVW = aw.vel;
                applyPill();

                var hDone = settled(hX, hTX, hVX) && settled(hW, hTW, hVW);
                var aDone = settled(aX, aTX, aVX) && settled(aW, aTW, aVW);

                if (hDone && aDone) {
                    hX = hTX; hW = hTW; hVX = 0; hVW = 0;
                    aX = aTX; aW = aTW; aVX = 0; aVW = 0;
                    applySlider(); applyPill();
                    rafId = null;
                } else {
                    rafId = requestAnimationFrame(loop);
                }
            });
        }

        // Find button whose center is closest to a bar-relative x
        function findClosest(relX) {
            var barL = bar.getBoundingClientRect().left;
            var closest = null, minDist = Infinity;
            buttons.forEach(function (btn) {
                var r      = btn.getBoundingClientRect();
                var center = (r.left + r.width / 2) - barL;
                var dist   = Math.abs(relX - center);
                if (dist < minDist) { minDist = dist; closest = btn; }
            });
            return closest;
        }

        // ── Init: snap both elements to active button ──
        var initBtn = bar.querySelector('.pf-filter.is-active');
        if (initBtn) {
            var m = btnRect(initBtn);
            hX = m.x; hW = m.w; hTX = m.x; hTW = m.w;
            aX = m.x; aW = m.w; aTX = m.x; aTW = m.w;
            applySlider(); applyPill();
            requestAnimationFrame(function () {
                if (activePill) activePill.classList.add('is-ready');
                // Slider starts hidden — revealed only on hover
            });
        }

        window.addEventListener('resize', function () {
            var cur = bar.querySelector('.pf-filter.is-active');
            if (!cur) return;
            var bm = btnRect(cur);
            hX = bm.x; hW = bm.w; hTX = bm.x; hTW = bm.w;
            aX = bm.x; aW = bm.w; aTX = bm.x; aTW = bm.w;
            applySlider(); applyPill();
        });

        // ── Mouse enters bar: snap slider to nearest btn, then reveal ──
        bar.addEventListener('mouseenter', function (e) {
            var barL   = bar.getBoundingClientRect().left;
            var relX   = e.clientX - barL;
            var closest = findClosest(relX);
            if (closest) {
                var bm = btnRect(closest);
                hX = bm.x; hW = bm.w; hTX = bm.x; hTW = bm.w;
                hVX = 0; hVW = 0;
                applySlider();
                // Mark hovered button
                if (hoveredBtn && hoveredBtn !== closest) hoveredBtn.classList.remove('is-hovered');
                closest.classList.add('is-hovered');
                hoveredBtn = closest;
            }
            slider.classList.add('is-hovering');
        });

        // ── Mouse moves: track closest button ──
        bar.addEventListener('mousemove', function (e) {
            var barL    = bar.getBoundingClientRect().left;
            var relX    = e.clientX - barL;
            var closest = findClosest(relX);
            if (!closest) return;

            if (hoveredBtn !== closest) {
                if (hoveredBtn) hoveredBtn.classList.remove('is-hovered');
                closest.classList.add('is-hovered');
                hoveredBtn = closest;
            }

            var bm = btnRect(closest);
            hTX = bm.x;
            hTW = bm.w;
            startAnim();
        });

        // ── Mouse leaves bar: hide slider, clear hover text ──
        bar.addEventListener('mouseleave', function () {
            slider.classList.remove('is-hovering');
            if (hoveredBtn) { hoveredBtn.classList.remove('is-hovered'); hoveredBtn = null; }
            // Reset slider target to active pill position (keeps it in sync)
            hTX = aTX; hTW = aTW;
            startAnim();
        });

        // ── Click: animate active pill to new button ──
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cat = btn.getAttribute('data-filter');

                filterBars.forEach(function (otherBar) {
                    var oPill   = otherBar.querySelector('.pf-active-pill');
                    var oSlider = otherBar.querySelector('.pf-slider');
                    otherBar.querySelectorAll('.pf-filter').forEach(function (f) {
                        f.classList.remove('is-active');
                        if (f.getAttribute('data-filter') === cat) {
                            f.classList.add('is-active');
                            var obL = otherBar.getBoundingClientRect().left;
                            var fr  = f.getBoundingClientRect();
                            var ox  = fr.left - obL, ow = fr.width;

                            if (otherBar === bar) {
                                // Spring animate pill to new active
                                aTX = ox; aTW = ow;
                                // Also re-aim slider if mouse is still inside
                                if (slider.classList.contains('is-hovering') && hoveredBtn) {
                                    var hbm = btnRect(hoveredBtn);
                                    hTX = hbm.x; hTW = hbm.w;
                                } else {
                                    hTX = ox; hTW = ow;
                                }
                                startAnim();
                            } else {
                                // Instant snap for other page's bar
                                if (oPill) {
                                    oPill.style.transform = 'translateX(' + ox.toFixed(2) + 'px)';
                                    oPill.style.width     = ow.toFixed(2) + 'px';
                                    if (!oPill.classList.contains('is-ready')) oPill.classList.add('is-ready');
                                }
                                if (oSlider) {
                                    oSlider.style.transform = 'translateX(' + ox.toFixed(2) + 'px)';
                                    oSlider.style.width     = ow.toFixed(2) + 'px';
                                }
                            }
                        }
                    });
                });

                // Filter portfolio items
                items.forEach(function (item) {
                    var match = (cat === 'all' || item.getAttribute('data-category') === cat);
                    if (!match) {
                        item.classList.add('is-animating-out');
                        item.classList.remove('is-animating-in');
                        setTimeout(function () {
                            item.classList.add('is-hidden');
                            item.classList.remove('is-animating-out');
                        }, 350);
                    } else {
                        item.classList.remove('is-hidden', 'is-animating-out');
                        item.classList.add('is-animating-in');
                        setTimeout(function () { item.classList.remove('is-animating-in'); }, 500);
                    }
                });
            });
        });
    });

    // Staggered fade-up for portfolio items + observe them
    var pfObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                pfObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    items.forEach(function (item, i) {
        item.classList.add('fade-up');
        item.style.transitionDelay = (i * 0.08) + 's';
        pfObserver.observe(item);
    });

    // Fade-up for header and filters
    var pfHeader = document.querySelector('.portfolio-header');
    var pfFilters = document.querySelector('.portfolio-filters');
    if (pfHeader) { pfHeader.classList.add('fade-up'); pfObserver.observe(pfHeader); }
    if (pfFilters) { pfFilters.classList.add('fade-up'); pfObserver.observe(pfFilters); }

    // All-works page: drop-in filter reveal when scrolled into view
    var awFilterBar = document.querySelector('.aw-portfolio .aw-filters');
    if (awFilterBar) {
        var awFilterObs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                awFilterBar.classList.add('is-revealed');
                awFilterObs.disconnect();
            }
        }, { threshold: 0.1 });
        awFilterObs.observe(awFilterBar);
    }
});
