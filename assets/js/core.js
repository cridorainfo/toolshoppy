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

  // Wires drag & drop + click-to-browse + paste on a drop-zone element.
  // onFiles receives a FileList/array of File objects.
  function setupDropZone(zoneEl, inputEl, onFiles) {
    if (!zoneEl || !inputEl) return;

    zoneEl.addEventListener('click', () => inputEl.click());

    inputEl.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) onFiles(Array.from(e.target.files));
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
      if (files && files.length) onFiles(Array.from(files));
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
      if (files.length) onFiles(files);
    });
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

  global.TS = {
    formatBytes,
    percentSaved,
    setupDropZone,
    downloadBlob,
    loadImage,
    canvasToTargetSize,
  };
})(window);
