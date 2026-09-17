/**
 * Shared Navbar Component - High-Performance Edition (Floating Header & Synchronized Bar 3 Shifting)
 */
(function () {
    'use strict';

    let cachedDesktopWidth = 0;
    let isNavigatingBack = false;

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' }
    ];
    const PRIMARY_TITLE = window.PAGE_PRIMARY_TITLE || 'Tournament';
    const SECONDARY_TITLE = window.PAGE_SECONDARY_TITLE || '';
    const BAR3_STORAGE_KEY = 'bar3_collapsed_state';
    const PAGE_HISTORY_KEY = 'site_page_history';

    const BACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    const TOGGLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

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

    /**
     * Exact cubic-bezier solver matching cubic-bezier(0.32, 0.94, 0.2, 1)
     */
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

    /**
     * Dynamic Section Header Stacking Calculator
     */
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

    /**
     * Smooth, bounded auto-scroll controller.
     */
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

    /**
     * Updates highlighted bubble indicator over active tab link.
     */
    function updateHighlights(noTransition = false) {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const viewports = container.querySelectorAll('.tab-scroll-viewport');

        viewports.forEach(viewport => {
            let highlight = viewport.querySelector('.active-tab-highlight');
            if (!highlight) {
                highlight = document.createElement('div');
                highlight.className = 'active-tab-highlight';
                viewport.appendChild(highlight);
            }

            const activeLink = viewport.querySelector('.tab-link.is-active');
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

    /**
     * Synchronizes Bar 3 toggle button icon and dynamic height variables.
     */
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
        const exactHeight = innerContent ? innerContent.offsetHeight : lowerWrapper.scrollHeight;

        const hVal = showBar3 ? `${exactHeight}px` : '0px';
        navContainer.style.setProperty('--bar3-h', hVal);
        document.documentElement.style.setProperty('--bar3-h', hVal);
    }

    /**
     * Handles clicking the Bar 2 chevron button to expand or collapse Bar 3.
     */
    function toggleMenu() {
        const lowerWrapper = document.getElementById('lowerTabWrapper');
        if (!lowerWrapper) return;

        lowerWrapper.classList.toggle('is-hidden');
        syncToggleState();
    }

    /**
     * Updates layout mode between Desktop (Bar 1) and Collapsed Mobile (Bar 2 + Bar 3).
     */
    function updateResponsiveLayout() {
        const navContainer = document.querySelector('.navigation-container');
        const navbar = document.querySelector('#combinedNavbar');
        const branding = document.querySelector('.branding-group');
        const desktopTabList = document.querySelector('#combinedNavbar .tab-list');
        const lowerWrapper = document.getElementById('lowerTabWrapper');

        if (!navContainer || !navbar || !branding || !desktopTabList) return;

        const navbarWidth = navbar.getBoundingClientRect().width;
        const isCurrentlyCollapsed = navContainer.classList.contains('is-collapsed-mode');

        if (!isCurrentlyCollapsed || cachedDesktopWidth === 0) {
            const backBtn = branding.querySelector('.icon-action-button, .action-button');
            const primaryTitle = branding.querySelector('.primary-title');
            const secondaryTitle = branding.querySelector('.secondary-title');

            const backBtnWidth = backBtn ? backBtn.offsetWidth : 36;
            const primaryWidth = primaryTitle ? primaryTitle.scrollWidth : 0;
            const secondaryWidth = secondaryTitle ? secondaryTitle.scrollWidth : 0;
            const titlesWidth = Math.max(primaryWidth, secondaryWidth);

            const brandingWidth = backBtnWidth + titlesWidth + 24;
            const tabsWidth = desktopTabList.scrollWidth;

            cachedDesktopWidth = brandingWidth + tabsWidth + 32;
        }

        const uncollapseThreshold = cachedDesktopWidth + 32;
        
        const shouldCollapse = isCurrentlyCollapsed 
            ? navbarWidth < uncollapseThreshold 
            : navbarWidth < cachedDesktopWidth;

        navContainer.classList.toggle('is-collapsed-mode', shouldCollapse);

        if (lowerWrapper) {
            const showBar3 = shouldCollapse && !lowerWrapper.classList.contains('is-hidden');
            const innerContent = lowerWrapper.querySelector('.stacked-tab-navbar-inner');
            const exactHeight = innerContent ? innerContent.offsetHeight : lowerWrapper.scrollHeight;
            
            const hVal = showBar3 ? `${exactHeight}px` : '0px';
            navContainer.style.setProperty('--bar3-h', hVal);
            document.documentElement.style.setProperty('--bar3-h', hVal);
        }

        syncToggleState();
        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();
    }

    /**
     * Navigates between view tabs and updates page states.
     */
    function setActiveTab(targetHash, isUserAction = false) {
        if (!targetHash) return;

        const allLinks = document.querySelectorAll('.navigation-container .tab-link');
        allLinks.forEach(link => {
            const isMatch = link.getAttribute('href') === targetHash;
            link.classList.toggle('is-active', isMatch);
            if (isMatch) {
                link.setAttribute('aria-selected', 'true');
            } else {
                link.setAttribute('aria-selected', 'false');
            }
        });

        const tabViews = document.querySelectorAll('.tab-view');
        tabViews.forEach(view => {
            const matches = ('#' + view.id) === targetHash;
            view.classList.toggle('is-active', matches);
        });

        updateHighlights(!isUserAction);
        centerActiveTab(isUserAction ? 'smooth' : 'auto');
        updateSectionHeaderLayout();
    }

    /**
     * Builds and renders the complete Navigation component inside #navContainer.
     */
    function buildNavbarUI() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        let initialCollapsedState = 'expanded';
        try {
            initialCollapsedState = localStorage.getItem(BAR3_STORAGE_KEY) || 'expanded';
        } catch (e) {}

        const isBar3Hidden = initialCollapsedState === 'collapsed';

        const tabsMarkup = NAVIGATION_ITEMS.map((item, index) => `
            <li class="tab-item">
                <a href="${item.target}" class="tab-link ${index === 0 ? 'is-active' : ''}" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}">
                    ${item.label}
                </a>
            </li>
        `).join('');

        container.innerHTML = `
            <header class="navbar combined-header-navbar" id="combinedNavbar">
                <div class="branding-group">
                    <button class="icon-action-button back-button" id="navBackBtn" aria-label="Go back">
                        ${BACK_SVG}
                    </button>
                    <div class="header-titles">
                        <span class="primary-title">${PRIMARY_TITLE}</span>
                        ${SECONDARY_TITLE ? `<span class="secondary-title">${SECONDARY_TITLE}</span>` : ''}
                    </div>
                </div>

                <button class="icon-action-button toggle-menu-button ${isBar3Hidden ? 'is-collapsed' : ''}" id="navToggleBtn" aria-label="Toggle navigation menu">
                    ${TOGGLE_SVG}
                </button>

                <nav class="tab-scroll-viewport" id="desktopTabViewport" aria-label="Primary navigation">
                    <ul class="tab-list" role="tablist">
                        ${tabsMarkup}
                    </ul>
                </nav>
            </header>

            <div class="stacked-tab-wrapper ${isBar3Hidden ? 'is-hidden' : ''}" id="lowerTabWrapper">
                <div class="stacked-tab-navbar-inner">
                    <header class="navbar stacked-tab-navbar">
                        <nav class="tab-scroll-viewport" id="mobileTabViewport" aria-label="Mobile tab navigation">
                            <ul class="tab-list" role="tablist">
                                ${tabsMarkup}
                            </ul>
                        </nav>
                    </header>
                </div>
            </div>
        `;

        const backBtn = document.getElementById('navBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', handleSmartBack);
        }

        const toggleBtn = document.getElementById('navToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleMenu);
        }

        container.addEventListener('click', function (e) {
            const tabLink = e.target.closest('.tab-link');
            if (tabLink) {
                e.preventDefault();
                const targetHash = tabLink.getAttribute('href');
                if (window.location.hash !== targetHash) {
                    history.pushState(null, '', targetHash);
                }
                setActiveTab(targetHash, true);
            }
        });

        const activeHash = getActiveTargetFromHash();
        setActiveTab(activeHash, false);

        requestAnimationFrame(() => {
            updateResponsiveLayout();
            setTimeout(() => {
                document.documentElement.classList.remove('no-transitions');
            }, 50);
        });
    }

    window.addEventListener('hashchange', function () {
        const activeHash = getActiveTargetFromHash();
        setActiveTab(activeHash, true);
    });

    window.addEventListener('resize', function () {
        updateResponsiveLayout();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildNavbarUI);
    } else {
        buildNavbarUI();
    }
})();