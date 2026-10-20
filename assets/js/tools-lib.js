// ToolShoppy — pure logic for the text/number tools (password, JSON, Base64, case,
// units, percentage, compound interest, crop geometry). No DOM access here so the same
// file runs in the browser (window.TSLib) and under `node --test` (module.exports).
(function (root, factory) {
  var lib = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = lib;
  else root.TSLib = lib;
})(typeof self !== 'undefined' ? self : this, function (root) {
  'use strict';

  // ---------- Password generator ----------
  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
  };
  var AMBIGUOUS = /[Il1O0o]/g;

  function cryptoSource() {
    var c = root.crypto || (typeof require === 'function' ? require('node:crypto').webcrypto : null);
    if (!c || !c.getRandomValues) throw new Error('Secure random numbers are not available in this browser.');
    return c;
  }

  // Uniform integer in [0, max) using rejection sampling, so there is no modulo bias.
  function randomInt(max, source) {
    var c = source || cryptoSource();
    var limit = Math.floor(0x100000000 / max) * max;
    var buf = new Uint32Array(1);
    do { c.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function poolFor(opts) {
    var sets = [];
    ['lower', 'upper', 'digits', 'symbols'].forEach(function (k) {
      if (!opts[k]) return;
      var chars = SETS[k];
      if (opts.noAmbiguous) chars = chars.replace(AMBIGUOUS, '');
      if (chars) sets.push(chars);
    });
    return sets;
  }

  function generatePassword(opts, source) {
    var length = Math.max(4, Math.min(128, Math.floor(opts.length) || 16));
    var sets = poolFor(opts);
    if (!sets.length) throw new Error('Pick at least one character type.');
    var all = sets.join('');
    var out = [];
    // Guarantee one character from every selected set, then fill from the full pool.
    sets.forEach(function (s) { out.push(s.charAt(randomInt(s.length, source))); });
    while (out.length < length) out.push(all.charAt(randomInt(all.length, source)));
    // Fisher-Yates shuffle so the guaranteed characters are not always at the start.
    for (var i = out.length - 1; i > 0; i--) {
      var j = randomInt(i + 1, source);
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out.slice(0, length).join('');
  }

  function passwordEntropyBits(opts) {
    var size = poolFor(opts).join('').length;
    var length = Math.max(4, Math.min(128, Math.floor(opts.length) || 16));
    return size > 1 ? length * Math.log2(size) : 0;
  }

  function strengthLabel(bits) {
    if (bits < 40) return 'Weak';
    if (bits < 60) return 'Fair';
    if (bits < 80) return 'Good';
    if (bits < 110) return 'Strong';
    return 'Very strong';
  }

  // ---------- JSON ----------
  function sortKeysDeep(v) {
    if (Array.isArray(v)) return v.map(sortKeysDeep);
    if (v && typeof v === 'object') {
      var out = {};
      Object.keys(v).sort().forEach(function (k) { out[k] = sortKeysDeep(v[k]); });
      return out;
    }
    return v;
  }

  function lineColAt(text, pos) {
    var before = text.slice(0, pos);
    var line = before.split('\n').length;
    var col = pos - (before.lastIndexOf('\n') + 1) + 1;
    return { line: line, col: col };
  }

  // Strict JSON scanner used only to explain a failed JSON.parse: engines word their
  // errors differently (and recent ones give no position), so we find the first bad
  // character ourselves. Returns { index, message }.
  function locateJsonError(text) {
    var i = 0, n = text.length;
    function ws() { while (i < n && " \t\n\r".indexOf(text.charAt(i)) >= 0) i++; }
    function fail(hint) { var e = new Error(hint || ""); e.index = i; throw e; }
    function lit(word) { if (text.substr(i, word.length) === word) { i += word.length; return true; } return false; }
    function str() {
      i++;
      for (;;) {
        if (i >= n) fail("The string is never closed. Add the missing closing double quote.");
        var c = text.charAt(i);
        if (c === "\"") { i++; return; }
        if (c < " ") fail("Line breaks and tabs inside a string must be written as \\n and \\t.");
        if (c === "\\") {
          i++;
          var e = text.charAt(i);
          if (e && "\"\\/bfnrt".indexOf(e) >= 0) i++;
          else if (e === "u" && /^[0-9a-fA-F]{4}$/.test(text.substr(i + 1, 4))) i += 5;
          else fail("Invalid escape sequence in a string.");
        } else i++;
      }
    }
    function digits() { var s0 = i; while (i < n && text.charAt(i) >= "0" && text.charAt(i) <= "9") i++; if (i === s0) fail("A digit was expected here."); }
    function num() {
      if (text.charAt(i) === "-") i++;
      if (text.charAt(i) === "0") i++;
      else if (text.charAt(i) >= "1" && text.charAt(i) <= "9") digits();
      else fail("A digit was expected here.");
      if (text.charAt(i) === ".") { i++; digits(); }
      if (text.charAt(i) === "e" || text.charAt(i) === "E") { i++; if (text.charAt(i) === "+" || text.charAt(i) === "-") i++; digits(); }
    }
    function value() {
      ws();
      if (i >= n) fail("Unexpected end of input. A value is missing here.");
      var c = text.charAt(i);
      if (c === "{") return obj();
      if (c === "[") return arr();
      if (c === "\"") return str();
      if (c === "-" || (c >= "0" && c <= "9")) return num();
      if (lit("true") || lit("false") || lit("null")) return;
      if (c === "'") fail("JSON strings use double quotes, not single quotes.");
      if (c === "/" ) fail("Comments are not allowed in JSON.");
      fail("Unexpected character " + JSON.stringify(c) + ". A value (string, number, object, array, true, false or null) was expected.");
    }
    function afterItem(close) {
      ws();
      var c = text.charAt(i);
      if (c === ",") { i++; return true; }
      if (c === close) { i++; return false; }
      if (i >= n) fail("Unexpected end of input. A closing " + close + " may be missing.");
      fail("Expected a comma or " + close + " here but found " + JSON.stringify(c) + ". A comma may be missing.");
    }
    function arr() {
      i++; ws();
      if (text.charAt(i) === "]") { i++; return; }
      for (;;) {
        ws();
        if (text.charAt(i) === "]") fail("A trailing comma before ] is not allowed in JSON.");
        value();
        if (!afterItem("]")) return;
      }
    }
    function obj() {
      i++; ws();
      if (text.charAt(i) === "}") { i++; return; }
      for (;;) {
        ws();
        var c = text.charAt(i);
        if (c === "}") fail("A trailing comma before } is not allowed in JSON.");
        if (i >= n) fail("Unexpected end of input. A closing } may be missing.");
        if (c !== "\"") fail(c === "'" ? "Property names must use double quotes, not single quotes." : "Property names must be in double quotes.");
        str(); ws();
        if (text.charAt(i) !== ":") fail("A colon was expected after the property name.");
        i++; value();
        if (!afterItem("}")) return;
      }
    }
    try {
      value(); ws();
      if (i < n) fail("Extra content after the end of the JSON value.");
    } catch (e) {
      if (typeof e.index === "number") return { index: e.index, message: e.message };
      throw e;
    }
    return null;
  }

  function parseJson(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (e) {
      var loc = locateJsonError(text);
      if (!loc) return { ok: false, message: String(e && e.message || e) };
      var lc = lineColAt(text, loc.index);
      return { ok: false, message: loc.message, line: lc.line, col: lc.col };
    }
  }

  // indent: number of spaces, 'tab', or 0 to minify
  function formatJson(text, indent, sortKeys) {
    var p = parseJson(text);
    if (!p.ok) return p;
    var v = sortKeys ? sortKeysDeep(p.value) : p.value;
    var ind = indent === 'tab' ? '\t' : (indent | 0);
    return { ok: true, text: JSON.stringify(v, null, ind || undefined) };
  }

  // ---------- Base64 ----------
  function utf8ToBinary(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return bin;
  }

  function encodeBase64(str, urlSafe) {
    var b64 = btoa(utf8ToBinary(str));
    return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
  }

  function decodeBase64(input) {
    var s = String(input).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    if (!s) return { ok: true, text: '' };
    if (/[^A-Za-z0-9+/=]/.test(s) || /=[^=]/.test(s)) {
      return { ok: false, message: 'This is not valid Base64: it contains characters outside A–Z, a–z, 0–9, +, / and =.' };
    }
    s = s.replace(/=+$/, '');
    if (s.length % 4 === 1) return { ok: false, message: 'This is not valid Base64: the length is not possible for Base64 data.' };
    while (s.length % 4) s += '=';
    var bin;
    try { bin = atob(s); } catch (e) { return { ok: false, message: 'This is not valid Base64.' }; }
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    try {
      return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
    } catch (e) {
      return { ok: false, message: 'The data decodes, but it is not UTF-8 text (it may be an image or other binary file).' };
    }
  }

  // ---------- Case converter ----------
  var MINOR = { a: 1, an: 1, the: 1, and: 1, but: 1, or: 1, nor: 1, for: 1, so: 1, yet: 1, at: 1, by: 1, in: 1, of: 1, on: 1, to: 1, up: 1, as: 1, per: 1, via: 1, vs: 1 };

  function splitWords(str) {
    var spaced = String(str)
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2');
    return spaced.match(/[\p{L}\p{N}]+/gu) || [];
  }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }

  var CASES = {
    upper: function (s) { return s.toUpperCase(); },
    lower: function (s) { return s.toLowerCase(); },
    title: function (s) {
      var parts = s.toLowerCase().split(/(\s+)/);
      var wordIdx = [];
      parts.forEach(function (p, i) { if (!/^\s*$/.test(p)) wordIdx.push(i); });
      return parts.map(function (p, i) {
        if (/^\s*$/.test(p)) return p;
        var first = i === wordIdx[0], last = i === wordIdx[wordIdx.length - 1];
        if (!first && !last && MINOR[p.replace(/[^\p{L}]/gu, '')]) return p;
        return p.replace(/^([^\p{L}\p{N}]*)(\p{L}|\p{N})/u, function (_, pre, ch) { return pre + ch.toUpperCase(); });
      }).join('');
    },
    sentence: function (s) {
      var lower = s.toLowerCase();
      return lower.replace(/(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu, function (_, pre, ch) { return pre + ch.toUpperCase(); });
    },
    capitalized: function (s) { return s.toLowerCase().replace(/(^|\s)(\p{L})/gu, function (_, pre, ch) { return pre + ch.toUpperCase(); }); },
    camel: function (s) { return splitWords(s).map(function (w, i) { return i ? cap(w) : w.toLowerCase(); }).join(''); },
    pascal: function (s) { return splitWords(s).map(cap).join(''); },
    snake: function (s) { return splitWords(s).map(function (w) { return w.toLowerCase(); }).join('_'); },
    kebab: function (s) { return splitWords(s).map(function (w) { return w.toLowerCase(); }).join('-'); },
    constant: function (s) { return splitWords(s).map(function (w) { return w.toUpperCase(); }).join('_'); },
    alternating: function (s) {
      var n = 0;
      return Array.from(s).map(function (ch) {
        if (!/\p{L}/u.test(ch)) return ch;
        return (n++ % 2) ? ch.toUpperCase() : ch.toLowerCase();
      }).join('');
    },
    inverse: function (s) {
      return Array.from(s).map(function (ch) {
        var u = ch.toUpperCase(), l = ch.toLowerCase();
        return ch === u && ch !== l ? l : ch === l && ch !== u ? u : ch;
      }).join('');
    },
  };
  function convertCase(kind, text) {
    var fn = CASES[kind];
    if (!fn) throw new Error('Unknown case: ' + kind);
    return fn(String(text));
  }

  // ---------- Unit converter ----------
  // factor = how many base units in one of this unit. Temperature is handled separately.
  var UNITS = {
    length: { label: 'Length', base: 'm', units: {
      mm: ['Millimetre', 0.001], cm: ['Centimetre', 0.01], m: ['Metre', 1], km: ['Kilometre', 1000],
      in: ['Inch', 0.0254], ft: ['Foot', 0.3048], yd: ['Yard', 0.9144], mi: ['Mile', 1609.344], nmi: ['Nautical mile', 1852],
    } },
    mass: { label: 'Weight / mass', base: 'g', units: {
      mg: ['Milligram', 0.001], g: ['Gram', 1], kg: ['Kilogram', 1000], t: ['Tonne', 1e6],
      oz: ['Ounce', 28.349523125], lb: ['Pound', 453.59237], st: ['Stone', 6350.29318],
      ozt: ['Troy ounce', 31.1034768], tola: ['Tola (11.664 g)', 11.664], pavan: ['Pavan / sovereign (8 g)', 8],
    } },
    area: { label: 'Area', base: 'm2', units: {
      mm2: ['Square millimetre', 1e-6], cm2: ['Square centimetre', 1e-4], m2: ['Square metre', 1], km2: ['Square kilometre', 1e6],
      sqin: ['Square inch', 0.00064516], sqft: ['Square foot', 0.09290304], sqyd: ['Square yard', 0.83612736],
      acre: ['Acre', 4046.8564224], ha: ['Hectare', 10000], cent: ['Cent (1/100 acre)', 40.468564224], guntha: ['Guntha (1/40 acre)', 101.1714105600],
    } },
    volume: { label: 'Volume', base: 'l', units: {
      ml: ['Millilitre', 0.001], l: ['Litre', 1], m3: ['Cubic metre', 1000],
      tsp: ['Teaspoon (US)', 0.00492892159375], tbsp: ['Tablespoon (US)', 0.01478676478125], cup: ['Cup (US)', 0.2365882365],
      floz: ['Fluid ounce (US)', 0.0295735295625], pt: ['Pint (US)', 0.473176473], gal: ['Gallon (US)', 3.785411784], galuk: ['Gallon (UK)', 4.54609],
    } },
    speed: { label: 'Speed', base: 'mps', units: {
      mps: ['Metre per second', 1], kmh: ['Kilometre per hour', 1 / 3.6], mph: ['Mile per hour', 0.44704], kn: ['Knot', 1852 / 3600], fps: ['Foot per second', 0.3048],
    } },
    time: { label: 'Time', base: 's', units: {
      ms: ['Millisecond', 0.001], s: ['Second', 1], min: ['Minute', 60], h: ['Hour', 3600], d: ['Day', 86400], wk: ['Week', 604800],
      mo: ['Month (30.44 days)', 2629746], yr: ['Year (365.25 days)', 31557600],
    } },
    data: { label: 'Digital storage', base: 'B', units: {
      bit: ['Bit', 0.125], B: ['Byte', 1], KB: ['Kilobyte (1,000 B)', 1e3], MB: ['Megabyte', 1e6], GB: ['Gigabyte', 1e9], TB: ['Terabyte', 1e12],
      KiB: ['Kibibyte (1,024 B)', 1024], MiB: ['Mebibyte', 1048576], GiB: ['Gibibyte', 1073741824], TiB: ['Tebibyte', 1099511627776],
    } },
    temperature: { label: 'Temperature', base: 'C', units: {
      C: ['Celsius', 0], F: ['Fahrenheit', 0], K: ['Kelvin', 0],
    } },
  };

  function toCelsius(v, u) { return u === 'F' ? (v - 32) * 5 / 9 : u === 'K' ? v - 273.15 : v; }
  function fromCelsius(c, u) { return u === 'F' ? c * 9 / 5 + 32 : u === 'K' ? c + 273.15 : c; }

  function convertUnit(category, value, from, to) {
    var cat = UNITS[category];
    if (!cat || !cat.units[from] || !cat.units[to]) throw new Error('Unknown unit');
    if (!isFinite(value)) return NaN;
    if (category === 'temperature') return fromCelsius(toCelsius(value, from), to);
    return value * cat.units[from][1] / cat.units[to][1];
  }

  function formatNumber(n, maxSig) {
    if (n === null || n === undefined || !isFinite(n)) return '—';
    if (n === 0) return '0';
    var sig = maxSig || 10;
    var abs = Math.abs(n);
    if (abs >= 1e15 || abs < 1e-9) return n.toExponential(Math.min(sig - 1, 8)).replace(/\.?0+e/, 'e');
    var s = Number(n.toPrecision(sig)).toString();
    if (s.indexOf('e') !== -1) s = Number(n.toPrecision(sig)).toFixed(12).replace(/\.?0+$/, '');
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  // ---------- Percentage ----------
  function pctOf(pct, whole) { return whole * pct / 100; }
  function whatPct(part, whole) { return whole === 0 ? null : part / whole * 100; }
  function pctChange(from, to) { return from === 0 ? null : (to - from) / Math.abs(from) * 100; }
  function addPct(value, pct) { return value * (1 + pct / 100); }
  function subPct(value, pct) { return value * (1 - pct / 100); }
  function wholeFromPart(part, pct) { return pct === 0 ? null : part / (pct / 100); }

  // ---------- Compound interest ----------
  // Balance grows by the effective monthly rate for the compounding frequency; an
  // optional deposit is added at the end of every month. With no deposits this equals
  // P * (1 + r/n)^(n*t).
  function compoundInterest(o) {
    var P = Math.max(0, +o.principal || 0);
    var rate = Math.max(0, +o.ratePct || 0) / 100;
    var years = Math.max(0, +o.years || 0);
    var n = [1, 2, 4, 12, 365].indexOf(+o.compoundsPerYear) >= 0 ? +o.compoundsPerYear : 12;
    var monthly = Math.max(0, +o.monthlyDeposit || 0);
    var months = Math.round(years * 12);
    var rm = Math.pow(1 + rate / n, n / 12) - 1;
    var bal = P, contrib = P, schedule = [];
    for (var m = 1; m <= months; m++) {
      bal = bal * (1 + rm) + monthly;
      contrib += monthly;
      if (m % 12 === 0 || m === months) {
        schedule.push({ year: m / 12, contributed: contrib, interest: bal - contrib, balance: bal });
      }
    }
    return {
      balance: bal, contributed: contrib, interest: bal - contrib, schedule: schedule,
      effectiveAnnualRate: Math.pow(1 + rate / n, n) - 1,
      yearsToDouble: rate > 0 ? Math.log(2) / (n * Math.log(1 + rate / n)) : null,
    };
  }

  // ---------- Crop geometry ----------
  // Largest rectangle with the given aspect ratio (w/h) that fits inside the image, centred.
  function fitAspect(imgW, imgH, ratio) {
    var w = imgW, h = imgW / ratio;
    if (h > imgH) { h = imgH; w = imgH * ratio; }
    return { x: Math.round((imgW - w) / 2), y: Math.round((imgH - h) / 2), w: Math.round(w), h: Math.round(h) };
  }
  function clampRect(r, imgW, imgH, minSize) {
    var min = minSize || 1;
    var w = Math.max(min, Math.min(imgW, Math.round(r.w)));
    var h = Math.max(min, Math.min(imgH, Math.round(r.h)));
    var x = Math.max(0, Math.min(imgW - w, Math.round(r.x)));
    var y = Math.max(0, Math.min(imgH - h, Math.round(r.y)));
    return { x: x, y: y, w: w, h: h };
  }

  return {
    SETS: SETS, randomInt: randomInt, generatePassword: generatePassword, passwordEntropyBits: passwordEntropyBits, strengthLabel: strengthLabel,
    parseJson: parseJson, formatJson: formatJson,
    encodeBase64: encodeBase64, decodeBase64: decodeBase64,
    splitWords: splitWords, convertCase: convertCase, CASE_KINDS: Object.keys(CASES),
    UNITS: UNITS, convertUnit: convertUnit, formatNumber: formatNumber,
    pctOf: pctOf, whatPct: whatPct, pctChange: pctChange, addPct: addPct, subPct: subPct, wholeFromPart: wholeFromPart,
    compoundInterest: compoundInterest,
    fitAspect: fitAspect, clampRect: clampRect,
  };
});
