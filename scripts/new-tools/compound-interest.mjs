import { COMMON_JS } from './common.mjs';

export default {
  path: '/tools/finance/compound-interest-calculator/',
  trail: [{ name: 'Finance', href: '/tools/finance/' }],
  crumbName: 'Compound Interest Calculator',
  title: 'Compound Interest Calculator Free | With Monthly Deposits | ToolShoppy',
  description: 'Free compound interest calculator. See how savings or an investment grows with monthly, quarterly, yearly or daily compounding and optional monthly deposits. Year-by-year table, no signup.',
  name: 'Compound Interest Calculator',
  h1: 'Compound Interest Calculator',
  intro: 'See how a lump sum and regular monthly deposits grow over time with compound interest. Works in any currency, with a year-by-year breakdown.',
  keywords: 'compound interest calculator, compound interest, savings calculator, investment growth calculator, interest on interest, rule of 72',
  icon: 'coin', tile: 'emerald',
  appCategory: 'FinanceApplication',
  trust: 'Your numbers stay in your browser — nothing is stored',
  howToTitle: 'How to calculate compound interest',
  steps: [
    'Enter your starting amount and, if you save regularly, a monthly deposit.',
    'Enter the annual interest rate and how many years you will keep the money invested.',
    'Pick how often interest compounds (monthly is common for savings; some deposits compound quarterly or yearly).',
    'Read the final balance, total deposits and interest earned, then check the year-by-year table.',
  ],
  toolHtml: `      <div class="calc-form">
        <div class="calc-row">
          <div class="calc-field"><label for="ciP">Starting amount</label><input type="number" id="ciP" value="100000" min="0" step="any" inputmode="decimal"></div>
          <div class="calc-field"><label for="ciM">Monthly deposit (optional)</label><input type="number" id="ciM" value="5000" min="0" step="any" inputmode="decimal"></div>
        </div>
        <div class="calc-row">
          <div class="calc-field"><label for="ciR">Annual interest rate (%)</label><input type="number" id="ciR" value="7" min="0" step="any" inputmode="decimal"></div>
          <div class="calc-field"><label for="ciY">Years</label><input type="number" id="ciY" value="10" min="0" max="80" step="any" inputmode="decimal"></div>
        </div>
        <div class="calc-row">
          <div class="calc-field"><label for="ciN">Compounding</label>
            <select id="ciN"><option value="12" selected>Monthly</option><option value="4">Quarterly</option><option value="2">Half-yearly</option><option value="1">Yearly</option><option value="365">Daily</option></select></div>
          <div class="calc-field"><label for="ciC">Currency symbol</label>
            <select id="ciC"><option value="₹|en-IN" selected>₹ Indian rupee</option><option value="AED |en-AE">AED Dirham</option><option value="$|en-US">$ Dollar</option><option value="£|en-GB">£ Pound</option><option value="€|de-DE">€ Euro</option><option value="|en-US">None</option></select></div>
        </div>
      </div>
      <div class="calc-result-hero">
        <div class="calc-result-label">Final balance</div>
        <div class="calc-result-value" id="ciBal" aria-live="polite">—</div>
      </div>
      <div class="compare-row">
        <div class="compare-box"><div class="label">Total you deposit</div><div class="value" id="ciDep">—</div></div>
        <div class="compare-box saved"><div class="label">Interest earned</div><div class="value" id="ciInt">—</div></div>
      </div>
      <div class="stat-pills">
        <span class="stat-pill">Effective annual rate<strong id="ciEar">—</strong></span>
        <span class="stat-pill">Time to double<strong id="ciDbl">—</strong></span>
      </div>
      <h2 class="seo-heading-3" style="font-size:1rem;margin-top:18px;">Year-by-year growth</h2>
      <div class="tool-guide-table-wrap"><table id="ciTable"><thead><tr><th scope="col">Year</th><th scope="col">Deposits</th><th scope="col">Interest</th><th scope="col">Balance</th></tr></thead><tbody></tbody></table></div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Rule of 72</strong></p>
        <ul>
          <li>Years to double ≈ 72 ÷ rate</li>
          <li>At 8%: about 9 years</li>
          <li>At 6%: about 12 years</li>
        </ul>
      </div>`,
  sections: [
    ['How compound interest works', `<p>Simple interest pays only on your original amount. <strong>Compound interest</strong> pays on your original amount <em>and</em> on the interest already earned, so growth speeds up over time. With no deposits the final amount is <code>A = P × (1 + r/n)<sup>n×t</sup></code>, where P is the starting amount, r the annual rate, n the number of compounding periods per year and t the years.</p><p>This calculator also lets you add a deposit at the end of every month. It applies the effective monthly rate for your chosen compounding frequency month by month, so the result matches the formula exactly when deposits are zero and stays consistent when they are not.</p>`],
    ['Why starting early and compounding more often matter', `<p>Time matters more than the rate: at 7% a lump sum roughly doubles every 10 years, so the last decade adds far more than the first. More frequent compounding helps slightly (monthly beats yearly), but a few extra percentage points of rate, or a few extra years, matter much more. The <strong>effective annual rate</strong> shown above is the single yearly rate that gives the same growth as your nominal rate and compounding frequency.</p>`],
    ['What this calculator does not include', `<ul class="guide-list"><li><strong>Taxes, fees and inflation.</strong> Real returns are lower after tax, charges and rising prices.</li><li><strong>Variable or market returns.</strong> Shares, mutual funds and similar investments do not grow at a fixed rate, so treat the result as an illustration, not a forecast or financial advice.</li><li><strong>Bank-specific rules.</strong> Banks differ in how they compound and round, and in when they credit interest. For fixed or recurring deposits in India use the <a href="/tools/finance/fd-calculator/">FD / RD calculator</a>; for regular mutual-fund investing use the <a href="/tools/finance/sip-calculator/">SIP calculator</a>.</li></ul>`],
  ],
  faqs: [
    ['What is the compound interest formula?', 'A = P × (1 + r/n)^(n×t), where P is the starting amount, r is the annual rate as a decimal, n is how many times interest compounds per year and t is the number of years. This calculator also adds optional monthly deposits.'],
    ['How do monthly deposits change the result?', 'Each deposit is added at the end of the month and then earns interest in later months. Regular deposits usually contribute more to the final balance than the starting amount over long periods.'],
    ['What is the effective annual rate?', 'It is the yearly rate that gives the same growth as your nominal rate with the chosen compounding. For example, 12% compounded monthly has an effective annual rate of about 12.68%.'],
    ['How long will it take my money to double?', 'The tool shows the time to double at your rate and compounding. As a rule of thumb (Rule of 72), divide 72 by the annual rate: at 8% it takes about 9 years.'],
    ['Is this a guaranteed return?', 'No. It assumes a constant rate. Real investments vary, and taxes, fees and inflation reduce what you keep. Use it to compare scenarios, not to predict a result.'],
  ],
  related: [
    { href: '/tools/finance/sip-calculator/', title: 'SIP Calculator', desc: 'Mutual fund SIP returns', icon: 'coin', tile: 'green' },
    { href: '/tools/finance/fd-calculator/', title: 'FD / RD Calculator', desc: 'Fixed & recurring deposit', icon: 'building-bank', tile: 'amber' },
    { href: '/tools/finance/emi-calculator/', title: 'EMI Calculator', desc: 'Home & personal loan EMI', icon: 'building-bank', tile: 'blue' },
    { href: '/tools/misc/percentage-calculator/', title: 'Percentage Calculator', desc: 'Percent of, change, add & subtract', icon: 'calculator', tile: 'green' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var used = false;
  function num(id) { var v = parseFloat($(id).value); return isFinite(v) ? v : 0; }
  function render() {
    var parts = $('ciC').value.split('|');
    var sym = parts[0], locale = parts[1];
    function money(n) {
      return sym + Math.round(n).toLocaleString(locale);
    }
    var r = TSLib.compoundInterest({
      principal: num('ciP'), monthlyDeposit: num('ciM'), ratePct: num('ciR'),
      years: Math.min(80, num('ciY')), compoundsPerYear: parseInt($('ciN').value, 10)
    });
    $('ciBal').textContent = money(r.balance);
    $('ciDep').textContent = money(r.contributed);
    $('ciInt').textContent = money(r.interest);
    $('ciEar').textContent = (r.effectiveAnnualRate * 100).toFixed(2) + '%';
    $('ciDbl').textContent = r.yearsToDouble === null ? '—' : (r.yearsToDouble < 1 ? '< 1 year' : r.yearsToDouble.toFixed(1) + ' years');
    $('ciTable').querySelector('tbody').innerHTML = r.schedule.map(function (row) {
      var y = Number.isInteger(row.year) ? row.year : row.year.toFixed(1);
      return '<tr><th scope="row">' + y + '</th><td>' + money(row.contributed) + '</td><td>' + money(row.interest) + '</td><td>' + money(row.balance) + '</td></tr>';
    }).join('');
  }
  ['ciP', 'ciM', 'ciR', 'ciY', 'ciN', 'ciC'].forEach(function (id) {
    $(id).addEventListener('input', function () { if (!used) { used = true; track('compound-interest-calculator'); } render(); });
    $(id).addEventListener('change', render);
  });
  render();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
