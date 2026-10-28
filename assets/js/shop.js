/* webshop.html – Artikel aus data/artikel.csv (Artikel;Preis;Groessen) */
document.addEventListener('DOMContentLoaded', function () {
    const e = Site.esc;
    const form = document.getElementById('orderForm');
    const tbody = document.getElementById('article-rows');
    const totalEl = document.getElementById('totalPrice');
    const PLACEHOLDER_ID = 'DEINE-FORM-ID';

    const slug = function (s) { return s.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); };
    const toNumber = function (s) { return parseFloat(String(s).replace(',', '.')) || 0; };
    const euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };


    /* Artikel */
    function qtyInputs() { return tbody.querySelectorAll('.qty-input'); }
    function total() {
        let sum = 0;
        qtyInputs().forEach(function (i) { sum += (parseInt(i.value, 10) || 0) * toNumber(i.dataset.price); });
        return sum;
    }
    function updateTotal() { totalEl.textContent = euro(total()); }

    Site.loadCSV('data/artikel.csv').then(function (items) {
        tbody.innerHTML = items.filter(function (a) { return a.Artikel; }).map(function (a) {
            const id = slug(a.Artikel);
            const sizes = a.Groessen ? a.Groessen.split('|').map(function (s) { return s.trim(); }).filter(Boolean) : [];
            const sizeCell = sizes.length
                ? '<select name="' + id + '_Groesse" aria-label="Größe ' + e(a.Artikel) + '">' +
                  sizes.map(function (s) { return '<option value="' + e(s) + '">' + e(s) + '</option>'; }).join('') + '</select>'
                : '-';
            return '<tr data-name="' + e(a.Artikel) + '"><td>' + e(a.Artikel) + '</td><td>' + euro(toNumber(a.Preis)) + '</td>' +
                '<td>' + sizeCell + '</td>' +
                '<td><input type="number" name="' + id + '_Anzahl" min="0" value="0" class="qty-input" ' +
                'data-price="' + toNumber(a.Preis) + '" aria-label="Anzahl ' + e(a.Artikel) + '"></td></tr>';
        }).join('');
        qtyInputs().forEach(function (i) { i.addEventListener('input', updateTotal); });
        updateTotal();
    }).catch(function (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-error">Artikel konnten nicht geladen werden.</td></tr>';
    });

    /* Absenden: Zusammenfassung ergänzen, Eingaben prüfen */
    form.addEventListener('submit', function (ev) {
        if (form.action.indexOf(PLACEHOLDER_ID) !== -1) {
            ev.preventDefault();
            alert('Das Bestellformular ist noch nicht eingerichtet (Formspree-ID fehlt). Bitte kontaktiere den Verein direkt.');
            return;
        }
        const lines = [];
        tbody.querySelectorAll('tr').forEach(function (row) {
            const qty = parseInt(row.querySelector('.qty-input').value, 10) || 0;
            if (qty > 0) {
                const sel = row.querySelector('select');
                lines.push(qty + 'x ' + row.dataset.name + (sel ? ' (Größe ' + sel.value + ')' : ''));
            }
        });
        if (!lines.length) {
            ev.preventDefault();
            alert('Bitte wähle mindestens einen Artikel aus.');
            return;
        }
        document.getElementById('orderSummary').value = lines.join('\n');
        document.getElementById('orderTotal').value = euro(total());
    });
});
