import { COMMON_JS, BTN_ROW } from './common.mjs';

const RATIOS = [
  ['free', 'Free'], ['1', '1:1'], ['1.3333333', '4:3'], ['0.75', '3:4'], ['1.5', '3:2'],
  ['1.7777778', '16:9'], ['0.5625', '9:16'], ['0.7777778', '35×45 mm (passport)'],
];

export default {
  path: '/tools/image/crop/',
  trail: [{ name: 'Image Tools', href: '/tools/image/' }],
  crumbName: 'Crop Image',
  title: 'Crop Image Online Free | Crop, Rotate, Flip Photos | ToolShoppy',
  description: 'Free online image cropper. Crop photos to any size or a fixed ratio (1:1, 4:3, 16:9, passport), rotate and flip, then download JPG, PNG or WebP. Private — nothing is uploaded.',
  name: 'Image Cropper',
  h1: 'Crop Image Online',
  intro: 'Drag to crop a photo to any shape or a fixed ratio, rotate or flip it, and download it as JPG, PNG or WebP. Your picture is edited in your browser and never uploaded.',
  keywords: 'crop image online, image cropper, crop photo, crop picture, rotate image, crop image to square, crop passport photo',
  icon: 'cut', tile: 'violet',
  trust: 'Your files never leave your device',
  howToTitle: 'How to crop an image online',
  steps: [
    'Select a photo, or drop it onto the box. Pasting an image with Ctrl+V works too.',
    'Pick a ratio such as 1:1 or 16:9, or leave it on <strong>Free</strong>. Drag the box to move it and drag a corner to resize it.',
    'Use the numbers to set an exact position and size in pixels, and the buttons to rotate or flip.',
    'Choose a format and press <strong>Download cropped image</strong>.',
  ],
  layoutId: 'cropLayout',
  toolHtml: `      <div class="drop-zone" id="cropDrop">
        <div class="icon"><span class="icon-tile icon-tile--sm icon-tile--violet"><svg class="icon-svg" width="24" height="24" aria-hidden="true"><use href="/assets/icons/sprite.svg#upload"></use></svg></span></div>
        <div class="dz-cta">Select an image</div>
        <p>or drop here · paste works too (Ctrl+V)</p>
        <p class="drop-zone-hint">JPG, PNG, WebP, GIF and more</p>
        <input type="file" id="cropFile" accept="image/*">
      </div>
      <div id="cropUi" style="display:none;margin-top:16px;">
        <div class="chip-row" id="cropRatios" role="group" aria-label="Crop shape">
${RATIOS.map(([v, label], i) => `          <button class="chip${i === 0 ? ' active' : ''}" type="button" data-ratio="${v}">${label}</button>`).join('\n')}
        </div>
        <div id="cropStage" style="position:relative;line-height:0;margin:12px 0;background:#0f172a;border-radius:12px;overflow:hidden;touch-action:none;">
          <canvas id="cropView" aria-label="Image with crop area. Drag the box to move it or a corner to resize it." style="width:100%;height:auto;display:block;cursor:move;touch-action:none;"></canvas>
        </div>
        <div style="${BTN_ROW}margin-top:0;">
          <button class="btn" id="cropRotL" type="button">⟲ Rotate left</button>
          <button class="btn" id="cropRotR" type="button">⟳ Rotate right</button>
          <button class="btn" id="cropFlipH" type="button">⇋ Flip horizontal</button>
          <button class="btn" id="cropFlipV" type="button">⇅ Flip vertical</button>
          <button class="btn" id="cropReset" type="button">Reset</button>
        </div>
        <div class="calc-row" style="grid-template-columns:repeat(4,1fr);gap:8px;">
          <div class="calc-field" style="margin-bottom:8px;"><label for="cropX">X</label><input type="number" id="cropX" min="0" step="1" inputmode="numeric"></div>
          <div class="calc-field" style="margin-bottom:8px;"><label for="cropY">Y</label><input type="number" id="cropY" min="0" step="1" inputmode="numeric"></div>
          <div class="calc-field" style="margin-bottom:8px;"><label for="cropW">Width</label><input type="number" id="cropW" min="1" step="1" inputmode="numeric"></div>
          <div class="calc-field" style="margin-bottom:8px;"><label for="cropH">Height</label><input type="number" id="cropH" min="1" step="1" inputmode="numeric"></div>
        </div>
        <div class="calc-row">
          <div class="calc-field"><label for="cropFmt">Format</label>
            <select id="cropFmt"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></div>
          <div class="calc-field" id="cropQWrap"><label for="cropQ">Quality: <span id="cropQVal">92</span>%</label><input type="range" id="cropQ" min="40" max="100" value="92"></div>
        </div>
        <div class="stat-pills">
          <span class="stat-pill">Original<strong id="cropOrig">—</strong></span>
          <span class="stat-pill">Crop<strong id="cropSize">—</strong></span>
        </div>
        <button class="btn btn-accent btn-block" id="cropDownload" type="button" style="margin-top:12px;">Download cropped image</button>
        <p id="cropMsg" role="status" style="margin-top:8px;font-size:0.85rem;color:var(--text-muted);min-height:1.3em;"></p>
      </div>`,
  sidebarHtml: `      <div class="info-box">
        <p><strong>Crop vs resize</strong></p>
        <ul>
          <li>Crop removes parts of the picture</li>
          <li>Resize changes its pixel size</li>
          <li>Compress lowers the file size in KB</li>
        </ul>
        <p style="margin-top:8px;"><a href="/tools/image/resize/">Resize</a> · <a href="/tools/image/compress/">Compress</a> · <a href="/tools/image/passport-photo/">Passport photo</a></p>
      </div>`,
  sections: [
    ['Crop, resize or compress: which do you need?', `<p><strong>Cropping</strong> cuts away the edges of a picture to change its framing or shape, for example to make a square profile photo or remove empty background. The cropped area keeps its original pixels, so the result has fewer pixels than the original. <strong>Resizing</strong> scales the whole picture to different pixel dimensions (use the <a href="/tools/image/resize/">image resizer</a>), and <strong>compressing</strong> lowers the file size in KB by reducing quality (use the <a href="/tools/image/compress/">image compressor</a>).</p><p>A common workflow for a form upload is to crop first to the right shape, resize to the pixel size the form asks for, then compress to the KB limit.</p>`],
    ['Common crop ratios and what they are for', `<ul class="guide-list"><li><strong>1:1 (square)</strong> — profile pictures and many social posts.</li><li><strong>4:3 and 3:2</strong> — typical camera and print proportions.</li><li><strong>16:9</strong> — video thumbnails, banners and slides; <strong>9:16</strong> — stories and reels.</li><li><strong>35×45 mm (7:9)</strong> — a common passport-photo proportion. Check your application’s exact size, background and head-position rules; for India, UAE and US photos use the <a href="/tools/image/passport-photo/">passport photo maker</a>.</li></ul>`],
    ['Quality, formats and privacy', `<p>Cropping happens on a canvas in your browser at the picture’s full resolution, so the crop is not scaled down. JPG is smallest for photos, PNG keeps sharp edges and transparency, and WebP is small with transparency support in modern browsers. If you save a transparent PNG as JPG, the transparent area becomes white. Your image is never uploaded; it is read on your device and discarded when you close the page.</p>`],
  ],
  faqs: [
    ['How do I crop an image to a square?', 'Select your image, choose the 1:1 ratio, drag the box to frame what you want and press Download. The crop keeps the original pixel quality.'],
    ['Can I crop to an exact size in pixels?', 'Yes. Use the X, Y, Width and Height boxes to set the exact position and size in pixels. With a ratio selected, changing the width updates the height to match.'],
    ['Does cropping reduce image quality?', 'No. Cropping keeps the original pixels inside the box. Quality only drops if you save as JPG or WebP at a lower quality setting; use the slider to control that.'],
    ['Can I rotate or flip the picture as well?', 'Yes. Rotate left or right in 90° steps, or flip horizontally or vertically, before cropping. The crop box resets after each change.'],
    ['Is my photo uploaded to a server?', 'No. The picture is cropped on your device using your browser and is never sent to ToolShoppy.'],
  ],
  related: [
    { href: '/tools/image/resize/', title: 'Image Resizer', desc: 'Resize by pixels or percentage', icon: 'ruler-2', tile: 'violet' },
    { href: '/tools/image/compress/', title: 'Compress Image', desc: 'Reach an exact KB size', icon: 'arrows-minimize', tile: 'indigo' },
    { href: '/tools/image/passport-photo/', title: 'Passport Photo Maker', desc: 'India, UAE, US & UK', icon: 'photo', tile: 'blue' },
    { href: '/tools/image/convert/', title: 'Image Converter', desc: 'HEIC, PNG, JPG, WebP', icon: 'refresh', tile: 'cyan' },
  ],
  inlineScript: String.raw`(function () {${COMMON_JS}
  var view = $('cropView'), ctx = view.getContext('2d');
  var work = null;            // canvas holding the (rotated/flipped) full-resolution image
  var original = null;        // untouched decoded image source for Reset
  var rect = { x: 0, y: 0, w: 1, h: 1 };
  var ratio = null;           // width / height, or null for free
  var baseName = 'image';
  var drag = null, used = false;
  var HANDLE = 16;            // handle hit size in CSS pixels

  function scale() { return work.width / view.getBoundingClientRect().width; }

  function draw() {
    if (!work) return;
    var maxW = 1200;
    var vw = Math.min(work.width, maxW), vh = Math.round(work.height * vw / work.width);
    if (view.width !== vw || view.height !== vh) { view.width = vw; view.height = vh; }
    var k = vw / work.width;
    ctx.clearRect(0, 0, vw, vh);
    ctx.drawImage(work, 0, 0, vw, vh);
    ctx.fillStyle = 'rgba(15,23,42,0.58)';
    ctx.fillRect(0, 0, vw, vh);
    var rx = rect.x * k, ry = rect.y * k, rw = rect.w * k, rh = rect.h * k;
    ctx.drawImage(work, rect.x, rect.y, rect.w, rect.h, rx, ry, rw, rh);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 1; i < 3; i++) {
      ctx.moveTo(rx + rw * i / 3, ry); ctx.lineTo(rx + rw * i / 3, ry + rh);
      ctx.moveTo(rx, ry + rh * i / 3); ctx.lineTo(rx + rw, ry + rh * i / 3);
    }
    ctx.stroke();
    // corner handles, sized in CSS pixels so they stay easy to grab on phones
    var hs = HANDLE * (vw / view.getBoundingClientRect().width) / 2;
    ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]].forEach(function (p) {
      ctx.beginPath(); ctx.rect(p[0] - hs, p[1] - hs, hs * 2, hs * 2); ctx.fill(); ctx.stroke();
    });
    $('cropX').value = rect.x; $('cropY').value = rect.y; $('cropW').value = rect.w; $('cropH').value = rect.h;
    $('cropSize').textContent = rect.w + ' × ' + rect.h + ' px';
    $('cropOrig').textContent = work.width + ' × ' + work.height + ' px';
  }

  function resetRect() {
    rect = ratio ? TSLib.fitAspect(work.width, work.height, ratio) : { x: 0, y: 0, w: work.width, h: work.height };
  }
  function setWork(canvas) { work = canvas; resetRect(); draw(); }

  function transform(kind) {
    var w = work.width, h = work.height, c = document.createElement('canvas'), g;
    if (kind === 'L' || kind === 'R') { c.width = h; c.height = w; } else { c.width = w; c.height = h; }
    g = c.getContext('2d');
    if (kind === 'R') { g.translate(h, 0); g.rotate(Math.PI / 2); }
    else if (kind === 'L') { g.translate(0, w); g.rotate(-Math.PI / 2); }
    else if (kind === 'H') { g.translate(w, 0); g.scale(-1, 1); }
    else if (kind === 'V') { g.translate(0, h); g.scale(1, -1); }
    g.drawImage(work, 0, 0);
    setWork(c);
  }

  function load(file) {
    if (!file || (file.type && file.type.indexOf('image/') !== 0)) return;
    baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    var done = function (src, w, h) {
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(src, 0, 0);
      original = c;
      var copy = document.createElement('canvas'); copy.width = w; copy.height = h; copy.getContext('2d').drawImage(c, 0, 0);
      $('cropUi').style.display = 'block';
      $('cropLayout').classList.add('is-active');
      setWork(copy);
      $('cropMsg').textContent = '';
      if (!used) { used = true; track('image-crop'); }
    };
    var fail = function () { alert('This image could not be read. Try a JPG, PNG or WebP file.'); };
    if (window.createImageBitmap) {
      createImageBitmap(file).then(function (bmp) { done(bmp, bmp.width, bmp.height); }, function () {
        TS.loadImage(file).then(function (r) { done(r.img, r.img.naturalWidth, r.img.naturalHeight); }, fail);
      });
    } else {
      TS.loadImage(file).then(function (r) { done(r.img, r.img.naturalWidth, r.img.naturalHeight); }, fail);
    }
  }

  // ----- pointer interaction -----
  function pointerImg(e) {
    var b = view.getBoundingClientRect(), s = work.width / b.width;
    return { x: (e.clientX - b.left) * s, y: (e.clientY - b.top) * s, s: s };
  }
  function hit(p) {
    var tol = HANDLE * p.s;
    var corners = { nw: [rect.x, rect.y], ne: [rect.x + rect.w, rect.y], sw: [rect.x, rect.y + rect.h], se: [rect.x + rect.w, rect.y + rect.h] };
    for (var k in corners) {
      if (Math.abs(p.x - corners[k][0]) <= tol && Math.abs(p.y - corners[k][1]) <= tol) return k;
    }
    if (p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h) return 'move';
    return null;
  }
  view.addEventListener('pointerdown', function (e) {
    if (!work) return;
    var p = pointerImg(e), h = hit(p);
    if (!h) return;
    view.setPointerCapture(e.pointerId);
    var opposite = { nw: [rect.x + rect.w, rect.y + rect.h], ne: [rect.x, rect.y + rect.h], sw: [rect.x + rect.w, rect.y], se: [rect.x, rect.y] };
    drag = { mode: h, sx: p.x, sy: p.y, start: { x: rect.x, y: rect.y, w: rect.w, h: rect.h }, anchor: opposite[h] };
    e.preventDefault();
  });
  view.addEventListener('pointermove', function (e) {
    if (!work) return;
    var p = pointerImg(e);
    if (!drag) {
      var h = hit(p);
      view.style.cursor = h === 'nw' || h === 'se' ? 'nwse-resize' : h === 'ne' || h === 'sw' ? 'nesw-resize' : h === 'move' ? 'move' : 'default';
      return;
    }
    if (drag.mode === 'move') {
      rect = TSLib.clampRect({ x: drag.start.x + (p.x - drag.sx), y: drag.start.y + (p.y - drag.sy), w: drag.start.w, h: drag.start.h }, work.width, work.height);
    } else {
      var ax = drag.anchor[0], ay = drag.anchor[1];
      var px = Math.max(0, Math.min(work.width, p.x)), py = Math.max(0, Math.min(work.height, p.y));
      var w = Math.abs(px - ax), h2 = Math.abs(py - ay);
      if (ratio) {
        var maxW = px >= ax ? work.width - ax : ax, maxH = py >= ay ? work.height - ay : ay;
        w = Math.min(Math.max(w, h2 * ratio), maxW, maxH * ratio);
        h2 = w / ratio;
      }
      w = Math.max(10, w); h2 = Math.max(10, ratio ? w / ratio : h2);
      rect = TSLib.clampRect({ x: px >= ax ? ax : ax - w, y: py >= ay ? ay : ay - h2, w: w, h: h2 }, work.width, work.height, 10);
    }
    draw();
  });
  function endDrag() { drag = null; }
  view.addEventListener('pointerup', endDrag);
  view.addEventListener('pointercancel', endDrag);

  // ----- numeric inputs -----
  ['cropX', 'cropY', 'cropW', 'cropH'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      if (!work) return;
      var r = { x: +$('cropX').value || 0, y: +$('cropY').value || 0, w: +$('cropW').value || 1, h: +$('cropH').value || 1 };
      if (ratio && id === 'cropW') r.h = r.w / ratio;
      else if (ratio && id === 'cropH') r.w = r.h * ratio;
      rect = TSLib.clampRect(r, work.width, work.height);
      draw();
    });
  });

  $('cropRatios').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-ratio]');
    if (!chip || !work) return;
    var v = chip.getAttribute('data-ratio');
    ratio = v === 'free' ? null : parseFloat(v);
    $('cropRatios').querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
    if (ratio) rect = TSLib.fitAspect(work.width, work.height, ratio);
    draw();
  });
  $('cropRotL').addEventListener('click', function () { transform('L'); });
  $('cropRotR').addEventListener('click', function () { transform('R'); });
  $('cropFlipH').addEventListener('click', function () { transform('H'); });
  $('cropFlipV').addEventListener('click', function () { transform('V'); });
  $('cropReset').addEventListener('click', function () {
    if (!original) return;
    var c = document.createElement('canvas'); c.width = original.width; c.height = original.height; c.getContext('2d').drawImage(original, 0, 0);
    setWork(c);
  });
  $('cropFmt').addEventListener('change', function () { $('cropQWrap').style.display = $('cropFmt').value === 'image/png' ? 'none' : ''; });
  $('cropQ').addEventListener('input', function () { $('cropQVal').textContent = $('cropQ').value; });

  $('cropDownload').addEventListener('click', function () {
    if (!work) return;
    var mime = $('cropFmt').value, ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    var out = document.createElement('canvas'); out.width = rect.w; out.height = rect.h;
    var g = out.getContext('2d');
    if (mime === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, out.width, out.height); }
    g.drawImage(work, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    out.toBlob(function (blob) {
      if (!blob) { $('cropMsg').textContent = 'Could not create the image. Try a smaller crop or another format.'; return; }
      TS.downloadBlob(blob, baseName + '-cropped.' + ext);
      $('cropMsg').textContent = 'Downloaded ' + rect.w + ' × ' + rect.h + ' px · ' + TS.formatBytes(blob.size);
      track('image-crop', { action: 'download', format: ext });
    }, mime, mime === 'image/png' ? undefined : $('cropQ').value / 100);
  });

  TS.setupDropZone($('cropDrop'), $('cropFile'), function (files) { load(files[0]); }, { preview: false });
  window.addEventListener('resize', draw);
})();`,
  scripts: ['<script src="/assets/js/tools-lib.js?v=1"></script>'],
};
