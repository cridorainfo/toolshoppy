// Run with node scripts/test-zip.cjs; requires Python's standard-library ZIP reader.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { PDFDocument } = require('../assets/libs/pdf-lib.min.js');

const root = path.resolve(__dirname, '..');
const window = { navigator: {}, addEventListener() {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/core.js'), 'utf8'), {
  window, Uint8Array, Uint32Array, TextEncoder,
  document: { documentElement: { setAttribute() {} } },
  localStorage: { setItem() {} },
});

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolshoppy-zip-'));
  try {
    const source = await PDFDocument.create();
    for (let i = 0; i < 4; i++) source.addPage([200 + i, 300 + i]);
    // Exercise the page's actual PDF-copy helper with the bundled PDF library.
    const html = fs.readFileSync(path.join(root, 'tools/pdf/split/index.html'), 'utf8');
    const helper = html.match(/async function buildPdfFromPages[\s\S]*?\n  }/)[0];
    const buildPdf = vm.runInNewContext('(' + helper + ')', { PDFLib: { PDFDocument } });
    for (const [mode, groups] of Object.entries({ all: [[0], [1], [2], [3]], ranges: [[0, 1], [3]] })) {
      const entries = [];
      for (let i = 0; i < groups.length; i++) {
        const doc = await buildPdf(source, groups[i]);
        entries.push({ name: `document-${i + 1}.pdf`, data: await doc.save() });
      }
      // Non-ASCII filenames must round-trip too.
      entries[0].name = 'résumé-ملف.pdf';
      const zipPath = path.join(dir, mode + '.zip');
      fs.writeFileSync(zipPath, window.TS.buildZip(entries));
      const extracted = JSON.parse(execFileSync('python', ['-c',
        'import zipfile,json,sys,base64\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n print(json.dumps([{ "name": n, "data": base64.b64encode(z.read(n)).decode() } for n in z.namelist()]))',
        zipPath], { encoding: 'utf8' }));
      assert.equal(extracted.length, entries.length);
      for (let i = 0; i < extracted.length; i++) {
        assert.equal(extracted[i].name, entries[i].name);
        const bytes = Buffer.from(extracted[i].data, 'base64');
        assert.deepEqual(bytes, Buffer.from(entries[i].data));
        const pdf = await PDFDocument.load(bytes);
        assert.equal(pdf.getPageCount(), groups[i].length);
        pdf.getPages().forEach((page, j) => assert.equal(page.getWidth(), 200 + groups[i][j]));
      }
      console.log(mode + ': ZIP CRCs, filenames, PDF bytes, page counts and order passed');
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
