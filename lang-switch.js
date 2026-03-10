(() => {
    const LANG_KEY = 'rosomat.language';
    const CACHE_KEY = 'rosomat.translation.cache.ar_en.v1';
    const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
    const SEP = '[[[__ROSOMAT_SEP__]]]';
    const ARABIC_RE = /[\u0600-\u06FF]/;
    const EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'TEXTAREA']);

    const state = {
        current: 'ar',
        cache: loadCache(),
        textTargets: [],
        attrTargets: [],
        titleSource: '',
        applying: false,
        observer: null,
        refreshTimer: null,
        pendingRequest: null
    };

    function loadCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return (parsed && typeof parsed === 'object') ? parsed : {};
        } catch (err) {
            return {};
        }
    }

    function saveCache() {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(state.cache));
        } catch (err) {
            // Ignore storage failures (private mode / quota).
        }
    }

    function containsArabic(value) {
        return ARABIC_RE.test(value || '');
    }

    function normalizeWhitespace(value) {
        return (value || '').replace(/\s+/g, ' ').trim();
    }

    function createDesktopSwitch() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-switch';
        btn.setAttribute('data-lang-toggle', 'desktop');
        btn.setAttribute('aria-label', 'Switch language');
        btn.innerHTML = [
            '<span class="lang-switch__label lang-switch__label--ar">AR</span>',
            '<span class="lang-switch__label lang-switch__label--en">EN</span>',
            '<span class="lang-switch__thumb"></span>'
        ].join('');
        return btn;
    }

    function createMobileSwitch() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-mobile-btn';
        btn.setAttribute('data-lang-toggle', 'mobile');
        btn.setAttribute('aria-label', 'Switch language');
        btn.innerHTML = '<i class="ri-translate-2"></i><span>English</span>';
        return btn;
    }

    function injectSwitches() {
        const actions = document.querySelector('.navbar__actions');
        if (actions && !actions.querySelector('[data-lang-toggle="desktop"]')) {
            actions.insertBefore(createDesktopSwitch(), actions.firstChild || null);
        }

        const navLinks = document.getElementById('navLinks');
        if (navLinks && !navLinks.querySelector('[data-lang-toggle="mobile"]')) {
            navLinks.appendChild(createMobileSwitch());
        }
    }

    function syncSwitchUI(lang) {
        const isEN = lang === 'en';

        document.querySelectorAll('.lang-switch').forEach((el) => {
            el.classList.toggle('is-en', isEN);
            el.setAttribute('aria-pressed', isEN ? 'true' : 'false');
        });

        document.querySelectorAll('.lang-mobile-btn').forEach((el) => {
            el.setAttribute('aria-pressed', isEN ? 'true' : 'false');
            const label = el.querySelector('span');
            if (label) label.textContent = isEN ? 'العربية' : 'English';
        });
    }

    function setDocumentDirection(lang) {
        const html = document.documentElement;
        const isEN = lang === 'en';
        html.setAttribute('lang', isEN ? 'en' : 'ar');
        html.setAttribute('dir', isEN ? 'ltr' : 'rtl');
        document.body.classList.toggle('lang-en', isEN);
    }

    function trackTextNodes() {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const parent = node.parentElement;

            if (!parent) continue;
            if (EXCLUDED_TAGS.has(parent.tagName)) continue;
            if (parent.closest('[data-no-translate]')) continue;

            if (!node.__rosomatI18n) {
                const source = node.nodeValue || '';
                const key = normalizeWhitespace(source);
                if (!key || !containsArabic(key)) continue;

                const prefix = (source.match(/^\s*/) || [''])[0];
                const suffix = (source.match(/\s*$/) || [''])[0];

                node.__rosomatI18n = {
                    source,
                    key,
                    prefix,
                    suffix
                };
                state.textTargets.push(node);
            }
        }
    }

    function trackAttributeTargets() {
        const attrs = ['placeholder', 'title', 'aria-label'];
        const elements = document.body.querySelectorAll('*');

        elements.forEach((el) => {
            if (el.closest('[data-no-translate]')) return;
            if (!el.__rosomatI18nAttrs) el.__rosomatI18nAttrs = {};

            attrs.forEach((attr) => {
                const current = el.getAttribute(attr);
                if (!current) return;

                const key = normalizeWhitespace(current);
                if (!key) return;

                if (!el.__rosomatI18nAttrs[attr]) {
                    if (!containsArabic(key)) return;
                    el.__rosomatI18nAttrs[attr] = {
                        source: current,
                        key
                    };
                    state.attrTargets.push({ el, attr });
                }
            });
        });
    }

    function trackTitle() {
        if (state.titleSource) return;
        const title = document.title || '';
        if (!containsArabic(title)) return;
        state.titleSource = title;
    }

    function compactTargetLists() {
        state.textTargets = state.textTargets.filter((node) => node && node.isConnected && node.__rosomatI18n);
        state.attrTargets = state.attrTargets.filter((target) => {
            if (!target || !target.el || !target.el.isConnected) return false;
            return Boolean(target.el.__rosomatI18nAttrs && target.el.__rosomatI18nAttrs[target.attr]);
        });
    }

    function collectMissingKeys() {
        const missing = new Set();

        state.textTargets.forEach((node) => {
            const meta = node.__rosomatI18n;
            if (!meta || !meta.key) return;
            if (!state.cache[meta.key]) missing.add(meta.key);
        });

        state.attrTargets.forEach(({ el, attr }) => {
            const meta = el.__rosomatI18nAttrs && el.__rosomatI18nAttrs[attr];
            if (!meta || !meta.key) return;
            if (!state.cache[meta.key]) missing.add(meta.key);
        });

        if (state.titleSource) {
            const key = normalizeWhitespace(state.titleSource);
            if (key && !state.cache[key]) missing.add(key);
        }

        return Array.from(missing);
    }

    async function translateQuery(rawText) {
        const url = `${TRANSLATE_URL}?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(rawText)}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Translate request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
            return rawText;
        }

        return payload[0].map((part) => Array.isArray(part) ? (part[0] || '') : '').join('');
    }

    function buildChunks(list) {
        const chunks = [];
        let current = [];
        let size = 0;

        list.forEach((item) => {
            const projected = size + item.length + SEP.length;
            if (current.length > 0 && (projected > 3600 || current.length >= 40)) {
                chunks.push(current);
                current = [];
                size = 0;
            }

            current.push(item);
            size += item.length + SEP.length;
        });

        if (current.length > 0) chunks.push(current);
        return chunks;
    }

    async function translateMissingKeys(missing) {
        if (!missing.length) return;

        const chunks = buildChunks(missing);
        for (const chunk of chunks) {
            if (state.pendingRequest && state.pendingRequest.lang === 'ar') {
                break;
            }

            try {
                const packed = chunk.join(SEP);
                const translatedPacked = await translateQuery(packed);
                const pieces = translatedPacked.split(SEP);

                if (pieces.length === chunk.length) {
                    chunk.forEach((source, idx) => {
                        state.cache[source] = (pieces[idx] || source).trim() || source;
                    });
                } else {
                    // Fallback for unexpected separator handling.
                    for (const source of chunk) {
                        try {
                            const translated = await translateQuery(source);
                            state.cache[source] = translated || source;
                        } catch (err) {
                            state.cache[source] = source;
                        }
                    }
                }
            } catch (err) {
                chunk.forEach((source) => {
                    if (!state.cache[source]) state.cache[source] = source;
                });
            }
        }

        saveCache();
    }

    function applyEnglish() {
        state.textTargets.forEach((node) => {
            const meta = node.__rosomatI18n;
            if (!meta) return;
            const translated = state.cache[meta.key] || meta.key;
            node.nodeValue = `${meta.prefix}${translated}${meta.suffix}`;
        });

        state.attrTargets.forEach(({ el, attr }) => {
            const meta = el.__rosomatI18nAttrs && el.__rosomatI18nAttrs[attr];
            if (!meta) return;
            const translated = state.cache[meta.key] || meta.key;
            el.setAttribute(attr, translated);
        });

        if (state.titleSource) {
            const key = normalizeWhitespace(state.titleSource);
            document.title = state.cache[key] || state.titleSource;
        }
    }

    function applyArabic() {
        state.textTargets.forEach((node) => {
            const meta = node.__rosomatI18n;
            if (!meta) return;
            node.nodeValue = meta.source;
        });

        state.attrTargets.forEach(({ el, attr }) => {
            const meta = el.__rosomatI18nAttrs && el.__rosomatI18nAttrs[attr];
            if (!meta) return;
            el.setAttribute(attr, meta.source);
        });

        if (state.titleSource) {
            document.title = state.titleSource;
        }
    }

    async function applyLanguage(lang, persist = true) {
        const targetLang = lang === 'en' ? 'en' : 'ar';
        if (state.applying) {
            state.pendingRequest = { lang: targetLang, persist };
            return;
        }

        clearTimeout(state.refreshTimer);
        state.applying = true;
        try {
            state.current = targetLang;
            setDocumentDirection(state.current);

            trackTextNodes();
            trackAttributeTargets();
            trackTitle();
            compactTargetLists();

            if (state.current === 'en') {
                const missing = collectMissingKeys();
                await translateMissingKeys(missing);
                if (state.pendingRequest && state.pendingRequest.lang === 'ar') {
                    return;
                }
                applyEnglish();
            } else {
                applyArabic();
            }

            syncSwitchUI(state.current);
            if (persist) localStorage.setItem(LANG_KEY, state.current);
        } finally {
            state.applying = false;
            const pending = state.pendingRequest;
            state.pendingRequest = null;
            if (pending && pending.lang !== state.current) {
                applyLanguage(pending.lang, pending.persist);
            }
        }
    }

    function scheduleRefreshForEnglish() {
        if (state.current !== 'en' || state.applying) return;
        clearTimeout(state.refreshTimer);
        state.refreshTimer = setTimeout(() => {
            applyLanguage('en', false);
        }, 220);
    }

    function setupObserver() {
        if (state.observer) return;
        state.observer = new MutationObserver((mutations) => {
            if (state.current !== 'en' || state.applying) return;

            const hasAddedNodes = mutations.some((m) => m.addedNodes && m.addedNodes.length > 0);
            if (!hasAddedNodes) return;
            scheduleRefreshForEnglish();
        });

        state.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function bindSwitches() {
        document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const next = state.current === 'ar' ? 'en' : 'ar';
                applyLanguage(next, true);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectSwitches();
        bindSwitches();
        setupObserver();

        const preferred = localStorage.getItem(LANG_KEY);
        applyLanguage(preferred === 'en' ? 'en' : 'ar', false);
    });
})();
