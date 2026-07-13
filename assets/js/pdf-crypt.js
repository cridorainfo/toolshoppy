// ToolShoppy — PDF Standard Security Handler (V4/R4, AES-128/AESV2)
// Implements the encryption side of ISO 32000-1 section 7.6 so an existing
// PDF (already normalized by pdf-lib into a classic, non-object-stream file)
// can be password protected entirely in the browser. Requires pdf-lib to be
// loaded first (window.PDFLib) to normalize arbitrary input PDFs.
(function (global) {
  'use strict';

  const PAD = new Uint8Array([
    0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
    0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
    0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
    0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
  ]);
  const SALT_AES = new Uint8Array([0x73, 0x41, 0x6c, 0x54]); // "sAlT"

  function concatBytes(arrays) {
    let len = 0;
    for (const a of arrays) len += a.length;
    const out = new Uint8Array(len);
    let off = 0;
    for (const a of arrays) { out.set(a, off); off += a.length; }
    return out;
  }

  function strToBytes(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
  }

  function bytesToBinaryString(bytes) {
    // chunked to avoid call-stack limits on String.fromCharCode(...bytes)
    let s = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return s;
  }

  // Byte-native MD5 (RFC 1321). Operates directly on Uint8Array — no string
  // round-trip — since PDF's key-derivation algorithm repeatedly re-hashes
  // arbitrary binary (including bytes >=128), and every JS MD5 library that
  // takes a string input silently UTF-8-encodes it first, corrupting exactly
  // that data (verified against Python's hashlib.md5 on binary test vectors).
  function md5Raw(msgBytes) {
    function rotl(x, c) { return (x << c) | (x >>> (32 - c)); }
    const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
               5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
               4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
               6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    if (!md5Raw._K) {
      const K = new Int32Array(64);
      for (let i = 0; i < 64; i++) K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) | 0;
      md5Raw._K = K;
    }
    const K = md5Raw._K;

    const origLenBits = msgBytes.length * 8;
    let paddedLen = msgBytes.length + 1;
    while (paddedLen % 64 !== 56) paddedLen++;
    paddedLen += 8;
    const buf = new Uint8Array(paddedLen);
    buf.set(msgBytes);
    buf[msgBytes.length] = 0x80;
    const dv = new DataView(buf.buffer);
    const lo = origLenBits >>> 0;
    const hi = Math.floor(origLenBits / 4294967296) >>> 0;
    dv.setUint32(paddedLen - 8, lo, true);
    dv.setUint32(paddedLen - 4, hi, true);

    let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

    for (let chunkStart = 0; chunkStart < paddedLen; chunkStart += 64) {
      const M = new Int32Array(16);
      for (let i = 0; i < 16; i++) M[i] = dv.getInt32(chunkStart + i * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + rotl(F, S[i])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }

    const out = new Uint8Array(16);
    const outDv = new DataView(out.buffer);
    outDv.setInt32(0, a0, true);
    outDv.setInt32(4, b0, true);
    outDv.setInt32(8, c0, true);
    outDv.setInt32(12, d0, true);
    return out;
  }

  function hexEncode(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
    return hex;
  }

  function rc4(keyBytes, dataBytes) {
    const S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) S[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + S[i] + keyBytes[i % keyBytes.length]) & 0xff;
      const tmp = S[i]; S[i] = S[j]; S[j] = tmp;
    }
    const out = new Uint8Array(dataBytes.length);
    let i = 0; j = 0;
    for (let k = 0; k < dataBytes.length; k++) {
      i = (i + 1) & 0xff;
      j = (j + S[i]) & 0xff;
      const tmp = S[i]; S[i] = S[j]; S[j] = tmp;
      out[k] = dataBytes[k] ^ S[(S[i] + S[j]) & 0xff];
    }
    return out;
  }

  function padPassword(pwBytes) {
    const truncated = pwBytes.subarray(0, 32);
    return concatBytes([truncated, PAD.subarray(0, 32 - truncated.length)]);
  }

  function permissionsToBytesLE(p) {
    return new Uint8Array([p & 0xff, (p >> 8) & 0xff, (p >> 16) & 0xff, (p >>> 24) & 0xff]);
  }

  function computeOwnerHash(ownerPwBytes, userPwBytes, keyLenBytes, revision) {
    const src = ownerPwBytes.length ? ownerPwBytes : userPwBytes;
    let digest = md5Raw(padPassword(src));
    if (revision >= 3) {
      for (let i = 0; i < 50; i++) digest = md5Raw(digest.subarray(0, keyLenBytes));
    }
    const rc4Key = digest.subarray(0, keyLenBytes);
    let result = rc4(rc4Key, padPassword(userPwBytes));
    if (revision >= 3) {
      for (let i = 1; i <= 19; i++) {
        const roundKey = rc4Key.map((b) => b ^ i);
        result = rc4(roundKey, result);
      }
    }
    return result; // 32 bytes
  }

  function computeEncryptionKey(userPwBytes, oValue, permissions, idBytes, keyLenBytes, revision, encryptMetadata) {
    const parts = [padPassword(userPwBytes), oValue, permissionsToBytesLE(permissions), idBytes];
    if (revision >= 4 && !encryptMetadata) parts.push(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
    let digest = md5Raw(concatBytes(parts));
    if (revision >= 3) {
      for (let i = 0; i < 50; i++) digest = md5Raw(digest.subarray(0, keyLenBytes));
    }
    return digest.subarray(0, keyLenBytes);
  }

  function computeUserHash(fileKey, idBytes, revision) {
    let enc = md5Raw(concatBytes([PAD, idBytes]));
    enc = rc4(fileKey, enc);
    for (let i = 1; i <= 19; i++) {
      const roundKey = fileKey.map((b) => b ^ i);
      enc = rc4(roundKey, enc);
    }
    return concatBytes([enc, new Uint8Array(16)]); // pad to 32 bytes
  }

  function objectKey(fileKey, objNum, genNum) {
    const material = concatBytes([
      fileKey,
      new Uint8Array([objNum & 0xff, (objNum >> 8) & 0xff, (objNum >> 16) & 0xff]),
      new Uint8Array([genNum & 0xff, (genNum >> 8) & 0xff]),
      SALT_AES,
    ]);
    const digest = md5Raw(material);
    const n = Math.min(fileKey.length + 5, 16);
    return digest.subarray(0, n);
  }

  async function aesEncryptCBC(keyBytes, plainBytes) {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, plainBytes);
    return concatBytes([iv, new Uint8Array(cipherBuf)]);
  }

  // ---- PDF text-level string tokenizer (operates on a latin1-decoded string
  // so byte offsets map 1:1 to string indices) ----
  function decodePdfLiteralString(rawBytes) {
    const out = [];
    for (let i = 0; i < rawBytes.length; i++) {
      const c = rawBytes[i];
      if (c === 0x5c && i + 1 < rawBytes.length) {
        const n = rawBytes[i + 1];
        if (n === 0x6e) { out.push(0x0a); i++; }
        else if (n === 0x72) { out.push(0x0d); i++; }
        else if (n === 0x74) { out.push(0x09); i++; }
        else if (n === 0x62) { out.push(0x08); i++; }
        else if (n === 0x66) { out.push(0x0c); i++; }
        else if (n === 0x28 || n === 0x29 || n === 0x5c) { out.push(n); i++; }
        else if (n === 0x0a) { i++; } // line continuation, drop
        else if (n === 0x0d) { i++; if (rawBytes[i + 1] === 0x0a) i++; }
        else if (n >= 0x30 && n <= 0x37) {
          let oct = '' + String.fromCharCode(n);
          let j = i + 2;
          for (let k = 0; k < 2 && j < rawBytes.length && rawBytes[j] >= 0x30 && rawBytes[j] <= 0x37; k++, j++) {
            oct += String.fromCharCode(rawBytes[j]);
          }
          out.push(parseInt(oct, 8) & 0xff);
          i = j - 1;
        } else { out.push(n); i++; }
      } else {
        out.push(c);
      }
    }
    return new Uint8Array(out);
  }

  function decodeHexString(rawBytes) {
    let hex = '';
    for (let i = 0; i < rawBytes.length; i++) {
      const c = rawBytes[i];
      if ((c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66)) {
        hex += String.fromCharCode(c);
      }
    }
    if (hex.length % 2 === 1) hex += '0';
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  // Finds every literal/hex string token in a dict-text byte range and
  // returns their spans (relative to `bytes`) + decoded plaintext bytes.
  function findStringTokens(bytes) {
    const tokens = [];
    let i = 0;
    while (i < bytes.length) {
      const c = bytes[i];
      if (c === 0x28) { // '(' literal string
        const start = i;
        let depth = 1;
        const raw = [];
        let j = i + 1;
        while (j < bytes.length && depth > 0) {
          const cj = bytes[j];
          if (cj === 0x5c) {
            raw.push(cj);
            j++;
            if (j < bytes.length) { raw.push(bytes[j]); j++; }
            continue;
          }
          if (cj === 0x28) { depth++; raw.push(cj); j++; continue; }
          if (cj === 0x29) {
            depth--;
            j++;
            if (depth === 0) break;
            raw.push(cj);
            continue;
          }
          raw.push(cj); j++;
        }
        tokens.push({ start, end: j, decoded: decodePdfLiteralString(new Uint8Array(raw)) });
        i = j;
        continue;
      }
      if (c === 0x3c) { // '<'
        if (bytes[i + 1] === 0x3c) { i += 2; continue; } // dict open '<<'
        const start = i;
        let j = i + 1;
        const raw = [];
        while (j < bytes.length && bytes[j] !== 0x3e) { raw.push(bytes[j]); j++; }
        j++; // skip '>'
        tokens.push({ start, end: j, decoded: decodeHexString(new Uint8Array(raw)) });
        i = j;
        continue;
      }
      if (c === 0x3e && bytes[i + 1] === 0x3e) { i += 2; continue; } // dict close '>>'
      i++;
    }
    return tokens;
  }

  async function encryptDictStrings(dictBytes, objKey) {
    const tokens = findStringTokens(dictBytes);
    if (!tokens.length) return dictBytes;
    const pieces = [];
    let cursor = 0;
    for (const tok of tokens) {
      pieces.push(dictBytes.subarray(cursor, tok.start));
      const encrypted = await aesEncryptCBC(objKey, tok.decoded);
      const hexStr = '<' + hexEncode(encrypted) + '>';
      pieces.push(strToBytes(hexStr));
      cursor = tok.end;
    }
    pieces.push(dictBytes.subarray(cursor));
    return concatBytes(pieces);
  }

  // ---- Classic xref/object parser (matches pdf-lib's useObjectStreams:false output) ----
  function parsePdfStructure(bytes) {
    const text = bytesToBinaryString(bytes);

    const trailerIdx = text.lastIndexOf('trailer');
    if (trailerIdx === -1) throw new Error('No trailer found — unexpected PDF structure');
    const trailerDictStart = text.indexOf('<<', trailerIdx);
    const trailerDictEnd = findMatchingDictEnd(text, trailerDictStart);
    const trailerText = text.substring(trailerDictStart, trailerDictEnd);

    const rootMatch = trailerText.match(/\/Root\s+(\d+)\s+(\d+)\s+R/);
    const infoMatch = trailerText.match(/\/Info\s+(\d+)\s+(\d+)\s+R/);
    if (!rootMatch) throw new Error('Malformed trailer — missing /Root');

    const xrefIdx = text.lastIndexOf('\nxref');
    const scanEnd = xrefIdx !== -1 ? xrefIdx : trailerIdx;

    // Walk the body directly for "N G obj ... endobj" blocks instead of
    // trusting the xref table's own bookkeeping — the xref table's format
    // (subsection count, exact spacing) can vary in ways that are brittle to
    // parse, but pdf-lib's own object layout (since we always feed it
    // normalized `useObjectStreams:false` output) is simple to scan directly.
    const firstObjMatch = text.match(/\d+\s+\d+\s+obj\b/);
    if (!firstObjMatch) throw new Error('No indirect objects found — unexpected PDF structure');
    const headerEnd = firstObjMatch.index;

    const objects = [];
    let cursor = headerEnd;
    while (cursor < scanEnd) {
      while (cursor < scanEnd && /\s/.test(text[cursor])) cursor++;
      if (cursor >= scanEnd) break;
      const obj = parseObjectAt(text, bytes, cursor);
      objects.push(obj);
      cursor = obj.nextScanPos;
    }
    if (!objects.length) throw new Error('No indirect objects found — unexpected PDF structure');

    return {
      text,
      objects,
      size: Math.max.apply(null, objects.map((o) => o.objNum)) + 1,
      rootRef: { num: parseInt(rootMatch[1], 10), gen: parseInt(rootMatch[2], 10) },
      infoRef: infoMatch ? { num: parseInt(infoMatch[1], 10), gen: parseInt(infoMatch[2], 10) } : null,
      headerEnd,
    };
  }

  function findMatchingDictEnd(text, dictStart) {
    let depth = 0;
    let i = dictStart;
    while (i < text.length) {
      if (text[i] === '<' && text[i + 1] === '<') { depth++; i += 2; continue; }
      if (text[i] === '>' && text[i + 1] === '>') { depth--; i += 2; if (depth === 0) return i; continue; }
      i++;
    }
    throw new Error('Unterminated dictionary');
  }

  function resolveLength(dictText) {
    // pdf-lib's own normalized output (useObjectStreams:false) always writes a
    // direct integer /Length. An indirect reference would require the length
    // object to already be parsed before we can find where this object's
    // "endobj" is during a linear left-to-right scan — since that referenced
    // object normally comes *later* in the file, this can't be resolved on
    // the fly. Fail loudly instead of silently mis-scanning.
    if (/\/Length\s+\d+\s+\d+\s+R/.test(dictText)) {
      throw new Error('This PDF uses an indirect stream /Length, which is not supported.');
    }
    const m = dictText.match(/\/Length\s+(\d+)/);
    if (m) return parseInt(m[1], 10);
    throw new Error('Stream object missing /Length');
  }

  function parseObjectAt(text, bytes, offset) {
    const headerMatch = text.substring(offset, offset + 40).match(/^(\d+)\s+(\d+)\s+obj\b/);
    if (!headerMatch) throw new Error('Expected an object header at byte offset ' + offset);
    const objNum = parseInt(headerMatch[1], 10);
    const genNum = parseInt(headerMatch[2], 10);
    let cursor = offset + headerMatch[0].length;
    while (/\s/.test(text[cursor])) cursor++;
    if (text[cursor] !== '<' || text[cursor + 1] !== '<') {
      throw new Error('Expected dictionary at object ' + objNum);
    }
    const dictStart = cursor;
    const dictEnd = findMatchingDictEnd(text, dictStart);
    const dictText = text.substring(dictStart, dictEnd);

    let after = dictEnd;
    while (/\s/.test(text[after])) after++;
    let streamBytes = null;
    let scanCursor = dictEnd;
    if (text.substr(after, 6) === 'stream') {
      let streamDataStart = after + 6;
      if (text[streamDataStart] === '\r' && text[streamDataStart + 1] === '\n') streamDataStart += 2;
      else if (text[streamDataStart] === '\n') streamDataStart += 1;
      const length = resolveLength(dictText);
      streamBytes = { start: streamDataStart, length };
      scanCursor = streamDataStart + length;
    }
    const endobjIdx = text.indexOf('endobj', scanCursor);
    if (endobjIdx === -1) throw new Error('Missing endobj for object ' + objNum);
    const nextScanPos = endobjIdx + 'endobj'.length;

    return { objNum, genNum, dictStart, dictEnd, dictText, offset, streamBytes, nextScanPos };
  }

  async function protectPdf(inputBytes, opts) {
    const userPassword = opts.userPassword || '';
    const ownerPassword = opts.ownerPassword || opts.userPassword || '';
    const permissions = typeof opts.permissions === 'number' ? opts.permissions : -4;
    const keyLenBytes = 16; // AES-128
    const revision = 4;

    const { PDFDocument } = PDFLib;
    let srcDoc;
    try {
      srcDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true, updateMetadata: false });
    } catch (e) {
      throw new Error('Could not read this PDF. It may already be password protected or corrupted.');
    }
    const normalized = await srcDoc.save({ useObjectStreams: false });

    const struct = parsePdfStructure(normalized);

    const idBytes = crypto.getRandomValues(new Uint8Array(16));
    const userPwBytes = strToBytes(unescape(encodeURIComponent(userPassword)));
    const ownerPwBytes = strToBytes(unescape(encodeURIComponent(ownerPassword)));

    const oValue = computeOwnerHash(ownerPwBytes, userPwBytes, keyLenBytes, revision);
    const fileKey = computeEncryptionKey(userPwBytes, oValue, permissions, idBytes, keyLenBytes, revision, true);
    const uValue = computeUserHash(fileKey, idBytes, revision);

    const chunks = [];
    const headerBytes = normalized.subarray(0, struct.headerEnd);
    chunks.push(headerBytes);
    let currentOffset = headerBytes.length;
    const newOffsets = {};

    for (const obj of struct.objects) {
      const objKey = objectKey(fileKey, obj.objNum, obj.genNum);
      const dictBytesOriginal = strToBytes(obj.dictText);
      let newDictBytes = await encryptDictStrings(dictBytesOriginal, objKey);
      let streamChunk = null;

      if (obj.streamBytes) {
        const rawStream = normalized.subarray(obj.streamBytes.start, obj.streamBytes.start + obj.streamBytes.length);
        const encryptedStream = await aesEncryptCBC(objKey, rawStream);
        let newDictText = bytesToBinaryString(newDictBytes);
        newDictText = newDictText.replace(/\/Length\s+\d+/, '/Length ' + encryptedStream.length);
        newDictBytes = strToBytes(newDictText);
        streamChunk = encryptedStream;
      }

      newOffsets[obj.objNum] = currentOffset;
      const headerStr = obj.objNum + ' ' + obj.genNum + ' obj\n';
      chunks.push(strToBytes(headerStr));
      chunks.push(newDictBytes);
      currentOffset += headerStr.length + newDictBytes.length;

      if (streamChunk) {
        const streamHeader = '\nstream\n';
        chunks.push(strToBytes(streamHeader));
        chunks.push(streamChunk);
        const streamFooter = '\nendstream\nendobj\n\n';
        chunks.push(strToBytes(streamFooter));
        currentOffset += streamHeader.length + streamChunk.length + streamFooter.length;
      } else {
        const footer = '\nendobj\n\n';
        chunks.push(strToBytes(footer));
        currentOffset += footer.length;
      }
    }

    const encryptObjNum = struct.size; // next available object number
    const cfDict = '/CF << /StdCF << /CFM /AESV2 /AuthEvent /DocOpen /Length 16 >> >> /StmF /StdCF /StrF /StdCF';
    const encryptDictText = '<< /Filter /Standard /V 4 /R 4 /Length 128 ' + cfDict +
      ' /O <' + hexEncode(oValue) + '> /U <' + hexEncode(uValue) + '> /P ' + permissions + ' /EncryptMetadata true >>';
    const encryptChunkStr = encryptObjNum + ' 0 obj\n' + encryptDictText + '\nendobj\n\n';
    newOffsets[encryptObjNum] = currentOffset;
    chunks.push(strToBytes(encryptChunkStr));
    currentOffset += encryptChunkStr.length;

    const xrefOffset = currentOffset;
    let xrefText = 'xref\n0 ' + (encryptObjNum + 1) + '\n';
    xrefText += '0000000000 65535 f \n';
    for (let n = 1; n <= encryptObjNum; n++) {
      const off = newOffsets[n];
      xrefText += String(off).padStart(10, '0') + ' 00000 n \n';
    }
    chunks.push(strToBytes(xrefText));
    currentOffset += xrefText.length;

    const idHex = hexEncode(idBytes);
    const trailerText = 'trailer\n<< /Size ' + (encryptObjNum + 1) +
      ' /Root ' + struct.rootRef.num + ' ' + struct.rootRef.gen + ' R' +
      (struct.infoRef ? ' /Info ' + struct.infoRef.num + ' ' + struct.infoRef.gen + ' R' : '') +
      ' /ID [<' + idHex + '> <' + idHex + '>] /Encrypt ' + encryptObjNum + ' 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    chunks.push(strToBytes(trailerText));

    return concatBytes(chunks);
  }

  global.TSPdfCrypt = { protectPdf };
})(window);
