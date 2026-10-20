#!/usr/bin/env node
/**
 * Builds /tools/image/compress/{20kb,50kb,100kb,200kb}/ — the real image compressor with the
 * target preselected, plus guidance specific to that size. The tool markup and script are
 * copied from the canonical compressor page so there is one implementation to maintain.
 *
 * Also keeps a "Compress to a specific size" link block on the parent compressor page.
 * Idempotent. Run via `npm run build:tools`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToolPage, esc } from './lib/tool-page.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_FILE = path.join(ROOT, 'tools/image/compress/index.html');
const raw = fs.readFileSync(BASE_FILE, 'utf8');
const CRLF = raw.includes('\r\n');
const base = raw.replace(/\r\n/g, '\n'); // work on LF; the file's own line endings are restored on write

const toolStart = base.indexOf('<div class="tool-card-main">');
const trustAt = base.indexOf('<div class="trust-badge">', toolStart);
if (toolStart < 0 || trustAt < 0) throw new Error('Cannot find the compressor markup; update build-compress-size-pages.mjs.');
const toolInner = base.slice(toolStart + '<div class="tool-card-main">'.length, trustAt).replace(/^\s*\n/, '');
const scriptMatch = base.match(/<script>\s*\n\(function \(\) \{\n[\s\S]*?\n\}\)\(\);\s*<\/script>\s*<\/body>/);
if (!scriptMatch) throw new Error('Cannot find the compressor script.');
const baseScript = scriptMatch[0].replace(/^<script>\s*\n/, '').replace(/\s*<\/script>\s*<\/body>$/, '');

const SIZES = [
  {
    kb: 20, slug: '20kb',
    title: 'Compress Image to 20KB Online Free | JPG, PNG, WebP | ToolShoppy',
    description: 'Compress a photo, signature or scan to 20 KB online for free. Set the 20 KB target, check the real output size and download. No signup, no upload — runs in your browser.',
    h1: 'Compress Image to 20 KB',
    intro: 'Shrink a photo, signature or scanned stamp to about 20 KB for strict upload limits. The compressor tries JPEG qualities, and reduces pixel size if needed, until the file fits.',
    keywords: 'compress image to 20kb, reduce image size to 20kb, 20kb image compressor, signature 20kb, photo 20kb online',
    meaning: `<p>20 KB is about 20,480 bytes, roughly one hundredth of a typical phone photo (2–5 MB). Reaching it means cutting the file by about 99%, which a compressor does by lowering JPEG quality and, for large pictures, shrinking the pixel dimensions. That is why a 20 KB file is usually small on screen too, often a few hundred pixels wide.</p><p>Some pictures compress far better than others. A face against a plain background, a signature on white paper or a simple stamp can look fine at 20 KB. A busy scene full of detail, or a photo with small text, will look soft or blocky.</p>`,
    table: [
      ['Signature or stamp on a white background', 'Usually fits easily and stays readable.'],
      ['Passport-style portrait (plain background)', 'Often fits at a small pixel size; check the face is still clear.'],
      ['Phone photo of a person at a distance', 'Will be reduced a lot; detail and background become soft.'],
      ['Photo of a document with small print', 'Usually unreadable at this size. Use a higher target.'],
    ],
    tips: ['Crop to the face or signature first with the <a href="/tools/image/crop/">image cropper</a>. Less empty space means better quality per kilobyte.', 'Use the largest, sharpest original you have; compressing an already-small copy hurts more.', 'Photograph signatures with dark ink on plain white paper in good light.', 'If a form states a range such as “10–20 KB”, check the result is above the minimum as well. The tool aims for as close to 20 KB as it can without going over.', 'If a form also needs exact pixel dimensions, resize first with the <a href="/tools/image/resize/">image resizer</a>, then compress.'],
    faqs: [
      ['How do I compress an image to 20 KB?', 'Open the tool, add your image, keep the 20 KB preset selected and press Compress. It searches for the best JPEG quality that stays under 20 KB, reduces dimensions if needed, and shows the actual size before you download.'],
      ['Will my image still look good at 20 KB?', 'It depends on the picture. Simple images such as signatures and plain-background portraits usually stay clear. Detailed photos become softer, so look at the result at full size before uploading.'],
      ['Can I get exactly 20 KB?', 'The tool gets as close as it can without going over, but an exact byte count is not guaranteed. Check the size shown after compression against your form’s limit.'],
      ['My form says 10 KB to 20 KB. What should I do?', 'Compress to 20 KB, then check the downloaded size. If it is below the minimum, use the 50 KB preset or a custom target between the two limits.'],
      ['Is my photo uploaded to a server?', 'No. The compression runs in your browser, so your photo or signature is never sent to ToolShoppy.'],
    ],
  },
  {
    kb: 50, slug: '50kb',
    title: 'Compress Image to 50KB Online Free | JPG, PNG, WebP | ToolShoppy',
    description: 'Compress a photo to 50 KB online for free. Preselected 50 KB target, shows the real output size, no signup and no upload — everything runs in your browser.',
    h1: 'Compress Image to 50 KB',
    intro: 'Reduce a photo to about 50 KB for application forms, ID uploads and profile pictures. Pick the 50 KB target, compress, check the size and download.',
    keywords: 'compress image to 50kb, reduce image size to 50kb, 50kb photo, 50kb image compressor, compress jpg to 50kb',
    meaning: `<p>50 KB is about 51,200 bytes, around one fiftieth of a typical 2.5 MB phone photo. It is a common limit for passport-style photos and profile pictures on forms and job portals, and it is large enough to keep a face clear if the pixel dimensions are modest.</p><p>The tool binary-searches JPEG quality until the file is as large as it can be without exceeding 50 KB. If quality alone is not enough, it also reduces the pixel dimensions. Plain backgrounds and well-lit faces compress best.</p>`,
    table: [
      ['Passport-style photo, plain background', 'Usually fits at a moderate pixel size with a clear face.'],
      ['Scanned signature or certificate corner', 'Usually fits easily.'],
      ['Full-size phone photo with a busy background', 'Reduced noticeably; fine detail will soften.'],
      ['A4 document photo or scan with small text', 'May become hard to read. Try 200 KB.'],
    ],
    tips: ['Crop out empty space before compressing; a tighter crop keeps more detail within 50 KB. The <a href="/tools/image/crop/">image cropper</a> supports fixed ratios.', 'Photograph in daylight against a plain wall to avoid noisy shadows, which waste kilobytes.', 'For forms that require specific pixel dimensions, resize first and compress second. See the <a href="/tools/image/govt-photo/">application photo presets</a> for common starting sizes; always follow your form’s instructions.', 'Compare the result to the original at full size. If faces look blocky, consider whether a 100 KB target is allowed.'],
    faqs: [
      ['How do I reduce an image to 50 KB?', 'Add your image, keep the 50 KB preset (it is selected on this page), press Compress and download the result. The tool shows the original and compressed sizes side by side.'],
      ['Does compressing to 50 KB change the pixel size?', 'It first lowers JPEG quality and, if that is not enough, also reduces the pixel dimensions. If your form requires a set width and height, check them after compressing, or resize first.'],
      ['Which formats can I compress to 50 KB?', 'You can add JPG, PNG and WebP images. The output is always a JPEG, so transparency is not kept.'],
      ['Can I compress several photos to 50 KB at once?', 'Yes. Select several images and download them together as a ZIP, each aimed at 50 KB.'],
      ['Is it safe for ID or exam photos?', 'Yes. Photos stay on your device and are never uploaded, which matters for personal ID pictures.'],
    ],
  },
  {
    kb: 100, slug: '100kb',
    title: 'Compress Image to 100KB Online Free | JPG, PNG, WebP | ToolShoppy',
    description: 'Compress an image to 100 KB online for free. Preselected 100 KB target, real output size shown, no signup, files never leave your browser.',
    h1: 'Compress Image to 100 KB',
    intro: 'Bring a photo or scan down to about 100 KB for portals, email and messaging. The 100 KB target is preselected, and the actual size is shown before you download.',
    keywords: 'compress image to 100kb, reduce image size to 100kb, 100kb photo, compress jpg to 100kb, 100kb image compressor',
    meaning: `<p>100 KB is about 102,400 bytes. It is a comfortable limit for profile photos, ID pictures and small scans: with a sensible pixel size a portrait can look sharp, and a simple document can stay legible. A typical phone photo (2–5 MB) needs to shrink by roughly 95–98%.</p><p>The tool aims for the highest JPEG quality that fits under 100 KB, and reduces dimensions only if it has to. Because the limit is generous, many images need only a quality reduction.</p>`,
    table: [
      ['Portrait or profile photo', 'Usually sharp at a medium pixel size.'],
      ['ID card or certificate photo', 'Often readable; check small text at full size.'],
      ['Phone photo at full resolution', 'Scaled down; good for screens, not large prints.'],
      ['Dense scanned page', 'Text may soften. Try 200 KB or use PDF compression for multi-page documents.'],
    ],
    tips: ['Keep your original. Compression to a small size is a one-way change, so work on a copy.', 'If the picture has transparency (a PNG logo), note the result is a JPEG with a white background. Use the <a href="/tools/image/convert/">image converter</a> to keep PNG or WebP.', 'Large dimensions waste bytes. If a portal only shows a small preview, <a href="/tools/image/resize/">resize</a> first for a cleaner result at 100 KB.', 'For documents of several pages, make them into one PDF with <a href="/tools/pdf/image-to-pdf/">Image to PDF</a> and compress that with the <a href="/tools/pdf/compress/">PDF compressor</a> instead.'],
    faqs: [
      ['How do I compress a picture to 100 KB?', 'Add the picture, leave the 100 KB preset selected, press Compress and download. The page reports the size so you can confirm it is under your limit.'],
      ['Will 100 KB be good enough quality?', 'For profile photos and ID pictures usually yes, especially at moderate pixel dimensions. Dense scans and large prints need a bigger target.'],
      ['Why is my result a little under 100 KB?', 'The compressor picks the best quality that does not exceed the target, so the file is typically just under it. An exact byte count is not guaranteed.'],
      ['Can I keep the PNG format?', 'This compressor outputs JPEG. For PNG or WebP output use the image converter, which can also keep transparency.'],
      ['Are my pictures uploaded?', 'No. Compression runs entirely in your browser; nothing is sent to ToolShoppy.'],
    ],
  },
  {
    kb: 200, slug: '200kb',
    title: 'Compress Image to 200KB Online Free | JPG, PNG, WebP | ToolShoppy',
    description: 'Compress a photo or scan to 200 KB online for free. 200 KB target preselected, real size shown, batch ZIP download, no signup and no upload.',
    h1: 'Compress Image to 200 KB',
    intro: 'Reduce photos and scans to about 200 KB while keeping them clear. The 200 KB target is preselected; add one image or many and download the results as a ZIP.',
    keywords: 'compress image to 200kb, reduce image size to 200kb, 200kb photo, compress jpg to 200kb, 200kb image compressor',
    meaning: `<p>200 KB is about 204,800 bytes: large enough to keep good detail in a portrait or a readable scan of a certificate or form, yet small enough for most upload fields and for email. A phone photo of 3 MB needs to shrink by about 93%, which mostly comes from lowering quality and trimming the pixel size rather than from heavy blur.</p><p>It is a good target when 50 KB looks too soft and the portal allows more, and a sensible default for photographed documents.</p>`,
    table: [
      ['Portrait or ID photo', 'Typically clear, with good skin and hair detail.'],
      ['Photographed document (single page)', 'Usually readable; keep the page flat and well lit.'],
      ['Landscape or product photo', 'Good for web and email, not for large prints.'],
      ['Very large camera photo (20 MP+)', 'Scaled down substantially; keep the original for printing.'],
    ],
    tips: ['Photograph documents flat, in daylight and square to the camera. Shadows and angles waste kilobytes and hurt legibility.', 'Select several pages or photos and download the ZIP to compress them in one go.', 'If you need a single file from many pages, combine them with <a href="/tools/pdf/image-to-pdf/">Image to PDF</a> first.', 'Check dimensions too: some portals set minimum and maximum pixel sizes as well as a KB limit.'],
    faqs: [
      ['How do I compress an image to 200 KB?', 'Add the image, keep the 200 KB preset, press Compress and download it. For several images, download all of them together as a ZIP.'],
      ['Is 200 KB enough for a readable document photo?', 'Usually yes for a single, well-lit page. For dense small print or multi-page documents, check the result at full size or compress a PDF instead.'],
      ['What if the result is still over 200 KB?', 'Very detailed images may need smaller dimensions. Resize the image first, then compress; or choose a smaller target. The page shows the actual size so you can check.'],
      ['Does it work with HEIC photos from an iPhone?', 'Convert HEIC to JPG first with the image converter, then compress the JPG here.'],
      ['Do my files leave my device?', 'No. Everything runs in your browser and nothing is uploaded.'],
    ],
  },
];

const OTHER_RELATED = {
  crop: { href: '/tools/image/crop/', title: 'Crop Image', desc: 'Crop, rotate & flip photos', icon: 'cut', tile: 'violet' },
  resize: { href: '/tools/image/resize/', title: 'Image Resizer', desc: 'Resize by pixels or percentage', icon: 'ruler-2', tile: 'violet' },
  convert: { href: '/tools/image/convert/', title: 'Image Converter', desc: 'HEIC, PNG, JPG, WebP', icon: 'refresh', tile: 'cyan' },
  govt: { href: '/tools/image/govt-photo/', title: 'Govt Photo Resizer', desc: 'PSC, UPSC, PAN & passport sizes', icon: 'id', tile: 'pink' },
};

let written = 0;
for (const s of SIZES) {
  const siblings = SIZES.filter(o => o.kb !== s.kb);
  const sizeLinks = `<ul class="guide-list">${siblings.map(o => `<li><a href="/tools/image/compress/${o.slug}/">Compress an image to ${o.kb} KB</a></li>`).join('')}<li><a href="/tools/image/compress/">Choose any size, or enter a custom KB target</a></li></ul>`;
  const table = `<div class="tool-guide-table-wrap"><table><thead><tr><th scope="col">Kind of image</th><th scope="col">What to expect at ${s.kb} KB</th></tr></thead><tbody>${s.table.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div><p class="guide-note">These are general expectations. The result depends on the picture, so always check the downloaded file.</p>`;
  const page = renderToolPage({
    path: `/tools/image/compress/${s.slug}/`,
    trail: [{ name: 'Image Tools', href: '/tools/image/' }, { name: 'Image Compressor', href: '/tools/image/compress/' }],
    crumbName: `Compress to ${s.kb} KB`,
    title: s.title, description: s.description, name: `Compress Image to ${s.kb} KB`, h1: s.h1, intro: s.intro, keywords: s.keywords,
    icon: 'arrows-minimize', tile: 'indigo',
    trust: 'Your files never leave your device',
    howToTitle: `How to compress an image to ${s.kb} KB`,
    steps: [
      'Select your photo or scan, drop it on the box, or paste it with Ctrl+V.',
      `The <strong>${s.kb} KB</strong> target is already selected. Pick a different preset or a custom value if your limit is different.`,
      'Press <strong>Compress</strong>. The tool searches for the best quality that stays under the target.',
      `Check the compressed size is under ${s.kb} KB, then download the image or a ZIP for several files.`,
    ],
    layoutId: 'toolLayout',
    toolHtml: toolInner.replace('<button class="chip active" data-kb="50">', '<button class="chip" data-kb="50">').replace(`<button class="chip" data-kb="${s.kb}">`, `<button class="chip active" data-kb="${s.kb}">`),
    sidebarHtml: `      <div class="info-box">
        <p><strong>How it works</strong></p>
        <ul>
          <li>Searches JPEG quality in your browser until the file fits</li>
          <li>Reduces pixel size too when quality alone is not enough</li>
          <li>Nothing is uploaded — it all runs locally</li>
        </ul>
      </div>`,
    sections: [
      [`What ${s.kb} KB means for an image`, s.meaning],
      [`What to expect at ${s.kb} KB`, table],
      [`Tips for a clear ${s.kb} KB image`, `<ul class="guide-list">${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>`],
      ['Need a different size?', sizeLinks],
    ],
    faqs: s.faqs,
    related: [OTHER_RELATED.crop, OTHER_RELATED.resize, OTHER_RELATED.govt, OTHER_RELATED.convert],
    scripts: [],
    inlineScript: baseScript.replace('let targetKb = 50;', `let targetKb = ${s.kb};`),
  });
  if (!baseScript.includes('let targetKb = 50;')) throw new Error('Compressor default target changed; update build-compress-size-pages.mjs.');
  const out = path.join(ROOT, 'tools/image/compress', s.slug, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== page) { fs.writeFileSync(out, page); written++; }
}

// Link block on the parent compressor page (kept between markers so re-runs replace it).
const START = '<!-- size-links:start -->', END = '<!-- size-links:end -->';
const block = `${START}
  <section class="content-section">
    <h2>Compress to a specific size</h2>
    <p>Many upload forms set a hard limit. These pages open the same compressor with the target already chosen, and explain what to expect at each size.</p>
    <ul class="guide-list">${SIZES.map(s => `<li><a href="/tools/image/compress/${s.slug}/">Compress image to ${s.kb} KB</a></li>`).join('')}</ul>
  </section>
  ${END}`;
let parent = base;
parent = parent.replace(new RegExp(`\\s*${START}[\\s\\S]*?${END}`), '');
const anchor = '<!-- service-search:end -->';
if (!parent.includes(anchor)) throw new Error('Parent compressor page has no service-search end marker.');
parent = parent.replace(anchor, `${anchor}\n  ${block}`);
if (parent !== base) fs.writeFileSync(BASE_FILE, CRLF ? parent.replace(/\n/g, '\r\n') : parent);
console.log(`Size pages written: ${written}/${SIZES.length}. Parent link block ${parent !== base ? 'updated' : 'unchanged'}.`);
