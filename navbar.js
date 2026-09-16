/**
 * Shared Navbar Component - High-Performance Edition (Dynamic Auto-Collapse)
 */
(function () {
    'use strict';

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' }
    ];
    const PRIMARY_TITLE = window.PAGE_PRIMARY_TITLE || 'Tournament';
    const SECONDARY_TITLE = window.PAGE_SECONDARY_TITLE || '';
    const BAR3_STORAGE_KEY = 'bar3_collapsed_state';

    const BACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    const TOGGLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    // Add near the top of navbar_2.js
    const MatrixClass = window.DOMMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix;

    function getParsedMatrix(element) {
        const transform = window.getComputedStyle(element).transform;
        
        if (!transform || transform === 'none') {
            return new MatrixClass();
        }
        
        return new MatrixClass(transform);
    }

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

        let x = t;
        for (let i = 0; i < 8; i++) {
            const currentX = 3 * (1 - x) * (1 - x) * x * 0.16 + 3 * (1 - x) * x * x * 0.3 + x * x * x;
            const dx = 3 * (1 - x) * (1 - x) * 0.16 + 6 * (1 - x) * x * (0.3 - 0.16) + 3 * x * x * (1 - 0.3);
            if (Math.abs(currentX - t) < 1e-5 || dx === 0) break;
            x -= (currentX - t) / dx;
        }

        return 3 * (1 - x) * (1 - x) * x * 1 + 3 * (1 - x) * x * x * 1 + x * x * x;
    }

    /**
     * Interruptible smooth auto-scroll controller.
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
            
            const targetScrollLeft = Math.max(0, itemRelativeLeft - (viewportRect.width / 2) + (itemRect.width / 2));

            if (behavior === 'auto') {
                if (viewport._scrollAnim) {
                    cancelAnimationFrame(viewport._scrollAnim);
                    viewport._scrollAnim = null;
                }
                viewport.scrollLeft = targetScrollLeft;
                return;
            }

            // Immediately kill existing scroll loop on new click
            if (viewport._scrollAnim) {
                cancelAnimationFrame(viewport._scrollAnim);
                viewport._scrollAnim = null;
            }

            const startScrollLeft = viewport.scrollLeft;
            const distance = targetScrollLeft - startScrollLeft;
            
            if (Math.abs(distance) < 0.5) return;

            const startTime = performance.now();
            const duration = 750; // Match --slide-duration

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
        const tabViewport = document.querySelector('#combinedNavbar .tab-scroll-viewport');
        const lowerWrapper = document.getElementById('lowerTabWrapper');

        if (!navContainer || !navbar || !branding || !tabViewport) return;

        // Read current element dimensions without mutating DOM layout first
        const navbarWidth = navbar.getBoundingClientRect().width;
        const brandingWidth = branding.getBoundingClientRect().width;
        
        // Query tabList from navContainer to ensure scrollWidth is measurable
        const tabList = navContainer.querySelector('.tab-list');
        const tabsWidth = tabList ? tabList.scrollWidth : 0;
        
        // Safety buffer: padding + toggle button width allowance when collapsed
        const safetyBuffer = 32; 

        // Dynamic Threshold: Collapse IF total content exceeds available navbar width
        const shouldCollapse = (brandingWidth + tabsWidth + safetyBuffer) > navbarWidth;
        
        // Toggle class in a single batch operation
        navContainer.classList.toggle('is-collapsed-mode', shouldCollapse);

        // Recalculate Accordion height (Bar 3)
        if (lowerWrapper) {
            const isHidden = lowerWrapper.classList.contains('is-hidden');
            const innerContent = lowerWrapper.querySelector('.stacked-tab-navbar-inner');
            const exactHeight = innerContent ? innerContent.offsetHeight : lowerWrapper.scrollHeight;
            navContainer.style.setProperty('--bar3-h', isHidden ? '0px' : `${exactHeight}px`);
        }

        // Sync active states, pill positioning, and auto-scroll centering
        syncToggleState();
        updateHighlights(true);
        centerActiveTab('auto');
    }

    // Hardcodes toggle icon orientation directly to Bar 3 visibility
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
                    highlight.style.transition = 'none';
                    highlight.style.transform = `translateX(${targetLeft}px)`;
                    highlight.style.width = `${targetWidth}px`;
                    highlight.classList.add('is-visible');
                    
                    // Force browser layout flush while transitions are strictly inline disabled
                    void highlight.offsetWidth; 
                    highlight.style.transition = '';
                    return;
                }

                // Interrupt existing CSS transition cleanly by freezing current rendered position
                // NEW / FIX CODE
                // FIXED:
                const matrix = getParsedMatrix(highlight);
                const translateX = matrix.m41 ?? matrix.e;
                const currentLeft = (typeof translateX === 'number' && !Number.isNaN(translateX)) ? translateX : targetLeft;
                const currentWidth = highlight.offsetWidth || targetWidth;

                // 1. Instantly freeze pill at current mid-animation coordinates
                highlight.classList.add('no-transition');
                highlight.style.transform = `translateX(${currentLeft}px)`;
                highlight.style.width = `${currentWidth}px`;

                // 2. Force reflow to flush frozen styles
                void highlight.offsetWidth;

                // 3. Re-enable CSS transitions to travel smoothly to new target
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

        updateHighlights(disableAnimation);
        centerActiveTab(disableAnimation ? 'auto' : 'smooth');
    }

    // In navbar.js
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

        // Attach pointer events with guaranteed capture & release cleanup
        container.querySelectorAll('.icon-action-button').forEach(btn => {
            let pressStartTime = 0;
            let releaseTimer = null;

            const clearPressed = () => {
                if (releaseTimer) {
                    clearTimeout(releaseTimer);
                    releaseTimer = null;
                }
                btn.classList.remove('is-pressed');
            };

            btn.addEventListener('pointerdown', (e) => {
                // Force browser to track pointer releases even if cursor moves outside button
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
                const remainingTime = Math.max(0, 80 - elapsed);

                if (releaseTimer) clearTimeout(releaseTimer);

                releaseTimer = setTimeout(() => {
                    clearPressed();
                    btn.blur();
                }, remainingTime);
            };

            btn.addEventListener('pointerup', handleRelease);
            btn.addEventListener('pointercancel', clearPressed);
            btn.addEventListener('pointerleave', clearPressed);
            btn.addEventListener('blur', clearPressed);
        });

        const lowerWrapper = document.getElementById('lowerTabWrapper');
        const toggleBtn = container.querySelector('.toggle-menu-button');

        // Toggle Accordion (Bar 3) with unified localStorage key
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

        // Delegated Navigation Clicks
        container.addEventListener('click', (e) => {
            const link = e.target.closest('.tab-link');
            if (!link) return;

            e.preventDefault();
            const target = link.getAttribute('data-target');

            if (window.location.hash !== target) {
                history.pushState(null, '', target);
            }

            setActiveTab(target);
        });

        // Sync tabs on browser navigation (Back/Forward)
        window.addEventListener('popstate', () => {
            setActiveTab(getActiveTargetFromHash());
        });

        // Initial render execution
        setActiveTab(initialTarget, true);
        updateResponsiveLayout();

        // Force synchronous layout paint before stripping anti-flash class
        updateHighlights(true);
        centerActiveTab('auto');

        // Double rAF ensures the compositor has committed the initial transform frame to display
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
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();