/* downloads.html – Dokumente aus data/downloads.csv (Name;Beschreibung;Format;Datei) */
document.addEventListener('DOMContentLoaded', function () {
    const body = document.getElementById('download-rows');
    const e = Site.esc;
    Site.loadCSV('data/downloads.csv').then(function (docs) {
        body.innerHTML = docs.filter(function (d) { return d.Name; }).map(function (d) {
            const action = d.Datei
                ? '<a class="download-link" href="' + e(d.Datei) + '" download>Herunterladen</a>'
                : '<span class="text-muted">Bald verfügbar</span>';
            return '<tr><td>' + e(d.Name) + '</td><td>' + e(d.Beschreibung) + '</td><td>' + e(d.Format) + '</td><td>' + action + '</td></tr>';
        }).join('');
    }).catch(function (err) {
        console.error(err);
        body.innerHTML = '<tr><td colspan="4" class="text-center text-error">Fehler beim Laden der Dokumente.</td></tr>';
    });
});
