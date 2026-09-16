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

    function getActiveTargetFromHash() {
        const hash = window.location.hash;
        return NAVIGATION_ITEMS.some(item => item.target === hash)
            ? hash
            : NAVIGATION_ITEMS[0]?.target;
    }

    /**
     * Easing function matching CSS cubic-bezier(0.16, 1, 0.3, 1)
     */
    function easeBubble(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * Centers the active tab within its scrollable viewport cleanly.
     * @param {'smooth' | 'auto'} behavior - Scrolling animation behavior.
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

            // 1. Precise sub-pixel measurement relative to the viewport
            const viewportRect = viewport.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            const currentScrollLeft = viewport.scrollLeft;
            const itemRelativeLeft = itemRect.left - viewportRect.left + currentScrollLeft;
            
            const targetScrollLeft = Math.max(0, itemRelativeLeft - (viewportRect.width / 2) + (itemRect.width / 2));

            if (behavior === 'auto') {
                if (viewport._scrollAnim) cancelAnimationFrame(viewport._scrollAnim);
                viewport.scrollLeft = targetScrollLeft;
                return;
            }

            // Don't animate if already virtually centered
            if (Math.abs(viewport.scrollLeft - targetScrollLeft) < 1) return;

            // 2. Prevent overlapping animation frames on rapid clicks
            if (viewport._scrollAnim) {
                cancelAnimationFrame(viewport._scrollAnim);
            }

            // 3. Temporarily disable CSS scroll behavior so JS loop doesn't fight native scroll engine
            const originalScrollBehavior = viewport.style.scrollBehavior;
            viewport.style.scrollBehavior = 'auto';

            const startScrollLeft = viewport.scrollLeft;
            const distance = targetScrollLeft - startScrollLeft;
            const startTime = performance.now();
            const duration = 750; // 0.75s to match --slide-duration

            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                viewport.scrollLeft = startScrollLeft + (distance * easeBubble(progress));

                if (progress < 1) {
                    viewport._scrollAnim = requestAnimationFrame(step);
                } else {
                    viewport.style.scrollBehavior = originalScrollBehavior;
                    viewport._scrollAnim = null;
                }
            }

            viewport._scrollAnim = requestAnimationFrame(step);
        });
    }

    /**
     * Dynamically calculates available viewport space vs element natural widths.
     * Triggers accordion collapse exclusively when natural content width exceeds available navbar space.
     */
    function updateResponsiveLayout() {
        const navContainer = document.querySelector('.navigation-container');
        const navbar = document.querySelector('#combinedNavbar');
        const branding = document.querySelector('.branding-group');
        const tabViewport = document.querySelector('#combinedNavbar .tab-scroll-viewport');
        const lowerWrapper = document.getElementById('lowerTabWrapper');

        if (!navContainer || !navbar || !branding || !tabViewport) return;

        // 1. Temporarily strip collapse mode to measure natural unconstrained desktop widths
        navContainer.classList.remove('is-collapsed-mode');

        // 2. Measure actual element bounding boxes and content sizes
        const navbarWidth = navbar.getBoundingClientRect().width;
        const brandingWidth = branding.getBoundingClientRect().width;
        const tabsWidth = tabViewport.scrollWidth;
        
        // Safety buffer: padding + toggle button width allowance when collapsed
        const safetyBuffer = 32; 

        // 3. Dynamic Threshold: Collapse IF total content exceeds available navbar width
        const shouldCollapse = (brandingWidth + tabsWidth + safetyBuffer) > navbarWidth;

        if (shouldCollapse) {
            navContainer.classList.add('is-collapsed-mode');
        } else {
            navContainer.classList.remove('is-collapsed-mode');
        }

        // 4. Recalculate Accordion height (Bar 3)
        if (lowerWrapper) {
            const isHidden = lowerWrapper.classList.contains('is-hidden');
            const innerContent = lowerWrapper.querySelector('.stacked-tab-navbar-inner');
            const exactHeight = innerContent ? innerContent.offsetHeight : lowerWrapper.scrollHeight;
            navContainer.style.setProperty('--bar3-h', isHidden ? '0px' : `${exactHeight}px`);
        }

        // 5. Sync active states, pill positioning, and auto-scroll centering
        syncToggleState();
        updateHighlights(true);
        centerActiveTab('auto'); // Instant centering on screen resize to stay locked on screen
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

    // Positions active pill highlights smooth across changes
    function updateHighlights(disableAnimation = false) {
        const container = document.getElementById('navContainer');
        if (!container) return;

        container.querySelectorAll('.tab-list').forEach(list => {
            const activeLink = list.querySelector('.tab-link.is-active');
            const highlight = list.querySelector('.active-tab-highlight');

            if (!activeLink || !highlight) return;

            const listRect = list.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();

            const leftOffset = linkRect.left - listRect.left;
            const width = linkRect.width;

            if (disableAnimation) highlight.classList.add('no-transition');

            highlight.style.transform = `translateX(${leftOffset}px)`;
            highlight.style.width = `${width}px`;
            highlight.classList.add('is-visible');

            if (disableAnimation) {
                void highlight.offsetWidth; // Trigger layout reflow
                highlight.classList.remove('no-transition');
            }
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
                        <div class="active-tab-highlight"></div>
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
                                <div class="active-tab-highlight"></div>
                                ${linksHTML}
                            </ul>
                        </nav>
                    </header>
                </div>
            </div>
        `;

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

        // Layout recalculation listeners
        window.addEventListener('resize', updateResponsiveLayout, { passive: true });

        // Initial render execution
        setActiveTab(initialTarget, true);
        updateResponsiveLayout();

        requestAnimationFrame(() => {
            updateHighlights(true);
            centerActiveTab('auto');
            document.documentElement.classList.remove('no-transitions');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();