// Browser smoke audit. Start a local static server, then run with NODE_PATH pointing
// to a Playwright installation. Optional AUDIT_BASE_URL and CHROME_PATH overrides.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8765';
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? walk(path.join(dir, e.name)) : e.name === 'index.html' ? [path.join(dir, e.name)] : []);
}
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  // Isolate tool behavior from advertising and analytics, keeping tool dependencies live.
  await context.route(/googlesyndication|googletagmanager|doubleclick|adsterra/, route => route.abort());
  const results = [];
  try {
    for (const file of walk(path.join(root, 'tools'))) {
      const url = '/' + path.relative(root, path.dirname(file)).replaceAll('\\', '/') + '/';
      const page = await context.newPage();
      const errors = [], missing = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) missing.push(r.url().slice(base.length) + ': ' + r.status()); });
      page.on('dialog', d => d.dismiss());
      try {
        await page.goto(base + url, { waitUntil: 'networkidle', timeout: 20000 });
      } catch (e) { errors.push(e.message.split('\n')[0]); }
      const widths = {};
      for (const width of [375, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        widths[width] = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1,
          offenders: [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth + 2 && e.getBoundingClientRect().width > 0).slice(0, 6).map(e => e.tagName + '#' + e.id + '.' + e.className) }));
      }
      const controls = await page.locator('main input,main select,main textarea,main button').evaluateAll(es => es.map(e => ({ tag: e.tagName, id: e.id, type: e.type, text: e.tagName === 'BUTTON' ? e.textContent.trim().slice(0, 65) : '', value: e.value })));
      results.push({ url, errors, missing, widths, controls });
      console.log(url, errors.length || missing.length || Object.values(widths).some(w => w.overflow) ? JSON.stringify({ errors, missing, widths }) : 'PASS');
      await page.close();
    }
  } finally {
    fs.mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    fs.writeFileSync(path.join(root, 'artifacts/tool-audit.json'), JSON.stringify(results, null, 2));
    await browser.close();
  }
})();
