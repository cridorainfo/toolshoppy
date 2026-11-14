import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/js/ads.js', import.meta.url), 'utf8');
function harness({ words = 500, off = false } = {}) {
  const slots = ['ad-top', 'ad-incontent', 'ad-sidebar', 'ad-sticky-footer'].map((cls, i) => ({
    classList: { contains: name => name === cls }, offsetWidth: i === 3 ? 0 : 320,
    dataset: {}, style: {}, children: [], innerHTML: '',
    getAttribute: () => null, querySelector: () => null,
    setAttribute(name, value) { this[name] = value; },
    appendChild(child) { this.children.push(child); },
  }));
  let intersect;
  const observed = [], timers = [], queue = [];
  const window = { adsbygoogle: queue, TS_AD_CONFIG: { client: 'ca-pub-test', slots: { top: '1', incontent: '2', sidebar: '3', stickyFooterMobile: '4' } }, IntersectionObserver: true };
  vm.runInNewContext(source, {
    window,
    document: {
      readyState: 'complete', querySelectorAll: () => slots,
      querySelector(selector) {
        if (selector === 'main') return { cloneNode: () => ({ querySelectorAll: () => [], textContent: Array(words).fill('content').join(' ') }) };
        return off && selector.includes('ts-ads') ? {} : null;
      },
      createElement: () => ({ style: {}, setAttribute() {} }),
    },
    setTimeout: fn => timers.push(fn),
    IntersectionObserver: class {
      constructor(callback) { intersect = callback; }
      observe(slot) { observed.push(slot); }
      unobserve() {}
    },
  });
  return { slots, observed, timers, queue, show: slot => intersect([{ target: slot, isIntersecting: true }]) };
}

test('below-fold ads are not requested by timers; each visible slot initializes once', () => {
  const h = harness();
  assert.equal(h.queue.length, 0);
  assert.equal(h.timers.length, 0);
  h.show(h.slots[0]);
  h.show(h.slots[0]);
  assert.equal(h.queue.length, 1);
  assert.equal(h.slots[0].children.length, 1);
});

test('hidden slots cannot bypass the manual density budget on resize', () => {
  const h = harness({ words: 350 });
  assert.equal(h.observed.length, 2);
  assert.equal(h.slots[2].style.display, 'none');
  assert.equal(h.slots[3].style.display, 'none');
  assert.equal(h.observed.includes(h.slots[3]), false);
});

test('ad-free pages never initialize manual units', () => {
  const h = harness({ off: true });
  assert.equal(h.observed.length, 0);
  assert.equal(h.queue.length, 0);
  assert.ok(h.slots.every(slot => slot.style.display === 'none'));
});
