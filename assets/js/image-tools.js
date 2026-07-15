// ToolShoppy — shared image canvas utilities
(function (global) {
  'use strict';

  function coverFitRect(sw, sh, tw, th) {
    var tr = tw / th, sr = sw / sh, sx, sy, sww, shh;
    if (sr > tr) {
      shh = sh; sww = shh * tr; sx = (sw - sww) / 2; sy = 0;
    } else {
      sww = sw; shh = sww / tr; sx = 0; sy = (sh - shh) / 2;
    }
    return { sx: sx, sy: sy, sw: sww, sh: shh };
  }

  function drawCoverFit(ctx, img, w, h) {
    var r = coverFitRect(img.naturalWidth, img.naturalHeight, w, h);
    ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, w, h);
  }

  function sampleCorners(imgData, w, h) {
    var d = imgData.data, samples = [];
    function px(x, y) {
      var i = (y * w + x) * 4;
      return [d[i], d[i + 1], d[i + 2]];
    }
    samples.push(px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1));
    var r = 0, g = 0, b = 0;
    samples.forEach(function (s) { r += s[0]; g += s[1]; b += s[2]; });
    return [Math.round(r / 4), Math.round(g / 4), Math.round(b / 4)];
  }

  function colorDist(a, b) {
    return Math.sqrt(
      (a[0] - b[0]) * (a[0] - b[0]) +
      (a[1] - b[1]) * (a[1] - b[1]) +
      (a[2] - b[2]) * (a[2] - b[2])
    );
  }

  function removeSolidBackground(img, opts) {
    opts = opts || {};
    var tolerance = opts.tolerance != null ? opts.tolerance : 40;
    var feather = opts.feather != null ? opts.feather : 8;
    var canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var bg = opts.bgColor || sampleCorners(imgData, canvas.width, canvas.height);
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
      var dist = colorDist([data[i], data[i + 1], data[i + 2]], bg);
      if (dist <= tolerance) {
        data[i + 3] = 0;
      } else if (dist <= tolerance + feather) {
        var alpha = Math.round(255 * (dist - tolerance) / feather);
        data[i + 3] = Math.min(data[i + 3], alpha);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  function unsharpMask(ctx, w, h, amount) {
    amount = amount || 0.6;
    var imgData = ctx.getImageData(0, 0, w, h);
    var src = imgData.data;
    var out = new Uint8ClampedArray(src.length);
    var kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        for (var c = 0; c < 3; c++) {
          var sum = 0, ki = 0;
          for (var ky = -1; ky <= 1; ky++) {
            for (var kx = -1; kx <= 1; kx++) {
              var idx = ((y + ky) * w + (x + kx)) * 4 + c;
              sum += src[idx] * kernel[ki++];
            }
          }
          var orig = src[(y * w + x) * 4 + c];
          var val = orig + amount * (sum - orig);
          out[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, val));
        }
        out[(y * w + x) * 4 + 3] = src[(y * w + x) * 4 + 3];
      }
    }
    for (var i = 0; i < src.length; i++) imgData.data[i] = out[i] || src[i];
    ctx.putImageData(imgData, 0, 0);
  }

  function upscaleImage(img, scale) {
    var w = Math.round(img.naturalWidth * scale);
    var h = Math.round(img.naturalHeight * scale);
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    unsharpMask(ctx, w, h, 0.45);
    return canvas;
  }

  function makeSticker(img, size, maxBytes) {
    size = size || 512;
    maxBytes = maxBytes || 100 * 1024;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    drawCoverFit(ctx, img, size, size);
    return global.TS.canvasToTargetSize(canvas, maxBytes, 'image/webp').then(function (webp) {
      if (webp && webp.size <= maxBytes) return webp;
      return global.TS.canvasToTargetSize(canvas, maxBytes, 'image/png');
    });
  }

  function passportCanvas(img, preset, bgColor) {
    var canvas = document.createElement('canvas');
    canvas.width = preset.w;
    canvas.height = preset.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCoverFit(ctx, img, canvas.width, canvas.height);
    return canvas;
  }

  global.TSImage = {
    coverFitRect: coverFitRect,
    drawCoverFit: drawCoverFit,
    removeSolidBackground: removeSolidBackground,
    upscaleImage: upscaleImage,
    makeSticker: makeSticker,
    passportCanvas: passportCanvas,
  };
})(window);
