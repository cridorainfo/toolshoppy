import { COMMON_JS } from './common.mjs';

const card = (id, title, body) => `      <div class="compare-box" style="text-align:left;margin-bottom:14px;padding:14px;">
        <p style="font-weight:700;margin-bottom:10px;" id="${id}Title">${title}</p>
${body}
      </div>`;
const num = (id, label, value) => `          <div class="calc-field" style="margin-bottom:8px;"><label for="${id}">${label}</label><input type="number" id="${id}" value="${value}" step="any" inputmode="decimal"></div>`;

export default {
  path: '/tools/misc/percentage-calculator/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'Percentage Calculator',
  title: 'Percentage Calculator Free | % Of, % Change, Add & Subtract | ToolShoppy',
  description: 'Free percentage calculator. Find X% of a number, what percent one number is of another, percentage increase or decrease, and add or subtract a percentage. Instant results.',
  name: 'Percentage Calculator',
  h1: 'Percentage Calculator',
  intro: 'Six quick calculators in one: percent of a number, what percent one number is of another, percentage change, add or subtract a percentage, and finding the whole from a part.',
  keywords: 'percentage calculator, percent of a number, percentage increase calculator, percentage decrease, calculate percentage, discount calculator',
  icon: 'calculator', tile: 'green',
  appCategory: 'FinanceApplication',
  trust: 'Calculated in your browser — nothing is sent anywhere',
  howToTitle: 'How to calculate a percentage',
  steps: [
    'Find the card that matches your question, such as “What is X% of Y?” or “Percentage change”.',
    'Type your two numbers. The answer updates as you type.',
    'Use the formula shown with each result to check it or repeat it on paper.',
  ],
  toolHtml: [
    card('p1', 'What is <em>X</em>% of <em>Y</em>?', `        <div class="calc-row">
${num('p1x', 'X (%)', 15)}
${num('p1y', 'Y', 2400)}
        </div>
        <p><strong id="p1r">—</strong></p><p class="rate-disclaimer" id="p1f"></p>`),
    card('p2', '<em>X</em> is what percent of <em>Y</em>?', `        <div class="calc-row">
${num('p2x', 'X', 45)}
${num('p2y', 'Y', 180)}
        </div>
        <p><strong id="p2r">—</strong></p><p class="rate-disclaimer" id="p2f"></p>`),
    card('p3', 'Percentage change from <em>X</em> to <em>Y</em>', `        <div class="calc-row">
${num('p3x', 'From (X)', 80)}
${num('p3y', 'To (Y)', 100)}
        </div>
        <p><strong id="p3r">—</strong></p><p class="rate-disclaimer" id="p3f"></p>`),
    card('p4', 'Add or subtract <em>X</em>% from <em>Y</em>', `        <div class="calc-row">
${num('p4x', 'X (%)', 18)}
${num('p4y', 'Y', 1000)}
        </div>
        <p><strong id="p4r">—</strong></p><p class="rate-disclaimer" id="p4f"></p>`),
    card('p5', '<em>Y</em> is <em>X</em>% of what number?', `        <div class="calc-row">
${num('p5x', 'X (%)', 20)}
${num('p5y', 'Y', 50)}
        </div>
        <p><strong id="p5r">—</strong></p><p class="rate-disclaimer" id="p5f"></p>`),
  ].join('\n'),
  sidebarHtml: `      <div class="info-box">
        <p><strong>Quick formulas</strong></p>
        <ul>
          <li>X% of Y = Y × X ÷ 100</li>
          <li>Change % = (new − old) ÷ old × 100</li>
          <li>Add X% = Y × (1 + X ÷ 100)</li>
          <li>Subtract X% = Y × (1 − X ÷ 100)</li>
        </ul>
      </div>`,
  sections: [
    ['Percentage formulas, in plain words', `<p>A percentage is a number out of 100. To find <strong>X% of Y</strong>, multiply Y by X and divide by 100: 15% of 2,400 is 2,400 × 15 ÷ 100 = 360. To find what percent <strong>X is of Y</strong>, divide X by Y and multiply by 100: 45 out of 180 is 25%.</p><p><strong>Percentage change</strong> compares a new value with the old one: subtract old from new, divide by the old value, and multiply by 100. From 80 to 100 is +25%; from 100 back to 80 is −20%, because the base changed.</p>`],
    ['Discounts, GST and VAT', `<p>To take a discount, use “Subtract X% from Y”: a 25% discount on 2,000 leaves 1,500. To add tax, use “Add X% to Y”: 18% GST on 1,000 makes 1,180. To work out the pre-tax price from a tax-inclusive total, divide by 1 + rate (for 18% GST, divide by 1.18), or use the dedicated <a href="/tools/finance/gst-calculator/">GST calculator</a> or <a href="/tools/finance/uae-vat/">UAE VAT calculator</a>.</p>`],
    ['Common percentage mistakes', `<ul class="guide-list"><li><strong>Increase then decrease by the same percent does not return to the start.</strong> +20% then −20% of 100 gives 96, not 100.</li><li><strong>Percentage points are not percent.</strong> Going from 10% to 12% is +2 percentage points but a 20% increase.</li><li><strong>The base matters.</strong> “X% of Y” and “Y% of X” are equal numbers, but “what percent” and “percentage change” depend on which number you divide by.</li></ul>`],
  ],
  faqs: [
    ['How do I calculate a percentage of a number?', 'Multiply the number by the percentage and divide by 100. For example, 15% of 2,400 = 2,400 × 15 ÷ 100 = 360. The first calculator does this automatically.'],
    ['How do I calculate percentage increase or decrease?', 'Subtract the old value from the new value, divide by the old value and multiply by 100. A positive result is an increase and a negative result is a decrease. Use the “Percentage change” calculator.'],
    ['How do I add or remove a percentage like GST?', 'To add a percentage, multiply by 1 + rate (for 18%: × 1.18). To remove it, divide by the same factor. The “Add or subtract” card shows both results at once.'],
    ['Why is a 20% rise followed by a 20% fall not the same as the start?', 'Each percentage applies to a different base. A 20% rise on 100 gives 120, and 20% of 120 is 24, so the fall leaves 96.'],
    ['Is this percentage calculator free and private?', 'Yes. It is free, needs no signup, and calculates entirely in your browser.'],
  ],
  related: [
    { href: '/tools/finance/gst-calculator/', title: 'GST Calculator', desc: 'Add or remove GST', icon: 'calculator', tile: 'indigo' },
    { href: '/tools/finance/uae-vat/', title: 'UAE VAT Calculator', desc: 'Add or remove 5% VAT', icon: 'calculator', tile: 'teal' },
    { href: '/tools/misc/unit-converter/', title: 'Unit Converter', desc: 'Length, weight, area & more', icon: 'scale', tile: 'teal' },
    { href: '/tools/finance/emi-calculator/', title: 'EMI Calculator', desc: 'Home & personal loan EMI', icon: 'building-bank', tile: 'blue' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var used = false;
  var f = TSLib.formatNumber;
  function val(id) { var v = parseFloat($(id).value); return isFinite(v) ? v : null; }
  function set(id, result, formula) { $(id + 'r').textContent = result; $(id + 'f').textContent = formula || ''; }
  function calc() {
    var x, y;
    x = val('p1x'); y = val('p1y');
    if (x === null || y === null) set('p1', '—'); else set('p1', f(TSLib.pctOf(x, y)), f(x) + ' ÷ 100 × ' + f(y));
    x = val('p2x'); y = val('p2y');
    var w = x === null || y === null ? null : TSLib.whatPct(x, y);
    if (w === null) set('p2', '—', y === 0 ? 'Y cannot be zero.' : ''); else set('p2', f(w) + '%', f(x) + ' ÷ ' + f(y) + ' × 100');
    x = val('p3x'); y = val('p3y');
    var c = x === null || y === null ? null : TSLib.pctChange(x, y);
    if (c === null) set('p3', '—', x === 0 ? 'The starting value cannot be zero.' : '');
    else set('p3', (c > 0 ? '+' : '') + f(c) + '% ' + (c > 0 ? '(increase)' : c < 0 ? '(decrease)' : '(no change)'), '(' + f(y) + ' − ' + f(x) + ') ÷ ' + f(x) + ' × 100');
    x = val('p4x'); y = val('p4y');
    if (x === null || y === null) set('p4', '—'); else set('p4', 'Add: ' + f(TSLib.addPct(y, x)) + '   ·   Subtract: ' + f(TSLib.subPct(y, x)), f(y) + ' × (1 ± ' + f(x) + ' ÷ 100)');
    x = val('p5x'); y = val('p5y');
    var wh = x === null || y === null ? null : TSLib.wholeFromPart(y, x);
    if (wh === null) set('p5', '—', x === 0 ? 'X cannot be zero.' : ''); else set('p5', f(wh), f(y) + ' ÷ (' + f(x) + ' ÷ 100)');
    if (!used) { used = true; }
  }
  document.querySelectorAll('input[type=number]').forEach(function (el) {
    el.addEventListener('input', function () { if (!el._tracked) { el._tracked = true; track('percentage-calculator'); } calc(); });
  });
  calc();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
