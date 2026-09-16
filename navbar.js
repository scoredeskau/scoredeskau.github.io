/**
 * Shared Navbar Component
 */
(function () {
    // 1. Page Configuration Variables & Defaults
    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' },
        { label: 'Schedule', target: '#schedule' },
        { label: 'Announcements', target: '#announcements' },
        { label: 'Results', target: '#results' },
        { label: 'Streams', target: '#streams' },
        { label: 'Settings', target: '#settings' }
    ];

    const PAGE_THEME = window.PAGE_THEME || 'theme-australian';

    document.documentElement.className = document.documentElement.className.replace(/\btheme-\S+/g, '') + ' ' + PAGE_THEME;
    document.body.className = PAGE_THEME;

    function getInitialTabIndex() {
        const currentHash = window.location.hash;
        if (currentHash) {
            const foundIndex = NAVIGATION_ITEMS.findIndex(item => item.target === currentHash);
            if (foundIndex !== -1) return foundIndex;
        }
        const storedIndex = sessionStorage.getItem(`active_tab_${window.location.pathname}`);
        if (storedIndex !== null && !isNaN(parseInt(storedIndex, 10))) {
            const idx = parseInt(storedIndex, 10);
            if (idx >= 0 && idx < NAVIGATION_ITEMS.length) return idx;
        }
        return 0;
    }

    let activeTabIndex = getInitialTabIndex();

    // 2. Inject Refined CSS Styles with Smooth Gliding AND Fading Animations
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .no-transitions *,
        .no-transitions *::before,
        .no-transitions *::after {
            transition: none !important;
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }

        :root {
            --canvas-background-color: #0B192C;
            --court-accent-color: #38BDF8;
            --navbar-height: 52px;
            --back-btn-size: 36px;
            --tab-bubble-height: 44px;
            --back-btn-offset: calc((var(--navbar-height) - var(--back-btn-size)) / 2);
            --tab-bubble-offset-v: calc((var(--navbar-height) - var(--tab-bubble-height)) / 2);
            --page-outer-spacing: 24px;
            --navbar-pill-background: rgba(15, 23, 42, 0.75);
            --navbar-border-color: rgba(255, 255, 255, 0.2);
        }

        :root.theme-australian, body.theme-australian { --canvas-background-color: #071527; --court-accent-color: #38BDF8; }
        :root.theme-french, body.theme-french         { --canvas-background-color: #1A4D2E; --court-accent-color: #E27355; }
        :root.theme-wimbledon, body.theme-wimbledon   { --canvas-background-color: #3D2358; --court-accent-color: #34D399; }
        :root.theme-usopen, body.theme-usopen         { --canvas-background-color: #1E293B; --court-accent-color: #60A5FA; }
        :root.theme-streams, body.theme-streams       { --canvas-background-color: #0B3D66; --court-accent-color: #38BDF8; }
        :root.theme-settings, body.theme-settings     { --canvas-background-color: #2B1B3F; --court-accent-color: #C084FC; }

        body {
            background-color: var(--canvas-background-color);
            width: 100%;
            min-height: 100vh;
            overflow-x: hidden;
            padding: var(--page-outer-spacing);
            font-family: "SF Pro Text", "SF Pro Icons", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #FFFFFF;
            transition: background-color 0.68s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .active-tab-display,
        h1, h2, h3, h4, h5, h6, .main-content {
            color: #FFFFFF !important;
        }

        .navigation-container {
            position: relative;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            margin-bottom: var(--page-outer-spacing);
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }

        .navbar {
            width: 100%;
            height: var(--navbar-height);
            padding: 0;
            background: var(--navbar-pill-background);
            border-radius: 9999px;
            border: 1px solid var(--navbar-border-color);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            isolation: isolate;
        }

        @supports (backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px)) {
            .navbar {
                background: rgba(255, 255, 255, 0.12);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
        }

        .branding-group {
            display: flex;
            align-items: center;
            padding-left: var(--back-btn-offset);
            flex-shrink: 0;
            min-width: max-content;
            z-index: 2;
            height: 100%;
        }

        .icon-action-button {
            height: var(--back-btn-size);
            width: var(--back-btn-size);
            border-radius: 9999px;
            display: grid;
            place-items: center;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            color: rgba(255, 255, 255, 0.95);
            flex-shrink: 0;
            cursor: pointer;
            opacity: 1;
            transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            user-select: none;
            -webkit-user-select: none;
            will-change: transform, opacity;
        }

        @media (hover: hover) {
            .icon-action-button:hover {
                background: rgba(255, 255, 255, 0.22);
                border-color: rgba(255, 255, 255, 0.35);
            }
            .tab-link:hover {
                color: #FFFFFF;
                opacity: 1;
            }
        }

        .icon-action-button:active,
        .icon-action-button.is-pressed {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 0.28);
            border-color: rgba(255, 255, 255, 0.45);
        }

        .icon-action-button svg {
            width: 18px;
            height: 18px;
            transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
        }

        .toggle-menu-button {
            display: none;
            z-index: 10;
        }

        .toggle-menu-button.is-collapsed svg {
            transform: rotate(180deg);
        }

        .header-titles {
            height: var(--back-btn-size);
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1px;
            white-space: nowrap;
            padding-left: var(--back-btn-offset);
            padding-right: var(--back-btn-offset);
            overflow: hidden;
            flex-shrink: 0;
            min-width: max-content;
            transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .primary-title {
            font-size: 14px;
            line-height: 1.2;
            font-weight: 600;
            color: #FFFFFF;
            white-space: nowrap;
        }

        .secondary-title {
            font-size: 12px;
            line-height: 1.2;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.80);
            white-space: nowrap;
        }

        .tab-scroll-viewport {
            position: relative;
            display: flex;
            align-items: center;
            height: 100%;
            margin-left: auto;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            min-width: 0;
            overflow-anchor: none;
            -webkit-overflow-scrolling: touch;
            padding: 0;
        }

        .tab-scroll-viewport::-webkit-scrollbar { display: none; }

        .tab-list {
            position: relative;
            display: flex;
            align-items: center;
            gap: 4px;
            list-style: none;
            height: 100%;
            margin: 0;
            padding: 0 var(--tab-bubble-offset-v);
            margin-left: auto;
            flex-shrink: 0;
        }

        .tab-item {
            height: 100%;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            z-index: 1;
            position: relative;
        }

        .tab-link {
            color: rgba(255, 255, 255, 0.72);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: -0.1px;
            white-space: nowrap;
            height: 100%;
            display: flex;
            align-items: center;
            padding: 0 16px;
            border-radius: 9999px;
            opacity: 0.72;
            transition: color 0.35s ease, opacity 0.35s ease;
            user-select: none;
            -webkit-user-select: none;
        }

        .tab-link.is-active {
            color: #FFFFFF;
            opacity: 1;
        }

        /* Active Pill Highlight with Glide & Opacity Cross-Fade */
        .active-tab-highlight {
            position: absolute;
            top: var(--tab-bubble-offset-v);
            bottom: var(--tab-bubble-offset-v);
            left: 0;
            background: rgba(255, 255, 255, 0.20);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 9999px;
            pointer-events: none;
            opacity: 0;
            transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), 
                        width 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 0.45s ease;
            z-index: 0;
            will-change: transform, width, opacity;
        }

        .active-tab-highlight.is-visible {
            opacity: 1;
        }

        .active-tab-highlight.no-transition {
            transition: none !important;
        }

        .stacked-tab-wrapper { display: none; }

        .navigation-container.is-collapsed-mode .toggle-menu-button {
            display: grid;
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            margin-right: var(--back-btn-offset);
        }

        .navigation-container.is-collapsed-mode .toggle-menu-button:active,
        .navigation-container.is-collapsed-mode .toggle-menu-button.is-pressed {
            transform: translateY(-50%) scale(0.92);
        }

        .navigation-container.is-collapsed-mode .branding-group {
            padding-right: calc(var(--back-btn-size) + (var(--back-btn-offset) * 2));
            width: 100%;
            min-width: 0;
            flex-shrink: 1;
        }

        .navigation-container.is-collapsed-mode .header-titles {
            min-width: 0;
            flex-shrink: 1;
        }

        .navigation-container.is-collapsed-mode .primary-title,
        .navigation-container.is-collapsed-mode .secondary-title {
            text-overflow: ellipsis;
            overflow: hidden;
        }

        .navigation-container.is-collapsed-mode .combined-header-navbar .tab-scroll-viewport { 
            display: none; 
        }
        
        /* Ultra-Smooth Gliding & Fading Container */
        .navigation-container.is-collapsed-mode .stacked-tab-wrapper {
            display: grid;
            grid-template-rows: 1fr;
            width: 100%;
            transition: grid-template-rows 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: grid-template-rows;
        }

        .navigation-container.is-collapsed-mode .stacked-tab-navbar-inner {
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }

        /* Expanded State with Soft Fade-In */
        .navigation-container.is-collapsed-mode .stacked-tab-navbar { 
            display: flex; 
            height: var(--navbar-height);
            margin-top: 6px;
            opacity: 1;
            transform: translateY(0) scale(1);
            transform-origin: top center;
            transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                        transform 0.68s cubic-bezier(0.22, 1, 0.36, 1),
                        margin-top 0.68s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: opacity, transform, margin-top;
        }

        .navigation-container.is-collapsed-mode .stacked-tab-navbar .tab-scroll-viewport {
            width: 100%;
            margin-left: 0;
            padding: 0 var(--tab-bubble-offset-v);
        }

        .navigation-container.is-collapsed-mode .stacked-tab-navbar .tab-list {
            margin-left: 0;
            padding: 0;
        }

        /* Collapsed State: Fades out and glides away smoothly */
        .navigation-container.is-collapsed-mode .stacked-tab-wrapper.is-hidden {
            grid-template-rows: 0fr;
        }

        .navigation-container.is-collapsed-mode .stacked-tab-wrapper.is-hidden .stacked-tab-navbar {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
            margin-top: 0px;
            pointer-events: none;
        }
    `;
    document.head.appendChild(styleElement);

    // 3. Mount Dynamic HTML Structure
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
    const desktopTabListElement = document.getElementById('desktopTabList');
    const mobileTabListElement = document.getElementById('mobileTabList');
    const desktopViewportElement = document.getElementById('desktopTabViewport');
    const mobileViewportElement = document.getElementById('mobileTabViewport');
    const themeTitleHeadingElement = document.getElementById('themeTitleHeading');
    const toggleMenuButtonElement = document.getElementById('toggleMenuButton');
    const lowerTabWrapperElement = document.getElementById('lowerTabWrapper');

    function renderTabNavigationItems(targetContainerElement) {
        const highlightHtml = targetContainerElement.querySelector('.active-tab-highlight').outerHTML;
        const itemsHtml = NAVIGATION_ITEMS.map((item, index) => {
            const isActive = index === activeTabIndex;
            return `<li class="tab-item"><a href="${item.target || '#'}" class="tab-link${isActive ? ' is-active' : ''}" data-index="${index}">${item.label}</a></li>`;
        }).join('');
        
        targetContainerElement.innerHTML = highlightHtml + itemsHtml;
    }

    renderTabNavigationItems(desktopTabListElement);
    renderTabNavigationItems(mobileTabListElement);

    const updatedDesktopHighlight = document.getElementById('desktopActiveHighlight');
    const updatedMobileHighlight = document.getElementById('mobileActiveHighlight');

    let cachedTabsWidth = 0;
    const activeScrollAnimations = new WeakMap();

    // Soft Deceleration Curve for JS Smooth Scroll
    function softDecelerationEasing(t) {
        const p1x = 0.22, p1y = 1.0, p2x = 0.36, p2y = 1.0;
        let cx = 3.0 * p1x, bx = 3.0 * (p2x - p1x) - cx, ax = 1.0 - cx - bx;
        let cy = 3.0 * p1y, by = 3.0 * (p2y - p1y) - cy, ay = 1.0 - cy - by;

        function sampleCurveX(time) { return ((ax * time + bx) * time + cx) * time; }
        function sampleCurveY(time) { return ((ay * time + by) * time + cy) * time; }

        let sampleT = t;
        for (let i = 0; i < 5; i++) {
            let x = sampleCurveX(sampleT) - t;
            if (Math.abs(x) < 1e-3) break;
            let dX = (3.0 * ax * sampleT + 2.0 * bx) * sampleT + cx;
            if (Math.abs(dX) < 1e-3) break;
            sampleT -= x / dX;
        }

        return sampleCurveY(sampleT);
    }

    function synchronizedSmoothScroll(viewportElement, targetScrollLeft, duration = 600) {
        if (activeScrollAnimations.has(viewportElement)) {
            cancelAnimationFrame(activeScrollAnimations.get(viewportElement));
        }

        const startScrollLeft = viewportElement.scrollLeft;
        const totalDistance = targetScrollLeft - startScrollLeft;

        if (Math.abs(totalDistance) < 1) {
            viewportElement.scrollLeft = targetScrollLeft;
            return;
        }

        const startTime = performance.now();

        function scrollFrame(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progressRatio = Math.min(elapsedTime / duration, 1);
            
            const easedProgress = softDecelerationEasing(progressRatio);
            viewportElement.scrollLeft = startScrollLeft + (totalDistance * easedProgress);

            if (progressRatio < 1) {
                activeScrollAnimations.set(viewportElement, requestAnimationFrame(scrollFrame));
            } else {
                activeScrollAnimations.delete(viewportElement);
            }
        }

        activeScrollAnimations.set(viewportElement, requestAnimationFrame(scrollFrame));
    }

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
            if (activeScrollAnimations.has(viewportElement)) {
                cancelAnimationFrame(activeScrollAnimations.get(viewportElement));
            }
            viewportElement.scrollLeft = targetScrollLeft;
            void highlightElement.offsetHeight;
            highlightElement.classList.remove('no-transition');
        } else {
            synchronizedSmoothScroll(viewportElement, targetScrollLeft, 600);
        }
    }

    function checkCollisionBreakpoints(containerWidth) {
        navContainer.classList.remove('is-collapsed-mode');
        cachedTabsWidth = desktopTabListElement.scrollWidth;

        const navbarWidth = containerWidth || combinedNavbar.clientWidth;
        const brandingWidth = brandingGroup.scrollWidth;
        const totalRequiredWidth = brandingWidth + cachedTabsWidth + 12;

        if (navbarWidth < totalRequiredWidth) {
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

        document.querySelectorAll('.tab-link').forEach(linkElement => {
            linkElement.classList.toggle('is-active', parseInt(linkElement.dataset.index, 10) === index);
        });

        if (themeTitleHeadingElement) {
            themeTitleHeadingElement.textContent = currentItem.label;
        }

        const activeDesktopLink = desktopTabListElement.querySelector(`a[data-index="${index}"]`);
        const activeMobileLink = mobileTabListElement.querySelector(`a[data-index="${index}"]`);

        updateHighlightPosition(activeDesktopLink, updatedDesktopHighlight, desktopViewportElement, isInstant);
        updateHighlightPosition(activeMobileLink, updatedMobileHighlight, mobileViewportElement, isInstant);
    }

    toggleMenuButtonElement.addEventListener('click', () => {
        const isHidden = lowerTabWrapperElement.classList.toggle('is-hidden');
        toggleMenuButtonElement.classList.toggle('is-collapsed', isHidden);
        toggleMenuButtonElement.setAttribute('aria-expanded', !isHidden);

        if (!isHidden) {
            const activeMobileLink = mobileTabListElement.querySelector(`a[data-index="${activeTabIndex}"]`);
            updateHighlightPosition(activeMobileLink, updatedMobileHighlight, mobileViewportElement, true);
        }
    });

    document.querySelectorAll('.icon-action-button').forEach(button => {
        let releaseTimer;

        button.addEventListener('touchstart', () => {
            clearTimeout(releaseTimer);
            button.classList.add('is-pressed');
        }, { passive: true });

        const releasePressState = () => {
            releaseTimer = setTimeout(() => {
                button.classList.remove('is-pressed');
            }, 80);
        };

        button.addEventListener('touchend', releasePressState, { passive: true });
        button.addEventListener('touchcancel', releasePressState, { passive: true });
    });

    document.addEventListener('click', event => {
        const clickedTabLink = event.target.closest('.tab-link');
        if (!clickedTabLink) return;

        const index = parseInt(clickedTabLink.dataset.index, 10);
        if (!isNaN(index)) {
            switchActiveTab(index, false);
        }
    });

    window.addEventListener('hashchange', () => {
        const newIndex = getInitialTabIndex();
        if (newIndex !== activeTabIndex) {
            switchActiveTab(newIndex, true);
        }
    });

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

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('no-transitions');
        });
    });
})();