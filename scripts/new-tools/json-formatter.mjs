import { COMMON_JS, BTN_ROW, MONO } from './common.mjs';

export default {
  path: '/tools/misc/json-formatter/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'JSON Formatter',
  title: 'JSON Formatter & Validator Online Free | Beautify, Minify | ToolShoppy',
  description: 'Free JSON formatter and validator. Beautify, minify and sort JSON, and see the exact line and column of any error. Runs in your browser — your data is never uploaded.',
  name: 'JSON Formatter & Validator',
  h1: 'JSON Formatter & Validator',
  intro: 'Paste JSON to beautify it, minify it or find the exact line and column of a syntax error. Everything runs in your browser, so API responses and config files stay private.',
  keywords: 'json formatter, json validator, json beautifier, json minify, format json online, json pretty print',
  icon: 'file-text', tile: 'amber',
  trust: 'Your JSON never leaves your device',
  howToTitle: 'How to format and validate JSON',
  steps: [
    'Paste your JSON into the input box, or press <strong>Sample</strong> to try it.',
    'Choose <strong>2 spaces</strong>, <strong>4 spaces</strong>, <strong>Tab</strong> to beautify, or <strong>Minify</strong> to remove all whitespace.',
    'If the JSON is invalid, the message shows the line and column of the first error and highlights it in the input.',
    'Copy the result or download it as a .json file.',
  ],
  toolHtml: `      <label for="jsonIn" style="font-weight:600;font-size:0.9rem;">JSON input</label>
      <textarea class="text-tool-area" id="jsonIn" spellcheck="false" placeholder='Paste JSON here, e.g. {"name":"ToolShoppy","free":true}' style="${MONO}min-height:180px;"></textarea>
      <div class="chip-row" id="jsonFmt" role="group" aria-label="Output format" style="margin-top:12px;">
        <button class="chip active" type="button" data-indent="2">2 spaces</button>
        <button class="chip" type="button" data-indent="4">4 spaces</button>
        <button class="chip" type="button" data-indent="tab">Tab</button>
        <button class="chip" type="button" data-indent="0">Minify</button>
        <button class="chip" type="button" id="jsonSort" aria-pressed="false">Sort keys A–Z</button>
      </div>
      <div style="${BTN_ROW}">
        <button class="btn btn-primary" id="jsonRun" type="button">Format JSON</button>
        <button class="btn btn-accent" id="jsonCopy" type="button" disabled>Copy</button>
        <button class="btn" id="jsonDownload" type="button" disabled>Download .json</button>
        <button class="btn" id="jsonSample" type="button">Sample</button>
        <button class="btn" id="jsonClear" type="button">Clear</button>
      </div>
      <p id="jsonStatus" role="status" style="font-weight:600;margin:6px 0;min-height:1.4em;"></p>
      <label for="jsonOut" style="font-weight:600;font-size:0.9rem;">Result</label>
      <textarea class="text-tool-area" id="jsonOut" readonly spellcheck="false" style="${MONO}min-height:180px;"></textarea>
      <div class="stat-pills">
        <span class="stat-pill">Input<strong id="jsonSizeIn">0 B</strong></span>
        <span class="stat-pill">Output<strong id="jsonSizeOut">0 B</strong></span>
      </div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Common JSON mistakes</strong></p>
        <ul>
          <li>Trailing comma after the last item</li>
          <li>Single quotes instead of double quotes</li>
          <li>Unquoted property names</li>
          <li>Comments (JSON has none)</li>
        </ul>
      </div>`,
  sections: [
    ['What a JSON formatter and validator does', `<p>JSON (JavaScript Object Notation) is the text format most web APIs, config files and databases use to exchange data. A <strong>formatter</strong> re-indents it so nested objects and arrays are easy to read; a <strong>minifier</strong> strips every optional space and line break to make it smaller; a <strong>validator</strong> checks that it follows the JSON rules and tells you where it does not.</p><p>This tool parses your text with the browser’s own JSON engine, so what it accepts is what <code>JSON.parse</code> accepts. If parsing fails, a separate strict scanner finds the first offending character and reports its line and column and a plain-language reason, because browsers word their own errors differently.</p>`],
    ['Fixing common JSON errors', `<ul class="guide-list"><li><strong>Trailing comma:</strong> <code>{"a":1,}</code> is invalid. Remove the comma after the last property or item.</li><li><strong>Single quotes:</strong> JSON strings and property names must use double quotes.</li><li><strong>Unquoted keys:</strong> <code>{name:"x"}</code> is JavaScript, not JSON. Write <code>{"name":"x"}</code>.</li><li><strong>Comments:</strong> JSON does not allow <code>//</code> or <code>/* */</code>. Remove them before validating.</li><li><strong>Special values:</strong> <code>NaN</code>, <code>undefined</code> and <code>Infinity</code> are not valid JSON values.</li></ul>`],
    ['Privacy and large files', `<p>Your JSON is processed locally and never uploaded, which matters when it contains tokens, customer data or internal configuration. Very large files (tens of megabytes) depend on your device’s memory, and the textarea can become slow to scroll; for those, use a command-line tool such as <code>jq</code>.</p>`],
  ],
  faqs: [
    ['How do I format JSON online?', 'Paste your JSON into the input box, choose 2 spaces, 4 spaces or Tab, and press Format JSON. The beautified result appears below and you can copy or download it.'],
    ['How do I find the error in my JSON?', 'Press Format JSON. If the text is invalid, the message gives the line and column of the first problem and explains it, and the input box highlights that spot.'],
    ['What is the difference between formatting and minifying JSON?', 'Formatting adds indentation and line breaks for people to read. Minifying removes all optional whitespace so the file is as small as possible for sending over a network. The data is identical.'],
    ['Does sorting keys change my data?', 'Sorting reorders object properties alphabetically at every level. JSON objects are unordered, so values are unchanged, but array order is kept exactly as it is.'],
    ['Is my JSON uploaded to a server?', 'No. Parsing and formatting happen in your browser. ToolShoppy never receives what you paste.'],
  ],
  related: [
    { href: '/tools/misc/base64/', title: 'Base64 Encode & Decode', desc: 'Text and files to Base64', icon: 'transform', tile: 'slate' },
    { href: '/tools/misc/case-converter/', title: 'Case Converter', desc: 'camelCase, snake_case & more', icon: 'text-size', tile: 'indigo' },
    { href: '/tools/misc/password-generator/', title: 'Password Generator', desc: 'Strong random passwords', icon: 'lock-access', tile: 'rose' },
    { href: '/tools/misc/word-counter/', title: 'Word Counter', desc: 'Words, chars & reading time', icon: 'abc', tile: 'indigo' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var input = $('jsonIn'), output = $('jsonOut'), status = $('jsonStatus');
  var indent = '2', sortKeys = false, used = false;
  var SAMPLE = '{"site":"ToolShoppy","free":true,"tools":[{"name":"JSON Formatter","private":true},{"name":"Image Compressor","private":true}],"stats":{"signup":false,"uploads":0}}';

  function bytes(s) { return new TextEncoder().encode(s).length; }
  function size(n) { return n < 1024 ? n + ' B' : (n / 1024).toFixed(n < 10240 ? 2 : 1) + ' KB'; }
  function indexOfLineCol(text, line, col) {
    var idx = 0;
    for (var l = 1; l < line; l++) { var nl = text.indexOf('\n', idx); if (nl < 0) return text.length; idx = nl + 1; }
    return Math.min(text.length, idx + col - 1);
  }
  function setStatus(msg, ok) {
    status.textContent = msg;
    status.style.color = ok ? 'var(--success)' : 'var(--primary-dark)';
  }
  function run(highlight) {
    var text = input.value;
    $('jsonSizeIn').textContent = size(bytes(text));
    if (!text.trim()) { output.value = ''; setStatus('', true); $('jsonCopy').disabled = true; $('jsonDownload').disabled = true; $('jsonSizeOut').textContent = '0 B'; return; }
    var r = TSLib.formatJson(text, indent === 'tab' ? 'tab' : parseInt(indent, 10), sortKeys);
    if (!r.ok) {
      output.value = '';
      $('jsonCopy').disabled = true; $('jsonDownload').disabled = true; $('jsonSizeOut').textContent = '0 B';
      var where = r.line ? ' (line ' + r.line + ', column ' + r.col + ')' : '';
      setStatus('Invalid JSON' + where + ': ' + r.message, false);
      if (r.line && highlight === true) {
        var i = indexOfLineCol(text, r.line, r.col);
        try { input.focus(); input.setSelectionRange(i, Math.min(text.length, i + 1)); } catch (e) {}
      }
      return;
    }
    output.value = r.text;
    $('jsonCopy').disabled = false; $('jsonDownload').disabled = false;
    $('jsonSizeOut').textContent = size(bytes(r.text));
    setStatus('Valid JSON ✓', true);
    if (!used) { used = true; track('json-formatter'); }
  }
  $('jsonRun').addEventListener('click', function () { run(true); });
  input.addEventListener('input', function () { if (input.value.length < 200000) run(); else $('jsonSizeIn').textContent = size(bytes(input.value)); });
  $('jsonFmt').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    if (chip.id === 'jsonSort') {
      sortKeys = !sortKeys;
      chip.classList.toggle('active', sortKeys);
      chip.setAttribute('aria-pressed', String(sortKeys));
    } else {
      indent = chip.getAttribute('data-indent');
      $('jsonFmt').querySelectorAll('[data-indent]').forEach(function (c) { c.classList.toggle('active', c === chip); });
    }
    run();
  });
  $('jsonCopy').addEventListener('click', function () { copyText(output.value, this); });
  $('jsonDownload').addEventListener('click', function () { TS.downloadBlob(new Blob([output.value], { type: 'application/json' }), 'formatted.json'); });
  $('jsonSample').addEventListener('click', function () { input.value = SAMPLE; run(); });
  $('jsonClear').addEventListener('click', function () { input.value = ''; run(); input.focus(); });
  run();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
