/**
 * Shared Navbar Component - High-Performance Edition
 */
(function () {
    'use strict';

    let isNavigatingBack = false;
    let isCardNavigating = false;
    let lastWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' }
    ];
    const PRIMARY_TITLE = window.PAGE_PRIMARY_TITLE || 'Tournament';
    const SECONDARY_TITLE = window.PAGE_SECONDARY_TITLE || '';
    const BAR3_STORAGE_KEY = 'bar3_collapsed_state';
    const PAGE_HISTORY_KEY = 'site_page_history';

    const BACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    const TOGGLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    // Reset navigation flag when page is shown (e.g., via browser Back button BFCache)
    window.addEventListener('pageshow', function () {
        isCardNavigating = false;
    });

    /**
     * Touch & Pointer Press Feedback Manager for Mobile & Desktop
     */
    function setupTouchPressFeedback() {
        window.addEventListener('touchstart', function () {}, { passive: true });

        const targetSelectors = '.action-button, .icon-action-button, .toggle-menu-button, .tab-link, .card, .portal-card, .nav-card, .section-card, .feature-card, [data-href]';

        function handlePressStart(e) {
            const btn = e.target.closest(targetSelectors);
            if (btn) {
                btn.classList.add('is-pressed');
            }
        }

        function handlePressEnd() {
            const pressedElements = document.querySelectorAll('.is-pressed');
            pressedElements.forEach(el => el.classList.remove('is-pressed'));
        }

        if (window.PointerEvent) {
            document.addEventListener('pointerdown', handlePressStart, { passive: true });
            document.addEventListener('pointerup', handlePressEnd, { passive: true });
            document.addEventListener('pointercancel', handlePressEnd, { passive: true });
        } else {
            document.addEventListener('touchstart', handlePressStart, { passive: true });
            document.addEventListener('touchend', handlePressEnd, { passive: true });
            document.addEventListener('touchcancel', handlePressEnd, { passive: true });
            document.addEventListener('mousedown', handlePressStart, { passive: true });
            document.addEventListener('mouseup', handlePressEnd, { passive: true });
        }
    }

    /**
     * Smooth Tile/Card Navigation with Spring Compression & Bounce Delay
     */
    function setupCardNavigationFeedback() {
        document.addEventListener('click', function (e) {
            const card = e.target.closest('.card, .portal-card, .nav-card, .section-card, .feature-card, [data-href]');
            if (!card) return;

            let targetUrl = card.getAttribute('href') || card.getAttribute('data-href');
            if (!targetUrl) {
                const innerLink = card.querySelector('a[href]');
                if (innerLink) targetUrl = innerLink.getAttribute('href');
            }

            if (targetUrl && !targetUrl.startsWith('#') && !targetUrl.startsWith('javascript:')) {
                e.preventDefault();

                if (isCardNavigating) return;
                isCardNavigating = true;

                // Handle keyboard activation (Enter key) where pointer events didn't fire
                const isKeyboardClick = e.detail === 0 && e.clientX === 0 && e.clientY === 0;
                if (isKeyboardClick) {
                    card.classList.add('is-pressed');
                    setTimeout(() => {
                        card.classList.remove('is-pressed');
                    }, 70);
                }

                // Perform page navigation after allowing the release bounce animation to play
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 200);
            }
        });
    }

    /**
     * Session-Based Page History Stack Management
     */
    function getPageHistory() {
        try {
            const stored = sessionStorage.getItem(PAGE_HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function setPageHistory(history) {
        try {
            sessionStorage.setItem(PAGE_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {}
    }

    function recordCurrentPageVisit() {
        const currentUrl = window.location.href.split('#')[0];
        let historyStack = getPageHistory();

        const existingIndex = historyStack.lastIndexOf(currentUrl);
        if (existingIndex !== -1) {
            historyStack = historyStack.slice(0, existingIndex + 1);
        } else {
            historyStack.push(currentUrl);
        }

        setPageHistory(historyStack);
    }

    function handleSmartBack() {
        if (isNavigatingBack) return;

        const currentUrl = window.location.href.split('#')[0];
        let historyStack = getPageHistory();

        if (historyStack.length > 0 && historyStack[historyStack.length - 1] === currentUrl) {
            historyStack.pop();
        }

        let targetUrl = '';

        if (historyStack.length > 0) {
            targetUrl = historyStack[historyStack.length - 1];
            setPageHistory(historyStack);
        } else {
            const referrer = document.referrer;
            const isSameOriginReferrer = referrer && referrer.startsWith(window.location.origin) && referrer.split('#')[0] !== currentUrl;

            if (isSameOriginReferrer) {
                targetUrl = referrer;
            } else if (!currentUrl.endsWith('index.html') && !currentUrl.endsWith('/')) {
                targetUrl = 'index.html';
            }
        }

        isNavigatingBack = true;

        if (targetUrl) {
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 50);
        } else {
            setTimeout(() => {
                window.history.back();
            }, 50);
        }
    }

    recordCurrentPageVisit();

    function getActiveTargetFromHash() {
        const hash = window.location.hash;
        return NAVIGATION_ITEMS.some(item => item.target === hash)
            ? hash
            : NAVIGATION_ITEMS[0]?.target;
    }

    function easeBubble(t) {
        if (t <= 0) return 0;
        if (t >= 1) return 1;

        let x = Math.min(Math.max(t, 0), 1);
        for (let i = 0; i < 8; i++) {
            const currentX = 3 * (1 - x) * (1 - x) * x * 0.32 + 3 * (1 - x) * x * x * 0.2 + x * x * x;
            const dx = 3 * (1 - x) * (1 - x) * 0.32 + 6 * (1 - x) * x * (0.2 - 0.32) + 3 * x * x * (1 - 0.2);
            if (Math.abs(currentX - t) < 1e-5 || dx === 0) break;
            x -= (currentX - t) / dx;
            x = Math.min(Math.max(x, 0), 1);
        }

        return 3 * (1 - x) * (1 - x) * x * 0.94 + 3 * (1 - x) * x * x * 1.0 + x * x * x;
    }

    function updateSectionHeaderLayout() {
        const headers = document.querySelectorAll('.section-header');
        headers.forEach(header => {
            const title = header.querySelector('h1, h2, h3, .active-tab-display, .section-title');
            const actions = header.querySelector('.section-actions');
            if (!title || !actions) return;

            const children = Array.from(actions.children);
            if (children.length === 0) return;

            const availableWidth = header.clientWidth;
            if (availableWidth === 0) return;

            const titleWidth = title.getBoundingClientRect().width;
            let totalButtonsWidth = 0;
            children.forEach(child => {
                totalButtonsWidth += child.getBoundingClientRect().width;
            });

            const gapBetweenButtons = 8;
            if (children.length > 1) {
                totalButtonsWidth += (children.length - 1) * gapBetweenButtons;
            }

            const gapBetweenTitleAndActions = 16;
            const totalRequiredWidth = titleWidth + gapBetweenTitleAndActions + totalButtonsWidth;

            if (totalRequiredWidth > availableWidth) {
                header.classList.add('is-stacked');
            } else {
                header.classList.remove('is-stacked');
            }
        });
    }

    function centerActiveTab(behavior = 'smooth') {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const viewports = container.querySelectorAll('.tab-scroll-viewport');

        viewports.forEach(viewport => {
            if (viewport.offsetWidth === 0 && viewport.offsetHeight === 0) return;

            const activeLink = viewport.querySelector('.tab-link.is-active');
            if (!activeLink) return;

            const activeItem = activeLink.closest('.tab-item') || activeLink;

            const viewportRect = viewport.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            const currentScrollLeft = viewport.scrollLeft;
            const itemRelativeLeft = itemRect.left - viewportRect.left + currentScrollLeft;
            
            const rawTargetScrollLeft = itemRelativeLeft - (viewportRect.width / 2) + (itemRect.width / 2);
            const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
            const targetScrollLeft = Math.min(Math.max(0, rawTargetScrollLeft), maxScrollLeft);

            if (behavior === 'auto') {
                if (viewport._scrollAnim) {
                    cancelAnimationFrame(viewport._scrollAnim);
                    viewport._scrollAnim = null;
                }
                viewport.scrollLeft = targetScrollLeft;
                return;
            }

            if (viewport._scrollAnim) {
                cancelAnimationFrame(viewport._scrollAnim);
                viewport._scrollAnim = null;
            }

            const startScrollLeft = viewport.scrollLeft;
            const distance = targetScrollLeft - startScrollLeft;
            
            if (Math.abs(distance) < 0.5) return;

            const startTime = performance.now();
            const duration = 750;

            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easedValue = easeBubble(progress);
                viewport.scrollLeft = startScrollLeft + (distance * easedValue);

                if (progress < 1) {
                    viewport._scrollAnim = requestAnimationFrame(step);
                } else {
                    viewport._scrollAnim = null;
                }
            }

            viewport._scrollAnim = requestAnimationFrame(step);
        });
    }

    function updateHighlights(noTransition = false) {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const viewports = container.querySelectorAll('.tab-scroll-viewport');

        viewports.forEach(viewport => {
            const tabList = viewport.querySelector('.tab-list');
            if (!tabList) return;

            let highlight = tabList.querySelector('.active-tab-highlight');
            if (!highlight) {
                highlight = document.createElement('div');
                highlight.className = 'active-tab-highlight';
                tabList.appendChild(highlight);
            }

            const activeLink = tabList.querySelector('.tab-link.is-active');
            if (!activeLink) {
                highlight.classList.remove('is-visible');
                return;
            }

            const activeItem = activeLink.closest('.tab-item') || activeLink;
            const leftOffset = activeItem.offsetLeft;
            const width = activeItem.offsetWidth;

            if (noTransition) {
                highlight.classList.add('no-transition');
            } else {
                highlight.classList.remove('no-transition');
            }

            highlight.style.transform = `translateX(${leftOffset}px)`;
            highlight.style.width = `${width}px`;
            highlight.classList.add('is-visible');

            if (noTransition) {
                requestAnimationFrame(() => {
                    highlight.classList.remove('no-transition');
                });
            }
        });
    }

    function syncToggleState() {
        const navContainer = document.querySelector('.navigation-container');
        const lowerWrapper = document.getElementById('lowerTabWrapper');
        const toggleBtn = document.querySelector('.toggle-menu-button');

        if (!navContainer || !lowerWrapper) return;

        const isHidden = lowerWrapper.classList.contains('is-hidden');
        if (toggleBtn) {
            toggleBtn.classList.toggle('is-collapsed', isHidden);
        }

        try {
            localStorage.setItem(BAR3_STORAGE_KEY, isHidden ? 'collapsed' : 'expanded');
        } catch (e) {}

        const showBar3 = navContainer.classList.contains('is-collapsed-mode') && !isHidden;
        const innerContent = lowerWrapper.querySelector('.stacked-tab-navbar-inner');
        
        let exactHeight = 0;
        if (innerContent && innerContent.offsetHeight > 0) {
            exactHeight = innerContent.offsetHeight;
        } else if (lowerWrapper && lowerWrapper.scrollHeight > 0) {
            exactHeight = lowerWrapper.scrollHeight;
        } else {
            exactHeight = 60; // 8px top-padding + 52px navbar pill height
        }

        const hVal = showBar3 ? `${exactHeight}px` : '0px';
        navContainer.style.setProperty('--bar3-h', hVal);
        document.documentElement.style.setProperty('--bar3-h', hVal);
    }

    function toggleBar3() {
        const lowerWrapper = document.getElementById('lowerTabWrapper');
        if (!lowerWrapper) return;

        const isCurrentlyHidden = lowerWrapper.classList.contains('is-hidden');
        lowerWrapper.classList.toggle('is-hidden', !isCurrentlyHidden);
        syncToggleState();
    }

    function renderNavbar() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const activeTarget = getActiveTargetFromHash();

        const tabItemsHtml = NAVIGATION_ITEMS.map(item => {
            const isActive = item.target === activeTarget ? 'is-active' : '';
            return `
                <li class="tab-item">
                    <a href="${item.target}" class="tab-link ${isActive}">${item.label}</a>
                </li>
            `;
        }).join('');

        let savedCollapsedState = 'expanded';
        try {
            savedCollapsedState = localStorage.getItem(BAR3_STORAGE_KEY) || 'expanded';
        } catch (e) {}

        const isLowerHidden = savedCollapsedState === 'collapsed';

        container.innerHTML = `
            <div class="navbar combined-header-navbar" id="combinedNavbar">
                <div class="branding-group">
                    <button class="icon-action-button back-button" id="backButton" aria-label="Go Back">
                        ${BACK_SVG}
                    </button>
                    <div class="header-titles">
                        <span class="primary-title">${PRIMARY_TITLE}</span>
                        ${SECONDARY_TITLE ? `<span class="secondary-title">${SECONDARY_TITLE}</span>` : ''}
                    </div>
                </div>

                <div class="tab-scroll-viewport">
                    <ul class="tab-list">
                        ${tabItemsHtml}
                    </ul>
                </div>

                <button class="icon-action-button toggle-menu-button ${isLowerHidden ? 'is-collapsed' : ''}" id="toggleMenuButton" aria-label="Toggle navigation menu">
                    ${TOGGLE_SVG}
                </button>
            </div>

            <div class="stacked-tab-wrapper ${isLowerHidden ? 'is-hidden' : ''}" id="lowerTabWrapper">
                <div class="stacked-tab-navbar-inner">
                    <div class="navbar stacked-tab-navbar">
                        <div class="tab-scroll-viewport">
                            <ul class="tab-list">
                                ${tabItemsHtml}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const backBtn = container.querySelector('#backButton');
        if (backBtn) {
            backBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handleSmartBack();
            });
        }

        const toggleBtn = container.querySelector('#toggleMenuButton');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function (e) {
                e.preventDefault();
                toggleBar3();
            });
        }

        const tabLinks = container.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    switchTab(href);
                }
            });
        });
    }

    function switchTab(targetHash) {
        if (!targetHash) return;

        if (window.history.pushState) {
            window.history.pushState(null, '', targetHash);
        } else {
            window.location.hash = targetHash;
        }

        const container = document.getElementById('navContainer');
        if (container) {
            const allLinks = container.querySelectorAll('.tab-link');
            allLinks.forEach(link => {
                if (link.getAttribute('href') === targetHash) {
                    link.classList.add('is-active');
                } else {
                    link.classList.remove('is-active');
                }
            });
        }

        const tabViews = document.querySelectorAll('.tab-view');
        tabViews.forEach(view => {
            if ('#' + view.id === targetHash) {
                view.classList.add('is-active');
            } else {
                view.classList.remove('is-active');
            }
        });

        updateHighlights();
        centerActiveTab('smooth');
        updateSectionHeaderLayout();
        
        // Ensure screen starts at top Y=0 so section headers aren't pulled under navbar
        window.scrollTo(0, 0);
    }

    function checkLayoutMode() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const combinedNavbar = document.getElementById('combinedNavbar');
        if (!combinedNavbar) return;

        const brandingGroup = combinedNavbar.querySelector('.branding-group');
        const viewport = combinedNavbar.querySelector('.tab-scroll-viewport');
        if (!brandingGroup || !viewport) return;

        const availableWidth = combinedNavbar.clientWidth;
        const brandingWidth = brandingGroup.getBoundingClientRect().width;
        const viewportScrollWidth = viewport.scrollWidth;

        const requiredWidth = brandingWidth + viewportScrollWidth + 32;

        if (availableWidth < requiredWidth || window.innerWidth <= 768) {
            container.classList.add('is-collapsed-mode');
        } else {
            container.classList.remove('is-collapsed-mode');
        }

        syncToggleState();
    }

    function init() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        renderNavbar();
        setupTouchPressFeedback();
        setupCardNavigationFeedback();

        const activeTarget = getActiveTargetFromHash();
        switchTab(activeTarget);

        // Run synchronously to calculate --bar3-h BEFORE initial paint while no-transitions is active
        checkLayoutMode();
        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();
        window.scrollTo(0, 0);

        // Remove anti-flash class after frame settles
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transitions');
            });
        });

        window.addEventListener('resize', function () {
            const currentWidth = window.innerWidth;
            if (currentWidth !== lastWindowWidth) {
                lastWindowWidth = currentWidth;
                checkLayoutMode();
                updateHighlights(true);
                centerActiveTab('auto');
                updateSectionHeaderLayout();
            }
        });

        window.addEventListener('hashchange', function () {
            const hash = getActiveTargetFromHash();
            switchTab(hash);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();