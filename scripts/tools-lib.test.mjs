import test from 'node:test';
import assert from 'node:assert/strict';
import lib from '../assets/js/tools-lib.js';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test('password: honours length and selected character sets', () => {
  const opts = { length: 24, lower: true, upper: true, digits: true, symbols: true };
  for (let i = 0; i < 50; i++) {
    const p = lib.generatePassword(opts);
    assert.equal(p.length, 24);
    assert.match(p, /[a-z]/); assert.match(p, /[A-Z]/); assert.match(p, /\d/); assert.match(p, /[^A-Za-z0-9]/);
  }
  assert.match(lib.generatePassword({ length: 40, digits: true }), /^\d{40}$/);
});

test('password: excludes ambiguous characters and clamps length', () => {
  for (let i = 0; i < 50; i++) {
    assert.doesNotMatch(lib.generatePassword({ length: 64, lower: true, upper: true, digits: true, noAmbiguous: true }), /[Il1O0o]/);
  }
  assert.equal(lib.generatePassword({ length: 2, lower: true }).length, 4);
  assert.equal(lib.generatePassword({ length: 999, lower: true }).length, 128);
  assert.throws(() => lib.generatePassword({ length: 12 }), /at least one/);
});

test('password: randomInt is unbiased across the range', () => {
  const counts = new Array(6).fill(0);
  for (let i = 0; i < 12000; i++) counts[lib.randomInt(6)]++;
  counts.forEach(c => assert.ok(c > 1700 && c < 2300, `skewed: ${counts}`));
});

test('password: entropy and labels', () => {
  close(lib.passwordEntropyBits({ length: 10, digits: true }), 10 * Math.log2(10));
  assert.equal(lib.strengthLabel(30), 'Weak');
  assert.equal(lib.strengthLabel(70), 'Good');
  assert.equal(lib.strengthLabel(130), 'Very strong');
});

test('json: formats, minifies, sorts keys', () => {
  assert.equal(lib.formatJson('{"b":1,"a":[1,2]}', 2).text, '{\n  "b": 1,\n  "a": [\n    1,\n    2\n  ]\n}');
  assert.equal(lib.formatJson('{ "b": 1,\n "a": 2 }', 0).text, '{"b":1,"a":2}');
  assert.equal(lib.formatJson('{"b":1,"a":{"d":1,"c":2}}', 0, true).text, '{"a":{"c":2,"d":1},"b":1}');
  assert.equal(lib.formatJson('{"a":1}', 'tab').text, '{\n\t"a": 1\n}');
});

test('json: reports line and column for bad input', () => {
  const r = lib.parseJson('{\n  "a": 1,\n  "b": ,\n}');
  assert.equal(r.ok, false);
  assert.equal(r.line, 3);
  assert.equal(r.col, 8);
  assert.equal(lib.parseJson('').ok, false);
  const trailing = lib.parseJson('{"a":1,}');
  assert.match(trailing.message, /trailing comma/i);
  assert.equal(trailing.col, 8);
  assert.match(lib.parseJson("{'a':1}").message, /double quotes/);
  assert.match(lib.parseJson('{a:1}').message, /double quotes/);
  assert.match(lib.parseJson('{"a":1').message, /end of input/);
  assert.match(lib.parseJson('[1 2]').message, /comma/);
  assert.equal(lib.parseJson('{"a":01}').ok, false);
  assert.equal(lib.parseJson('[1,2] x').ok, false);
  assert.equal(lib.parseJson('{"a":"b\\nc"}').ok, true); // escaped newline inside a string is valid
  assert.match(lib.parseJson('{"a":"b\nc"}').message, /\\n/); // a raw line break inside a string is not
  assert.equal(lib.parseJson('[1,2,3]').ok, true);
});

test('base64: round-trips unicode and supports URL-safe', () => {
  const s = 'नमस्കാര 👋 Hello, مرحبا';
  assert.equal(lib.decodeBase64(lib.encodeBase64(s)).text, s);
  assert.equal(lib.decodeBase64(lib.encodeBase64(s, true)).text, s);
  assert.equal(lib.encodeBase64('hello'), 'aGVsbG8=');
  assert.equal(lib.encodeBase64('subjects?_d', true), 'c3ViamVjdHM_X2Q');
  assert.equal(lib.decodeBase64('aGVs\nbG8').text, 'hello');
});

test('base64: rejects invalid input with a message', () => {
  assert.equal(lib.decodeBase64('abc$').ok, false);
  assert.equal(lib.decodeBase64('a').ok, false);
  assert.equal(lib.decodeBase64('/w==').ok, false); // 0xFF is not UTF-8
  assert.equal(lib.decodeBase64('').text, '');
});

test('case: standard conversions', () => {
  assert.equal(lib.convertCase('upper', 'hello'), 'HELLO');
  assert.equal(lib.convertCase('lower', 'HeLLo'), 'hello');
  assert.equal(lib.convertCase('title', 'the lord of the rings'), 'The Lord of the Rings');
  assert.equal(lib.convertCase('title', 'a tale to remember'), 'A Tale to Remember');
  assert.equal(lib.convertCase('sentence', 'hello world. this IS fun! ok? yes'), 'Hello world. This is fun! Ok? Yes');
  assert.equal(lib.convertCase('capitalized', 'the lord of the rings'), 'The Lord Of The Rings');
  assert.equal(lib.convertCase('alternating', 'abc def'), 'aBc DeF');
  assert.equal(lib.convertCase('inverse', 'Hello World'), 'hELLO wORLD');
});

