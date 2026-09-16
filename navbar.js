/**
 * Shared Navbar Component - High-Performance Edition
 */
(function () {
    'use strict';

    const NAVIGATION_ITEMS = window.PAGE_NAVIGATION_ITEMS || [
        { label: 'Live Scores', target: '#scores' }
    ];
    const PRIMARY_TITLE = window.PAGE_PRIMARY_TITLE || 'Tournament';
    const SECONDARY_TITLE = window.PAGE_SECONDARY_TITLE || '';

    const BACK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    const TOGGLE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    function initNavbar() {
        const container = document.getElementById('navContainer');
        if (!container) return;

        // Construct Navbar DOM efficiently
        const linksHTML = NAVIGATION_ITEMS.map((item, index) => `
            <li class="tab-item">
                <a href="${item.target}" class="tab-link ${index === 0 ? 'is-active' : ''}" data-target="${item.target}">${item.label}</a>
            </li>
        `).join('');

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
            <div class="stacked-tab-wrapper is-hidden" id="lowerTabWrapper">
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
        const displayTitleHeading = document.getElementById('themeTitleHeading');

        // Positioning function for active tab highlight pill
        const updateHighlights = (disableAnimation = false) => {
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
                    // Force reflow and re-enable transition
                    void highlight.offsetWidth;
                    highlight.classList.remove('no-transition');
                }
            });
        };

        // Responsive Collapse Handler
        const checkResponsiveMode = () => {
            const isCollapsed = window.innerWidth <= 768;
            container.classList.toggle('is-collapsed-mode', isCollapsed);
            updateHighlights(true);
        };

        checkResponsiveMode();
        window.addEventListener('resize', checkResponsiveMode, { passive: true });

        // Toggle Accordion (Bar 3)
        if (toggleBtn && lowerWrapper) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = lowerWrapper.classList.toggle('is-hidden');
                toggleBtn.classList.toggle('is-collapsed', !isHidden);
                container.style.setProperty('--bar3-h', isHidden ? '0px' : `${lowerWrapper.scrollHeight}px`);
                if (!isHidden) {
                    requestAnimationFrame(() => updateHighlights(true));
                }
            });
        }

        // Delegated Navigation Clicks
        container.addEventListener('click', (e) => {
            const link = e.target.closest('.tab-link');
            if (!link) return;

            e.preventDefault();
            const target = link.getAttribute('data-target');

            // Update active states
            container.querySelectorAll('.tab-link').forEach(l => {
                l.classList.toggle('is-active', l.getAttribute('data-target') === target);
            });

            if (displayTitleHeading) {
                displayTitleHeading.textContent = link.textContent.trim();
            }

            // Animate highlight pill to the newly active tab
            updateHighlights();
        });

        // Initialize pill positions immediately
        requestAnimationFrame(() => {
            updateHighlights(true);
            document.documentElement.classList.remove('no-transitions');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();