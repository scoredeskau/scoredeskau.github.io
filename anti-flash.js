/**
 * Anti-Flash Script
 * Restores saved user theme from localStorage early before layout render 
 * to prevent screen flash or theme flickering.
 */
(function () {
    const STORAGE_KEY_ACTIVE_THEME = 'activeTournamentTheme';
    const VALID_THEMES = [
        'theme-australian', 
        'theme-french', 
        'theme-wimbledon', 
        'theme-usopen', 
        'theme-streams', 
        'theme-settings'
    ];

    const savedTheme = localStorage.getItem(STORAGE_KEY_ACTIVE_THEME);
    const pageTheme = window.PAGE_THEME || 'theme-australian';

    let selectedTheme = pageTheme;

    // Honor saved user theme preference if valid
    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
        selectedTheme = savedTheme;
    }

    document.documentElement.classList.add('no-transitions', selectedTheme);
})();