/**
 * Shared Navbar Component - High-Performance Edition (Dynamic Auto-Collapse & Section Header Stacking)
 */
(function () {
    'use strict';

    let lastKnownTabsWidth = 0;
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
     * Exact 1:1 cubic-bezier solver for cubic-bezier(0.16, 1, 0.3, 1)
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
            
            navContainer.style.setProperty('--bar3-h', showBar3 ? `${exactHeight}px` : '0px');
        }

        syncToggleState();
        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();
    }

    function syncToggleState() {
        const navContainer = document.querySelector('.navigation-container');
        const lowerWrapper = document.getElementById('lowerTabWrapper');
        const toggleBtn = navContainer?.querySelector('.toggle-menu-button');

        if (!toggleBtn || !lowerWrapper) return;
        const isHidden = lowerWrapper.classList.contains('is-hidden');
        toggleBtn.classList.toggle('is-collapsed', isHidden);
    }

    function updateHighlights(disableAnimation = false) {
        const container = document.getElementById('navContainer');
        if (!container) return;

        container.querySelectorAll('.tab-list').forEach(list => {
            if (list.offsetWidth === 0 && list.offsetHeight === 0) return;
            const activeLink = list.querySelector('.tab-link.is-active');
            const highlight = list.querySelector('.active-tab-highlight');

            if (!activeLink || !highlight) return;

            const listRect = list.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            const targetLeft = linkRect.left - listRect.left;
            const targetWidth = linkRect.width;

            if (disableAnimation) {
                highlight.classList.add('no-transition');
                highlight.style.transform = `translateX(${targetLeft}px)`;
                highlight.style.width = `${targetWidth}px`;
                highlight.classList.add('is-visible');
                
                void highlight.offsetWidth; 
                highlight.classList.remove('no-transition');
                return;
            }

            highlight.classList.remove('no-transition');
            highlight.style.transform = `translateX(${targetLeft}px)`;
            highlight.style.width = `${targetWidth}px`;
            highlight.classList.add('is-visible');
        });
    }

    function setActiveTab(target, disableAnimation = false) {
        const container = document.getElementById('navContainer');
        const displayTitleHeading = document.getElementById('themeTitleHeading');
        if (!container) return;

        container.querySelectorAll('.tab-link').forEach(link => {
            const isActive = link.getAttribute('data-target') === target;
            link.classList.toggle('is-active', isActive);
            if (isActive && displayTitleHeading) {
                displayTitleHeading.textContent = link.textContent.trim();
            }
        });

        const targetId = target ? target.replace('#', '') : '';
        const views = document.querySelectorAll('.tab-view');
        views.forEach(view => {
            const matches = view.id === targetId || view.getAttribute('data-tab-view') === targetId;
            view.classList.toggle('is-active', matches);
        });

        updateHighlights(disableAnimation);
        centerActiveTab(disableAnimation ? 'auto' : 'smooth');
        updateSectionHeaderLayout();
    }

    function attachActionButtonListeners(scope = document) {
        scope.querySelectorAll('.action-button, .icon-action-button').forEach(btn => {
            if (btn._hasActionButtonListener) return;
            btn._hasActionButtonListener = true;

            let pressStartTime = 0;
            let releaseTimer = null;

            const clearPressed = () => {
                if (releaseTimer) {
                    clearTimeout(releaseTimer);
                    releaseTimer = null;
                }
                btn.classList.remove('is-pressed');
                if (typeof btn.blur === 'function') {
                    btn.blur();
                }
            };

            btn.addEventListener('pointerdown', (e) => {
                if (btn.setPointerCapture) {
                    try { btn.setPointerCapture(e.pointerId); } catch (_) {}
                }
                clearPressed();
                pressStartTime = Date.now();
                btn.classList.add('is-pressed');
            });

            const handleRelease = (e) => {
                if (btn.hasPointerCapture && btn.hasPointerCapture(e.pointerId)) {
                    try { btn.releasePointerCapture(e.pointerId); } catch (_) {}
                }

                const elapsed = Date.now() - pressStartTime;
                const remainingTime = Math.max(0, 70 - elapsed);

                if (releaseTimer) clearTimeout(releaseTimer);

                releaseTimer = setTimeout(() => {
                    clearPressed();
                }, remainingTime);
            };

            btn.addEventListener('pointerup', handleRelease);
            btn.addEventListener('pointercancel', clearPressed);
            btn.addEventListener('pointerleave', clearPressed);
        });
    }

    window.attachActionButtonListeners = attachActionButtonListeners;
    window.updateSectionHeaderLayout = updateSectionHeaderLayout;

    let resizeAnimationFrameId = null;

    window.addEventListener('resize', () => {
        if (resizeAnimationFrameId) {
            cancelAnimationFrame(resizeAnimationFrameId);
        }
        resizeAnimationFrameId = requestAnimationFrame(() => {
            updateResponsiveLayout();
            resizeAnimationFrameId = null;
        });
    }, { passive: true });

    function initNavbar() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        const initialTarget = getActiveTargetFromHash();
        const isBar3HiddenStored = localStorage.getItem(BAR3_STORAGE_KEY) === 'true';

        const linksHTML = NAVIGATION_ITEMS.map((item) => {
            const isActive = item.target === initialTarget;
            return `
                <li class="tab-item">
                    <a href="${item.target}" class="tab-link ${isActive ? 'is-active' : ''}" data-target="${item.target}">${item.label}</a>
                </li>
            `;
        }).join('');

        container.innerHTML = `
            <header class="navbar combined-header-navbar" id="combinedNavbar">
                <div class="branding-group">
                    <button class="icon-action-button" aria-label="Go Back">${BACK_SVG}</button>
                    <div class="header-titles">
                        <span class="primary-title">${PRIMARY_TITLE}</span>
                        ${SECONDARY_TITLE ? `<span class="secondary-title">${SECONDARY_TITLE}</span>` : ''}
                    </div>
                </div>
                <nav class="tab-scroll-viewport">
                    <ul class="tab-list">
                        <li class="active-tab-highlight" aria-hidden="true"></li>
                        ${linksHTML}
                    </ul>
                </nav>
                <button class="icon-action-button toggle-menu-button" aria-label="Toggle Navigation">${TOGGLE_SVG}</button>
            </header>
            <div class="stacked-tab-wrapper ${isBar3HiddenStored ? 'is-hidden' : ''}" id="lowerTabWrapper">
                <div class="stacked-tab-navbar-inner">
                    <header class="navbar stacked-tab-navbar">
                        <nav class="tab-scroll-viewport">
                            <ul class="tab-list">
                                <li class="active-tab-highlight" aria-hidden="true"></li>
                                ${linksHTML}
                            </ul>
                        </nav>
                    </header>
                </div>
            </div>
        `;

        attachActionButtonListeners(container);

        const lowerWrapper = document.getElementById('lowerTabWrapper');
        const toggleBtn = container.querySelector('.toggle-menu-button');

        if (toggleBtn && lowerWrapper) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = lowerWrapper.classList.toggle('is-hidden');
                syncToggleState();
                localStorage.setItem(BAR3_STORAGE_KEY, isHidden);

                const innerContent = lowerWrapper.querySelector('.stacked-tab-navbar-inner');
                const targetHeight = innerContent ? innerContent.offsetHeight : lowerWrapper.scrollHeight;
                container.style.setProperty('--bar3-h', isHidden ? '0px' : `${targetHeight}px`);

                if (!isHidden) {
                    requestAnimationFrame(() => {
                        updateHighlights(true);
                        centerActiveTab('auto');
                    });
                }
            });
        }

        container.addEventListener('click', (e) => {
            const backBtn = e.target.closest('.branding-group .icon-action-button');
            if (backBtn) {
                e.preventDefault();
                e.stopPropagation();
                handleSmartBack();
                return;
            }

            const link = e.target.closest('.tab-link');
            if (!link) return;

            e.preventDefault();
            const target = link.getAttribute('data-target');

            if (window.location.hash !== target) {
                history.pushState(null, '', target);
            }

            setActiveTab(target);
        });

        window.addEventListener('popstate', () => {
            setActiveTab(getActiveTargetFromHash());
        });

        setActiveTab(initialTarget, true);
        updateResponsiveLayout();

        updateHighlights(true);
        centerActiveTab('auto');
        updateSectionHeaderLayout();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.documentElement.classList.remove('no-transitions');
            });
        });

        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                updateResponsiveLayout();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNavbar();
            attachActionButtonListeners(document);
        });
    } else {
        initNavbar();
        attachActionButtonListeners(document);
    }
})();