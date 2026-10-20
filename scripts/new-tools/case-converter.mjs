import { COMMON_JS, BTN_ROW } from './common.mjs';

const KINDS = [
  ['sentence', 'Sentence case'], ['lower', 'lowercase'], ['upper', 'UPPERCASE'], ['title', 'Title Case'],
  ['capitalized', 'Capitalize Each Word'], ['camel', 'camelCase'], ['pascal', 'PascalCase'], ['snake', 'snake_case'],
  ['kebab', 'kebab-case'], ['constant', 'CONSTANT_CASE'], ['alternating', 'aLtErNaTiNg'], ['inverse', 'iNVERSE'],
];

export default {
  path: '/tools/misc/case-converter/',
  trail: [{ name: 'More Tools', href: '/tools/misc/' }],
  crumbName: 'Case Converter',
  title: 'Case Converter Online Free | Uppercase, Lowercase, Title Case | ToolShoppy',
  description: 'Free case converter. Change text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case and more in one click. Private — runs in your browser.',
  name: 'Case Converter',
  h1: 'Case Converter',
  intro: 'Paste your text and switch it to uppercase, lowercase, title case, sentence case, camelCase, snake_case and more. It works on any language that has letter case and stays in your browser.',
  keywords: 'case converter, uppercase to lowercase, title case converter, sentence case, camelcase converter, snake case converter',
  icon: 'text-size', tile: 'indigo',
  trust: 'Your text stays in your browser — never uploaded',
  howToTitle: 'How to change the case of text',
  steps: [
    'Paste or type your text into the box.',
    'Choose a case style. The converted text appears below straight away.',
    'Press <strong>Copy</strong> to copy the result, or <strong>Use as input</strong> to convert it again.',
  ],
  toolHtml: `      <label for="caseIn" style="font-weight:600;font-size:0.9rem;">Your text</label>
      <textarea class="text-tool-area" id="caseIn" placeholder="Paste or type your text here…" style="min-height:140px;"></textarea>
      <div class="chip-row" id="caseKinds" role="group" aria-label="Case style" style="margin-top:12px;">
${KINDS.map(([k, label], i) => `        <button class="chip${i === 0 ? ' active' : ''}" type="button" data-kind="${k}">${label}</button>`).join('\n')}
      </div>
      <label for="caseOut" style="font-weight:600;font-size:0.9rem;display:block;margin-top:6px;">Converted text</label>
      <textarea class="text-tool-area" id="caseOut" readonly style="min-height:140px;"></textarea>
      <div class="stat-pills">
        <span class="stat-pill">Characters<strong id="caseChars">0</strong></span>
        <span class="stat-pill">Words<strong id="caseWords">0</strong></span>
      </div>
      <div style="${BTN_ROW}">
        <button class="btn btn-accent" id="caseCopy" type="button" disabled>Copy</button>
        <button class="btn" id="caseSwap" type="button" disabled>Use as input</button>
        <button class="btn" id="caseClear" type="button">Clear</button>
      </div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Which case for what?</strong></p>
        <ul>
          <li>Title Case: headlines and book titles</li>
          <li>Sentence case: normal writing</li>
          <li>camelCase / snake_case: code variables</li>
          <li>kebab-case: URLs and CSS classes</li>
        </ul>
      </div>`,
  sections: [
    ['The case styles explained', `<ul class="guide-list"><li><strong>Sentence case</strong> capitalises the first letter of each sentence and lowercases the rest.</li><li><strong>Title Case</strong> capitalises the main words and leaves short words such as “of”, “the”, “and” and “to” lowercase unless they start or end the title.</li><li><strong>Capitalize Each Word</strong> capitalises every word, with no exceptions.</li><li><strong>camelCase</strong> and <strong>PascalCase</strong> join words with no spaces, with capitals marking each new word; PascalCase also capitalises the first word.</li><li><strong>snake_case</strong>, <strong>kebab-case</strong> and <strong>CONSTANT_CASE</strong> join words with underscores or hyphens and are common for variables, file names, URLs and constants.</li></ul>`],
    ['How the converter treats your text', `<p>For camelCase, snake_case and similar styles, the tool splits your text into words at spaces and punctuation, and also where a lowercase letter meets a capital (so <code>parseHTTPResponse</code> becomes <code>parse_http_response</code>). Digits are kept as part of words. Case rules use Unicode, so letters such as é, ñ, ü or Greek and Cyrillic convert correctly. Scripts without letter case, such as Devanagari, Arabic, Malayalam or Chinese, are left unchanged.</p><p>Title Case follows a common English style (it keeps a short list of minor words lowercase). Style guides such as AP, APA and Chicago differ in the details, so check your guide for formal headlines.</p>`],
    ['Tips', `<ul class="guide-list"><li>Convert to lowercase first if your text has odd capitals, then apply Sentence case.</li><li>Proper nouns and acronyms such as “India” or “NASA” are not detected; fix them by hand after Sentence case or Title Case.</li><li>For code identifiers, use the style your language or team prefers (for example snake_case in Python and camelCase in JavaScript).</li></ul>`],
  ],
  faqs: [
    ['How do I change text from uppercase to lowercase?', 'Paste your text and choose lowercase. The converted text appears below and you can copy it. Choose Sentence case if you also want the first letter of each sentence capitalised.'],
    ['What is the difference between Title Case and Capitalize Each Word?', 'Title Case keeps short words like “of”, “and” and “the” lowercase unless they begin or end the text. Capitalize Each Word capitalises every word.'],
    ['Does it work with Hindi, Arabic or other languages?', 'Scripts without uppercase and lowercase letters, such as Hindi, Arabic and Malayalam, are left as they are. Languages with letter case, such as Spanish, French, German, Turkish-style Latin letters, Greek and Russian, convert correctly.'],
    ['How do I convert text to camelCase or snake_case?', 'Choose camelCase, snake_case, kebab-case or PascalCase. The tool splits your text into words and joins them in the style you picked.'],
    ['Is my text uploaded anywhere?', 'No. The conversion happens in your browser and nothing is sent to ToolShoppy.'],
  ],
  related: [
    { href: '/tools/misc/word-counter/', title: 'Word Counter', desc: 'Words, chars & reading time', icon: 'abc', tile: 'indigo' },
    { href: '/tools/misc/font-styler/', title: 'Font Styler', desc: 'Stylish Unicode text', icon: 'sparkles', tile: 'amber' },
    { href: '/tools/misc/json-formatter/', title: 'JSON Formatter', desc: 'Format, validate, minify', icon: 'file-text', tile: 'amber' },
    { href: '/tools/misc/base64/', title: 'Base64 Encode & Decode', desc: 'Text and files to Base64', icon: 'transform', tile: 'slate' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var kind = 'sentence', used = false;
  var input = $('caseIn'), output = $('caseOut');
  function run() {
    var text = input.value;
    output.value = text ? TSLib.convertCase(kind, text) : '';
    $('caseChars').textContent = output.value.length.toLocaleString();
    $('caseWords').textContent = (output.value.trim() ? output.value.trim().split(/\s+/).length : 0).toLocaleString();
    $('caseCopy').disabled = !text;
    $('caseSwap').disabled = !text;
    if (text && !used) { used = true; track('case-converter', { kind: kind }); }
  }
  $('caseKinds').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-kind]');
    if (!chip) return;
    kind = chip.getAttribute('data-kind');
    $('caseKinds').querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
    run();
  });
  input.addEventListener('input', run);
  $('caseCopy').addEventListener('click', function () { copyText(output.value, this); });
  $('caseSwap').addEventListener('click', function () { input.value = output.value; run(); });
  $('caseClear').addEventListener('click', function () { input.value = ''; run(); input.focus(); });
  run();
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
