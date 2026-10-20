const { chromium } = require('playwright');
const { PDFDocument } = require('../assets/libs/pdf-lib.min.js');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:8765';
const results = [];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ serviceWorkers: 'block', timezoneId: 'America/Los_Angeles', viewport: { width: 375, height: 900 } });
  await context.route(/googlesyndication|googletagmanager|doubleclick|adsterra/, r => r.abort());
  const src = await PDFDocument.create();
  for (let i = 0; i < 3; i++) src.addPage([300 + i * 10, 400]).drawText('Page ' + (i + 1) + ' audit text', { x: 20, y: 300, size: 16 });
  const pdf = { name: 'audit.pdf', mimeType: 'application/pdf', buffer: Buffer.from(await src.save()) };
  async function test(tool, name, fn) {
    if (process.env.TEST_FILTER && !(tool + ' ' + name).includes(process.env.TEST_FILTER)) return;
    const page = await context.newPage();
    const errors = [], dialogs = [];
    page.setDefaultTimeout(15000);
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
    try {
      await page.goto(base + '/tools/' + tool + '/', { waitUntil: 'networkidle' });
      await fn(page, dialogs);
      assert.deepEqual(errors, []);
      results.push({ tool, name, status: 'PASS' });
    } catch (e) { results.push({ tool, name, status: 'FAIL', error: e.message, dialogs, errors, statusText: await page.locator('#statusText').textContent().catch(() => null) }); }
    console.log(JSON.stringify(results.at(-1)));
    await page.close();
  }
  async function download(page, selector = '#downloadBtn') {
    const event = page.waitForEvent('download');
    await page.locator(selector).click();
    const dl = await event;
    const data = fs.readFileSync(await dl.path());
    assert.ok(data.length > 0);
    return data;
  }
  async function pdfOutput(page, button, count = 3, size = true) {
    await page.locator(button).click();
    await page.locator('#resultPanel.active').waitFor();
    const out = await PDFDocument.load(await download(page));
    assert.equal(out.getPageCount(), count);
    if (size) assert.equal(out.getPage(0).getWidth(), 300);
    return out;
  }
  try {
    for (const [tool, button] of [['rotate', '#saveBtn'], ['organize', '#saveBtn'], ['page-numbers', '#applyBtn'], ['watermark', '#applyBtn'], ['compress', '#compressBtn'], ['editor', '#saveBtn'], ['sign', '#saveBtn']]) {
      await test('pdf/' + tool, 'valid PDF download preserves pages and dimensions', async p => {
        await p.locator('#fileInput').setInputFiles(pdf);
        await p.locator(button).waitFor({ state: 'visible' });
        if (tool === 'editor' || tool === 'sign') await p.waitForFunction(() => [...document.querySelectorAll('canvas')].some(c => c.width > 300));
        await pdfOutput(p, button);
      });
    }
    await test('pdf/split', 'thumbnail selection toggles once', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      const tile = p.locator('.pdf-page-tile').first();
      await tile.waitFor();
      await tile.locator('.page-num').click();
      assert.equal(await tile.locator('input').isChecked(), false);
      assert.match(await p.locator('#selCount').innerText(), /^2 of 3/);
    });
    for (const mode of ['all', 'range', 'extract']) await test('pdf/split', mode + ' download', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('.pdf-page-tile').first().waitFor();
      await p.locator('[data-mode="' + mode + '"]').click();
      if (mode === 'range') await p.locator('#rangeInput').fill('1-2, 3');
      await p.locator('#splitBtn').click();
      await p.locator('#resultPanel.active').waitFor();
      const bytes = await download(p);
      if (mode === 'extract') assert.equal((await PDFDocument.load(bytes)).getPageCount(), 3);
      else assert.equal(bytes.readUInt32LE(0), 0x04034b50);
    });
    for (const tool of ['pdf-to-word', 'pdf-to-markdown', 'pdf-to-excel', 'pdf-to-image']) await test('pdf/' + tool, 'conversion download', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('#convertBtn').click();
      await p.locator('#resultPanel.active').waitFor();
      await download(p);
    });
    await test('pdf/merge', 'merge two PDFs', async p => {
      await p.locator('#fileInput').setInputFiles([pdf, { ...pdf, name: 'second.pdf' }]);
      await pdfOutput(p, '#mergeBtn', 6);
    });
    await test('misc/timezone-converter', 'India noon to Dubai independent of browser timezone', async p => {
      await p.locator('#dtInput').fill('2026-01-15T12:00');
      await p.locator('#dtInput').dispatchEvent('change');
      assert.match(await p.locator('#resultOut').innerText(), /10:30\s*am/i);
    });
    await test('misc/age-calculator', 'month end does not produce negative days', async p => {
      await p.locator('#dob').fill('2025-01-31');
      await p.locator('#asOf').fill('2025-03-01');
      await p.locator('#asOf').dispatchEvent('change');
      assert.doesNotMatch(await p.locator('#ageValue').innerText(), /-/);
      assert.equal(await p.locator('#totalDays').innerText(), '29');
    });
    const fixturePage = await context.newPage();
    const image = Buffer.from(await fixturePage.evaluate(() => { const c = document.createElement('canvas'); c.width = 240; c.height = 160; const x = c.getContext('2d'); x.fillStyle = 'white'; x.fillRect(0,0,240,160); x.fillStyle = 'red'; x.fillRect(50,40,80,70); return c.toDataURL().split(',')[1]; }), 'base64');
    await fixturePage.close();
    const png = { name: 'audit.png', mimeType: 'image/png', buffer: image };
    for (const [tool, button] of [['upscale','#upscaleBtn'], ['convert','#convertBtn'], ['resize','#resizeBtn'], ['compress','#compressBtn'], ['govt-photo','#generateBtn'], ['passport-photo','#generateBtn'], ['sticker-maker','#makeBtn']]) {
      await test('image/' + tool, 'image processing', async p => {
        await p.locator('#fileInput').setInputFiles(png);
        await p.locator(button).click();
        await p.locator('#resultPanel.active').waitFor();
        const selector = await p.locator('#downloadAllBtn').count() ? '#downloadAllBtn' : '#downloadBtn';
        await download(p, selector);
      });
    }
    await test('pdf/image-to-pdf', 'image becomes a readable PDF', async p => {
      await p.locator('#fileInput').setInputFiles(png);
      await pdfOutput(p, '#createBtn', 1, false);
    });
    await test('image/image-to-ascii', 'ASCII text download', async p => {
      await p.locator('#fileInput').setInputFiles(png);
      assert.ok((await download(p, '#downloadTxtBtn')).length > 20);
    });
    await test('image/background-remove', 'background removal PNG download', async p => {
      await p.locator('#fileInput').setInputFiles(png);
      await p.locator('#downloadBtn').waitFor({ state: 'visible', timeout: 90000 });
      assert.equal((await download(p)).subarray(1, 4).toString(), 'PNG');
    });
    await test('pdf/protect', 'password protection and unlock round trip', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('#pw1').fill('audit123');
      await p.locator('#pw2').fill('audit123');
      await p.locator('#protectBtn').click();
      await p.locator('#resultPanel.active').waitFor();
      const protectedBytes = await download(p);
      await assert.rejects(() => PDFDocument.load(protectedBytes));
      await p.goto(base + '/tools/pdf/unlock/', { waitUntil: 'networkidle' });
      await p.locator('#fileInput').setInputFiles({ ...pdf, buffer: protectedBytes });
      await p.locator('#pw').fill('wrong');
      await p.locator('#unlockBtn').click();
      await p.locator('#pwError').waitFor({ state: 'visible' });
      await p.locator('#pw').fill('audit123');
      await pdfOutput(p, '#unlockBtn');
    });
    await test('pdf/html-to-pdf', 'HTML export', async p => {
      await p.locator('#htpCode').fill('<h1>Audit document</h1><p>Readable content</p>');
      await p.locator('#renderBtn').click();
      await p.frameLocator('iframe').locator('h1').waitFor();
      await pdfOutput(p, '#exportBtn', 1, false);
    });
    await test('pdf/word-to-pdf', 'DOCX conversion', async p => {
      const docx = await p.evaluate(() => Array.from(TS.buildZip([
        { name: '[Content_Types].xml', data: new TextEncoder().encode('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
        { name: '_rels/.rels', data: new TextEncoder().encode('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>') },
        { name: 'word/document.xml', data: new TextEncoder().encode('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Audit document text</w:t></w:r></w:p></w:body></w:document>') },
      ])));
      await p.locator('#fileInput').setInputFiles({ name: 'audit.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from(docx) });
      await pdfOutput(p, '#convertBtn', 1, false);
    });
    for (const tool of ['font-styler', 'text-handwriting']) await test('misc/' + tool, 'text generation', async p => {
      await p.locator('#inputText').fill('Hello world 123');
      if (tool === 'text-handwriting') assert.equal((await download(p)).subarray(1, 4).toString(), 'PNG');
      else assert.ok((await p.locator('main').innerText()).includes('Copy'));
    });
    await test('misc/word-counter', 'word and character counts', async p => {
      await p.locator('#textIn').fill('Hello world.');
      assert.equal(await p.locator('#words').innerText(), '2');
      assert.equal(await p.locator('#chars').innerText(), '12');
    });
    await test('misc/whatsapp-link', 'URL encoding', async p => {
      await p.locator('#phone').fill('+971 50 123 4567');
      await p.locator('#message').fill('Hello & welcome');
      assert.equal(await p.locator('#linkOut').innerText(), 'https://wa.me/971501234567?text=Hello%20%26%20welcome');
    });
    await test('misc/qr-generator', 'PNG and bulk ZIP', async p => {
      await p.locator('#qrText').fill('https://example.com');
      assert.equal((await download(p)).subarray(1, 4).toString(), 'PNG');
      await p.getByRole('button', { name: 'Bulk', exact: true }).click();
      await p.locator('#bulkLines').fill('First code\nSecond code');
      assert.equal((await download(p, '#bulkBtn')).readUInt32LE(0), 0x04034b50);
    });
    await test('video/status-splitter', 'image status ZIP', async p => {
      await p.locator('#fileInput').setInputFiles(png);
      await p.locator('#splitBtn').click();
      await p.locator('#resultPanel.active').waitFor();
      assert.equal((await download(p)).readUInt32LE(0), 0x04034b50);
    });
    // Generate a deterministic one-second fixture (MediaRecorder timestamps vary
    // with headless-browser throttling and can accidentally create long clips).
    const mediaPage = await context.newPage();
    await mediaPage.goto(base);
    const media = await mediaPage.evaluate(async () => {
      const { getFFmpeg } = await import('/assets/js/ffmpeg-loader.mjs?v=2');
      const ffmpeg = await getFFmpeg();
      const code = await ffmpeg.exec(['-f', 'lavfi', '-i', 'color=c=red:s=160x120:r=10', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100', '-t', '1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', 'fixture.mp4']);
      if (code) throw new Error('Could not generate the media fixture');
      return Array.from(await ffmpeg.readFile('fixture.mp4'));
    });
    await mediaPage.close();
    const video = { name: 'audit.mp4', mimeType: 'video/mp4', buffer: Buffer.from(media) };
    for (const [tool, button] of [['video/compress','#compressBtn'], ['video/trim','#trimBtn'], ['video/to-audio','#convertBtn'], ['misc/audio-cutter','#cutBtn'], ['video/status-splitter','#splitBtn']]) await test(tool, 'media processing download', async p => {
      await p.locator('#fileInput').setInputFiles(video);
      if (await p.locator('#endSec').count()) { await p.locator('#endSec').fill('1'); }
      await p.locator(button).click();
      await p.locator('#resultPanel.active').waitFor({ timeout: 90000 });
      let output = await download(p);
      if (tool === 'video/status-splitter') {
        const { execFileSync } = require('node:child_process');
        output = Buffer.from(execFileSync('python', ['-c', 'import io,sys,zipfile,base64; z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())); assert z.testzip() is None; assert len(z.namelist()) == 1; print(base64.b64encode(z.read(z.namelist()[0])).decode())'], { input: output }).toString().trim(), 'base64');
      }
      assert.ok(output.length > 100);
      const duration = await p.evaluate(data => new Promise((resolve, reject) => {
        const element = document.createElement('video');
        const url = URL.createObjectURL(new Blob([new Uint8Array(data)]));
        element.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(element.duration); };
        element.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Downloaded media cannot be decoded')); };
        element.src = url;
      }), Array.from(output));
      assert.ok(duration > 0 && duration < 3, 'Expected a playable one-second output');
    });
    await test('pdf/organize', 'regression move past deleted pages', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('[data-index="1"] [data-act="remove"]').click();
      await p.locator('[data-index="0"] [data-act="down"]').click();
      const out = await pdfOutput(p, '#saveBtn', 2, false);
      assert.deepEqual(out.getPages().map(x => x.getWidth()), [320, 300]);
    });
    await test('pdf/rotate', 'regression rotation changes output', async p => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('[data-act="rotate"]').first().click();
      assert.equal((await pdfOutput(p, '#saveBtn')).getPage(0).getRotation().angle, 90);
    });
    await test('pdf/split', 'regression invalid ranges clear previous result', async (p, dialogs) => {
      await p.locator('#fileInput').setInputFiles(pdf);
      await p.locator('.pdf-page-tile').first().waitFor();
      await p.locator('#splitBtn').click(); await p.locator('#resultPanel.active').waitFor();
      await p.locator('[data-mode="range"]').click(); await p.locator('#rangeInput').fill('1-2, banana');
      await p.locator('#splitBtn').click();
      await p.waitForFunction(() => !document.getElementById('splitBtn').disabled);
      assert.equal(await p.locator('#resultPanel').isVisible(), false); assert.match(dialogs.join(' '), /valid page ranges/);
    });
    await test('image/convert', 'regression filenames remain plain text', async p => {
      await p.locator('#fileInput').setInputFiles({ ...png, name: '<img src=x onerror=alert(1)>.png' });
      assert.equal(await p.locator('#fileList img').count(), 0);
      await p.locator('#convertBtn').click(); await p.locator('#resultPanel.active').waitFor();
      assert.match(await p.locator('#resultList').innerText(), /<img/);
      await download(p, '#downloadAllBtn');
    });
    await test('misc/audio-cutter', 'regression bad media restores controls', async p => {
      await p.locator('#fileInput').setInputFiles({ name: 'broken.mp3', mimeType: 'audio/mpeg', buffer: Buffer.from('not audio') });
      await p.locator('#endSec').fill('1'); await p.locator('#cutBtn').click();
      await p.waitForFunction(() => !document.getElementById('cutBtn').disabled, { timeout: 60000 });
      assert.match(await p.locator('#statusText').innerText(), /Could not cut/);
      assert.equal(await p.locator('#resultPanel').isVisible(), false);
    });
  } finally {
    fs.mkdirSync('artifacts', { recursive: true });
    fs.writeFileSync('artifacts/tool-workflows' + (process.env.TEST_FILTER ? '-' + process.env.TEST_FILTER.replace(/[^a-z0-9]/gi, '-') : '') + '.json', JSON.stringify(results, null, 2));
    await browser.close();
  }
})();
