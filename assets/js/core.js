// ToolShoppy — shared client-side utilities
(function (global) {
  'use strict';

  function formatBytes(bytes) {
    if (bytes === 0) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i++;
    }
    return (val >= 100 || i === 0 ? Math.round(val) : val.toFixed(1)) + ' ' + units[i];
  }

  function percentSaved(originalBytes, newBytes) {
    if (!originalBytes) return 0;
    return Math.max(0, Math.round((1 - newBytes / originalBytes) * 100));
  }

  function getFileKind(file) {
    if (!file || !file.name) return 'file';
    const t = file.type || '';
    if (t.indexOf('image/') === 0) return 'image';
    if (t.indexOf('video/') === 0) return 'video';
    if (t.indexOf('audio/') === 0) return 'audio';
    if (t === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
    if (/\.(docx?|doc)$/i.test(file.name) || t.indexOf('word') >= 0) return 'doc';
    return 'file';
  }

  function extensionLabel(file) {
    const m = file.name.match(/\.([^.]+)$/);
    return m ? m[1].toUpperCase().slice(0, 4) : 'FILE';
  }

  function revokePreviewUrls(container) {
    if (!container || !container._tsPreviewUrls) return;
    container._tsPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
    container._tsPreviewUrls = [];
  }

  /** Render thumbnail / media preview for uploaded files. */
  function renderFilePreview(container, files, opts) {
    if (!container) return;
    opts = opts || {};
    revokePreviewUrls(container);
    container._tsPreviewUrls = container._tsPreviewUrls || [];
    container.innerHTML = '';

    const list = Array.from(files || []).filter(Boolean);
    const max = opts.maxFiles || 12;

    if (!list.length) {
      container.hidden = true;
      container.setAttribute('aria-hidden', 'true');
      return;
    }

    container.hidden = false;
    container.setAttribute('aria-hidden', 'false');
    container.setAttribute('aria-live', 'polite');
    container.classList.add('file-upload-preview');

    const badge = document.createElement('div');
    badge.className = 'file-preview-status';
    badge.innerHTML = '<svg class="icon-svg" width="16" height="16" aria-hidden="true"><use href="/assets/icons/sprite.svg#circle-check"></use></svg> '
      + (list.length === 1 ? '1 file added' : list.length + ' files added');
    container.appendChild(badge);

    const inner = document.createElement('div');
    inner.className = 'file-upload-preview-inner' + (list.length > 1 ? ' is-grid' : '');

    list.slice(0, max).forEach((file) => {
      const tile = document.createElement('div');
      tile.className = 'file-preview-tile';
      const kind = getFileKind(file);
      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'file-preview-media';

      if (kind === 'image') {
        const img = document.createElement('img');
        const url = URL.createObjectURL(file);
        container._tsPreviewUrls.push(url);
        img.src = url;
        img.alt = file.name;
        img.loading = 'lazy';
        mediaWrap.appendChild(img);
      } else if (kind === 'video') {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        container._tsPreviewUrls.push(url);
        video.src = url;
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        mediaWrap.appendChild(video);
      } else if (kind === 'audio') {
        const audio = document.createElement('audio');
        const url = URL.createObjectURL(file);
        container._tsPreviewUrls.push(url);
        audio.src = url;
        audio.controls = true;
        audio.preload = 'metadata';
        mediaWrap.appendChild(audio);
      } else if (kind === 'pdf' && global.TSPdfPreview && global.pdfjsLib) {
        const ph = document.createElement('div');
        ph.className = 'file-preview-loading';
        ph.textContent = 'Loading preview…';
        mediaWrap.appendChild(ph);
        global.TSPdfPreview.renderPdfThumb(file, { maxWidth: 200 }).then((t) => {
          const img = document.createElement('img');
          img.src = t.dataUrl;
          img.alt = 'PDF preview — ' + file.name;
          ph.replaceWith(img);
        }).catch(() => {
          const fallback = document.createElement('div');
          fallback.className = 'file-preview-icon is-pdf';
          fallback.textContent = 'PDF';
          ph.replaceWith(fallback);
        });
      } else {
        const icon = document.createElement('div');
        icon.className = 'file-preview-icon';
        if (kind === 'pdf') icon.classList.add('is-pdf');
        else if (kind === 'doc') icon.classList.add('is-doc');
        icon.textContent = kind === 'pdf' ? 'PDF' : kind === 'doc' ? 'DOC' : extensionLabel(file);
        mediaWrap.appendChild(icon);
      }

      tile.appendChild(mediaWrap);
      const meta = document.createElement('div');
      meta.className = 'file-preview-meta';
      const nameEl = document.createElement('span');
      nameEl.className = 'file-preview-name';
      nameEl.textContent = file.name;
      nameEl.title = file.name;
      const sizeEl = document.createElement('span');
      sizeEl.className = 'file-preview-size';
      sizeEl.textContent = formatBytes(file.size);
      meta.appendChild(nameEl);
      meta.appendChild(sizeEl);
      tile.appendChild(meta);
      inner.appendChild(tile);
    });

    container.appendChild(inner);

    if (list.length > max) {
      const more = document.createElement('p');
      more.className = 'file-preview-more';
      more.textContent = '+' + (list.length - max) + ' more file' + (list.length - max > 1 ? 's' : '');
      container.appendChild(more);
    }
  }

  function getOrCreatePreviewContainer(zoneEl, previewEl) {
    if (previewEl) return previewEl;
    const next = zoneEl.nextElementSibling;
    if (next && next.classList.contains('file-upload-preview')) return next;
    const el = document.createElement('div');
    el.className = 'file-upload-preview';
    el.hidden = true;
    zoneEl.insertAdjacentElement('afterend', el);
    return el;
  }

  // Wires drag & drop + click-to-browse + paste on a drop-zone element.
  // onFiles receives a FileList/array of File objects.
  // opts.preview (default true) — show file preview after the drop zone.
  // opts.previewEl — use an existing container instead of auto-inserting one.
  function setupDropZone(zoneEl, inputEl, onFiles, opts) {
    if (!zoneEl || !inputEl) return;
    opts = opts || {};
    const previewEnabled = opts.preview !== false;
    const previewContainer = previewEnabled ? getOrCreatePreviewContainer(zoneEl, opts.previewEl) : null;

    function handleFiles(files) {
      const list = Array.from(files || []);
      if (!list.length) return;
      if (previewEnabled && previewContainer) {
        renderFilePreview(previewContainer, list, opts);
      }
      onFiles(list);
    }

    zoneEl.addEventListener('click', () => inputEl.click());

    inputEl.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) handleFiles(Array.from(e.target.files));
    });

    ['dragenter', 'dragover'].forEach((evt) => {
      zoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zoneEl.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((evt) => {
      zoneEl.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zoneEl.classList.remove('dragover');
      });
    });

    zoneEl.addEventListener('drop', (e) => {
      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) handleFiles(Array.from(files));
    });

    document.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const files = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) handleFiles(files);
    });

    return previewContainer;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => resolve({ img, url });
      img.onerror = reject;
      img.src = url;
    });
  }

  // Binary-search JPEG quality to hit a target byte size.
  function canvasToTargetSize(canvas, targetBytes, mime) {
    mime = mime || 'image/jpeg';
    return new Promise((resolve) => {
      let lo = 0.05, hi = 0.95, best = null;
      let attempts = 0;
      const maxAttempts = 8;

      function tryQuality(q) {
        canvas.toBlob((blob) => {
          attempts++;
          if (!blob) return resolve(best);
          if (best === null || Math.abs(blob.size - targetBytes) < Math.abs(best.size - targetBytes)) {
            best = blob;
          }
          if (attempts >= maxAttempts) {
            resolve(best);
            return;
          }
          if (blob.size > targetBytes) {
            hi = q;
          } else {
            lo = q;
          }
          tryQuality((lo + hi) / 2);
        }, mime, q);
      }
      tryQuality((lo + hi) / 2);
    });
  }

  // Theme is applied pre-paint by an inline <head> script (see page <head>);
  // this just flips + persists it after the toggle button is clicked.
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('ts-theme', next); } catch (e) { /* private mode */ }
  }

  // Build a store-only ZIP (no compression) for multi-file downloads.
  function buildZip(entries) {
    const CRC_TABLE = (function () {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
      }
      return t;
    })();

    function crc32(data) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function u16(n) { return [n & 0xFF, (n >>> 8) & 0xFF]; }
    function u32(n) { return [n & 0xFF, (n >>> 8) & 0xFF, (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]; }

    const parts = [];
    const central = [];
    let offset = 0;

    entries.forEach((entry) => {
      const nameBytes = new TextEncoder().encode(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
      const checksum = crc32(data);
      const local = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
        ...u32(checksum),
        ...u32(data.length),
        ...u32(data.length),
        ...u16(nameBytes.length),
        0x00, 0x00,
        ...nameBytes,
        ...data,
      ]);
      parts.push(local);
      central.push({ nameBytes, data, checksum, offset });
      offset += local.length;
    });

    const centralStart = offset;
    central.forEach((c) => {
      const cd = new Uint8Array([
        0x50, 0x4B, 0x01, 0x02, 0x14, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00,
        ...u32(c.checksum),
        ...u32(c.data.length),
        ...u32(c.data.length),
        ...u16(c.nameBytes.length),
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ...u32(c.offset),
        ...c.nameBytes,
      ]);
      parts.push(cd);
      offset += cd.length;
    });

    const centralSize = offset - centralStart;
    const end = new Uint8Array([
      0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00,
      ...u16(central.length),
      ...u16(central.length),
      ...u32(centralSize),
      ...u32(centralStart),
      0x00, 0x00,
    ]);
    parts.push(end);

    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    parts.forEach((p) => { out.set(p, pos); pos += p.length; });
    return out;
  }

  global.TS = {
    formatBytes,
    percentSaved,
    setupDropZone,
    renderFilePreview,
    getOrCreatePreviewContainer,
    downloadBlob,
    loadImage,
    canvasToTargetSize,
    toggleTheme,
    buildZip,
  };
})(window);
