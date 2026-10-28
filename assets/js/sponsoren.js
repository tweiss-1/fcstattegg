/* sponsoren.html – Partner aus data/sponsoren.csv (Name;Logo;Link;Startseite) */
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('sponsor-grid');
    const e = Site.esc;
    Site.loadCSV('data/sponsoren.csv').then(function (list) {
        grid.innerHTML = list.filter(function (s) { return s.Name; }).map(function (s) {
            const inner = '<div class="sponsor-logo-container" data-photo>' + Site.photoInner(s.Logo, s.Name, e(s.Name)) + '</div><h4>' + e(s.Name) + '</h4>';
            return s.Link
                ? '<a class="sponsor-card" href="' + e(s.Link) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
                : '<div class="sponsor-card">' + inner + '</div>';
        }).join('');
        Site.watchImages(grid);
    }).catch(function (err) {
        console.error(err);
        grid.innerHTML = '<p class="text-center text-error" style="grid-column:1/-1">Fehler beim Laden der Sponsoren.</p>';
    });
});
