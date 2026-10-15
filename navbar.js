/**
 * Shared Navbar Component - Apple Design High-Performance Edition
 */
(function () {
    'use strict';

    let isNavigatingBack = false;
    let isCardNavigating = false;

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' }
    ];
    const PRIMARY_TITLE = window.PAGE_PRIMARY_TITLE || 'Tournament';
    const SECONDARY_TITLE = window.PAGE_SECONDARY_TITLE || '';
    const BAR3_STORAGE_KEY = 'bar3_collapsed_state';
    const PAGE_HISTORY_KEY = 'site_page_history';

    const BACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    const TOGGLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    window.addEventListener('pageshow', function () {
        isCardNavigating = false;
    });

    /**
     * Touch & Pointer Press Feedback Manager (Instant pointer-down response)
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
     * Smooth Tile/Card Navigation with Spring Compression
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

                const isKeyboardClick = e.detail === 0 && e.clientX === 0 && e.clientY === 0;
                if (isKeyboardClick) {
                    card.classList.add('is-pressed');
                    setTimeout(() => {
                        card.classList.remove('is-pressed');
                    }, 70);
                }

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
            const tabList = viewport.querySelector('.tab-list');
            const allItems = tabList ? tabList.querySelectorAll('.tab-item') : [];
            const isFirstItem = allItems.length > 0 && allItems[0] === activeItem;
            const isLastItem = allItems.length > 0 && allItems[allItems.length - 1] === activeItem;

            const leftOffset = activeItem.offsetLeft;
            const itemWidth = activeItem.offsetWidth;
            const viewportWidth = viewport.clientWidth;

            const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewportWidth);
            const rawTargetScrollLeft = leftOffset - (viewportWidth / 2) + (itemWidth / 2);

            const isAtBoundary = isFirstItem || isLastItem || rawTargetScrollLeft <= 0 || rawTargetScrollLeft >= maxScrollLeft;

            if (behavior === 'auto') {
                if (viewport._scrollAnim) {
                    cancelAnimationFrame(viewport._scrollAnim);
                    viewport._scrollAnim = null;
                }
                viewport.scrollLeft = Math.max(0, Math.min(rawTargetScrollLeft, maxScrollLeft));
                return;
            }

            if (viewport._scrollAnim) {
                cancelAnimationFrame(viewport._scrollAnim);
                viewport._scrollAnim = null;
            }

            // Use native smooth scroll for boundary/edge tabs (rightmost, second/third rightmost)
            // to completely prevent Safari subpixel clamping and post-animation snapping jumps.
            if (isAtBoundary) {
                const targetBoundaryScroll = rawTargetScrollLeft <= 0 ? 0 : maxScrollLeft;
                viewport.scrollTo({
                    left: targetBoundaryScroll,
                    behavior: 'smooth'
                });
                return;
            }

            // Use custom easeBubble animation for tabs that can be perfectly centered
            const targetScrollLeft = Math.round(Math.min(Math.max(0, rawTargetScrollLeft), maxScrollLeft));
            const startScrollLeft = viewport.scrollLeft;
            const distance = targetScrollLeft - startScrollLeft;
            
            if (Math.abs(distance) < 0.5) {
                viewport.scrollLeft = targetScrollLeft;
                return;
            }

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
                    viewport.scrollLeft = targetScrollLeft;
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
            if (viewport.offsetWidth === 0 && viewport.offsetHeight === 0) return;

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
        const navContainer = document.getElementById('navContainer') || document.querySelector('.navigation-container');
        const lowerWrapper = document.getElementById('lowerTabWrapper');
        const toggleBtn = document.querySelector('.toggle-menu-button');

        if (!navContainer || !lowerWrapper) return;

        const isHidden = lowerWrapper.classList.contains('is-hidden');
        if (toggleBtn) {
            toggleBtn.classList.toggle('is-collapsed', isHidden);
            toggleBtn.setAttribute('aria-expanded', !isHidden ? 'true' : 'false');
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
            exactHeight = 60;
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

        if (isCurrentlyHidden) {
            updateHighlights(true);
            centerActiveTab('auto');
        }
    }

    function renderNavbar() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const activeTarget = getActiveTargetFromHash();

        const tabItemsHtml = NAVIGATION_ITEMS.map(item => {
            const isActive = item.target === activeTarget ? 'is-active' : '';
            return `
                <li class="tab-item">
                    <a href="${item.target}" class="tab-link ${isActive}" aria-selected="${isActive ? 'true' : 'false'}">${item.label}</a>
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

                <button class="icon-action-button toggle-menu-button ${isLowerHidden ? 'is-collapsed' : ''}" id="toggleMenuButton" aria-label="Toggle navigation menu" aria-expanded="${!isLowerHidden}">
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

    function initDropdowns() {
        const selects = document.querySelectorAll('.native-dropdown-select[data-storage-key]');
        selects.forEach(select => {
            const storageKey = select.getAttribute('data-storage-key');
            if (storageKey) {
                try {
                    const savedVal = localStorage.getItem(storageKey);
                    if (savedVal) {
                        let foundIndex = -1;
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].value === savedVal) {
                                foundIndex = i;
                                break;
                            }
                        }
                        if (foundIndex !== -1) {
                            select.selectedIndex = foundIndex;
                            const wrapper = select.closest('.dropdown-wrapper');
                            if (wrapper) {
                                const textSpan = wrapper.querySelector('.button-text');
                                if (textSpan) {
                                    textSpan.textContent = select.options[foundIndex].text;
                                }
                            }
                        }
                    }
                } catch (e) {}
            }
        });

        let lastMouseX = -9999;
        let lastMouseY = -9999;

        document.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            const wrappers = document.querySelectorAll('.dropdown-wrapper');
            wrappers.forEach(wrapper => {
                const rect = wrapper.getBoundingClientRect();
                const isInside = lastMouseX >= rect.left && lastMouseX <= rect.right && lastMouseY >= rect.top && lastMouseY <= rect.bottom;
                if (isInside) {
                    wrapper.classList.add('is-hovered');
                } else {
                    wrapper.classList.remove('is-hovered');
                }
            });
        }, { passive: true });

        document.addEventListener('pointerleave', function () {
            document.querySelectorAll('.dropdown-wrapper').forEach(w => w.classList.remove('is-hovered'));
        });

        document.addEventListener('pointerdown', function (e) {
            if (e.target && e.target.classList.contains('native-dropdown-select')) {
                document.querySelectorAll('.native-dropdown-select').forEach(sel => {
                    if (sel !== e.target) {
                        sel.blur();
                    }
                });
            }
        }, { passive: true });
    }

    document.addEventListener('change', function (e) {
        if (e.target && e.target.classList.contains('native-dropdown-select')) {
            const wrapper = e.target.closest('.dropdown-wrapper');
            if (wrapper) {
                const textSpan = wrapper.querySelector('.button-text');
                if (textSpan && e.target.value) {
                    textSpan.textContent = e.target.options[e.target.selectedIndex].text;
                }
                const btn = wrapper.querySelector('.action-button');
                if (btn) {
                    btn.blur();
                    btn.classList.remove('is-pressed');
                }

                setTimeout(() => {
                    if (wrapper.matches(':hover')) {
                        wrapper.classList.add('is-hovered');
                    } else {
                        wrapper.classList.remove('is-hovered');
                    }
                }, 10);

                wrapper.classList.add('no-hover-temp');
                setTimeout(() => wrapper.classList.remove('no-hover-temp'), 60);
            }

            const storageKey = e.target.getAttribute('data-storage-key');
            if (storageKey) {
                try {
                    localStorage.setItem(storageKey, e.target.value);
                } catch (err) {}
            }
            e.target.blur();
        }
    });

    document.addEventListener('click', function (e) {
        const resetBtn = e.target.closest('#resetFiltersBtn');
        if (resetBtn) {
            e.preventDefault();
            const selects = document.querySelectorAll('.native-dropdown-select[data-storage-key]');
            selects.forEach(select => {
                const storageKey = select.getAttribute('data-storage-key');
                if (storageKey) {
                    try {
                        localStorage.removeItem(storageKey);
                    } catch (err) {}
                }
                
                let defaultIndex = 0;
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].defaultSelected) {
                        defaultIndex = i;
                        break;
                    }
                }
                select.selectedIndex = defaultIndex;

                const wrapper = select.closest('.dropdown-wrapper');
                if (wrapper) {
                    const textSpan = wrapper.querySelector('.button-text');
                    if (textSpan) {
                        textSpan.textContent = select.options[defaultIndex].text;
                    }
                    wrapper.classList.remove('is-hovered');
                }
            });
            resetBtn.blur();
            resetBtn.classList.remove('is-pressed');
        }
    });

    function switchTab(targetHash, isInitial = false) {
        if (!targetHash) return;

        if (window.history.pushState && window.history.replaceState) {
            if (isInitial) {
                window.history.replaceState(null, '', targetHash);
            } else if (window.location.hash !== targetHash) {
                window.history.pushState(null, '', targetHash);
            }
        } else if (!isInitial) {
            window.location.hash = targetHash;
        }

        const container = document.getElementById('navContainer');
        if (container) {
            const allLinks = container.querySelectorAll('.tab-link');
            allLinks.forEach(link => {
                const isActive = link.getAttribute('href') === targetHash;
                link.classList.toggle('is-active', isActive);
                link.setAttribute('aria-selected', isActive ? 'true' : 'false');
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
        window.scrollTo(0, 0);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const cardTextElements = document.querySelectorAll('.portal-card h2, .portal-card span, .card h2, .card span');

        cardTextElements.forEach(el => {
            if (el.children.length === 0 && el.textContent.trim()) {
                el.textContent = el.textContent.split(' ').map(word => {
                    const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
                    if (!match) return word;

                    const [, prefix, core, suffix] = match;
                    if (core.length <= 4) return word;

                    const chunks = [];
                    let i = 0;

                    if (core.length % 2 !== 0) {
                        chunks.push(core.slice(0, 3));
                        i = 3;
                    }

                    while (i < core.length) {
                        chunks.push(core.slice(i, i + 2));
                        i += 2;
                    }

                    return prefix + chunks.join('\u00AD') + suffix;
                }).join(' ');
            }
        });
    });

    function checkLayoutMode() {
        const container = document.getElementById('navContainer') || document.querySelector('.navigation-container');
        if (!container) return;

        const combinedNavbar = document.getElementById('combinedNavbar');
        if (!combinedNavbar) return;

        const brandingGroup = combinedNavbar.querySelector('.branding-group');
        if (!brandingGroup) return;

        const availableWidth = combinedNavbar.clientWidth;
        if (availableWidth === 0) return;

        const backBtn = brandingGroup.querySelector('#backButton');
        const primaryTitle = brandingGroup.querySelector('.primary-title');
        const secondaryTitle = brandingGroup.querySelector('.secondary-title');

        const backBtnWidth = (backBtn && backBtn.offsetWidth > 0) ? backBtn.offsetWidth : (backBtn ? backBtn.getBoundingClientRect().width : 36);

        function getTextWidth(el) {
            if (!el || !el.textContent || !el.textContent.trim()) return 0;
            try {
                const style = window.getComputedStyle(el);
                const clone = el.cloneNode(true);
                clone.style.cssText = `
                    position: absolute !important;
                    visibility: hidden !important;
                    display: inline-block !important;
                    width: auto !important;
                    max-width: none !important;
                    white-space: nowrap !important;
                    top: -9999px !important;
                    left: -9999px !important;
                    font-family: ${style.fontFamily} !important;
                    font-size: ${style.fontSize} !important;
                    font-weight: ${style.fontWeight} !important;
                    font-style: ${style.fontStyle} !important;
                    letter-spacing: ${style.letterSpacing} !important;
                `;
                document.body.appendChild(clone);
                const width = clone.getBoundingClientRect().width;
                document.body.removeChild(clone);
                return Math.ceil(width);
            } catch (e) {
                return el.scrollWidth || 0;
            }
        }

        const primaryWidth = getTextWidth(primaryTitle);
        const secondaryWidth = getTextWidth(secondaryTitle);
        const titleWidth = Math.ceil(Math.max(primaryWidth, secondaryWidth));
        const brandingWidth = backBtnWidth + titleWidth + 24;

        function getIntrinsicTabsWidth() {
            const tabList = combinedNavbar.querySelector('.tab-list') || document.querySelector('#lowerTabWrapper .tab-list');
            if (!tabList) return 0;

            try {
                const clone = tabList.cloneNode(true);
                clone.style.cssText = `
                    position: absolute !important;
                    visibility: hidden !important;
                    display: flex !important;
                    width: auto !important;
                    max-width: none !important;
                    top: -9999px !important;
                    left: -9999px !important;
                    box-sizing: border-box !important;
                `;
                document.body.appendChild(clone);
                const width = Math.ceil(clone.getBoundingClientRect().width);
                document.body.removeChild(clone);
                return width;
            } catch (e) {
                return tabList.scrollWidth || 0;
            }
        }

        const tabsScrollWidth = getIntrinsicTabsWidth();
        const requiredWidth = brandingWidth + tabsScrollWidth + 16;
        const shouldCollapse = availableWidth < requiredWidth;
        const isCurrentlyCollapsed = container.classList.contains('is-collapsed-mode');

        if (shouldCollapse !== isCurrentlyCollapsed) {
            container.classList.toggle('is-collapsed-mode', shouldCollapse);
        }

        syncToggleState();
    }

    function handleResizeOrLayoutChange() {
        checkLayoutMode();
        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();
    }

    function init() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        renderNavbar();
        setupTouchPressFeedback();
        setupCardNavigationFeedback();
        initDropdowns();

        const activeTarget = getActiveTargetFromHash();
        switchTab(activeTarget, true);

        checkLayoutMode();
        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();
        window.scrollTo(0, 0);

        if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                handleResizeOrLayoutChange();
            });
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transitions');
            });
        });

        window.addEventListener('resize', handleResizeOrLayoutChange);

        window.addEventListener('orientationchange', function () {
            handleResizeOrLayoutChange();
            requestAnimationFrame(handleResizeOrLayoutChange);
            setTimeout(handleResizeOrLayoutChange, 50);
            setTimeout(handleResizeOrLayoutChange, 150);
            setTimeout(handleResizeOrLayoutChange, 300);
        });

        if (typeof ResizeObserver !== 'undefined') {
            const combinedNavbar = document.getElementById('combinedNavbar');
            if (combinedNavbar) {
                const resizeObserver = new ResizeObserver(() => {
                    handleResizeOrLayoutChange();
                });
                resizeObserver.observe(combinedNavbar);
            }
        }

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