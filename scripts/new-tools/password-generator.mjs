import { COMMON_JS, BTN_ROW, MONO } from './common.mjs';

export default {
  path: '/tools/misc/password-generator/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'Password Generator',
  title: 'Password Generator Free | Strong Random Passwords | ToolShoppy',
  description: 'Free strong password generator. Choose length and character types, see the strength, and copy. Made in your browser with secure random numbers — nothing is sent or saved.',
  name: 'Password Generator',
  h1: 'Strong Password Generator',
  intro: 'Create a random password of any length in one click. It is generated in your browser using secure random numbers, so it is never sent to a server.',
  keywords: 'password generator, strong password generator, random password generator, secure password, generate password online',
  icon: 'lock-access', tile: 'rose',
  trust: 'Generated on your device — never sent or stored',
  howToTitle: 'How to generate a strong password',
  steps: [
    'Drag the length slider. Use at least 16 characters for important accounts.',
    'Choose which character types to include: lowercase, uppercase, digits and symbols.',
    'Press <strong>Generate new</strong> until you like the result, then press <strong>Copy</strong>.',
    'Paste it into your password manager or the sign-up form. Use a different password for every account.',
  ],
  toolHtml: `      <div class="calc-result-hero">
        <div class="calc-result-label">Your password</div>
        <div class="calc-result-value" id="pwOut" aria-live="polite" style="${MONO}font-size:1.25rem;word-break:break-all;">—</div>
      </div>
      <div class="stat-pills">
        <span class="stat-pill">Strength<strong id="pwStrength">—</strong></span>
        <span class="stat-pill">Entropy<strong id="pwBits">—</strong></span>
        <span class="stat-pill">Length<strong id="pwLenShown">16</strong></span>
      </div>
      <div style="${BTN_ROW}">
        <button class="btn btn-primary" id="pwNew" type="button">Generate new</button>
        <button class="btn btn-accent" id="pwCopy" type="button">Copy</button>
      </div>
      <div class="calc-form">
        <div class="calc-field">
          <label for="pwLen">Length</label>
          <input type="range" id="pwLen" min="4" max="64" value="16">
        </div>
        <div class="chip-row" id="pwSets" role="group" aria-label="Character types">
          <button class="chip active" type="button" data-set="lower" aria-pressed="true">a–z</button>
          <button class="chip active" type="button" data-set="upper" aria-pressed="true">A–Z</button>
          <button class="chip active" type="button" data-set="digits" aria-pressed="true">0–9</button>
          <button class="chip active" type="button" data-set="symbols" aria-pressed="true">!@#$%</button>
          <button class="chip" type="button" data-set="noAmbiguous" aria-pressed="false">No look-alikes (Il1O0o)</button>
        </div>
      </div>
      <p id="pwNote" class="rate-disclaimer" style="margin-top:8px;"></p>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Good habits</strong></p>
        <ul>
          <li>One unique password per account</li>
          <li>Store them in a password manager</li>
          <li>Turn on two-step verification</li>
        </ul>
      </div>`,
  sections: [
    ['How this password generator works', `<p>Each character is picked with the browser’s secure random number generator (<code>crypto.getRandomValues</code>), the same source used for encryption keys, not <code>Math.random()</code>. The tool also avoids the common bias of using a remainder, so every character in your chosen set is equally likely. It always includes at least one character from every type you switch on, then shuffles the result.</p><p>Nothing you generate leaves the page. There is no account, no log and no request to a server when you press Generate.</p>`],
    ['How long should a password be?', `<p>Length matters more than complexity. The entropy shown above is length × log₂(size of the character set), so each extra character multiplies the number of possibilities. A random 16-character password with all four types is about 103 bits; 12 characters is about 77 bits.</p><p>For accounts that matter, such as email, banking and your password manager, use 16 or more characters. Some sites cap length or reject certain symbols; if so, switch symbols off and increase the length instead.</p>`],
    ['Tips for using generated passwords', `<ul class="guide-list"><li>Do not reuse a password. If one site leaks it, attackers try it everywhere else.</li><li>Do not edit a generated password by hand to make it memorable; that makes it weaker.</li><li>Use a password manager to remember them, and protect that one with a long passphrase and two-step verification.</li><li>Use “No look-alikes” if you need to read the password aloud or type it from paper.</li></ul>`],
  ],
  faqs: [
    ['Is this password generator safe to use?', 'Yes. Passwords are created in your browser with secure random numbers and are never sent to ToolShoppy or stored. You can disconnect from the internet after the page loads and it still works.'],
    ['How long should my password be?', 'Use at least 16 characters for important accounts. Length adds more strength than extra symbols. If a site limits length, use the maximum it allows.'],
    ['What does the entropy number mean?', 'Entropy in bits estimates how many guesses an attacker would need on average: each added bit doubles that. Above about 80 bits is considered strong against offline guessing.'],
    ['Why are some characters left out with “No look-alikes”?', 'It removes characters that are easy to confuse when reading, such as I, l, 1, O, 0 and o, which helps when you must type a password from a printout or read it over the phone.'],
    ['Can I generate a password without symbols?', 'Yes. Switch off the symbols chip. Increase the length to make up for the smaller character set; for example use 20 characters or more with letters and digits only.'],
  ],
  related: [
    { href: '/tools/misc/base64/', title: 'Base64 Encode & Decode', desc: 'Text and files to Base64', icon: 'transform', tile: 'slate' },
    { href: '/tools/misc/qr-generator/', title: 'QR Generator', desc: 'Text, WiFi, vCard, bulk ZIP', icon: 'qrcode', tile: 'sky' },
    { href: '/tools/misc/word-counter/', title: 'Word Counter', desc: 'Words, chars & reading time', icon: 'abc', tile: 'indigo' },
    { href: '/tools/misc/json-formatter/', title: 'JSON Formatter', desc: 'Format, validate, minify', icon: 'file-text', tile: 'amber' },
  ],
  inlineScript: `(function () {${COMMON_JS}
  var opts = { length: 16, lower: true, upper: true, digits: true, symbols: true, noAmbiguous: false };
  var out = $('pwOut'), lenInput = $('pwLen'), note = $('pwNote');
  var used = false;

  function render() {
    var bits = TSLib.passwordEntropyBits(opts);
    $('pwBits').textContent = Math.round(bits) + ' bits';
    $('pwStrength').textContent = TSLib.strengthLabel(bits);
    $('pwLenShown').textContent = opts.length;
  }
  function generate() {
    try {
      out.textContent = TSLib.generatePassword(opts);
      note.textContent = '';
      $('pwCopy').disabled = false;
    } catch (e) {
      out.textContent = '—';
      $('pwCopy').disabled = true;
      note.textContent = e.message;
    }
    render();
  }
  lenInput.addEventListener('input', function () { opts.length = parseInt(lenInput.value, 10); generate(); });
  $('pwNew').addEventListener('click', function () { generate(); if (!used) { used = true; track('password-generator'); } });
  $('pwCopy').addEventListener('click', function () { copyText(out.textContent, this); if (!used) { used = true; track('password-generator'); } });
  $('pwSets').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-set]');
    if (!chip) return;
    var key = chip.getAttribute('data-set');
    opts[key] = !opts[key];
    chip.classList.toggle('active', opts[key]);
    chip.setAttribute('aria-pressed', String(opts[key]));
    generate();
  });
  generate();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
