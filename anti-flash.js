(function() {
    var STORAGE_KEY_ACTIVE_THEME = 'activeTournamentTheme';
    var savedTheme = localStorage.getItem(STORAGE_KEY_ACTIVE_THEME);
    var validThemes = ['theme-australian', 'theme-french', 'theme-wimbledon', 'theme-usopen', 'theme-streams', 'theme-settings'];
    
    if (savedTheme && validThemes.indexOf(savedTheme) !== -1) {
        document.documentElement.className = 'no-transitions ' + savedTheme;
    } else {
        document.documentElement.className = 'no-transitions theme-australian';
    }
})();