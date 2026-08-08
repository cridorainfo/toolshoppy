// ToolShoppy — PDF → Excel table extraction (client-side, accounting-oriented)
// Uses PDF.js text positions to rebuild rows/columns, then SheetJS writes .xlsx.
(function (global) {
  'use strict';

  var ROW_Y_TOL = 3.5;
  var COL_GAP_MIN = 12;
  var NUM_RE = /^[(\[]?-?\$?\s*-?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?[)\]]?$|^[(\[]?-?\d+(?:\.\d+)?%?[)\]]?$/;
  var CURRENCY_RE = /^(?:INR|USD|AED|SAR|EUR|GBP|Rs\.?|₹|\$|€|£)\s*/i;

  function itemBox(item) {
    var t = item.transform || [1, 0, 0, 1, 0, 0];
    var x = t[4] || 0;
    var y = t[5] || 0;
    var h = Math.abs(t[3] || t[0] || 10) || 10;
    var w = item.width != null ? item.width : (item.str || '').length * h * 0.5;
    return { text: String(item.str || ''), x: x, y: y, w: w, h: h, x2: x + w };
  }

  function clusterRows(boxes) {
    if (!boxes.length) return [];
    var sorted = boxes.slice().sort(function (a, b) {
      if (Math.abs(b.y - a.y) > ROW_Y_TOL) return b.y - a.y;
      return a.x - b.x;
    });
    var rows = [];
    var cur = null;
    sorted.forEach(function (b) {
      if (!cur || Math.abs(cur.y - b.y) > ROW_Y_TOL) {
        cur = { y: b.y, items: [b] };
        rows.push(cur);
      } else {
        cur.items.push(b);
        cur.y = (cur.y * (cur.items.length - 1) + b.y) / cur.items.length;
      }
    });
    rows.forEach(function (r) {
      r.items.sort(function (a, b) { return a.x - b.x; });
    });
    return rows;
  }

  function mergeAdjacent(items) {
    if (!items.length) return [];
    var out = [];
    var cur = {
      text: items[0].text,
      x: items[0].x,
      y: items[0].y,
      x2: items[0].x2,
      h: items[0].h
    };
    for (var i = 1; i < items.length; i++) {
      var n = items[i];
      var gap = n.x - cur.x2;
      if (gap < Math.max(2, cur.h * 0.35)) {
        var space = gap > 0.8 ? ' ' : '';
        cur.text += space + n.text;
        cur.x2 = Math.max(cur.x2, n.x2);
      } else {
        out.push(cur);
        cur = { text: n.text, x: n.x, y: n.y, x2: n.x2, h: n.h };
      }
    }
    out.push(cur);
    return out;
  }

  function inferColumns(rows) {
    var centers = [];
    rows.forEach(function (r) {
      mergeAdjacent(r.items).forEach(function (c) {
        centers.push((c.x + c.x2) / 2);
      });
    });
    if (!centers.length) return [];
    centers.sort(function (a, b) { return a - b; });
    var clusters = [{ sum: centers[0], n: 1, min: centers[0], max: centers[0] }];
    for (var i = 1; i < centers.length; i++) {
      var x = centers[i];
      var last = clusters[clusters.length - 1];
      var mean = last.sum / last.n;
      if (x - mean < COL_GAP_MIN * 2.2 && x - last.max < COL_GAP_MIN * 3) {
        last.sum += x;
        last.n += 1;
        last.max = x;
      } else {
        clusters.push({ sum: x, n: 1, min: x, max: x });
      }
    }
    return clusters.map(function (c) { return c.sum / c.n; });
  }

  function assignToColumns(cells, colCenters) {
    if (!colCenters.length) return cells.map(function (c) { return c.text.trim(); });
    var row = new Array(colCenters.length).fill('');
    cells.forEach(function (c) {
      var mid = (c.x + c.x2) / 2;
      var best = 0;
      var bestD = Infinity;
      for (var i = 0; i < colCenters.length; i++) {
        var d = Math.abs(mid - colCenters[i]);
        if (d < bestD) { bestD = d; best = i; }
      }
      row[best] = row[best] ? (row[best] + ' ' + c.text.trim()) : c.text.trim();
    });
    return row;
  }

  function coerceCell(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return '';
    var cleaned = s.replace(CURRENCY_RE, '').replace(/,/g, '').replace(/[()]/g, function (m) {
      return m === '(' ? '-' : '';
    }).replace(/[\[\]]/g, '').trim();
    if (NUM_RE.test(s.replace(CURRENCY_RE, '').trim()) || NUM_RE.test(cleaned)) {
      var n = parseFloat(cleaned.replace(/%$/, ''));
      if (!isNaN(n) && isFinite(n)) return n;
    }
    return s;
  }

  function rowsLookTabular(matrix) {
    if (matrix.length < 2) return false;
    var widths = matrix.map(function (r) { return r.filter(Boolean).length; });
    var max = Math.max.apply(null, widths);
    if (max < 2) return false;
    var multi = widths.filter(function (w) { return w >= 2; }).length;
    return multi >= Math.max(2, Math.floor(matrix.length * 0.35));
  }

  function pageToMatrix(textContent, mode) {
    var boxes = (textContent.items || [])
      .filter(function (it) { return it && String(it.str || '').trim(); })
      .map(itemBox);
    var rows = clusterRows(boxes);
    if (!rows.length) return [];

    if (mode === 'lines') {
      return rows.map(function (r) {
        return [mergeAdjacent(r.items).map(function (c) { return c.text.trim(); }).join(' ')];
      });
    }

    var colCenters = inferColumns(rows);
    var matrix = rows.map(function (r) {
      var cells = mergeAdjacent(r.items);
      if (mode === 'auto' && colCenters.length >= 2) {
        return assignToColumns(cells, colCenters);
      }
      // fallback: split on large gaps within the row
      if (cells.length <= 1) return [cells[0] ? cells[0].text.trim() : ''];
      var out = [];
      var buf = cells[0].text.trim();
      for (var i = 1; i < cells.length; i++) {
        var gap = cells[i].x - cells[i - 1].x2;
        if (gap >= COL_GAP_MIN) {
          out.push(buf);
          buf = cells[i].text.trim();
        } else {
          buf += (gap > 1 ? ' ' : '') + cells[i].text.trim();
        }
      }
      out.push(buf);
      return out;
    });

    if (mode === 'auto' && !rowsLookTabular(matrix)) {
      return rows.map(function (r) {
        return [mergeAdjacent(r.items).map(function (c) { return c.text.trim(); }).join(' ')];
      });
    }
    return matrix;
  }

  function normalizeMatrix(matrix) {
    var maxCols = 0;
    matrix.forEach(function (r) { if (r.length > maxCols) maxCols = r.length; });
    return matrix.map(function (r) {
      var copy = r.slice();
      while (copy.length < maxCols) copy.push('');
      return copy.map(coerceCell);
    });
  }

  function sheetName(base, i, total) {
    var name = total > 1 ? (base + ' p' + (i + 1)) : base;
    return String(name).replace(/[\\/?*\[\]]/g, ' ').slice(0, 31) || ('Sheet' + (i + 1));
  }

  async function pdfFileToWorkbook(file, options) {
    options = options || {};
    var mode = options.mode || 'auto';
    var oneSheet = !!options.oneSheet;
    var onProgress = options.onProgress || function () {};
    if (!global.pdfjsLib) throw new Error('PDF engine failed to load.');
    if (!global.XLSX) throw new Error('Excel engine failed to load.');

    var data = new Uint8Array(await file.arrayBuffer());
    var pdf = await global.pdfjsLib.getDocument({ data: data }).promise;
    var sheets = [];
    var combined = [];
    var base = (file.name || 'statement').replace(/\.pdf$/i, '') || 'PDF';

    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var content = await page.getTextContent();
      var matrix = normalizeMatrix(pageToMatrix(content, mode));
      if (!matrix.length) matrix = [['(No extractable text on this page)']];
      if (oneSheet) {
        if (pdf.numPages > 1) {
          combined.push(['— Page ' + i + ' —']);
        }
        matrix.forEach(function (row) { combined.push(row); });
        if (i < pdf.numPages) combined.push([]);
      } else {
        sheets.push({ name: sheetName(base, i - 1, pdf.numPages), rows: matrix });
      }
      onProgress(Math.round((i / pdf.numPages) * 90));
    }

    var wb = global.XLSX.utils.book_new();
    if (oneSheet) {
      var ws = global.XLSX.utils.aoa_to_sheet(combined.length ? combined : [['']]);
      global.XLSX.utils.book_append_sheet(wb, ws, sheetName(base, 0, 1));
    } else {
      sheets.forEach(function (s) {
        var ws2 = global.XLSX.utils.aoa_to_sheet(s.rows);
        var unique = s.name;
        var n = 2;
        while (wb.SheetNames.indexOf(unique) >= 0) {
          unique = (s.name.slice(0, 28) + '_' + n).slice(0, 31);
          n++;
        }
        global.XLSX.utils.book_append_sheet(wb, ws2, unique);
      });
    }

    var out = global.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    onProgress(100);
    return {
      blob: new Blob([out], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      pages: pdf.numPages,
      sheets: oneSheet ? 1 : sheets.length
    };
  }

  global.TSPdfExcel = {
    pdfFileToWorkbook: pdfFileToWorkbook,
    coerceCell: coerceCell
  };
})(typeof window !== 'undefined' ? window : this);
