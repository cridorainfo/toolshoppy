import { COMMON_JS } from './common.mjs';

export default {
  path: '/tools/misc/unit-converter/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'Unit Converter',
  title: 'Unit Converter Free | Length, Weight, Area, Temperature, Tola, Cent | ToolShoppy',
  description: 'Free unit converter for length, weight, area, volume, temperature, speed, time and data. Includes tola, pavan, cent, guntha and acre for gold and land. Instant, no signup.',
  name: 'Unit Converter',
  h1: 'Unit Converter',
  intro: 'Convert length, weight, area, volume, temperature, speed, time and digital storage. It also includes everyday South Asian units such as tola, pavan (sovereign), cent, guntha and acre.',
  keywords: 'unit converter, length converter, weight converter, temperature converter, cent to sq ft, tola to gram, acre to cent, km to miles',
  icon: 'scale', tile: 'teal',
  trust: 'Calculated in your browser — nothing is sent anywhere',
  howToTitle: 'How to convert units',
  steps: [
    'Choose a category such as Length, Weight, Area or Temperature.',
    'Type the value and pick the “from” and “to” units. The answer appears instantly.',
    'Use the swap button to reverse the conversion, and scroll to see the value in every unit of that category.',
  ],
  toolHtml: `      <div class="chip-row" id="ucCats" role="group" aria-label="Category"></div>
      <div class="calc-form">
        <div class="calc-field">
          <label for="ucValue">Value</label>
          <input type="number" id="ucValue" value="1" step="any" inputmode="decimal">
        </div>
        <div class="calc-row">
          <div class="calc-field"><label for="ucFrom">From</label><select id="ucFrom"></select></div>
          <div class="calc-field"><label for="ucTo">To</label><select id="ucTo"></select></div>
        </div>
        <button class="btn" id="ucSwap" type="button" style="margin-bottom:6px;">⇅ Swap units</button>
      </div>
      <div class="calc-result-hero">
        <div class="calc-result-label" id="ucLabel">Result</div>
        <div class="calc-result-value" id="ucResult" aria-live="polite" style="word-break:break-word;">—</div>
      </div>
      <h2 class="seo-heading-3" style="font-size:1rem;margin-top:18px;">All units in this category</h2>
      <div class="tool-guide-table-wrap"><table id="ucTable"><thead><tr><th scope="col">Unit</th><th scope="col">Value</th></tr></thead><tbody></tbody></table></div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Handy South Asian units</strong></p>
        <ul>
          <li>1 tola = 11.664 g</li>
          <li>1 pavan / sovereign = 8 g</li>
          <li>1 cent = 435.6 sq ft</li>
          <li>1 acre = 100 cents = 40 guntha</li>
        </ul>
      </div>`,
  sections: [
    ['Units covered', `<p>The converter handles <strong>length</strong> (mm to miles and nautical miles), <strong>weight</strong> (mg to tonnes, pounds, ounces, stone, troy ounce, tola and pavan), <strong>area</strong> (square units, hectare, acre, cent and guntha), <strong>volume</strong> (litres, US cups, spoons, pints and US/UK gallons), <strong>temperature</strong> (Celsius, Fahrenheit, Kelvin), <strong>speed</strong>, <strong>time</strong> and <strong>digital storage</strong> in both decimal (KB, MB, GB) and binary (KiB, MiB, GiB) units.</p>`],
    ['Gold and land units used in India and the Gulf', `<p>A <strong>tola</strong> is traditionally 11.664 grams (about 0.375 troy ounce) and is still quoted for gold and silver in India and the Gulf. A <strong>pavan</strong> or <strong>sovereign</strong>, the unit Kerala jewellers quote, is 8 grams. For land, a <strong>cent</strong> is one hundredth of an acre (about 435.6 square feet or 40.47 square metres), and a <strong>guntha</strong> is one fortieth of an acre (1,089 square feet).</p><p>Regional definitions of some of these units vary slightly, so confirm the unit your jeweller or land record uses before a transaction. To see today’s prices, use the <a href="/tools/rates/gold-rate/">gold rate page</a>.</p>`],
    ['Decimal vs binary storage, and other common pitfalls', `<ul class="guide-list"><li><strong>1 GB is not 1 GiB.</strong> Storage makers use decimal units (1 GB = 1,000,000,000 bytes) while operating systems often show binary units (1 GiB = 1,073,741,824 bytes), which is why a “500 GB” drive looks smaller on a computer.</li><li><strong>Gallons differ.</strong> A US gallon is 3.785 litres and a UK (imperial) gallon is 4.546 litres.</li><li><strong>Months and years are approximations</strong> in the time category (30.44 days and 365.25 days).</li><li><strong>Temperature is not a simple ratio</strong>, so it is converted with the correct formulas rather than a multiplier.</li></ul>`],
  ],
  faqs: [
    ['How many square feet are in a cent?', 'One cent is about 435.6 square feet (40.47 square metres). One acre is 100 cents, which is 43,560 square feet.'],
    ['How many grams are in a tola and a pavan?', 'A tola is 11.664 grams and a pavan (sovereign) is 8 grams. Some regions use slightly different traditional values, so confirm with your jeweller.'],
    ['How do I convert Celsius to Fahrenheit?', 'Multiply by 9/5 and add 32. For example 100 °C is 212 °F. Choose Temperature, then Celsius to Fahrenheit and the tool does it for you.'],
    ['Why does my 500 GB drive show less space?', 'Drive makers count 1 GB as 1,000,000,000 bytes, while many operating systems report in binary GiB (1,073,741,824 bytes). Convert GB to GiB to see the difference.'],
    ['Is the converter accurate?', 'It uses exact or internationally defined conversion factors and rounds the displayed result to about 10 significant digits. Results are for general use, not for legal or scientific certification.'],
  ],
  related: [
    { href: '/tools/misc/percentage-calculator/', title: 'Percentage Calculator', desc: 'Percent of, change, add & subtract', icon: 'calculator', tile: 'green' },
    { href: '/tools/rates/gold-rate/', title: 'Gold Rate Today', desc: 'Kerala, India & UAE', icon: 'coin', tile: 'amber' },
    { href: '/tools/misc/bmi-calculator/', title: 'BMI Calculator', desc: 'Metric or imperial BMI', icon: 'scale', tile: 'teal' },
    { href: '/tools/misc/age-calculator/', title: 'Age Calculator', desc: 'DOB to exact age', icon: 'cake', tile: 'pink' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var cat = 'length', used = false;
  var catsEl = $('ucCats'), valueEl = $('ucValue'), fromEl = $('ucFrom'), toEl = $('ucTo');
  var DEFAULTS = {
    length: ['m', 'ft'], mass: ['kg', 'lb'], area: ['sqft', 'cent'], volume: ['l', 'gal'],
    speed: ['kmh', 'mph'], time: ['h', 'min'], data: ['GB', 'MB'], temperature: ['C', 'F']
  };
  // Order the categories so the ones people search most come first.
  var ORDER = ['length', 'mass', 'area', 'temperature', 'volume', 'speed', 'time', 'data'];

  function fillSelects(keepFrom, keepTo) {
    var units = TSLib.UNITS[cat].units;
    var html = Object.keys(units).map(function (k) { return '<option value="' + k + '">' + units[k][0] + '</option>'; }).join('');
    fromEl.innerHTML = html; toEl.innerHTML = html;
    fromEl.value = keepFrom && units[keepFrom] ? keepFrom : DEFAULTS[cat][0];
    toEl.value = keepTo && units[keepTo] ? keepTo : DEFAULTS[cat][1];
  }
  function render() {
    var v = parseFloat(valueEl.value);
    var units = TSLib.UNITS[cat].units;
    var from = fromEl.value, to = toEl.value;
    if (!isFinite(v)) {
      $('ucResult').textContent = '—';
      $('ucLabel').textContent = 'Enter a number';
      $('ucTable').querySelector('tbody').innerHTML = '';
      return;
    }
    var r = TSLib.convertUnit(cat, v, from, to);
    $('ucLabel').textContent = TSLib.formatNumber(v) + ' ' + units[from][0] + ' =';
    $('ucResult').textContent = TSLib.formatNumber(r) + ' ' + units[to][0];
    var rows = Object.keys(units).map(function (k) {
      var val = TSLib.convertUnit(cat, v, from, k);
      return '<tr' + (k === to ? ' style="font-weight:700"' : '') + '><th scope="row">' + units[k][0] + '</th><td>' + TSLib.formatNumber(val) + '</td></tr>';
    });
    $('ucTable').querySelector('tbody').innerHTML = rows.join('');
    if (!used) { used = true; track('unit-converter', { category: cat }); }
  }
  catsEl.innerHTML = ORDER.map(function (k, i) {
    return '<button class="chip' + (k === cat ? ' active' : '') + '" type="button" data-cat="' + k + '">' + TSLib.UNITS[k].label + '</button>';
  }).join('');
  catsEl.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-cat]');
    if (!chip) return;
    cat = chip.getAttribute('data-cat');
    catsEl.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
    fillSelects();
    render();
  });
  valueEl.addEventListener('input', render);
  fromEl.addEventListener('change', render);
  toEl.addEventListener('change', render);
  $('ucSwap').addEventListener('click', function () { var f = fromEl.value; fromEl.value = toEl.value; toEl.value = f; render(); });
  fillSelects();
  render();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
