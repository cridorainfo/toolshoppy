import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { CONSENT_TAG } from './lib/page-policy.mjs';

test('standalone CMP forwards only the explicit GDPR preview parameters', () => {
  const loader = CONSENT_TAG.match(/<script data-ts-consent>([\s\S]*?)<\/script>/)[1];
  for (const search of ['', '?secret=private', '?fc=alwaysshow&fctype=gdpr&secret=private', '?fc=alwaysshow&fctype=other']) {
    const scripts = [];
    vm.runInNewContext(loader, { URLSearchParams, window: { location: { search } }, document: {
      createElement: () => ({}), head: { appendChild: s => scripts.push(s) }
    } });
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].src, 'https://fundingchoicesmessages.google.com/i/pub-1180208702657280?ers=1' +
      (search.includes('fctype=gdpr') ? '&fc=alwaysshow&fctype=gdpr' : ''));
  }
});

const source = fs.readFileSync(new URL('../assets/js/third-party.js', import.meta.url), 'utf8');
function harness(status) {
  const scripts = [], timers = [], listeners = {};
  const values = { CONSENT_MODE_PURPOSE_STATUS_GRANTED: 1, CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE: 3 };
  const window = { googlefc: { callbackQueue: [], ConsentModePurposeStatusEnum: values,
    getGoogleConsentModeValues: () => ({ analyticsStoragePurposeConsentStatus: status }) },
    addEventListener: (name, fn) => { listeners[name] = fn; }, removeEventListener() {} };
  vm.runInNewContext(source, { window, encodeURIComponent, setTimeout: fn => timers.push(fn), document: {
    readyState: 'complete', createElement: () => ({}), head: { appendChild: s => scripts.push(s.src) },
    querySelector: selector => selector.includes('adsbygoogle.js') ? {} : null,
  } });
  return { scripts, resolve: () => window.googlefc.callbackQueue[0].CONSENT_MODE_DATA_READY(),
    interact: () => listeners.pointerdown(), timeout: () => timers.forEach(fn => fn()) };
}
test('interaction and timers never bypass unresolved consent', () => {
  const h = harness(0); h.interact(); h.timeout(); h.resolve(); assert.deepEqual(h.scripts, []);
});
test('denied, unconfigured and unexpected consent fail closed', () => {
  for (const value of [2, 4, undefined, 99]) { const h = harness(value); h.resolve(); h.interact(); h.timeout(); assert.deepEqual(h.scripts, []); }
});
test('granted and not-applicable consent load analytics once', () => {
  for (const value of [1, 3]) { const h = harness(value); h.resolve(); h.resolve(); h.interact(); h.timeout(); assert.equal(h.scripts.length, 1); assert.match(h.scripts[0], /googletagmanager/); }
});
test('consent defaults precede GA configuration in generated HTML', () => {
  for (const file of ['index.html', 'privacy.html', 'tools/image/compress/index.html']) {
    const html = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    assert.ok(html.indexOf("gtag('consent','default'") < html.indexOf("gtag('config'"));
    assert.ok(html.includes("analytics_storage:'denied'"));
    assert.equal((html.match(/https:\/\/fundingchoicesmessages\.google\.com\/i\//g) || []).length, 1);
    assert.ok(html.indexOf("gtag('consent','default'") < html.indexOf('https://fundingchoicesmessages.google.com/i/'));
  }
});
