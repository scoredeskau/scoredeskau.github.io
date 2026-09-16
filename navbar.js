/**
 * Shared Navbar Component - High-Performance Edition
 */
(function () {
    'use strict';

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' },
        { label: 'Schedule', target: '#schedule' },
        { label: 'Announcements', target: '#announcements' },
        { label: 'Results', target: '#results' },
        { label: 'Streams', target: '#streams' },
        { label: 'Settings', target: '#settings' }
    ];

    const PAGE_THEME = window.PAGE_THEME || 'theme-australian';

    // Apply baseline theme classes cleanly
    document.documentElement.className = document.documentElement.className.replace(/\btheme-\S+/g, '').trim() + ' ' + PAGE_THEME;
    document.body.className = PAGE_THEME;

    function getInitialTabIndex() {
        const hash = window.location.hash;
        if (hash) {
            const index = NAVIGATION_ITEMS.findIndex(item => item.target === hash);
            if (index !== -1) return index;
        }
        const stored = sessionStorage.getItem(`active_tab_${window.location.pathname}`);
        if (stored !== null) {
            const idx = parseInt(stored, 10);
            if (!isNaN(idx) && idx >= 0 && idx < NAVIGATION_ITEMS.length) return idx;
        }
        return 0;
    }

    let activeTabIndex = getInitialTabIndex();

    // Mount DOM Framework
    const navContainer = document.getElementById('navContainer');
    if (!navContainer) return;

    navContainer.innerHTML = `
        <nav class="navbar combined-header-navbar" id="combinedNavbar">
            <div class="branding-group" id="brandingGroup">
                <div class="icon-action-button back-button" aria-label="Go Back" role="button" tabindex="0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 5.5L8 12L14.5 18.5"/>
                    </svg>
                </div>
                <div class="header-titles">
                    <div class="primary-title">${window.PAGE_PRIMARY_TITLE || '2026 RSYLTC Clay Court Championships'}</div>
                    <div class="secondary-title">${window.PAGE_SECONDARY_TITLE || 'Tournament Management'}</div>
                </div>
            </div>

            <div class="tab-scroll-viewport" id="desktopTabViewport">
                <ul class="tab-list" id="desktopTabList">
                    <div class="active-tab-highlight" id="desktopActiveHighlight"></div>
                </ul>
            </div>

            <button class="icon-action-button toggle-menu-button" id="toggleMenuButton" aria-label="Toggle Tab Menu" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 15L12 9L6 15"/>
                </svg>
            </button>
        </nav>

        <div class="stacked-tab-wrapper" id="lowerTabWrapper">
            <div class="stacked-tab-navbar-inner">
                <nav class="navbar stacked-tab-navbar">
                    <div class="tab-scroll-viewport" id="mobileTabViewport">
                        <ul class="tab-list" id="mobileTabList">
                            <div class="active-tab-highlight" id="mobileActiveHighlight"></div>
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
    `;

    const combinedNavbar = document.getElementById('combinedNavbar');
    const brandingGroup = document.getElementById('brandingGroup');
    const desktopTabList = document.getElementById('desktopTabList');
    const mobileTabList = document.getElementById('mobileTabList');
    const desktopViewport = document.getElementById('desktopTabViewport');
    const mobileViewport = document.getElementById('mobileTabViewport');
    const themeTitleHeading = document.getElementById('themeTitleHeading');
    const toggleMenuButton = document.getElementById('toggleMenuButton');
    const lowerTabWrapper = document.getElementById('lowerTabWrapper');

    // Keep a last measured height so CSS max-height has stable endpoints.
    let bar3MeasuredHeight = 0;

    function buildTabsHtml() {
        return NAVIGATION_ITEMS.map((item, index) => 
            `<li class="tab-item"><a href="${item.target || '#'}" class="tab-link${index === activeTabIndex ? ' is-active' : ''}" data-index="${index}">${item.label}</a></li>`
        ).join('');
    }

    desktopTabList.insertAdjacentHTML('beforeend', buildTabsHtml());
    mobileTabList.insertAdjacentHTML('beforeend', buildTabsHtml());

    const desktopHighlight = document.getElementById('desktopActiveHighlight');
    const mobileHighlight = document.getElementById('mobileActiveHighlight');

    function updateHighlightPosition(activeTabLink, highlightElement, viewportElement, isInstant = false) {
        if (!activeTabLink || !highlightElement || !viewportElement) return;

        const activeItem = activeTabLink.closest('.tab-item');
        if (!activeItem) return;

        if (isInstant) {
            highlightElement.classList.add('no-transition');
        }

        const targetWidthPx = activeItem.offsetWidth;
        const horizontalOffsetPx = activeItem.offsetLeft;

        highlightElement.style.width = `${targetWidthPx}px`;
        highlightElement.style.transform = `translateX(${horizontalOffsetPx}px)`;
        highlightElement.classList.add('is-visible');

        const viewportWidth = viewportElement.clientWidth;
        const maxScroll = Math.max(0, viewportElement.scrollWidth - viewportWidth);
        const targetScrollLeft = Math.max(0, Math.min(maxScroll, (horizontalOffsetPx + (targetWidthPx / 2)) - (viewportWidth / 2)));

        if (isInstant) {
            viewportElement.scrollLeft = targetScrollLeft;
            void highlightElement.offsetHeight;
            highlightElement.classList.remove('no-transition');
        } else {
            viewportElement.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
        }
    }

    function checkCollisionBreakpoints(containerWidth) {
        navContainer.classList.remove('is-collapsed-mode');

        const navbarWidth = containerWidth || combinedNavbar.clientWidth;
        const brandingWidth = brandingGroup.scrollWidth;
        const tabsWidth = desktopTabList.scrollWidth;

        if (navbarWidth < (brandingWidth + tabsWidth + 12)) {
            navContainer.classList.add('is-collapsed-mode');
        }

        switchActiveTab(activeTabIndex, true);
    }

    function switchActiveTab(index, isInstant = false) {
        activeTabIndex = index;
        const currentItem = NAVIGATION_ITEMS[index] || NAVIGATION_ITEMS[0];

        sessionStorage.setItem(`active_tab_${window.location.pathname}`, index);
        if (currentItem.target && window.location.hash !== currentItem.target) {
            history.replaceState(null, '', currentItem.target);
        }

        const allTabLinks = navContainer.querySelectorAll('.tab-link');
        for (let i = 0; i < allTabLinks.length; i++) {
            const link = allTabLinks[i];
            link.classList.toggle('is-active', parseInt(link.dataset.index, 10) === index);
        }

        if (themeTitleHeading) {
            themeTitleHeading.textContent = currentItem.label;
        }

        const activeDesktopLink = desktopTabList.querySelector(`a[data-index="${index}"]`);
        const activeMobileLink = mobileTabList.querySelector(`a[data-index="${index}"]`);

        updateHighlightPosition(activeDesktopLink, desktopHighlight, desktopViewport, isInstant);
        updateHighlightPosition(activeMobileLink, mobileHighlight, mobileViewport, isInstant);
    }

    // Toggle Menu Button with press feedback matching the left action button
    toggleMenuButton.addEventListener('click', () => {
        toggleMenuButton.classList.add('is-pressed');
        setTimeout(() => toggleMenuButton.classList.remove('is-pressed'), 120);

        const willHide = !lowerTabWrapper.classList.contains('is-hidden');

        // Measure the content height when expanding.
        const stackedTabNavbar = lowerTabWrapper.querySelector('.stacked-tab-navbar');
        const measured = stackedTabNavbar ? (stackedTabNavbar.scrollHeight || stackedTabNavbar.offsetHeight) : (lowerTabWrapper.scrollHeight || 0);
        const targetHeight = (measured > 0 ? measured : (bar3MeasuredHeight || 0));
        bar3MeasuredHeight = Math.max(1, targetHeight);

        // Animate Bar 3 height so the content underneath scrolls smoothly.
        // Fade is controlled solely via `.is-hidden` + CSS transitions.
        lowerTabWrapper.classList.remove('bar3-fade-in', 'bar3-fade-out');

        // Ensure layout reads happen before we set the target.
        // Keep bar3MeasuredHeight in sync for later fallbacks.
        if (measured > 0) bar3MeasuredHeight = measured;

        // Force reflow so transition applies.
        // eslint-disable-next-line no-unused-expressions
        void lowerTabWrapper.offsetHeight;

        const isHidden = lowerTabWrapper.classList.toggle('is-hidden');

        // Drive height animation via a CSS variable.
        lowerTabWrapper.style.setProperty('--bar3-h', `${bar3MeasuredHeight}px`);

        // If hiding, delay the actual height collapse until after fade-out,
        // so fade-out remains visible.
        if (isHidden) {
            const fadeOutMs = 500; // matches --bar3-fade-out-duration
            lowerTabWrapper.style.maxHeight = `var(--bar3-h)`;
            window.setTimeout(() => {
                lowerTabWrapper.style.maxHeight = '0px';
            }, fadeOutMs);
        } else {
            // Ensure we expand back to measured height.
            lowerTabWrapper.style.maxHeight = `var(--bar3-h)`;
        }

        toggleMenuButton.classList.toggle('is-collapsed', isHidden);
        toggleMenuButton.setAttribute('aria-expanded', !isHidden);

        if (!isHidden) {
            const activeMobileLink = mobileTabList.querySelector(`a[data-index="${activeTabIndex}"]`);
            updateHighlightPosition(activeMobileLink, mobileHighlight, mobileViewport, true);
        }
    });

    navContainer.addEventListener('click', (event) => {
        const clickedTabLink = event.target.closest('.tab-link');
        if (clickedTabLink) {
            const index = parseInt(clickedTabLink.dataset.index, 10);
            if (!isNaN(index)) switchActiveTab(index, false);
        }
    });

    // Touch Feedback Handling via Delegation
    navContainer.addEventListener('touchstart', (e) => {
        const btn = e.target.closest('.icon-action-button');
        if (btn) btn.classList.add('is-pressed');
    }, { passive: true });

    navContainer.addEventListener('touchend', (e) => {
        const btn = e.target.closest('.icon-action-button');
        if (btn) setTimeout(() => btn.classList.remove('is-pressed'), 80);
    }, { passive: true });

    window.addEventListener('hashchange', () => {
        const newIndex = getInitialTabIndex();
        if (newIndex !== activeTabIndex) switchActiveTab(newIndex, true);
    });

    // Debounced Resize Observer
    let resizeFrameId = null;
    const resizeObserver = new ResizeObserver((entries) => {
        if (resizeFrameId) cancelAnimationFrame(resizeFrameId);
        resizeFrameId = requestAnimationFrame(() => {
            const width = entries[0]?.contentRect?.width;
            checkCollisionBreakpoints(width);
        });
    });

    resizeObserver.observe(navContainer);
    checkCollisionBreakpoints();

    // Initialize Bar 3 state deterministically on refresh.
    // This prevents the first toggle from behaving differently than later toggles,
    // and avoids Bar 3 temporarily overlaying main content during initial render.
    (function initBar3() {
        if (!lowerTabWrapper) return;
        const stackedTabNavbar = lowerTabWrapper.querySelector('.stacked-tab-navbar');
        const h = stackedTabNavbar
            ? (stackedTabNavbar.scrollHeight || stackedTabNavbar.offsetHeight || 0)
            : (lowerTabWrapper.scrollHeight || 0);
        lowerTabWrapper.style.setProperty('--bar3-h', `${Math.max(1, h)}px`);

        // Start closed; JS will toggle as user interacts.
        lowerTabWrapper.classList.add('is-hidden');
        lowerTabWrapper.style.maxHeight = '0px';
    })();

    // Enable Smooth Transitions Post Initial Paint
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('no-transitions');
        });
    });
})();