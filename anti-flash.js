/**
 * Anti-Flash Script (Optimized)
 * Synchronously sets class on root element and manages scroll restoration to prevent early layout shifts.
 */
(function () {
    'use strict';

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const STORAGE_KEY = 'activeTournamentTheme';
    const VALID_THEMES = new Set([
        'theme-australian', 
        'theme-french', 
        'theme-wimbledon', 
        'theme-usopen', 
        'theme-streams', 
        'theme-settings'
    ]);

    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const pageTheme = window.PAGE_THEME || 'theme-australian';

    const selectedTheme = (savedTheme && VALID_THEMES.has(savedTheme)) ? savedTheme : pageTheme;
    document.documentElement.classList.add('no-transitions', selectedTheme);
})();