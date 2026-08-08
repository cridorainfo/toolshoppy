// ToolShoppy — on-device OCR via Baidu PaddleOCR PP-OCRv5 (ONNX / ffocr)
// Images never leave the browser. Model weights download once and cache locally.
(function (global) {
  'use strict';

  var FFOCR_URL = 'https://cdn.jsdelivr.net/npm/ffocr@0.1.13/+esm';
  var ocrInstance = null;
  var loadingPromise = null;

  function phaseLabel(phase) {
    switch (phase) {
      case 'loading_dictionary': return 'Loading dictionary…';
      case 'loading_detection_model': return 'Downloading detection model…';
      case 'loading_recognition_model': return 'Downloading recognition model…';
      case 'warmup': return 'Warming up OCR…';
      case 'preprocessing': return 'Preparing image…';
      case 'detecting': return 'Detecting text…';
      case 'recognizing': return 'Recognizing text…';
      default: return 'Working…';
    }
  }

  function ensureOcr(onProgress) {
    if (ocrInstance) return Promise.resolve(ocrInstance);
    if (loadingPromise) return loadingPromise;
    onProgress = onProgress || function () {};
    loadingPromise = (async function () {
      onProgress({ phase: 'loading_engine', label: 'Loading OCR engine…', pct: 5 });
      var mod;
      try {
        mod = await import(FFOCR_URL);
      } catch (e) {
        loadingPromise = null;
        throw new Error('Could not load OCR engine. Check your connection and try again.');
      }
      var create = mod.createDefaultPPOcrV5 || (mod.default && mod.default.createDefaultPPOcrV5);
      if (!create) {
        loadingPromise = null;
        throw new Error('OCR engine API missing.');
      }
      onProgress({ phase: 'init', label: 'Starting PP-OCRv5…', pct: 12 });
      // Prefer WASM so we do not need COOP/COEP headers (WebGPU/threaded WASM).
      var inst = create({
        cacheModels: true,
        providerPreference: ['wasm']
      });
      if (inst && typeof inst.then === 'function') inst = await inst;
      ocrInstance = inst;
      onProgress({ phase: 'ready', label: 'OCR ready', pct: 20 });
      return ocrInstance;
    })().catch(function (err) {
      loadingPromise = null;
      throw err;
    });
    return loadingPromise;
  }

  async function recognize(source, options) {
    options = options || {};
    var onProgress = options.onProgress || function () {};
    var ocr = await ensureOcr(onProgress);

    var result = await ocr.ocr(source, {
      onProgress: function (info) {
        info = info || {};
        var pct = 20;
        if (info.loaded != null && info.totalBytes) {
          pct = 20 + Math.round((info.loaded / info.totalBytes) * 45);
        } else if (info.phase === 'detecting') {
          pct = 70;
        } else if (info.phase === 'recognizing' && info.total) {
          pct = 70 + Math.round(((info.current || 0) / info.total) * 28);
        } else if (info.phase === 'preprocessing') {
          pct = 65;
        }
        onProgress({
          phase: info.phase,
          label: phaseLabel(info.phase),
          pct: Math.min(98, pct),
          current: info.current,
          total: info.total
        });
      }
    });

    onProgress({ phase: 'done', label: 'Done', pct: 100 });

    var lines = (result && result.lines) || [];
    var text = (result && result.text) || lines.map(function (l) { return l.text; }).join('\n');
    return {
      text: text,
      lines: lines,
      image: (result && result.image) || null,
      runtime: (result && result.runtime) || null,
      engine: 'PaddleOCR PP-OCRv5'
    };
  }

  global.TSPaddleOCR = {
    ensureOcr: ensureOcr,
    recognize: recognize,
    engineName: 'PaddleOCR PP-OCRv5 (Baidu)'
  };
})(typeof window !== 'undefined' ? window : this);
