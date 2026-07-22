// ToolShoppy — AI background removal (U^2-Netp salient-object segmentation via onnxruntime-web/WASM)
// Everything below runs fully on-device: the model file is a static asset fetched once and
// cached by the browser, and inference happens in WASM — the photo itself never leaves the page.
(function (global) {
  'use strict';

  var MODEL_URL = '/assets/models/u2netp.onnx';
  var INPUT_SIZE = 320;
  var MEAN = [0.485, 0.456, 0.406];
  var STD = [0.229, 0.224, 0.225];

  var session = null;
  var loadingPromise = null;

  function ensureOrt() {
    if (!global.ort) throw new Error('AI engine failed to load.');
    global.ort.env.wasm.wasmPaths = '/assets/libs/onnxruntime/';
    global.ort.env.wasm.numThreads = 1;
  }

  function loadSession(onProgress) {
    if (session) return Promise.resolve(session);
    if (loadingPromise) return loadingPromise;
    ensureOrt();
    onProgress = onProgress || function () {};
    loadingPromise = (async function () {
      var buf;
      try {
        var resp = await fetch(MODEL_URL);
        if (!resp.ok) throw new Error('Model download failed (' + resp.status + ')');
        var total = parseInt(resp.headers.get('Content-Length') || '0', 10);
        if (resp.body && resp.body.getReader && total) {
          var reader = resp.body.getReader();
          var chunks = [];
          var received = 0;
          for (;;) {
            var step = await reader.read();
            if (step.done) break;
            chunks.push(step.value);
            received += step.value.length;
            onProgress(Math.round((received / total) * 55));
          }
          buf = await new Blob(chunks).arrayBuffer();
        } else {
          buf = await resp.arrayBuffer();
        }
      } catch (e) {
        loadingPromise = null;
        throw e;
      }
      onProgress(60);
      session = await global.ort.InferenceSession.create(buf, { executionProviders: ['wasm'] });
      onProgress(70);
      return session;
    })();
    return loadingPromise;
  }

  function preprocess(img) {
    var canvas = document.createElement('canvas');
    canvas.width = INPUT_SIZE;
    canvas.height = INPUT_SIZE;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, INPUT_SIZE, INPUT_SIZE);
    var data = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE).data;
    var size = INPUT_SIZE * INPUT_SIZE;
    var out = new Float32Array(3 * size);
    for (var i = 0; i < size; i++) {
      out[i] = (data[i * 4] / 255 - MEAN[0]) / STD[0];
      out[size + i] = (data[i * 4 + 1] / 255 - MEAN[1]) / STD[1];
      out[2 * size + i] = (data[i * 4 + 2] / 255 - MEAN[2]) / STD[2];
    }
    return new global.ort.Tensor('float32', out, [1, 3, INPUT_SIZE, INPUT_SIZE]);
  }

  // Sharpen the raw saliency curve so confident background/foreground pixels
  // snap to fully transparent/opaque instead of leaving a hazy semi-transparent band.
  function sharpen(v) {
    var lo = 0.08, hi = 0.9;
    if (v <= lo) return 0;
    if (v >= hi) return 1;
    var t = (v - lo) / (hi - lo);
    return t * t * (3 - 2 * t);
  }

  function maskToAlphaCanvas(norm, size, targetW, targetH) {
    var small = document.createElement('canvas');
    small.width = size;
    small.height = size;
    var sctx = small.getContext('2d');
    var imgData = sctx.createImageData(size, size);
    for (var i = 0; i < size * size; i++) {
      var v = Math.max(0, Math.min(255, Math.round(sharpen(norm[i]) * 255)));
      imgData.data[i * 4] = v;
      imgData.data[i * 4 + 1] = v;
      imgData.data[i * 4 + 2] = v;
      imgData.data[i * 4 + 3] = 255;
    }
    sctx.putImageData(imgData, 0, 0);
    var big = document.createElement('canvas');
    big.width = targetW;
    big.height = targetH;
    var bctx = big.getContext('2d');
    bctx.imageSmoothingEnabled = true;
    bctx.imageSmoothingQuality = 'high';
    bctx.drawImage(small, 0, 0, targetW, targetH);
    return bctx.getImageData(0, 0, targetW, targetH).data;
  }

  // Separable box blur restricted to the alpha channel — O(w*h) regardless of radius.
  function featherAlpha(data, w, h, radius) {
    if (radius <= 0) return;
    var tmp = new Float32Array(w * h);
    var win = radius * 2 + 1;
    for (var y = 0; y < h; y++) {
      var rowOff = y * w;
      var acc = 0;
      for (var x = -radius; x <= radius; x++) {
        acc += data[(rowOff + Math.min(w - 1, Math.max(0, x))) * 4 + 3];
      }
      for (var x2 = 0; x2 < w; x2++) {
        tmp[rowOff + x2] = acc / win;
        var addX = Math.min(w - 1, x2 + radius + 1);
        var subX = Math.max(0, x2 - radius);
        acc += data[(rowOff + addX) * 4 + 3] - data[(rowOff + subX) * 4 + 3];
      }
    }
    var tmp2 = new Float32Array(w * h);
    for (var x = 0; x < w; x++) {
      var acc2 = 0;
      for (var y = -radius; y <= radius; y++) {
        acc2 += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      }
      for (var y2 = 0; y2 < h; y2++) {
        tmp2[y2 * w + x] = acc2 / win;
        var addY = Math.min(h - 1, y2 + radius + 1);
        var subY = Math.max(0, y2 - radius);
        acc2 += tmp[addY * w + x] - tmp[subY * w + x];
      }
    }
    for (var p = 0; p < w * h; p++) data[p * 4 + 3] = Math.round(tmp2[p]);
  }

  // Runs the neural net once — the expensive step. Returns a reusable mask
  // so the UI can re-composite (e.g. when the edge-softness slider moves)
  // without paying for inference again.
  async function segment(img, onProgress) {
    onProgress = onProgress || function () {};
    await loadSession(onProgress);
    var tensor = preprocess(img);
    onProgress(75);
    var feeds = {};
    feeds[session.inputNames[0]] = tensor;
    var results = await session.run(feeds);
    var mask = results[session.outputNames[0]].data;
    onProgress(88);

    var min = Infinity, max = -Infinity;
    for (var i = 0; i < mask.length; i++) {
      if (mask[i] < min) min = mask[i];
      if (mask[i] > max) max = mask[i];
    }
    var range = (max - min) || 1;
    var norm = new Float32Array(mask.length);
    for (var j = 0; j < mask.length; j++) norm[j] = (mask[j] - min) / range;
    onProgress(90);
    return { img: img, norm: norm, W: img.naturalWidth, H: img.naturalHeight };
  }

  // Cheap re-composite from an already-computed mask (feather is just a canvas blur).
  function compose(seg, feather) {
    var W = seg.W, H = seg.H;
    var alphaData = maskToAlphaCanvas(seg.norm, INPUT_SIZE, W, H);
    featherAlpha(alphaData, W, H, feather != null ? feather : 2);
    var outCanvas = document.createElement('canvas');
    outCanvas.width = W;
    outCanvas.height = H;
    var octx = outCanvas.getContext('2d');
    octx.drawImage(seg.img, 0, 0, W, H);
    var imgData = octx.getImageData(0, 0, W, H);
    var d = imgData.data;
    for (var p = 0; p < W * H; p++) d[p * 4 + 3] = alphaData[p * 4];
    octx.putImageData(imgData, 0, 0);
    return outCanvas;
  }

  async function removeBackground(img, opts) {
    opts = opts || {};
    var seg = await segment(img, opts.onProgress);
    var canvas = compose(seg, opts.feather);
    if (opts.onProgress) opts.onProgress(100);
    return canvas;
  }

  global.TSBgRemove = {
    removeBackground: removeBackground,
    segment: segment,
    compose: compose,
    loadSession: loadSession,
  };
})(window);
