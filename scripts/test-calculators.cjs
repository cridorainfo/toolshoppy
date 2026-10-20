const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { chromium } = require('playwright');
const w = {};
vm.runInNewContext(fs.readFileSync('assets/js/income-tax.js','utf8'), { window: w });
const tax = w.TSIncomeTax.salaryTax;
assert.equal(tax(1275000, 'new'), 0);
assert.equal(tax(1285000, 'new'), 10400);
assert.equal(tax(1500000, 'new'), 97500);
assert.equal(tax(2475000, 'new'), 312000);
assert.equal(tax(550000, 'old'), 0);
assert.equal(tax(1500000, 'old', 150000), 210600);
assert.equal(tax(5075000, 'new'), 1123200);
assert.equal(tax(5076000, 'new'), 1124240);
console.log('Tax slab, rebate, marginal relief and surcharge boundaries PASS');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route(/googlesyndication|googletagmanager|doubleclick|adsterra/, r => r.abort());
  const results = [];
  const num = async (p, id) => Number((await p.locator('#' + id).innerText()).replace(/[^0-9.-]/g, ''));
  async function test(tool, fn) {
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    try {
      await p.goto('http://127.0.0.1:8765/tools/' + tool + '/', { waitUntil: 'networkidle' });
      await fn(p); assert.deepEqual(errors, []);
      results.push({ tool, status: 'PASS' });
    } catch (e) { results.push({ tool, status: 'FAIL', error: e.message }); }
    console.log(JSON.stringify(results.at(-1))); await p.close();
  }
  try {
    await test('finance/emi-calculator', async p => {
      await p.locator('#principal').fill('120000'); await p.locator('#rate').fill('0'); await p.locator('#tenure').fill('1');
      assert.equal(await num(p,'emiValue'), 10000); assert.equal(await num(p,'totalInterest'),0);
      await p.locator('#principal').fill('0'); assert.equal(await p.locator('#totalPayment').innerText(),'—');
    });
    await test('finance/fd-calculator', async p => {
      await p.locator('#principal').fill('100000'); await p.locator('#rate').fill('8'); await p.locator('#years').fill('1');
      assert.equal(await num(p,'maturity'),108243);
      await p.getByRole('button',{name:'Recurring Deposit (RD)',exact:true}).click(); await p.locator('#rate').fill('0');
      assert.equal(await num(p,'maturity'),60000);
      await p.locator('#rate').fill('8'); assert.equal(await num(p,'maturity'),62647);
    });
    await test('finance/sip-calculator', async p => {
      await p.locator('#monthly').fill('1000'); await p.locator('#rate').fill('0'); await p.locator('#years').fill('2');
      assert.equal(await num(p,'maturity'),24000); assert.equal(await num(p,'gained'),0);
    });
    await test('finance/gst-calculator', async p => {
      await p.locator('#amount').fill('1000'); assert.equal(await num(p,'resultValue'),1180);
      await p.getByRole('button',{name:'Remove GST',exact:true}).click(); await p.locator('#amount').fill('1180'); assert.equal(await num(p,'resultValue'),1000);
    });
    await test('finance/uae-vat', async p => {
      await p.locator('#amount').fill('1000'); assert.equal(await num(p,'total'),1050);
      await p.getByRole('button',{name:'Remove VAT',exact:true}).click(); await p.locator('#amount').fill('1050'); assert.equal(await num(p,'total'),1000);
    });
    await test('finance/income-tax', async p => {
      assert.equal(await num(p,'taxNew'),97500); assert.equal(await num(p,'taxOld'),210600);
      assert.doesNotMatch(await p.locator('#better').innerText(),/-/); assert.equal(await p.locator('#deductions').isVisible(),true);
      await p.getByRole('button',{name:'Old regime',exact:true}).click(); assert.equal(await p.locator('#taxNew').isVisible(),false);
    });
    await test('finance/salary-calculator', async p => {
      await p.locator('#ctc').fill('1500000'); assert.equal(await num(p,'tax'),97500);
      await p.locator('#ctc').fill('0'); assert.equal(await num(p,'inHand'),0);
    });
    await test('misc/bmi-calculator', async p => {
      await p.locator('#weightKg').fill('80'); await p.locator('#heightCm').fill('200'); assert.equal(await num(p,'bmiValue'),20);
      await p.locator('#weightKg').fill('-1'); assert.equal(await p.locator('#bmiValue').innerText(),'—');
    });
    await test('misc/timezone-converter', async p => {
      await p.locator('#fromTz').selectOption('America/New_York'); await p.locator('#toTz').selectOption('UTC');
      await p.locator('#dtInput').fill('2026-03-08T02:30'); await p.locator('#dtInput').dispatchEvent('change'); assert.match(await p.locator('#resultOut').innerText(),/does not exist/);
      await p.locator('#dtInput').fill('2026-11-01T01:30'); await p.locator('#dtInput').dispatchEvent('change'); assert.match(await p.locator('#resultOut').innerText(),/first occurrence/);
    });
    await test('misc/age-calculator', async p => {
      await p.locator('#dob').fill('2000-02-29'); await p.locator('#asOf').fill('2025-02-28'); await p.locator('#asOf').dispatchEvent('change'); assert.equal(await p.locator('#ageValue').innerText(),'25y 0m 0d');
      await p.locator('#dob').fill('2026-02-28'); await p.locator('#dob').dispatchEvent('change'); assert.equal(await p.locator('#totalDays').innerText(),'—');
    });
  } finally { fs.writeFileSync('artifacts/calculator-tests.json',JSON.stringify(results,null,2)); await browser.close(); }
})();
