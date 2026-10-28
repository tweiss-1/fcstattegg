/* ==========================================================================
   FC Stattegg – gemeinsames Skript
   1. Konfiguration (Navigation, Footer, Vereinsdaten)  ← hier pflegen
   2. Header & Footer einsetzen
   3. Hilfsfunktionen: CSV laden, HTML escapen, Datum formatieren
   Wird auf jeder Seite mit <script src="assets/js/site.js" defer></script>
   geladen. Seiten-Skripte (home.js, team.js, ...) kommen danach.
   ========================================================================== */
(function () {
    'use strict';

    /* 1 Konfiguration ----------------------------------------------------- */
    const CONFIG = {
        clubName: 'FC STATTEGG',
        logo: 'images/Logo.png',
        address: 'FC Stattegg - am Wiesengrund 6 - 8046 Graz Stattegg',
        instagram: 'https://www.instagram.com/fcstattegg/',
        nav: [
            { href: 'index.html',     label: 'Homepage'   },
            { href: 'team.html',      label: 'Team'       },
            { href: 'km1.html',       label: 'KM I'       },
            { href: 'km2.html',       label: 'KM II'      },
            { href: 'nachwuchs.html', label: 'Nachwuchs'  },
            { href: 'downloads.html', label: 'Downloads'  },
            { href: 'webshop.html',   label: 'Shop'       },
            { href: 'sponsoren.html', label: 'Sponsoren'  }
        ],
        footerLinks: [
            { href: 'impressum.html',    label: 'Impressum'    },
            { href: 'datenschutz.html', label: 'Datenschutz' }
        ]
    };

    /* 3 Hilfsfunktionen --------------------------------------------------- */
    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // CSV-Text -> Array von Zeilen (Arrays). Unterstützt ; oder , als Trenner,
    // Anführungszeichen, Zeilenumbrüche (\r\n) und BOM.
    function parseCSV(text) {
        text = text.replace(/^\uFEFF/, '');
        const firstLine = text.split(/\r?\n/, 1)[0] || '';
        const delim = firstLine.includes(';') ? ';' : ',';
        const rows = [];
        let row = [], field = '', inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (inQuotes) {
                if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
                else if (c === '"') { inQuotes = false; }
                else { field += c; }
            } else if (c === '"') { inQuotes = true; }
            else if (c === delim) { row.push(field); field = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && text[i + 1] === '\n') i++;
                row.push(field); field = '';
                rows.push(row); row = [];
            } else { field += c; }
        }
        if (field !== '' || row.length) { row.push(field); rows.push(row); }
        return rows;
    }

    // CSV-Datei laden -> Promise<Array<Objekt>> (Schlüssel = Spaltenüberschriften).
    // Leere Zeilen werden übersprungen.
    function loadCSV(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) throw new Error(url + ' konnte nicht geladen werden (' + response.status + ')');
            return response.text();
        }).then(function (text) {
            const rows = parseCSV(text).filter(function (r) { return r.some(function (f) { return f.trim() !== ''; }); });
            if (!rows.length) return [];
            const headers = rows[0].map(function (h) { return h.trim(); });
            return rows.slice(1).map(function (r) {
                const obj = {};
                headers.forEach(function (h, i) { obj[h] = (r[i] || '').trim(); });
                return obj;
            });
        });
    }

    function formatDate(isoDate) {
        return new Date(isoDate).toLocaleDateString('de-AT',
            { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
    }


    // Platzhalter-Symbol für fehlende Personenfotos
    function personIcon(size) {
        return '<svg fill="currentColor" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" style="opacity:.5" aria-hidden="true">' +
               '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
    }

    // Foto mit Ersatzanzeige. Aufbau:
    //   <div data-photo> + photoInner(src, alt, ersatzHTML) + </div>
    // Fehlt das Bild (leer oder nicht ladbar), zeigt das CSS den Ersatz (.img-missing).
    function photoInner(src, alt, fallbackHTML) {
        return (src ? '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy">' : '') +
               '<span class="fallback">' + fallbackHTML + '</span>';
    }
    function watchImages(root) {
        root.querySelectorAll('[data-photo]').forEach(function (box) {
            const img = box.querySelector('img');
            if (!img) { box.classList.add('img-missing'); return; }
            function miss() { box.classList.add('img-missing'); img.remove(); }
            img.addEventListener('error', miss, { once: true });
            if (img.complete && img.naturalWidth === 0) miss();
        });
    }

    /* 2 Header & Footer --------------------------------------------------- */
    function currentPage() {
        const file = location.pathname.split('/').pop();
        return file === '' ? 'index.html' : file;
    }

    function headerHTML() {
        const page = currentPage();
        const items = CONFIG.nav.map(function (item) {
            const active = item.href === page;
            return '<li><a href="' + item.href + '"' + (active ? ' class="active" aria-current="page"' : '') + '>' +
                   esc(item.label) + '</a></li>';
        }).join('');
        const insta = '<li><a href="' + CONFIG.instagram + '" target="_blank" rel="noopener noreferrer" ' +
            'title="Instagram" aria-label="Instagram" class="nav-icon">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>' +
            '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>' +
            '<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a></li>';
        return '<div class="nav-container">' +
            '<a class="logo-area" href="index.html" style="text-decoration:none">' +
            '<img src="' + CONFIG.logo + '" alt="FC Stattegg Logo"><h1>' + esc(CONFIG.clubName) + '</h1></a>' +
            '<nav aria-label="Hauptnavigation"><ul>' + items + insta + '</ul></nav></div>';
    }

    function footerHTML() {
        const links = CONFIG.footerLinks.map(function (l) {
            return '<a href="' + l.href + '">' + esc(l.label) + '</a>';
        }).join('');
        return '<p>&copy; ' + new Date().getFullYear() + ' ' + esc(CONFIG.address) + '</p>' +
               '<p class="footer-small">Offizielle Vereinshomepage</p>' +
               '<p class="footer-links">' + links + '</p>';
    }

    // Platzhalter werden durch das Element selbst ersetzt (nicht umhüllt),
    // damit position: sticky am Header funktioniert.
    function mountLayout() {
        const h = document.getElementById('site-header');
        if (h) { const el = document.createElement('header'); el.innerHTML = headerHTML(); h.replaceWith(el); }
        const f = document.getElementById('site-footer');
        if (f) { const el = document.createElement('footer'); el.innerHTML = footerHTML(); f.replaceWith(el); }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountLayout);
    else mountLayout();

    window.Site = { config: CONFIG, loadCSV: loadCSV, parseCSV: parseCSV, esc: esc, formatDate: formatDate,
                   personIcon: personIcon, photoInner: photoInner, watchImages: watchImages };
})();
