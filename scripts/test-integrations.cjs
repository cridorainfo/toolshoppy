const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { PDFDocument } = require('../assets/libs/pdf-lib.min.js');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route(/googlesyndication|googletagmanager|doubleclick|adsterra/, r => r.abort());
  const results = [];
  const base = 'http://127.0.0.1:8765';
  async function test(tool, fn) {
    const p = await context.newPage(); p.setDefaultTimeout(15000);
    const errors = [], dialogs = [], requests = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
    p.on('requestfailed', r => { if (!/googlesyndication|googletagmanager|doubleclick|adsterra/.test(r.url())) requests.push(r.url() + ': ' + r.failure()?.errorText); });
    try {
      await p.goto(base + '/tools/' + tool + '/', { waitUntil: 'networkidle', timeout: 45000 });
      await fn(p); assert.deepEqual(errors, []);
      results.push({ tool, status: 'PASS', requests });
    } catch (e) { results.push({ tool, status: 'FAIL', error: e.message, errors, dialogs, requests }); }
    console.log(JSON.stringify(results.at(-1))); await p.close();
  }
  try {
    for (const tool of ['rates/gold-rate', 'rates/silver-rate', 'rates/currency-converter', 'rates/petrol-price']) await test(tool, async p => {
      await p.waitForFunction(() => !/Loading/.test(document.getElementById('updatedLine').textContent), { timeout: 30000 });
      assert.doesNotMatch(await p.locator('#updatedLine').innerText(), /Could not/);
    });
    for (const tool of ['image/ocr', 'pdf/ocr-pdf']) await test(tool, async p => {
      const png = Buffer.from(await p.evaluate(() => {
        const c = document.createElement('canvas'); c.width = 600; c.height = 180;
        const x = c.getContext('2d'); x.fillStyle = 'white'; x.fillRect(0, 0, 600, 180); x.fillStyle = 'black'; x.font = '40px Arial'; x.fillText('HELLO WORLD 123', 30, 100);
        return c.toDataURL().split(',')[1];
      }), 'base64');
      if (tool === 'image/ocr') await p.locator('#fileInput').setInputFiles({ name: 'text.png', mimeType: 'image/png', buffer: png });
      else {
        const pdf = await PDFDocument.create(); const img = await pdf.embedPng(png); const pg = pdf.addPage([600, 180]); pg.drawImage(img, { x: 0, y: 0, width: 600, height: 180 });
        await p.locator('#fileInput').setInputFiles({ name: 'scan.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) });
        await p.locator('#startBtn').click();
      }
      await p.locator('#resultPanel.active').waitFor({ timeout: 120000 });
      const dlEvent = p.waitForEvent('download');
      await p.locator(tool === 'image/ocr' ? '#downloadBtn' : '#downloadTxtBtn').click();
      const data = fs.readFileSync(await (await dlEvent).path(), 'utf8');
      assert.match(data, /HELLO\s*WORLD/i);
      if (tool === 'pdf/ocr-pdf') {
        const event = p.waitForEvent('download'); await p.locator('#downloadPdfBtn').click();
        const bytes = fs.readFileSync(await (await event).path());
        assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
        const text = await p.evaluate(async data => {
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
          return (await (await pdf.getPage(1)).getTextContent()).items.map(i => i.str).join(' ');
        }, Array.from(bytes));
        assert.match(text, /HELLO\s*WORLD/i);
      }
    });
  } finally { fs.writeFileSync('artifacts/integration-tests.json', JSON.stringify(results, null, 2)); await browser.close(); }
})();
