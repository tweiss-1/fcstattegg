/* webshop.js – Artikel aus data/artikel.csv laden, berechnen und Formular vorbereiten */
document.addEventListener('DOMContentLoaded', function () {
    const e = Site.esc;
    const form = document.getElementById('orderForm');
    const tbody = document.getElementById('article-rows');
    const totalEl = document.getElementById('totalPrice');

    const toNumber = function (s) { return parseFloat(String(s).replace(',', '.')) || 0; };
    const euro = function (n) { return '€ ' + n.toFixed(2).replace('.', ','); };

    /* Artikel & Summen-Logik */
    function qtyInputs() { return tbody ? tbody.querySelectorAll('.qty-input') : []; }
    
    function total() {
        let sum = 0;
        qtyInputs().forEach(function (i) { 
            sum += (parseInt(i.value, 10) || 0) * toNumber(i.dataset.price); 
        });
        return sum;
    }
    
    function updateTotal() { 
        if (totalEl) totalEl.textContent = euro(total()); 
    }

    /* CSV laden und Artikeltabelle dynamisch generieren */
    if (tbody) {
        Site.loadCSV('data/artikel.csv').then(function (items) {
            tbody.innerHTML = items.filter(function (a) { return a.Artikel; }).map(function (a) {
                const id = a.Artikel.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                const sizes = a.Groessen ? a.Groessen.split('|').map(function (s) { return s.trim(); }).filter(Boolean) : [];
                
                const sizeCell = sizes.length
                    ? '<select name="' + id + '_Groesse" class="p-2 border border-gray-300 rounded-lg text-sm bg-white" aria-label="Größe ' + e(a.Artikel) + '">' +
                      sizes.map(function (s) { return '<option value="' + e(s) + '">' + e(s) + '</option>'; }).join('') + '</select>'
                    : '-';
                
                return '<tr data-name="' + e(a.Artikel) + '" class="border-b border-gray-100">' +
                    '<td class="py-3 px-4 font-medium text-gray-800">' + e(a.Artikel) + '</td>' +
                    '<td class="py-3 px-4 text-gray-600">' + euro(toNumber(a.Preis)) + '</td>' +
                    '<td class="py-3 px-4">' + sizeCell + '</td>' +
                    '<td class="py-3 px-4"><input type="number" name="' + id + '_Anzahl" min="0" value="0" class="qty-input w-20 p-2 border border-gray-300 rounded-lg text-center" ' +
                    'data-price="' + toNumber(a.Preis) + '" aria-label="Anzahl ' + e(a.Artikel) + '"></td></tr>';
            }).join('');

            qtyInputs().forEach(function (i) { i.addEventListener('input', updateTotal); });
            updateTotal();
        }).catch(function (err) {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-red-600">Artikel konnten nicht geladen werden.</td></tr>';
        });
    }

    /* Absenden: Zusammenfassung generieren, Eingaben prüfen und an PHP übergeben */
    if (form) {
        form.addEventListener('submit', function (ev) {
            const lines = [];
            if (tbody) {
                tbody.querySelectorAll('tr').forEach(function (row) {
                    const qtyInput = row.querySelector('.qty-input');
                    if (qtyInput) {
                        const qty = parseInt(qtyInput.value, 10) || 0;
                        if (qty > 0) {
                            const sel = row.querySelector('select');
                            lines.path ? lines.push(qty + 'x ' + row.dataset.name + (sel ? ' (Größe ' + sel.value + ')' : '')) : lines.push(qty + 'x ' + row.dataset.name + (sel ? ' (Größe ' + sel.value + ')' : ''));
                        }
                    }
                });
            }

            if (!lines.length) {
                ev.preventDefault();
                alert('Bitte wähle mindestens einen Artikel aus.');
                return;
            }

            // Übergabe an die versteckten Felder für das PHP-Skript
            const summaryField = document.getElementById('orderSummary');
            const totalField = document.getElementById('orderTotal');

            if (summaryField) summaryField.value = lines.join('\n');
            if (totalField) totalField.value = euro(total());
        });
    }
});