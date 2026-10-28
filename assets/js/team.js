/* team.html – Funktionäre & Betreuer aus data/team.csv */
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('team-grid');
    const e = Site.esc;
    Site.loadCSV('data/team.csv').then(function (people) {
        grid.innerHTML = people.filter(function (p) { return p.Name; }).map(function (p) {
            return '<div class="team-card">' +
                '<div class="team-avatar" data-photo>' +
                  Site.photoInner(p.Bild, p.Name, Site.personIcon(80)) +
                  '<div class="team-overlay"><div class="contact-info">' +
                    '<p><strong>📞 Tel:</strong> <a href="tel:' + e(p.Telefon) + '">' + e(p.Telefon) + '</a></p>' +
                    '<p><strong>✉️ E-Mail:</strong> <a href="mailto:' + e(p.Email) + '">' + e(p.Email) + '</a></p>' +
                  '</div></div>' +
                '</div>' +
                '<h4>' + e(p.Name) + '</h4><p>' + e(p.Rolle) + '</p></div>';
        }).join('');
        Site.watchImages(grid);
    }).catch(function (err) {
        console.error(err);
        grid.innerHTML = '<p class="text-center text-error" style="grid-column:1/-1">Fehler beim Laden der Kontaktdaten.</p>';
    });
});
