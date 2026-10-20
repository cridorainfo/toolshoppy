/**
 * PDF tool guides. Facts here were checked against what each page's code does
 * (for example: Compress and Unlock re-render pages as images; Word to PDF and
 * HTML to PDF draw the document to an image first; PDF to Word writes .doc).
 * Do not add claims the tool cannot back up.
 */
export const PDF = {
  'pdf/merge': {
    name: 'Merge PDF',
    kind: 'pdf',
    how: [
      'You add two or more PDFs and the page shows a small first-page preview of each one. The list order is the order of the final document: every page of the first file, then every page of the second, and so on. You can drag a file to a new position or use the up and down arrows.',
      'When you press Merge, the pages are copied from each source file into one new PDF by the pdf-lib library running in your browser tab. The pages are copied as they are rather than redrawn, so text stays selectable and layouts do not change. Nothing is sent to a server, which also means the practical size limit is your device’s memory, not a fixed file count.',
    ],
    benefits: [
      'Combine a CV, certificates and a cover letter into the single attachment a job or exam portal asks for.',
      'Pages are copied, not re-rendered, so text stays selectable and image quality does not drop.',
      'Reorder before you merge, with previews, so you do not have to redo the merge to fix the order.',
      'Private by design: salary slips, ID proofs and contracts never leave your device.',
    ],
    rows: [
      ['Quality of the result', 'Pages are copied as they are, so nothing is re-rendered.', 'Usually the same approach; check the output.', 'Same; full control over bookmarks and metadata.'],
      ['Batch size', 'No fixed limit; depends on your device’s memory.', 'Often limited by plan, file size or number of files (varies).', 'Limited mainly by your computer.'],
    ],
    better: 'you need to keep bookmarks, form fields or tagged accessibility structure intact across several files, or you are merging very large scans on a low-memory phone. A desktop PDF app handles those cases more completely.',
    tips: [
      'Rename files 1, 2, 3 before you add them if the order matters. Then check the list order matches before merging.',
      'Open the merged file and check page count, order and orientation before you send it.',
      'Merging does not shrink the file. If a form has a size limit, run the result through PDF Compress afterwards.',
      'A password-protected file must be unlocked first, using the password you know.',
    ],
    links: [['/tools/pdf/compress/', 'Compress the merged PDF'], ['/tools/pdf/organize/', 'Reorder single pages'], ['/blog/how-to-merge-pdf-free/', 'Step-by-step merge guide']],
  },

  'pdf/split': {
    name: 'Split PDF',
    kind: 'pdf',
    how: [
      'After you open a PDF, every page appears as a thumbnail rendered by PDF.js. You then pick one of three modes: extract the pages you tapped, split every page into its own file, or type ranges such as 1-3, 5, 8-10.',
      'The output is built with pdf-lib by copying the chosen pages into new documents. One selection becomes one PDF. Every-page and range modes produce several PDFs, which are bundled into a ZIP so you download them together. All of it runs in your browser.',
    ],
    benefits: [
      'Pull out the two pages a form really needs instead of uploading a 60-page scan.',
      'Split a combined scan into separate files, for example one PDF per certificate.',
      'Thumbnails mean you choose pages by sight, not by guessing page numbers.',
      'Pages are copied, not redrawn, so text stays selectable and sharp.',
    ],
    rows: [
      ['Choosing pages', 'Tap thumbnails, split every page, or type ranges.', 'Similar modes; some limit the number of pages on free plans (varies).', 'Full page management, often in a paid edition.'],
    ],
    better: 'you need to split by bookmarks or file size, or you need to keep interactive form fields working in each part. A desktop PDF application does those more completely.',
    tips: [
      'For ranges, use commas between ranges: 1-3, 5, 8-10 gives three separate PDFs, not one.',
      'Use Extract selected when you want a single output file made of non-adjacent pages.',
      'If the result is still too large for a portal, compress it after splitting.',
      'To remove pages rather than extract them, Organize PDF lets you delete pages and keep the rest.',
    ],
    links: [['/tools/pdf/organize/', 'Delete or reorder pages'], ['/tools/pdf/merge/', 'Merge PDFs'], ['/tools/pdf/compress/', 'Compress PDF']],
  },

  'pdf/compress': {
    name: 'Compress PDF',
    kind: 'pdf',
    how: [
      'This compressor works by re-rendering each page as an image at a lower resolution and JPEG quality, then rebuilding a PDF from those images. You choose High, Medium or Low quality. Lower quality gives a smaller file and softer detail.',
      'That method is simple and works well on scans and photo-heavy PDFs, because those are already images. The trade-off is real: the output no longer has selectable text, clickable links or fillable form fields. A PDF that is mostly text may even grow in size. Keep your original, compare the sizes, and only use the compressed copy when it is clearly smaller and still readable.',
    ],
    benefits: [
      'Get a scanned PDF under a form or email size limit without installing anything.',
      'Three presets: Medium is usually the right start, Low when a hard limit like 1 MB applies.',
      'Compare original and compressed sizes on screen before you download.',
      'Private: Aadhaar scans, bank statements and contracts are never uploaded.',
    ],
    rows: [
      ['What survives compression', 'Pages become images. Text, links and form fields are not kept.', 'Many keep text and only recompress images, so searchability is often preserved.', 'Acrobat’s optimiser can keep text and fonts while shrinking images.'],
      ['Hitting an exact size', 'Presets only. No setting guarantees an exact KB or MB result.', 'Some offer levels; exact targets are rare.', 'Offers detailed controls, but also no guaranteed size.'],
    ],
    better: 'you need to keep selectable text, links or fillable fields in the smaller file. Use a tool that recompresses images only, or an optimiser in desktop PDF software. For scans headed to a government upload, this tool is usually enough.',
    tips: [
      'Try Medium first. Switch to Low only if the file is still over the limit, then check the text is still readable.',
      'Compress after merging, not before, so you check the final size once.',
      'Zoom into small print, stamps and signatures on the result before you submit it.',
      'If the file got bigger, it was probably text-only. Send the original instead.',
    ],
    links: [['/tools/pdf/merge/', 'Merge PDFs first'], ['/tools/pdf/split/', 'Extract only the pages you need'], ['/tools/image/compress/', 'Compress an image to an exact KB']],
  },

  'pdf/editor': {
    name: 'PDF Editor',
    kind: 'pdf',
    how: [
      'The editor uses the open-source PDFium engine, the same family of code Chrome uses to display PDFs, running in your browser. When you click a line of text it finds the underlying text object, so your change updates that object instead of covering it with a white box.',
      'You can add new text, move or delete objects, place an image or signature picture, highlight, draw rectangles and rotate pages. On export, a new PDF is saved with the original content preserved, so text stays searchable and vector artwork stays sharp. The editor accepts files up to 40 MB and 1,000 pages. Scans have no text objects to edit, and highlights or rectangles are annotations, not secure redaction.',
    ],
    benefits: [
      'Fix a typo, a date or a phone number in an existing PDF without recreating it.',
      'Free to edit and free to download: no payment step, watermark or signup.',
      'Original text and vector graphics stay searchable and sharp after export.',
      'Your document is processed locally, which matters for contracts and ID documents.',
    ],
    rows: [
      ['Editing existing text', 'Edits supported text objects; limits apply for fonts, scans and reflow.', 'Many edit text, but often as a paid or limited feature.', 'Strongest editing and font handling, usually paid.'],
      ['Cost at download', 'Free, no watermark, no checkout.', 'Editing may be free but export can need an account or plan (varies).', 'Licence or subscription for editing features.'],
    ],
    better: 'you need paragraph reflow, editing inside grouped objects, complex scripts, or text recognition on a scan. Those need desktop software or an OCR step first; try OCR PDF before editing a scan.',
    tips: [
      'If a letter is missing from the font, load a full TTF font from your device or choose a replacement font on purpose.',
      'Do not use a rectangle to hide sensitive text. It is an annotation, and the text underneath can still exist.',
      'Allow wider text only after checking the line does not overlap neighbouring content.',
      'Keep your original file. The editor saves a new PDF and does not change the one you opened.',
    ],
    links: [['/tools/pdf/sign/', 'Sign a PDF'], ['/tools/pdf/ocr-pdf/', 'OCR a scanned PDF'], ['/tools/pdf/organize/', 'Organize pages']],
  },

  'pdf/word-to-pdf': {
    name: 'Word to PDF',
    kind: 'pdf',
    how: [
      'A .docx file is a zip of XML. The converter reads it in your browser with mammoth.js, which turns the document into clean HTML based on its structure: headings, paragraphs, lists, tables and images.',
      'That HTML is then drawn to a canvas and placed onto PDF pages with jsPDF. Because mammoth focuses on structure, not exact print layout, fonts, margins, headers, footers and unusual formatting may not match Word. The pages are also images of the document, so the text in the PDF is not selectable and the file can be larger than one saved from Word.',
    ],
    benefits: [
      'Turn a CV, letter or assignment into a PDF on any device, including a phone with no Word installed.',
      'No upload, so confidential documents stay with you.',
      'No signup and no watermark.',
      'Good for plain documents with headings, lists and tables.',
    ],
    rows: [
      ['Layout accuracy', 'Structure is kept; exact fonts, margins and headers may differ.', 'Server converters with a full rendering engine usually match layout more closely.', 'Word’s own Save as PDF matches the layout exactly.'],
      ['Text in the result', 'Pages are images, so text is not selectable.', 'Typically a real text PDF.', 'Real text PDF with links and bookmarks.'],
    ],
    better: 'the document must look identical to Word, with headers, footers or complex columns, or you need selectable text. If you have Word, use File, then Save As, then PDF. If you only have a phone, use this for simple documents and check the result.',
    tips: [
      'Convert only .docx files. Save older .doc files as .docx in Word first.',
      'Open the PDF and check page breaks, tables and images before sending.',
      'For a smaller file, run the PDF through PDF Compress, but note that text is already image-based.',
      'Use PDF Protect afterwards if the document contains personal details.',
    ],
    links: [['/tools/pdf/pdf-to-word/', 'PDF to Word'], ['/tools/pdf/protect/', 'Password protect'], ['/blog/word-to-pdf-free-no-upload/', 'Why no upload matters']],
  },

  'pdf/pdf-to-word': {
    name: 'PDF to Word',
    kind: 'pdf',
    how: [
      'PDF.js reads the text from each page in your browser. The extracted text is written into a Word-compatible .doc file that opens in Microsoft Word, Google Docs or LibreOffice, where you can edit it.',
      'This is a text extraction, not a layout reconstruction. Paragraph order and wording come across, but columns, tables, fonts, images and exact positions generally do not. A scanned PDF has no text to extract, so run OCR PDF first. The output is a .doc file, not .docx.',
    ],
    benefits: [
      'Pull the wording out of a PDF so you can reuse or edit it in Word or Google Docs.',
      'Private: the PDF never leaves your device, which suits contracts and CVs.',
      'No signup, no page limit set by us and no watermark.',
      'Fast on text-based PDFs, with nothing to install.',
    ],
    rows: [
      ['What you get', 'The text, in a basic editable Word file. Layout is not rebuilt.', 'Some rebuild columns, tables and images, with mixed results.', 'Word and Acrobat attempt layout reconstruction, often the best for complex files.'],
      ['Scanned PDFs', 'Not supported directly; run OCR PDF first.', 'Often includes OCR, sometimes as a paid feature.', 'OCR is available in some paid editions.'],
    ],
    better: 'you need tables, columns, images and fonts to stay in place. Opening the PDF in Word or using a layout-aware converter will reproduce complex documents much better than a text extraction.',
    tips: [
      'Check that your PDF is text-based by trying to select a word in a PDF reader. If you cannot, use OCR PDF first.',
      'Expect to reformat headings and tables after converting.',
      'If you only need the text, PDF to Markdown gives cleaner plain text with headings.',
      'For tables of numbers, PDF to Excel keeps rows and columns better than Word.',
    ],
    links: [['/tools/pdf/ocr-pdf/', 'OCR a scanned PDF'], ['/tools/pdf/pdf-to-excel/', 'PDF to Excel'], ['/tools/pdf/word-to-pdf/', 'Word to PDF']],
  },

  'pdf/protect': {
    name: 'Password Protect PDF',
    kind: 'pdf',
    how: [
      'You pick a PDF and type a password twice. The page encrypts the file with the PDF standard security handler using AES-128, entirely in your browser, and gives you a new file that asks for the password in common readers such as Adobe Reader, Chrome and mobile PDF apps.',
      'No server ever sees the file or the password, and ToolShoppy cannot recover a forgotten password. That is the point of local encryption, and also its main risk: write the password down. Encryption stops casual access to the file; it is not a replacement for a certified digital signature or an enterprise security process.',
    ],
    benefits: [
      'Protect Aadhaar, PAN, bank statements and salary slips before emailing them.',
      'Works in the common PDF readers, so the recipient needs nothing special.',
      'Local encryption: the file and password never leave your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Who sees your password', 'Nobody but you. It is used in your browser only.', 'The file and password are processed on the provider’s servers.', 'Stays on your computer.'],
      ['Encryption', 'AES-128 using the standard PDF handler.', 'Commonly AES-128 or AES-256 (varies).', 'Often offers AES-256.'],
    ],
    better: 'you need AES-256, certificate-based encryption, or permission rules such as blocking printing across a team. Desktop PDF software or a document security platform handles those needs.',
    tips: [
      'Share the password through a different channel than the file, for example by phone or a separate message.',
      'Use a long phrase rather than a short word, because short passwords can be guessed.',
      'Keep an unprotected original somewhere safe. A lost password cannot be recovered.',
      'To remove protection later, use Unlock PDF with the password you set.',
    ],
    links: [['/tools/pdf/unlock/', 'Unlock a PDF'], ['/tools/pdf/merge/', 'Merge before protecting'], ['/tools/image/govt-photo/aadhaar/', 'Aadhaar photo tool']],
  },

  'pdf/unlock': {
    name: 'Unlock PDF',
    kind: 'pdf',
    how: [
      'You open a protected PDF, enter the password you already know, and the page opens the document with it in your browser. It then writes a copy that no longer asks for a password.',
      'The unlocked copy is rebuilt from page images, so text, links and form fields are not kept as editable content. The tool does not crack unknown passwords and cannot open a file without the correct password.',
    ],
    benefits: [
      'Remove the password from your own document so you can print, share or archive it easily.',
      'Pairs with Password Protect when you want to change a password.',
      'Private: the file and password stay in your browser.',
      'Free, with no signup.',
    ],
    rows: [
      ['Output', 'An unlocked copy made of page images. Text and links are not preserved.', 'Often keeps text and structure.', 'Keeps text and structure when you save without a password.'],
      ['Unknown passwords', 'Not supported. You must know the password.', 'Most reputable services also require the password.', 'Also requires the password.'],
    ],
    better: 'you need the unlocked file to keep selectable text, bookmarks or fillable fields. Open it in a desktop PDF reader with the password and save a copy without security instead.',
    tips: [
      'Only unlock documents you own or have permission to use.',
      'Zoom into the result to confirm every page looks right before you delete the original.',
      'If you need to edit text afterwards, the image-based copy will not allow it. Use OCR PDF first.',
      'Re-protect the file with Password Protect with a new password if you are sharing it.',
    ],
    links: [['/tools/pdf/protect/', 'Password protect'], ['/tools/pdf/ocr-pdf/', 'Make the copy searchable'], ['/tools/pdf/merge/', 'Merge PDFs']],
  },

  'pdf/sign': {
    name: 'Sign PDF',
    kind: 'pdf',
    how: [
      'You open a PDF, choose Signature, and draw it, type it or upload an image of your signature. You then drag the signature to the right place on any page, resize it, and add initials, a date or extra text if needed.',
      'The signature is placed on top of the page as an overlay, so the original PDF content is not rasterized and stays sharp and selectable. If you tick “Save this signature”, a copy stays in your own browser’s local storage for next time. It is not uploaded.',
    ],
    benefits: [
      'Sign forms, offer letters and rental agreements from your phone without printing.',
      'Draw, type or upload, and reuse the same signature on every page.',
      'The original document is not blurred or re-rendered.',
      'No account and no watermark.',
    ],
    rows: [
      ['Type of signature', 'A visual signature placed on the page. It is not a certificate-based digital signature.', 'Many also offer simple visual signing; certificate-based signing is a separate, often paid, service.', 'Desktop PDF software can create certificate-based digital signatures.'],
    ],
    better: 'the other side requires a certificate-based or legally certified e-signature, an audit trail, or signatures from several people. A dedicated e-signature service handles those workflows.',
    tips: [
      'Draw your signature with a stylus or finger on a large screen so it looks natural.',
      'Use the Date and Text tools instead of editing the PDF text, so the original stays untouched.',
      'Check the requirements of the recipient. Many everyday documents accept a visual signature; some contracts do not.',
      'Clear the saved signature from the signature panel if you are on a shared device.',
    ],
    links: [['/tools/pdf/editor/', 'Edit text in the PDF'], ['/tools/pdf/protect/', 'Password protect the signed file'], ['/tools/pdf/merge/', 'Merge pages']],
  },

  'pdf/rotate': {
    name: 'Rotate PDF',
    kind: 'pdf',
    how: [
      'Each page appears as a thumbnail. You can rotate the whole document left or right in 90-degree steps, or tap the rotate button on a single page.',
      'Rotation is stored as a page-orientation setting in the PDF, written with pdf-lib. The page content is not redrawn, so there is no quality loss. Saving gives you a new PDF with the orientation fixed for any reader.',
    ],
    benefits: [
      'Fix a sideways scan from a phone or scanner in a few taps.',
      'Rotate only the pages that need it, leaving the rest unchanged.',
      'No quality loss because the pixels are not re-rendered.',
      'Private and free, with no signup.',
    ],
    rows: [
      ['Quality', 'No re-rendering. Orientation metadata changes.', 'Typically the same.', 'Same.'],
    ],
    better: 'you need to straighten a slightly tilted scan by a few degrees, or crop the page. That needs an image or PDF editor with deskew and crop tools.',
    tips: [
      'Rotate before merging so every part of the final document has the correct orientation.',
      'If only some pages are sideways, rotate those pages individually.',
      'Open the saved file and scroll through it. Some viewers cache the old orientation.',
      'If you also need to reorder or delete pages, Organize PDF does all three together.',
    ],
    links: [['/tools/pdf/organize/', 'Organize pages'], ['/tools/pdf/merge/', 'Merge PDFs'], ['/tools/pdf/image-to-pdf/', 'Images to PDF']],
  },

  'pdf/organize': {
    name: 'Organize PDF',
    kind: 'pdf',
    how: [
      'The page renders each page as a thumbnail. You drag thumbnails into a new order (or use the arrow buttons on touch screens), rotate any page by 90 degrees, or delete pages you do not need.',
      'When you save, pdf-lib builds a new PDF containing the pages in your chosen order and rotation. Pages are copied rather than redrawn, so text stays selectable and the quality is unchanged. It all runs in your browser.',
    ],
    benefits: [
      'Reorder, rotate and delete pages in one place, with live previews.',
      'Remove a blank or private page before you share a document.',
      'No quality loss, no upload and no signup.',
      'Works on a phone, with arrow buttons as an alternative to dragging.',
    ],
    rows: [
      ['Page management', 'Reorder, rotate and delete with thumbnails.', 'Similar tools; some limit page counts on free plans (varies).', 'Full page management plus bookmarks.'],
    ],
    better: 'you need to insert pages from another PDF, crop pages, or keep bookmarks. Merge PDF can add pages from other files, and desktop software handles cropping and bookmarks.',
    tips: [
      'Use Reset order if you want to start again without reloading the file.',
      'Delete pages first, then reorder, because it is easier to see the remaining pages.',
      'Check the preview of the last page after you delete, to make sure nothing important was removed.',
      'Save under a new name so your original stays available.',
    ],
    links: [['/tools/pdf/split/', 'Split PDF'], ['/tools/pdf/merge/', 'Merge PDF'], ['/tools/pdf/page-numbers/', 'Add page numbers']],
  },

  'pdf/watermark': {
    name: 'Watermark PDF',
    kind: 'pdf',
    how: [
      'You type the watermark text and choose size, opacity, angle (horizontal or diagonal) and colour. A live preview shows how it will look.',
      'When you apply it, the same text is stamped on every page with pdf-lib in your browser and a new PDF is saved. The watermark sits on top of the page content. It is a visible deterrent, not tamper-proof: someone with PDF editing tools may be able to remove it, so keep the original and share the stamped copy.',
    ],
    benefits: [
      'Mark a draft, “CONFIDENTIAL” or “COPY” on every page at once.',
      'Control opacity so the page stays readable.',
      'Private: your document is never uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['Watermark type', 'Text watermark on all pages, with size, opacity, angle and colour.', 'Many also support image watermarks and page ranges (varies).', 'Full control, including images and specific pages.'],
    ],
    better: 'you need an image or logo watermark, a different watermark on each page, or a watermark that is hard to remove. Use desktop PDF software or flatten the pages to images first.',
    tips: [
      'Start with around 20 to 30 percent opacity. Higher values can hide text.',
      'A diagonal watermark is harder to crop out than one in a corner.',
      'Add the watermark last, after merging and organizing pages.',
      'Never watermark your only copy. Keep a clean original.',
    ],
    links: [['/tools/pdf/page-numbers/', 'Add page numbers'], ['/tools/pdf/protect/', 'Password protect'], ['/tools/pdf/merge/', 'Merge PDFs']],
  },

  'pdf/page-numbers': {
    name: 'Add Page Numbers to PDF',
    kind: 'pdf',
    how: [
      'You choose a position (bottom left, centre, right, or top right), a format (1, Page 1, 1 / N or Page 1 of N), a starting number and a font size.',
      'The page then writes the numbers onto every page with pdf-lib in your browser and saves a new PDF. The numbers are added on top of the existing page, so the rest of the content is untouched.',
    ],
    benefits: [
      'Number a long merged document so people can refer to “page 12”.',
      'Start from any number when your PDF continues another document.',
      'Choose the format that fits legal, academic or business style.',
      'Private and free, with no signup.',
    ],
    rows: [
      ['Options', 'Four positions, four formats, start number and font size.', 'Comparable options; some restrict features to paid plans (varies).', 'Full header and footer control with page ranges and styles.'],
    ],
    better: 'you need roman numerals for front matter, different numbering for different sections, or to skip a cover page. Desktop PDF software or a word processor handles section-based numbering.',
    tips: [
      'Merge your files first, then add numbers once, so the sequence is correct.',
      'Set “Start at” to 0 or 2 if your cover should not count as page 1.',
      'Check the corner you picked is not covering an existing footer or stamp.',
      'Use 1 / N format when the reader should know the total length.',
    ],
    links: [['/tools/pdf/merge/', 'Merge first'], ['/tools/pdf/watermark/', 'Add a watermark'], ['/tools/pdf/organize/', 'Reorder pages']],
  },

  'pdf/image-to-pdf': {
    name: 'Image to PDF',
    kind: 'pdf',
    how: [
      'You add JPG, PNG, WebP, GIF or BMP images, reorder them with the arrows or by dragging, and choose a page size (A4, Letter or fit to image) and orientation.',
      'Each image becomes one PDF page, built in your browser with pdf-lib. Images in formats a PDF cannot embed directly are converted through the canvas first. The finished PDF is created locally and nothing is uploaded.',
    ],
    benefits: [
      'Turn phone photos of documents into one tidy PDF for a form or email.',
      'Control page size and orientation so printing is predictable.',
      'Reorder before you create the PDF, so pages come out in the right sequence.',
      'Private: ID and receipt images never leave your device.',
    ],
    rows: [
      ['Page layout', 'A4, Letter or fit-to-image, with auto, portrait or landscape.', 'Similar options; margins and compression vary.', 'Full control over margins, compression and OCR.'],
    ],
    better: 'you want the PDF to be searchable, which needs OCR, or you need automatic edge detection and cropping of paper in photos. A scanning app or OCR PDF can then help.',
    tips: [
      'Take photos in good light and straight on, so text is readable on the page.',
      'Use Fit to image if you do not want white borders around a scan.',
      'For a smaller file, compress the images first, then convert.',
      'Run OCR PDF on the result if you need to search or copy the text.',
    ],
    links: [['/tools/image/compress/', 'Compress images first'], ['/tools/pdf/ocr-pdf/', 'Make it searchable'], ['/tools/pdf/pdf-to-image/', 'PDF to image']],
  },

  'pdf/pdf-to-image': {
    name: 'PDF to Image',
    kind: 'pdf',
    how: [
      'PDF.js renders each page of your PDF onto a canvas in your browser, at up to twice the normal scale. You pick JPG or PNG and a quality level (High, Medium or Low).',
      'Each page is exported as an image. A multi-page PDF is bundled in a ZIP. JPG is smaller and suits photos and sharing; PNG is lossless and better for text and graphics.',
    ],
    benefits: [
      'Share a single page as an image on WhatsApp or in a chat.',
      'Use PDF pages in slides, posts or documents that only take images.',
      'Pick JPG for small size or PNG for crisp text.',
      'No upload, no signup and no watermark.',
    ],
    rows: [
      ['Image quality', 'Rendered at up to 2× scale with JPG or PNG output.', 'Often offers resolution options; some limit pages.', 'Fine control over DPI and colour profiles.'],
    ],
    better: 'you need a very high DPI for print, or colour-managed output. A desktop PDF or design application gives exact DPI control.',
    tips: [
      'Choose PNG for text-heavy pages and JPG for photos.',
      'High quality creates larger files. Use Medium when sharing over mobile data.',
      'If the images are too big to upload, run them through the image compressor.',
      'To extract the pictures from a PDF rather than render pages, you need dedicated software.',
    ],
    links: [['/tools/image/compress/', 'Compress the images'], ['/tools/pdf/image-to-pdf/', 'Images to PDF'], ['/tools/pdf/split/', 'Extract pages first']],
  },

  'pdf/pdf-to-excel': {
    name: 'PDF to Excel',
    kind: 'pdf',
    how: [
      'PDF.js extracts every piece of text on a page together with its position. In Auto tables mode the tool groups text that lines up into rows and columns, so an invoice or statement becomes cells. Line-by-line mode simply puts each line in its own row.',
      'Amounts like 1,250.00 or ₹500 are converted to real Excel numbers where the format is clear. You get an .xlsx file with one sheet per page, or all pages combined on one sheet. This works on text-based PDFs; scanned pages have no text, so run OCR first. Column detection is based on spacing, so irregular layouts can need a quick manual fix.',
    ],
    benefits: [
      'Move invoice, statement and ledger data into Excel or Google Sheets without retyping.',
      'Numbers arrive as numbers, so you can add them up straight away.',
      'Choose Auto tables for columns or Line-by-line for narrative documents.',
      'Private: financial documents stay on your device.',
    ],
    rows: [
      ['Table detection', 'Position-based column grouping on text PDFs; may need cleanup on irregular layouts.', 'Some use more advanced table detection and OCR (varies).', 'Acrobat and Excel can import some PDF tables directly.'],
      ['Scanned statements', 'Needs OCR first.', 'Often includes OCR as an option.', 'OCR in paid editions.'],
    ],
    better: 'your PDF has complex nested tables, merged cells or is a scan with skewed columns. Excel’s own Get Data from PDF, or a converter with table-recognition OCR, may give cleaner results.',
    tips: [
      'Try both layout modes and keep the one with cleaner columns.',
      'Check totals against the PDF after converting, especially negative numbers and brackets.',
      'For multi-page statements, use “Combine all pages into one sheet”.',
      'Scanned statement? Run Image OCR or OCR PDF first.',
    ],
    links: [['/tools/pdf/ocr-pdf/', 'OCR scanned PDFs'], ['/tools/pdf/pdf-to-word/', 'PDF to Word'], ['/tools/finance/gst-calculator/', 'GST calculator']],
  },

  'pdf/pdf-to-markdown': {
    name: 'PDF to Markdown',
    kind: 'pdf',
    how: [
      'PDF.js reads the text and the font size of each line. Lines with a noticeably larger font than the body text become Markdown headings (# or ##), and the remaining text becomes paragraphs.',
      'You can insert a separator between original pages, preview the result, copy it, or download a .md file. It only works on PDFs that contain real text. Complex layouts such as multi-column pages may read in a different order than a human would.',
    ],
    benefits: [
      'Get clean text with headings for notes, docs, wikis or AI tools.',
      'Copy it directly, or download as a .md file.',
      'Private: documents never leave your browser.',
      'Free, with no signup.',
    ],
    rows: [
      ['Structure detection', 'Headings from relative font size; paragraphs as plain text.', 'Some convert tables and lists too.', 'Manual or scripted workflows.'],
    ],
    better: 'your document has tables, multi-column layouts or equations that must be preserved. A converter with layout analysis will do better, and scanned pages need OCR first.',
    tips: [
      'Use the page separator option if you need to trace text back to a specific page.',
      'Fix reading order manually when a two-column PDF mixes columns.',
      'For scanned documents, run OCR PDF first and convert the searchable output.',
      'Check numbers and special characters, because extraction can drop unusual symbols.',
    ],
    links: [['/tools/pdf/ocr-pdf/', 'OCR PDF'], ['/tools/pdf/pdf-to-word/', 'PDF to Word'], ['/tools/pdf/pdf-to-excel/', 'PDF to Excel']],
  },

  'pdf/ocr-pdf': {
    name: 'OCR PDF',
    kind: 'pdf',
    how: [
      'OCR means optical character recognition: reading the words in a picture. The tool renders each page of your scanned PDF, runs a PaddleOCR model compiled to WebAssembly in your browser to find and read the text, and places an invisible text layer behind the page.',
      'You get a PDF that looks the same but whose text can be selected, searched and copied, plus a plain .txt file. The first run downloads an OCR model of about 20 MB, which is then cached. Each page takes a few seconds. The searchable layer supports Latin characters; text in other scripts is preserved in the separate text download.',
    ],
    benefits: [
      'Turn a scanned certificate or book chapter into something you can search and copy from.',
      'Output looks identical to your scan, with a hidden text layer.',
      'On-device: pages are never uploaded, which suits personal and legal documents.',
      'Works offline after the first model download.',
    ],
    rows: [
      ['Where recognition runs', 'On your device with PaddleOCR in WebAssembly.', 'On the provider’s servers.', 'On your computer.'],
      ['Speed', 'A few seconds per page on a typical device; first run downloads a model.', 'Fast, because servers do the work, after upload time.', 'Fast on a desktop, usually in paid editions.'],
    ],
    better: 'you have hundreds of pages, handwriting, or non-Latin scripts that must be searchable inside the PDF. A server-based or desktop OCR product tuned for those will be faster and more complete.',
    tips: [
      'Scan at a clear resolution and straight on. OCR accuracy depends mostly on image quality.',
      'Keep the tab open until every page finishes.',
      'Proofread names, dates and numbers in the text output.',
      'Need only a few lines from a photo? Image OCR is lighter for that.',
    ],
    links: [['/tools/image/ocr/', 'Image OCR'], ['/tools/pdf/pdf-to-markdown/', 'PDF to Markdown'], ['/tools/pdf/compress/', 'Compress the result']],
  },

  'pdf/html-to-pdf': {
    name: 'HTML to PDF',
    kind: 'pdf',
    how: [
      'You paste HTML or upload an .html file, and the page renders it inside an isolated preview frame so you can check how it looks. You then choose A4 or Letter.',
      'To make the PDF, the tool draws the rendered preview with html2canvas and places it onto pages with jsPDF. Tall content is split across pages automatically. Because the pages are made from an image of the render, the text in the PDF is not selectable. It cannot fetch a live web address, because browsers block reading other sites; paste the HTML source instead.',
    ],
    benefits: [
      'Turn a hand-written invoice, resume or report in HTML into a PDF without a server.',
      'See a preview before exporting, so you catch layout issues early.',
      'Inline styles and style blocks are supported.',
      'Private and free, with no signup.',
    ],
    rows: [
      ['Output', 'Image-based pages. Text is not selectable.', 'Server renderers often produce real text PDFs.', 'Browser Print to PDF produces real text PDFs.'],
      ['Web addresses', 'Not supported; paste the HTML source.', 'Many can fetch a URL.', 'Browser print works on any open page.'],
    ],
    better: 'you need selectable, searchable text or want to convert a live web page. Use your browser’s Print, then Save as PDF, which creates a text PDF directly.',
    tips: [
      'Use absolute sizes in your CSS (px, mm) so the preview matches the page.',
      'Embed images as data URLs if they do not load in the sandbox.',
      'Keep page-width content inside A4 width to avoid cut-off edges.',
      'Check long pages for text split at a page boundary.',
    ],
    links: [['/tools/pdf/word-to-pdf/', 'Word to PDF'], ['/tools/pdf/merge/', 'Merge PDFs'], ['/tools/pdf/compress/', 'Compress PDF']],
  },
};
