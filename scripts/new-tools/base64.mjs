import { COMMON_JS, BTN_ROW, MONO } from './common.mjs';

export default {
  path: '/tools/misc/base64/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'Base64 Encode & Decode',
  title: 'Base64 Encode & Decode Online Free | Text and Image to Base64 | ToolShoppy',
  description: 'Free Base64 encoder and decoder. Convert text or an image file to Base64, decode Base64 back to text, with UTF-8 and URL-safe support. Runs in your browser — nothing is uploaded.',
  name: 'Base64 Encode & Decode',
  h1: 'Base64 Encode & Decode',
  intro: 'Encode text or a file to Base64, or decode Base64 back to readable text. It handles Unicode and URL-safe Base64, and works entirely in your browser.',
  keywords: 'base64 encode, base64 decode, base64 converter, image to base64, text to base64, base64 online',
  icon: 'transform', tile: 'slate',
  trust: 'Text and files stay in your browser — never uploaded',
  howToTitle: 'How to encode or decode Base64',
  steps: [
    'Pick <strong>Encode</strong> to turn text into Base64, or <strong>Decode</strong> to turn Base64 back into text.',
    'Type or paste into the input box. The result updates as you type.',
    'Turn on <strong>URL-safe</strong> if the result goes into a URL or filename (it uses - and _ instead of + and /).',
    'To convert an image or other file, use <strong>File to Base64</strong> below and copy the data URI.',
  ],
  toolHtml: `      <div class="chip-row" id="b64Mode" role="group" aria-label="Mode">
        <button class="chip active" type="button" data-mode="encode">Encode</button>
        <button class="chip" type="button" data-mode="decode">Decode</button>
        <button class="chip" type="button" id="b64Url" aria-pressed="false">URL-safe</button>
      </div>
      <label for="b64In" id="b64InLabel" style="font-weight:600;font-size:0.9rem;display:block;margin-top:12px;">Text to encode</label>
      <textarea class="text-tool-area" id="b64In" spellcheck="false" placeholder="Type or paste here…" style="min-height:140px;"></textarea>
      <p id="b64Status" role="status" style="font-weight:600;margin:6px 0;min-height:1.4em;"></p>
      <label for="b64Out" style="font-weight:600;font-size:0.9rem;">Result</label>
      <textarea class="text-tool-area" id="b64Out" readonly spellcheck="false" style="${MONO}min-height:140px;"></textarea>
      <div style="${BTN_ROW}">
        <button class="btn btn-accent" id="b64Copy" type="button" disabled>Copy result</button>
        <button class="btn" id="b64Swap" type="button" disabled>Use result as input</button>
        <button class="btn" id="b64Clear" type="button">Clear</button>
      </div>
      <h2 class="seo-heading-3" style="font-size:1rem;margin-top:22px;">File to Base64 (images, PDFs, any file)</h2>
      <div class="drop-zone" id="b64Drop" style="padding:18px;">
        <div class="dz-cta">Choose a file</div>
        <p>or drop it here — converted to a data URI on your device</p>
        <input type="file" id="b64File">
      </div>
      <div id="b64FileBox" style="display:none;margin-top:12px;">
        <p id="b64FileInfo" style="font-size:0.85rem;color:var(--text-muted);"></p>
        <img id="b64Preview" alt="Preview of the selected image" width="120" height="120" style="display:none;max-width:120px;max-height:120px;width:auto;height:auto;border-radius:8px;border:1px solid var(--border);margin-bottom:10px;">
        <textarea class="text-tool-area" id="b64FileOut" readonly spellcheck="false" aria-label="Data URI" style="${MONO}min-height:100px;"></textarea>
        <div style="${BTN_ROW}">
          <button class="btn btn-accent" id="b64FileCopy" type="button">Copy data URI</button>
          <button class="btn" id="b64FileRaw" type="button">Copy Base64 only</button>
        </div>
      </div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Good to know</strong></p>
        <ul>
          <li>Base64 is encoding, not encryption</li>
          <li>It makes data about 33% larger</li>
          <li>Unicode text is encoded as UTF-8</li>
        </ul>
      </div>`,
  sections: [
    ['What Base64 is and when to use it', `<p>Base64 represents any data using only 64 safe text characters (A–Z, a–z, 0–9, + and /), so binary data can travel through systems built for plain text: email attachments, JSON, HTML, CSS and URLs. Every 3 bytes become 4 characters, so the encoded text is about one third larger than the original.</p><p>Common uses are embedding a small image directly in HTML or CSS as a <code>data:</code> URI, sending a file inside a JSON API request, and reading the payload of a token such as a JWT (which uses URL-safe Base64).</p>`],
    ['Base64 is not encryption', `<p>Anyone can decode Base64 instantly; it provides no secrecy. Do not use it to hide passwords, keys or personal data. If you need to protect information, encrypt it with a proper tool, and treat a Base64 string of a secret as the secret itself.</p>`],
    ['Unicode, URL-safe Base64 and common errors', `<ul class="guide-list"><li><strong>Unicode:</strong> text such as Hindi, Arabic, Malayalam or emoji is converted to UTF-8 bytes first, so it round-trips correctly. Plain <code>btoa()</code> in a browser fails on those characters.</li><li><strong>URL-safe:</strong> replaces + with - and / with _ and drops the = padding, so the value is safe in URLs and filenames. The decoder accepts both forms.</li><li><strong>“Not valid Base64”:</strong> the input contains characters other than A–Z, a–z, 0–9, +, /, = (or - and _). Remove spaces from copy-paste mistakes or stray quotes.</li><li><strong>“Not UTF-8 text”:</strong> the data decodes but is binary, such as an image. Decode files with a tool built for that type.</li></ul>`],
  ],
  faqs: [
    ['How do I encode text to Base64?', 'Choose Encode, then type or paste your text. The Base64 result appears immediately and you can copy it. Unicode text is handled as UTF-8.'],
    ['How do I convert an image to Base64?', 'Use File to Base64 below the main box: choose the image and copy the data URI (it starts with data:image/…;base64,). You can paste that straight into an HTML img src or a CSS url().'],
    ['Is Base64 secure?', 'No. Base64 is an encoding, not encryption, and anyone can decode it. Never rely on it to protect secrets.'],
    ['What is URL-safe Base64?', 'A variant that uses - and _ instead of + and / and usually omits padding, so the string can be used in URLs, filenames and JWTs without escaping.'],
    ['Are my text and files uploaded?', 'No. Encoding and decoding run in your browser, and files are read on your device only.'],
  ],
  related: [
    { href: '/tools/misc/json-formatter/', title: 'JSON Formatter', desc: 'Format, validate, minify', icon: 'file-text', tile: 'amber' },
    { href: '/tools/misc/password-generator/', title: 'Password Generator', desc: 'Strong random passwords', icon: 'lock-access', tile: 'rose' },
    { href: '/tools/misc/qr-generator/', title: 'QR Generator', desc: 'Text, WiFi, vCard, bulk ZIP', icon: 'qrcode', tile: 'sky' },
    { href: '/tools/image/convert/', title: 'Image Converter', desc: 'JPG, PNG, WebP, HEIC', icon: 'refresh', tile: 'cyan' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var mode = 'encode', urlSafe = false, used = false;
  var input = $('b64In'), output = $('b64Out'), status = $('b64Status');

  function run() {
    var text = input.value;
    if (!text) { output.value = ''; status.textContent = ''; $('b64Copy').disabled = true; $('b64Swap').disabled = true; return; }
    if (mode === 'encode') {
      output.value = TSLib.encodeBase64(text, urlSafe);
      status.textContent = '';
    } else {
      var r = TSLib.decodeBase64(text);
      if (!r.ok) { output.value = ''; status.style.color = 'var(--primary-dark)'; status.textContent = r.message; $('b64Copy').disabled = true; $('b64Swap').disabled = true; return; }
      output.value = r.text;
      status.style.color = 'var(--success)';
      status.textContent = 'Decoded ✓';
    }
    $('b64Copy').disabled = false; $('b64Swap').disabled = false;
    if (!used) { used = true; track('base64', { mode: mode }); }
  }
  $('b64Mode').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    if (chip.id === 'b64Url') {
      urlSafe = !urlSafe; chip.classList.toggle('active', urlSafe); chip.setAttribute('aria-pressed', String(urlSafe));
    } else {
      mode = chip.getAttribute('data-mode');
      $('b64Mode').querySelectorAll('[data-mode]').forEach(function (c) { c.classList.toggle('active', c === chip); });
      $('b64InLabel').textContent = mode === 'encode' ? 'Text to encode' : 'Base64 to decode';
    }
    run();
  });
  input.addEventListener('input', run);
  $('b64Copy').addEventListener('click', function () { copyText(output.value, this); });
  $('b64Swap').addEventListener('click', function () {
    input.value = output.value;
    mode = mode === 'encode' ? 'decode' : 'encode';
    $('b64Mode').querySelectorAll('[data-mode]').forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-mode') === mode); });
    $('b64InLabel').textContent = mode === 'encode' ? 'Text to encode' : 'Base64 to decode';
    run();
  });
  $('b64Clear').addEventListener('click', function () { input.value = ''; run(); input.focus(); });

  // File to data URI
  var dataUri = '';
  TS.setupDropZone($('b64Drop'), $('b64File'), function (files) {
    var f = files[0];
    var reader = new FileReader();
    reader.onload = function () {
      dataUri = String(reader.result);
      $('b64FileOut').value = dataUri;
      $('b64FileBox').style.display = 'block';
      $('b64FileInfo').textContent = f.name + ' · ' + TS.formatBytes(f.size) + ' → ' + TS.formatBytes(dataUri.length) + ' as Base64 text';
      var img = $('b64Preview');
      if (f.type.indexOf('image/') === 0) { img.src = dataUri; img.style.display = 'inline-block'; } else { img.style.display = 'none'; img.removeAttribute('src'); }
      track('base64', { mode: 'file' });
    };
    reader.readAsDataURL(f);
  }, { preview: false });
  $('b64FileCopy').addEventListener('click', function () { copyText(dataUri, this); });
  $('b64FileRaw').addEventListener('click', function () { copyText(dataUri.slice(dataUri.indexOf(',') + 1), this); });
  run();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
