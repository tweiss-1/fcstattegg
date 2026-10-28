/* index.html – Slideshow (data/slideshow.csv) und nächste Heimspiele (data/spiele.csv) */
document.addEventListener('DOMContentLoaded', function () {
    const e = Site.esc;

    /* Slideshow – für News, Spielberichte und Termine: einfach eine Zeile in data/slideshow.csv.
       Spalten: Bild;Link;Titel;Text;Anzeigen_ab;Anzeigen_bis
       Anzeigen_ab / Anzeigen_bis (JJJJ-MM-TT) sind optional; danach verschwindet der Eintrag von selbst.
       Link darf leer sein. */
    const cssUrl = function (u) {
        return 'url(' + encodeURI(u).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') + ')';
    };
    Site.loadCSV('data/slideshow.csv').then(function (all) {
        const today = new Date().toISOString().split('T')[0];
        const slides = all.filter(function (s) {
            return s.Titel && (!s.Anzeigen_ab || s.Anzeigen_ab <= today) && (!s.Anzeigen_bis || s.Anzeigen_bis >= today);
        });
        const box = document.getElementById('hero-slideshow-container');
        if (!slides.length) { box.innerHTML = '<div class="loading">Aktuell keine Neuigkeiten.</div>'; return; }
        const many = slides.length > 1;
        box.innerHTML = slides.map(function (s, i) {
            const tag = s.Link ? 'a' : 'div';
            return '<' + tag + (s.Link ? ' href="' + e(s.Link) + '"' : '') + ' class="slide' + (i === 0 ? ' active' : '') + '"' +
                (s.Bild ? ' style="background-image:' + cssUrl(s.Bild) + '"' : '') + '>' +
                '<div class="slide-content"><h2>' + e(s.Titel) + '</h2><p>' + e(s.Text) + '</p></div></' + tag + '>';
        }).join('') + (many ?
            '<button class="slideshow-btn prev-btn" aria-label="Zurück">&#10094;</button>' +
            '<button class="slideshow-btn next-btn" aria-label="Weiter">&#10095;</button>' +
            '<div class="slideshow-dots">' + slides.map(function (_, i) {
                return '<span class="dot' + (i === 0 ? ' active' : '') + '"></span>'; }).join('') + '</div>' : '');
        if (many) initSlideshow(box);
    }).catch(function (err) { console.error(err); });

    function initSlideshow(box) {
        const slides = box.querySelectorAll('.slide');
        const dots = box.querySelectorAll('.dot');
        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let current = 0, timer;
        function show(i) {
            slides[current].classList.remove('active'); dots[current].classList.remove('active');
            current = (i + slides.length) % slides.length;
            slides[current].classList.add('active'); dots[current].classList.add('active');
        }
        function stop() { clearInterval(timer); }
        function start() { stop(); if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, 6000); }
        box.querySelector('.next-btn').addEventListener('click', function () { show(current + 1); start(); });
        box.querySelector('.prev-btn').addEventListener('click', function () { show(current - 1); start(); });
        dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); start(); }); });
        box.addEventListener('mouseenter', stop);      // beim Lesen nicht weiterblättern
        box.addEventListener('mouseleave', start);
        box.addEventListener('focusin', stop);
        box.addEventListener('focusout', start);
        start();
    }

    /* Sponsoren in der Seitenleiste: Spalte "Startseite" in data/sponsoren.csv (1 = oben) */
    Site.loadCSV('data/sponsoren.csv').then(function (list) {
        const box = document.getElementById('home-sponsors');
        box.innerHTML = list.filter(function (s) { return s.Name && s.Startseite; })
            .sort(function (a, b) { return parseInt(a.Startseite, 10) - parseInt(b.Startseite, 10); })
            .map(function (s) {
                return '<a href="sponsoren.html" class="sidebar-sponsor" title="' + e(s.Name) + '" data-photo>' +
                    Site.photoInner(s.Logo, s.Name, e(s.Name)) + '</a>';
            }).join('');
        Site.watchImages(box);
    }).catch(function (err) { console.error(err); });

    /* Nächste Heimspiele */
    Site.loadCSV('data/spiele.csv').then(function (games) {
        const box = document.getElementById('next-games-container');
        const today = new Date().toISOString().split('T')[0];
        const next = games.filter(function (g) { return g.Datum && g.Datum >= today; })
            .sort(function (a, b) { return a.Datum.localeCompare(b.Datum) || (a.Uhrzeit || '').localeCompare(b.Uhrzeit || ''); })
            .slice(0, 3);
        if (!next.length) { box.innerHTML = '<div class="next-games-empty">Keine kommenden Spiele eingetragen.</div>'; return; }
        box.innerHTML = next.map(function (g, i) {
            return '<div class="mini-slide' + (i === 0 ? ' active' : '') + '">' +
                '<span class="mini-slide-label">' + e(g.Wettbewerb || 'Spiel') + '</span>' +
                '<h4>' + e(g.Heim) + ' vs. ' + e(g.Gast) + '</h4>' +
                '<p>' + e(Site.formatDate(g.Datum)) + ' | ' + e(g.Uhrzeit) + ' Uhr</p>' +
                '<small>' + e(g.Ort || 'Sportplatz am Wiesengrund') + '</small></div>';
        }).join('');
        const minis = box.querySelectorAll('.mini-slide');
        if (minis.length > 1) {
            let i = 0;
            setInterval(function () { minis[i].classList.remove('active'); i = (i + 1) % minis.length; minis[i].classList.add('active'); }, 4000);
        }
    }).catch(function (err) {
        console.error(err);
        document.getElementById('next-games-container').innerHTML = '<div class="next-games-empty">Spielplan nicht verfügbar.</div>';
    });
});
