// ToolShoppy — PDF first-page preview helper (pdf.js)
// Requires window.pdfjsLib + worker already configured by the page.
(function (global) {
  'use strict';

  var cache = new WeakMap();

  function ensureWorker() {
    if (!global.pdfjsLib) return false;
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/libs/pdf.worker.min.js';
    }
    return true;
  }

  /**
   * Render page 1 of a PDF File to a PNG data URL.
   * @param {File|Blob|Uint8Array} file
   * @param {object} [opts]
   * @param {number} [opts.maxWidth=180]
   * @param {string} [opts.password]
   * @returns {Promise<{dataUrl:string, pageCount:number, width:number, height:number}>}
   */
  function renderPdfThumb(file, opts) {
    opts = opts || {};
    var maxWidth = opts.maxWidth || 180;

    if (!ensureWorker()) {
      return Promise.reject(new Error('pdf.js not loaded'));
    }

    var cached = file && typeof file === 'object' ? cache.get(file) : null;
    if (cached) return Promise.resolve(cached);

    var dataPromise = file instanceof Uint8Array
      ? Promise.resolve(file)
      : file.arrayBuffer().then(function (buf) { return new Uint8Array(buf); });

    return dataPromise.then(function (data) {
      var params = { data: data };
      if (opts.password) params.password = opts.password;
      return pdfjsLib.getDocument(params).promise;
    }).then(function (pdf) {
      return pdf.getPage(1).then(function (page) {
        var base = page.getViewport({ scale: 1 });
        var scale = Math.min(maxWidth / base.width, 1.8);
        var viewport = page.getViewport({ scale: scale });
        var canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise
          .then(function () {
            var result = {
              dataUrl: canvas.toDataURL('image/jpeg', 0.82),
              pageCount: pdf.numPages,
              width: canvas.width,
              height: canvas.height,
            };
            if (file && typeof file === 'object') cache.set(file, result);
            return result;
          });
      });
    });
  }

  /** Lightweight placeholder when preview fails (encrypted / scan errors). */
  function placeholderThumb(label) {
    var canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 180;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 0, 140, 180);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(0.5, 0.5, 139, 179);
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(45, 50);
    ctx.lineTo(95, 50);
    ctx.lineTo(95, 115);
    ctx.lineTo(70, 130);
    ctx.lineTo(45, 115);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#64748B';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label || 'PDF', 70, 155);
    return { dataUrl: canvas.toDataURL('image/png'), pageCount: null, width: 140, height: 180 };
  }

  /**
   * Build a preview tile DOM element.
   * actions: optional HTML string for controls (reorder/remove)
   */
  function createPdfTile(file, thumb, actionsHtml, index) {
    var tile = document.createElement('div');
    tile.className = 'pdf-tile';
    tile.dataset.index = String(index);
    var name = (file && file.name) || 'document.pdf';
    var size = file && file.size != null ? (global.TS && TS.formatBytes ? TS.formatBytes(file.size) : '') : '';
    var pages = thumb && thumb.pageCount ? thumb.pageCount + (thumb.pageCount === 1 ? ' page' : ' pages') : '';
    tile.innerHTML =
      '<div class="pdf-tile-thumb">' +
        '<img alt="Preview of ' + escapeAttr(name) + '" src="' + (thumb && thumb.dataUrl ? thumb.dataUrl : '') + '">' +
        '<span class="pdf-tile-badge">PDF</span>' +
      '</div>' +
      '<div class="pdf-tile-body">' +
        '<div class="pdf-tile-name" title="' + escapeAttr(name) + '">' + escapeHtml(name) + '</div>' +
        '<div class="pdf-tile-meta">' + escapeHtml([pages, size].filter(Boolean).join(' · ')) + '</div>' +
        (actionsHtml ? '<div class="pdf-tile-actions">' + actionsHtml + '</div>' : '') +
      '</div>';
    return tile;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, '&#39;'); }

  global.TSPdfPreview = {
    renderPdfThumb: renderPdfThumb,
    placeholderThumb: placeholderThumb,
    createPdfTile: createPdfTile,
  };
})(window);
