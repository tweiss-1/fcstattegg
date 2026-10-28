/* nachwuchs.html – Jugendmannschaften aus data/nachwuchs.csv
   Spalten: Mannschaft;Bild;Info;Trainer;Telefon;Email
   - Klick auf das Mannschaftsfoto: Großansicht (Lightbox)
   - Maus über dem Foto: Trainer-Kontakt (nur wenn Trainer eingetragen ist)
   - Mehrere Trainer: in jeder der drei Spalten mit | trennen, in gleicher Reihenfolge */
document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('youth-grid');
    const e = Site.esc;
    const split = function (s) { return (s || '').split('|').map(function (x) { return x.trim(); }); };

    function trainersOf(t) {
        const names = split(t.Trainer), tel = split(t.Telefon), mail = split(t.Email);
        return names.map(function (n, i) { return { name: n, tel: tel[i] || '', mail: mail[i] || '' }; })
                    .filter(function (x) { return x.name; });
    }
    function contactHTML(list, plain) {
        return list.map(function (x) {
            return '<p class="trainer"><strong>' + e(x.name) + '</strong>' +
                (x.tel ? '<a href="tel:' + e(x.tel.replace(/\s+/g, '')) + '">' + (plain ? '' : '📞 ') + e(x.tel) + '</a>' : '') +
                (x.mail ? '<a href="mailto:' + e(x.mail) + '">' + (plain ? '' : '✉️ ') + e(x.mail) + '</a>' : '') + '</p>';
        }).join('');
    }

    /* Lightbox */
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.innerHTML = '<button class="lightbox-close" type="button" aria-label="Schließen">&times;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(dialog);
    dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (ev) { if (ev.target === dialog) dialog.close(); });

    function openLightbox(team) {
        dialog.querySelector('img').src = team.Bild;
        dialog.querySelector('img').alt = 'Mannschaftsfoto ' + team.Mannschaft;
        const trainers = trainersOf(team);
        dialog.querySelector('figcaption').innerHTML =
            '<strong>' + e(team.Mannschaft) + '</strong>' + (team.Info ? ' &middot; ' + e(team.Info) : '') +
            (trainers.length ? '<br>Trainer: ' + trainers.map(function (x) {
                return e(x.name) + (x.tel ? ' <a href="tel:' + e(x.tel.replace(/\s+/g, '')) + '">' + e(x.tel) + '</a>' : '') +
                       (x.mail ? ' <a href="mailto:' + e(x.mail) + '">' + e(x.mail) + '</a>' : '');
            }).join('<br>') : '');
        dialog.showModal();
    }

    Site.loadCSV('data/nachwuchs.csv').then(function (teams) {
        teams = teams.filter(function (t) { return t.Mannschaft; });
        grid.innerHTML = teams.map(function (t, i) {
            const trainers = trainersOf(t);
            return '<div class="team-card"><div class="team-avatar" data-photo data-index="' + i + '" tabindex="0" role="button" ' +
                'aria-label="Mannschaftsfoto ' + e(t.Mannschaft) + ' vergrößern">' +
                Site.photoInner(t.Bild, t.Mannschaft, e(t.Mannschaft)) +
                (trainers.length ? '<div class="team-overlay"><div class="contact-info">' + contactHTML(trainers) + '</div></div>' : '') +
                '</div><h4>' + e(t.Mannschaft) + '</h4><p>' + e(t.Info) + '</p></div>';
        }).join('');
        Site.watchImages(grid);

        function activate(box) {
            if (!box || box.classList.contains('img-missing')) return;   // ohne Foto keine Großansicht
            openLightbox(teams[parseInt(box.dataset.index, 10)]);
        }
        grid.addEventListener('click', function (ev) {
            if (ev.target.closest('a')) return;                         // Tel/Mail-Links normal ausführen
            activate(ev.target.closest('.team-avatar'));
        });
        grid.addEventListener('keydown', function (ev) {
            if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList.contains('team-avatar')) {
                ev.preventDefault(); activate(ev.target);
            }
        });
    }).catch(function (err) {
        console.error(err);
        grid.innerHTML = '<p class="text-center text-error" style="grid-column:1/-1">Fehler beim Laden der Mannschaften.</p>';
    });
});
