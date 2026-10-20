import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Load the real core.js with just enough of a browser to define window.TS.
const src = fs.readFileSync(new URL('../assets/js/core.js', import.meta.url), 'utf8');
const sandbox = {
  document: {
    documentElement: { hasAttribute: () => false, setAttribute() {} },
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  },
  localStorage: { getItem: () => null, setItem() {} },
  navigator: {},
  addEventListener() {},
  setTimeout, clearTimeout, URL, Blob, console,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const { canvasToTargetSize } = sandbox.TS;

// A canvas whose encoded size grows with quality: size = floor + slope * q.
function fakeCanvas(floor, slope) {
  const calls = [];
  return {
    calls,
    toBlob(cb, mime, q) {
      calls.push(q);
      cb({ size: Math.round(floor + slope * q), type: mime });
    },
  };
}

test('returns the largest encoding that fits under the target', async () => {
  const canvas = fakeCanvas(1000, 100000); // q=0.05 -> 6 KB ... q=0.95 -> ~96 KB
  const target = 50 * 1024;
  const blob = await canvasToTargetSize(canvas, target, 'image/jpeg');
  assert.ok(blob.size <= target, `result ${blob.size} is over ${target}`);
  assert.ok(blob.size > target * 0.97, `result ${blob.size} is not close to ${target}`);
});

test('never prefers an over-limit result just because it is closer', async () => {
  // Steep curve: neighbouring qualities straddle the limit; the old "closest" rule could pick the one above.
  const canvas = fakeCanvas(0, 200000);
  const target = 20 * 1024;
  const blob = await canvasToTargetSize(canvas, target, 'image/jpeg');
  assert.ok(blob.size <= target);
});

test('when nothing fits, returns the smallest encoding so the caller can shrink pixels', async () => {
  const canvas = fakeCanvas(60 * 1024, 100000); // even q=0.05 is ~65 KB
  const blob = await canvasToTargetSize(canvas, 20 * 1024, 'image/jpeg');
  assert.ok(blob.size > 20 * 1024);
  assert.ok(blob.size <= 60 * 1024 + 100000 * 0.06, `expected the near-floor result, got ${blob.size}`);
  assert.ok(canvas.calls.includes(0.05), 'should try the quality floor before giving up');
});

test('an easily satisfied target returns a high-quality result', async () => {
  const canvas = fakeCanvas(1000, 10000);
  const blob = await canvasToTargetSize(canvas, 500 * 1024, 'image/jpeg');
  assert.equal(blob.size, Math.round(1000 + 10000 * canvas.calls.filter(q => q > 0.9).sort((a, b) => b - a)[0]));
});
