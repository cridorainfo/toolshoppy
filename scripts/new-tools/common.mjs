// Small helpers inlined into every generated tool page (each page is a standalone static file).
export const COMMON_JS = String.raw`
  var $ = function (id) { return document.getElementById(id); };
  function track(tool, extra) {
    try { if (window.TSAnalytics) TSAnalytics.track('tool_use', Object.assign({ tool: tool }, extra || {})); } catch (e) {}
  }
  function flash(btn, text) {
    if (!btn) return;
    var old = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', old);
    btn.textContent = text;
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = old; }, 1400);
  }
  function copyText(text, btn) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove();
      flash(btn, ok ? 'Copied!' : 'Press Ctrl+C');
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { flash(btn, 'Copied!'); }, fallback);
    } else fallback();
  }
`;

// Reusable inline styles kept tiny so pages don't need new CSS.
export const BTN_ROW = 'display:flex;gap:10px;flex-wrap:wrap;margin:12px 0;';
export const MONO = "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;";
