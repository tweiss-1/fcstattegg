/* nachwuchs.html – Jugendmannschaften aus data/nachwuchs.csv (Mannschaft;Bild;Info) */
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('youth-grid');
    const e = Site.esc;
    Site.loadCSV('data/nachwuchs.csv').then(function (teams) {
        grid.innerHTML = teams.filter(function (t) { return t.Mannschaft; }).map(function (t) {
            return '<div class="team-card"><div class="team-avatar" data-photo>' +
                Site.photoInner(t.Bild, t.Mannschaft, e(t.Mannschaft)) + '</div>' +
                '<h4>' + e(t.Mannschaft) + '</h4><p>' + e(t.Info) + '</p></div>';
        }).join('');
        Site.watchImages(grid);
    }).catch(function (err) {
        console.error(err);
        grid.innerHTML = '<p class="text-center text-error" style="grid-column:1/-1">Fehler beim Laden der Mannschaften.</p>';
    });
});
