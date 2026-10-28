/* km1.html / km2.html – Kaderliste. Die CSV steht im Attribut data-csv des <tbody id="squad-body"> */
document.addEventListener('DOMContentLoaded', function () {
    const body = document.getElementById('squad-body');
    if (!body) return;
    const e = Site.esc;
    Site.loadCSV(body.dataset.csv).then(function (players) {
        players = players.filter(function (p) { return p.Name; });
        if (!players.length) {
            body.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Noch keine Spieler eingetragen.</td></tr>';
            return;
        }
        body.innerHTML = players.map(function (p) {
            return '<tr>' +
                '<td class="text-center"><div class="player-photo" data-photo>' + Site.photoInner(p.Foto, p.Name, Site.personIcon(20)) + '</div></td>' +
                '<td class="player-number">' + (e(p.Rueckennummer) || '-') + '</td>' +
                '<td class="player-name">' + e(p.Name) + '</td>' +
                '<td>' + e(p.Position) + '</td></tr>';
        }).join('');
        Site.watchImages(body);
    }).catch(function (err) {
        console.error(err);
        body.innerHTML = '<tr><td colspan="4" class="text-center text-error">Fehler beim Laden der Kaderliste.</td></tr>';
    });
});
