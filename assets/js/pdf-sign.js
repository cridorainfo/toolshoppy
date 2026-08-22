/* TSSign — shared e-signature engine (draw / type / upload, save & reuse, initials)
   Used by tools/pdf/sign/. Self-hosted script fonts only, no CDN. Client-side only. */
(function (global) {
  const FONTS = [
    { key: 'caveat', label: 'Casual', family: "'TS Sig Caveat', cursive" },
    { key: 'dancing', label: 'Elegant', family: "'TS Sig Dancing', cursive" },
    { key: 'vibes', label: 'Formal', family: "'TS Sig Vibes', cursive" },
  ];
  const COLORS = [
    { key: 'black', hex: '#111111' },
    { key: 'blue', hex: '#1D4ED8' },
    { key: 'navy', hex: '#1E293B' },
  ];
  const SIG_KEY = 'ts-saved-signature';
  const INITIALS_KEY = 'ts-saved-initials';

  function fontsReady() {
    if (!(global.document && document.fonts && document.fonts.load)) return Promise.resolve();
    return Promise.all(FONTS.map((f) => document.fonts.load('64px ' + f.family).catch(() => {})));
  }

  // Renders typed text in a script font to a tightly-fit transparent PNG.
  function renderTyped(text, fontKey, colorHex, fontSizePx) {
    const font = FONTS.find((f) => f.key === fontKey) || FONTS[0];
    const size = (fontSizePx || 64) * 2; // 2x for crisp export
    const measure = document.createElement('canvas').getContext('2d');
    measure.font = size + 'px ' + font.family;
    const label = (text || 'Your Name').trim() || 'Your Name';
    const width = Math.ceil(measure.measureText(label).width) + size;
    const height = Math.ceil(size * 1.7);
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    ctx.font = size + 'px ' + font.family;
    ctx.fillStyle = colorHex || '#111111';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.clearRect(0, 0, width, height);
    ctx.fillText(label, size / 2, height / 2);
    return { dataUrl: c.toDataURL('image/png'), width, height };
  }

  // Crops a canvas to its non-transparent ink bounds (+ padding), returns a dataURL, or null if blank.
  function cropToInk(srcCanvas, pad) {
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const data = srcCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    let minX = w, minY = h, maxX = 0, maxY = 0, hasInk = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 12) {
          hasInk = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!hasInk) return null;
    const p = pad == null ? 10 : pad;
    minX = Math.max(0, minX - p);
    minY = Math.max(0, minY - p);
    maxX = Math.min(w - 1, maxX + p);
    maxY = Math.min(h - 1, maxY + p);
    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    out.getContext('2d').drawImage(srcCanvas, minX, minY, cw, ch, 0, 0, cw, ch);
    return out.toDataURL('image/png');
  }

  // Wires mouse + touch drawing on a canvas. Returns {clear, isEmpty, exportPng, setColor, destroy}.
  function attachPad(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const cursor = opts && opts.cursor;
    let drawing = false, lastX = 0, lastY = 0, color = (opts && opts.color) || '#111111';

    function style() {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    style();

    function posOf(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: (clientX - r.left) * (canvas.width / r.width), y: (clientY - r.top) * (canvas.height / r.height) };
    }
    function dot(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    function updateCursor(e) {
      if (!cursor) return;
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) {
        cursor.hidden = true;
        return;
      }
      cursor.hidden = false;
      cursor.style.left = ((clientX - r.left) / r.width * 100) + '%';
      cursor.style.top = ((clientY - r.top) / r.height * 100) + '%';
    }
    function onDown(e) {
      e.preventDefault();
      drawing = true;
      if (cursor) cursor.classList.add('is-drawing');
      updateCursor(e);
      const p = posOf(e);
      lastX = p.x; lastY = p.y;
      dot(p.x, p.y);
    }
    function onMove(e) {
      updateCursor(e);
      if (!drawing) return;
      e.preventDefault();
      const p = posOf(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x; lastY = p.y;
    }
    function onUp() {
      drawing = false;
      if (cursor) cursor.classList.remove('is-drawing');
    }
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseenter', updateCursor);
    canvas.addEventListener('mouseleave', () => { if (cursor) { cursor.hidden = true; cursor.classList.remove('is-drawing'); } });
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', () => { onUp(); if (cursor) cursor.hidden = true; });

    return {
      clear() { ctx.clearRect(0, 0, canvas.width, canvas.height); },
      isEmpty() {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 12) return false;
        return true;
      },
      exportPng(pad) { return cropToInk(canvas, pad); },
      setColor(hex) { color = hex; style(); },
      destroy() {
        canvas.removeEventListener('mousedown', onDown);
        canvas.removeEventListener('mousemove', onMove);
        canvas.removeEventListener('touchstart', onDown);
        canvas.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onUp);
      },
    };
  }

  function save(key, dataUrl, meta) {
    try {
      localStorage.setItem(key, JSON.stringify(Object.assign({ dataUrl, savedAt: Date.now() }, meta || {})));
    } catch (e) { /* private mode / quota */ }
  }
  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clear(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  global.TSSign = {
    FONTS: FONTS,
    COLORS: COLORS,
    fontsReady: fontsReady,
    renderTyped: renderTyped,
    cropToInk: cropToInk,
    attachPad: attachPad,
    saveSignature(dataUrl, meta) { save(SIG_KEY, dataUrl, meta); },
    loadSignature() { return load(SIG_KEY); },
    clearSignature() { clear(SIG_KEY); },
    saveInitials(dataUrl, meta) { save(INITIALS_KEY, dataUrl, meta); },
    loadInitials() { return load(INITIALS_KEY); },
    clearInitials() { clear(INITIALS_KEY); },
  };
})(window);