test('case: developer conversions split words correctly', () => {
  assert.equal(lib.convertCase('camel', 'hello big world'), 'helloBigWorld');
  assert.equal(lib.convertCase('pascal', 'hello_big-world'), 'HelloBigWorld');
  assert.equal(lib.convertCase('snake', 'helloBigWorld'), 'hello_big_world');
  assert.equal(lib.convertCase('kebab', 'Hello Big World'), 'hello-big-world');
  assert.equal(lib.convertCase('constant', 'parseHTTPResponse'), 'PARSE_HTTP_RESPONSE');
  assert.throws(() => lib.convertCase('nope', 'x'));
});

test('units: length, mass, area, volume', () => {
  close(lib.convertUnit('length', 1, 'mi', 'km'), 1.609344);
  close(lib.convertUnit('length', 12, 'in', 'ft'), 1);
  close(lib.convertUnit('mass', 1, 'kg', 'lb'), 2.2046226218, 1e-9);
  close(lib.convertUnit('mass', 8, 'g', 'pavan'), 1);
  close(lib.convertUnit('mass', 1, 'tola', 'g'), 11.664);
  close(lib.convertUnit('area', 1, 'acre', 'cent'), 100);
  close(lib.convertUnit('area', 1, 'acre', 'guntha'), 40);
  close(lib.convertUnit('area', 1, 'ha', 'acre'), 2.4710538147, 1e-9);
  close(lib.convertUnit('volume', 1, 'gal', 'l'), 3.785411784);
});

test('units: temperature, speed, time, data', () => {
  close(lib.convertUnit('temperature', 100, 'C', 'F'), 212);
  close(lib.convertUnit('temperature', -40, 'C', 'F'), -40);
  close(lib.convertUnit('temperature', 0, 'K', 'C'), -273.15);
  close(lib.convertUnit('temperature', 98.6, 'F', 'C'), 37);
  close(lib.convertUnit('speed', 100, 'kmh', 'mph'), 62.137119224, 1e-9);
  close(lib.convertUnit('time', 2, 'h', 'min'), 120);
  close(lib.convertUnit('data', 1, 'GB', 'MB'), 1000);
  close(lib.convertUnit('data', 1, 'GiB', 'MiB'), 1024);
  close(lib.convertUnit('data', 8, 'bit', 'B'), 1);
  assert.throws(() => lib.convertUnit('length', 1, 'm', 'kg'));
});

test('units: number formatting', () => {
  assert.equal(lib.formatNumber(1234567.891234, 10), '1,234,567.891');
  assert.equal(lib.formatNumber(0.1 + 0.2), '0.3');
  assert.equal(lib.formatNumber(0), '0');
  assert.equal(lib.formatNumber(NaN), '—');
  assert.equal(lib.formatNumber(1e-12, 6), '1e-12');
});

test('percentage helpers', () => {
  assert.equal(lib.pctOf(15, 200), 30);
  assert.equal(lib.whatPct(50, 200), 25);
  assert.equal(lib.whatPct(1, 0), null);
  assert.equal(lib.pctChange(80, 100), 25);
  assert.equal(lib.pctChange(100, 80), -20);
  assert.equal(lib.pctChange(0, 5), null);
  assert.equal(lib.addPct(200, 18), 236);
  assert.equal(lib.subPct(200, 25), 150);
  assert.equal(lib.wholeFromPart(30, 15), 200);
  assert.equal(lib.wholeFromPart(5, 0), null);
});

test('compound interest: matches the closed-form formula without deposits', () => {
  const r = lib.compoundInterest({ principal: 100000, ratePct: 8, years: 10, compoundsPerYear: 12 });
  close(r.balance, 100000 * Math.pow(1 + 0.08 / 12, 120), 1e-9);
  const annual = lib.compoundInterest({ principal: 1000, ratePct: 10, years: 2, compoundsPerYear: 1 });
  close(annual.balance, 1210, 1e-9);
  close(annual.interest, 210, 1e-9);
  assert.equal(annual.schedule.length, 2);
  close(annual.effectiveAnnualRate, 0.1, 1e-9);
});

test('compound interest: monthly deposits and edge cases', () => {
  const zero = lib.compoundInterest({ principal: 0, ratePct: 0, years: 5, monthlyDeposit: 1000, compoundsPerYear: 12 });
  close(zero.balance, 60000);
  assert.equal(zero.yearsToDouble, null);
  // 12 monthly deposits of 1000 at 12%/yr, monthly compounding, deposited at month end.
  const fv = lib.compoundInterest({ principal: 0, ratePct: 12, years: 1, monthlyDeposit: 1000, compoundsPerYear: 12 });
  close(fv.balance, 1000 * ((Math.pow(1.01, 12) - 1) / 0.01), 1e-9);
  const dbl = lib.compoundInterest({ principal: 1, ratePct: 7.2, years: 1, compoundsPerYear: 1 });
  assert.ok(dbl.yearsToDouble > 9.9 && dbl.yearsToDouble < 10.0);
  assert.equal(lib.compoundInterest({ principal: 500, ratePct: 5, years: 0 }).balance, 500);
});

test('crop geometry', () => {
  assert.deepEqual(lib.fitAspect(1000, 500, 1), { x: 250, y: 0, w: 500, h: 500 });
  assert.deepEqual(lib.fitAspect(400, 800, 1), { x: 0, y: 200, w: 400, h: 400 });
  assert.deepEqual(lib.fitAspect(1600, 900, 16 / 9), { x: 0, y: 0, w: 1600, h: 900 });
  assert.deepEqual(lib.clampRect({ x: -10, y: 950, w: 300, h: 300 }, 1000, 1000), { x: 0, y: 700, w: 300, h: 300 });
  assert.deepEqual(lib.clampRect({ x: 0, y: 0, w: 5000, h: 0 }, 1000, 800, 10), { x: 0, y: 0, w: 1000, h: 10 });
});
