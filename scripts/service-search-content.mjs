// Reviewed copy for existing service URLs. These pages answer the task directly;
// synonyms share one canonical page instead of generating keyword variants.
export const SERVICE_SEARCH_CONTENT = {
  'image/compress': {
    name: 'Image Compressor',
    title: 'Image Compressor Online Free – Reduce Image Size | ToolShoppy',
    description: 'Free online image compression for JPG, PNG and WebP. Choose a KB target, reduce photo file size and download JPEGs. No signup or server upload.',
    h1: 'Image Compressor — Reduce Image Size Online',
    intro: 'Compress JPG, PNG and WebP images for forms, email and sharing. Choose a target size in KB and download smaller JPEG files, directly in your browser.',
    sections: [
      ['Image compression for photos and upload limits', '<p>Use image compression when a photo takes too long to send or a website rejects its file size. Choose 20 KB, 50 KB, 100 KB, 200 KB or 500 KB, or enter a custom target. You can select several images and download the results together as a ZIP.</p><p>For example, if a form asks for a photo below 100 KB, select the 100 KB preset and check the actual output size before submitting. A target is not a guarantee of an exact byte count. Fine details and small text can become less clear at lower sizes, so inspect the downloaded photo too.</p>'],
      ['Compress an image, resize it, or change its format?', '<p>File size is measured in KB or MB; dimensions are measured in pixels. If an upload requires a specific width and height, use the <a href="/tools/image/resize/">image resizer</a>. If it requires a different file type, use the <a href="/tools/image/convert/">JPG, PNG and WebP converter</a>. Compression here adjusts JPEG quality and may reduce dimensions to approach a small target.</p><p>This compressor exports JPEG. It does not preserve PNG transparency or animation. Use the converter for a PNG or WebP output, and keep your original image if you need an editable or transparent version.</p>'],
      ['Preparing a photo for an application form', '<p>Read the form’s file type, pixel dimensions and file-size limit separately. The <a href="/tools/image/govt-photo/">application photo resizer</a> provides common starting presets; the current instructions on your particular form take precedence. After compression, compare the result with those requirements before uploading it to the application website.</p><p>For a worked walkthrough, see <a href="/blog/compress-image-to-20kb-free/">how to compress an image to a 20 KB target</a>.</p>'],
    ],
    faqs: [
      ['How do I compress an image online?', 'Select one or more JPG, PNG or WebP files, choose a target size in KB, and click Compress Images. Review the output size and download a JPEG or a ZIP of multiple results. Processing happens in your browser.'],
      ['Can I compress a photo to 20 KB, 50 KB or 100 KB?', 'These presets are available, along with a custom target. The resulting size depends on the original image. Check the actual downloaded size against your upload limit; an exact byte count is not guaranteed.'],
      ['Does image compression change the dimensions?', 'The tool first adjusts JPEG quality and can also reduce pixel dimensions for smaller targets. If a form requires a specific width and height, check those dimensions separately.'],
      ['Can I compress a PNG without losing transparency?', 'This tool outputs JPEG, which does not support transparency. Use the image converter when you need PNG or WebP output with transparency.'],
      ['Are my photos uploaded to ToolShoppy?', 'No. Image compression runs locally in your browser. You do not need to create an account or send your photos to a ToolShoppy server.'],
    ],
  },
  'pdf/merge': {
    name: 'Merge PDF',
    title: 'Merge PDF Online Free – Combine PDF Files | ToolShoppy',
    description: 'Merge PDF files online for free. Add PDFs, arrange their order and combine them into one document in your browser. No signup or server upload.',
    h1: 'Merge PDF — Combine PDF Files Online',
    intro: 'Combine several PDF files into one document. Add your files, arrange their order, and download the merged PDF without uploading your documents to a server.',
    sections: [
      ['Combine documents into one PDF', '<p>A PDF merger is useful when a form accepts one attachment but your documents are in separate files. For example, add a cover letter, CV and supporting certificate, place them in that order, and merge them into a single application document. You can also combine invoice PDFs or separate scanned chapters.</p><p>The order of files in the list determines the order of the output. Every page from the first file comes before every page from the second. To remove or rearrange individual pages, use <a href="/tools/pdf/organize/">Organize PDF</a>; to keep just a page range, use <a href="/tools/pdf/split/">Split PDF</a>.</p>'],
      ['Merging scanned PDFs and large files', '<p>Scanned PDFs can be combined, but merging does not recognize the words inside scanned images. Use <a href="/tools/pdf/ocr-pdf/">PDF OCR</a> if you need a searchable document. Merging also does not set a final file-size limit. Check the result before attaching it to a form or email.</p><p>Files are processed in your browser, so available device memory limits the size of a batch. If a large batch fails, try fewer PDFs at a time. For a password-protected document, first open it with the correct password and save an authorized unlocked copy using <a href="/tools/pdf/unlock/">Unlock PDF</a>.</p>'],
      ['Check the merged PDF before sharing', '<p>Open the downloaded file and check the total page count, order and orientation. Keep the source PDFs so you can repeat the merge if an attachment is missing. On a phone, the saved file is usually available through the browser’s Downloads list or your Files app.</p><p>See the <a href="/blog/how-to-merge-pdf-free/">step-by-step guide to merging PDFs</a> for the full workflow.</p>'],
    ],
    faqs: [
      ['How do I merge PDF files into one document?', 'Select your PDFs, arrange the files in the list, click Merge PDFs and download the combined document. Pages are copied in the displayed file order.'],
      ['Can I change the order before merging?', 'Yes. Reorder the files with drag and drop or the up and down buttons. These controls reorder whole files. Use Organize PDF to rearrange individual pages.'],
      ['Is there a limit on the number of PDFs?', 'There is no fixed file-count limit in the merger. The practical limit depends on your browser and available device memory. Try smaller batches if a large merge fails.'],
      ['Will merging PDFs reduce the file size?', 'Merging combines pages; it does not target a smaller file size. Check the output size separately if a form or email has an attachment limit.'],
      ['Do my PDFs get uploaded anywhere?', 'No. ToolShoppy merges PDFs locally in your browser. No account or server upload is required.'],
    ],
  },
  'image/resize': {
    name: 'Image Resizer',
    title: 'Image Resizer Online Free – Resize by Pixels or % | ToolShoppy',
    description: 'Resize images online by width and height in pixels or by percentage. Keep the aspect ratio or set custom dimensions. Free, no signup or upload.',
    h1: 'Image Resizer — Resize Images by Pixels or Percentage',
    intro: 'Set a photo’s width and height in pixels or scale it by a percentage. Resize images locally in your browser, with an aspect-ratio lock to help preserve their proportions.',
    sections: [
      ['Choose pixel dimensions or a percentage', '<p>Use pixel mode when a website gives a specific width and height, such as 800 × 600 pixels. Use percentage mode when you want an image smaller in both directions: 50% makes the width and height half their original values.</p><p>Keep the aspect ratio locked to preserve the image’s proportions. A width and height with a different ratio can stretch the picture. If the destination also has a KB limit, use the <a href="/tools/image/compress/">image compressor</a> and check the final dimensions and file size together.</p>'],
      ['Resizing is different from converting a file', '<p>Resizing changes dimensions. It does not guarantee a particular file size or recover detail that was absent from the original photo. For a different file format, use the <a href="/tools/image/convert/">image converter</a>. For a document photo preset, start with the <a href="/tools/image/govt-photo/">application photo resizer</a> and compare its output with your form’s current requirements.</p>'],
    ],
  },
  'image/convert': {
    name: 'Image Converter',
    title: 'Image Converter Online – JPG, PNG, WebP & HEIC | ToolShoppy',
    description: 'Convert JPG, PNG, WebP and HEIC images to JPG, PNG or WebP online. Choose an output format and download for free. No signup or server upload.',
    h1: 'Image Converter — JPG, PNG, WebP and HEIC',
    intro: 'Convert your photos to JPG, PNG or WebP in your browser. Open common image formats, including HEIC photos, and choose the format you need to download.',
    sections: [
      ['Which image format should I choose?', '<p>Choose JPG for photos when the receiving website requests a JPEG. Choose PNG when you need transparency or a lossless image format, particularly for graphics and screenshots. WebP is useful for web images when your publishing system accepts it.</p><p>JPEG does not support transparency. Saving a low-quality JPEG as PNG also cannot restore detail already lost. After conversion, open the output and check that its appearance and format meet your needs.</p>'],
      ['Convert HEIC photos or prepare an upload', '<p>If a website does not accept an iPhone HEIC photo, select it here and choose JPG as the output. The converter creates a new file, so keep your original photo. Read the <a href="/blog/heic-to-jpg-iphone-india/">HEIC to JPG walkthrough</a> for more context.</p><p>Changing the format alone does not guarantee a particular KB size or pixel dimensions. Use the <a href="/tools/image/compress/">image compressor</a> for a file-size target or the <a href="/tools/image/resize/">image resizer</a> for width and height requirements.</p>'],
    ],
  },
  'pdf/compress': {
    name: 'PDF Compressor',
    title: 'PDF Compressor Online Free – Reduce PDF Size | ToolShoppy',
    description: 'Reduce PDF file size online with selectable compression quality. Process PDFs in your browser and download for free, without signup or server upload.',
    h1: 'PDF Compressor — Reduce PDF File Size Online',
    intro: 'Reduce a PDF’s file size for email and uploads. Select a compression level, compare the result with the original, and download the output from your browser.',
    sections: [
      ['Compress a PDF for email or an upload limit', '<p>Start with a moderate compression setting and check both the output size and readability. Scanned documents and image-heavy PDFs are useful candidates. A PDF that already contains compressed images may shrink very little or become larger; keep the original when the result is not an improvement.</p><p>No setting guarantees a particular final KB or MB size. If you only need part of the document, <a href="/tools/pdf/split/">extract the required PDF pages</a> before compressing. If you need to combine attachments, <a href="/tools/pdf/merge/">merge your PDFs</a> and check the size of the final combined file.</p>'],
      ['What changes during PDF compression?', '<p>This compressor renders PDF pages as images and rebuilds the document. Text selection, clickable links and interactive form fields are not preserved in the output. Fine print can also become less clear at lower quality settings.</p><p>Keep the original when you need editable fields, selectable text or working links. For a copy intended for reading or an application upload, open the output and inspect small text, signatures and stamps before sending it.</p>'],
    ],
  },
};

export const HUB_GUIDES = {
  image: ['Choose an image tool for your upload', '<p>Use <a href="/tools/image/compress/">image compression</a> for a smaller file size, <a href="/tools/image/resize/">image resizing</a> for width and height, or the <a href="/tools/image/convert/">image converter</a> for JPG, PNG and WebP output. These are separate requirements: a correctly sized photo can still be too large in KB or use the wrong format.</p><p>For text in a picture, choose Image OCR. For a transparent cutout, choose Background Remover. Each tool below opens directly to its own workspace and instructions.</p>'],
  pdf: ['Choose the PDF tool that matches your task', '<p><a href="/tools/pdf/merge/">Merge PDF</a> combines documents into one file. <a href="/tools/pdf/split/">Split PDF</a> extracts selected pages, and <a href="/tools/pdf/organize/">Organize PDF</a> changes page order or removes pages. To reduce attachment size, open the <a href="/tools/pdf/compress/">PDF compressor</a> and review its output limitations.</p><p>For scanned documents, PDF OCR recognizes text; PDF to Word serves a different purpose by exporting a DOCX file. Select the tool for your intended output, then read the instructions on that page before processing important documents.</p>'],
  video: ['Compress, cut or extract audio from a video', '<p>Choose the <a href="/tools/video/compress/">video compressor</a> to reduce file size, or the <a href="/tools/video/trim/">video trimmer</a> to keep one section of a clip. Use <a href="/tools/video/to-audio/">Video to MP3</a> when you only need the audio track. The status splitter divides a longer video into short clips.</p><p>Processing happens on your device, so larger files can take longer and use more memory. Keep the original recording and check the exported clip before sharing it.</p>'],
  finance: ['Find the calculator for your estimate', '<p>The <a href="/tools/finance/emi-calculator/">EMI calculator</a> models loan payments; the <a href="/tools/finance/sip-calculator/">SIP calculator</a> models regular investments; and the FD / RD calculator estimates deposit maturity. GST and UAE VAT calculators add or remove a selected tax percentage.</p><p>Salary and income-tax calculators use different inputs and assumptions. Check the selected year, regime and assumptions on the relevant page before using a result for planning.</p>'],
  rates: ['Find a rate or currency conversion', '<p>Choose gold or silver for precious-metal reference pages, petrol prices for state fuel pages, or the <a href="/tools/rates/currency-converter/">currency converter</a> to compare currency amounts. The <a href="/tools/rates/currency-converter/aed-inr/">AED to INR converter</a> opens the dirham-to-rupee pair directly.</p><p>Read the source timestamp on a rate page and compare it with your provider’s current quote. Retail prices, exchange spreads and transaction fees can differ from reference values.</p>'],
  misc: ['Quick tools for everyday tasks', '<p>Create a scannable link with the <a href="/tools/misc/qr-generator/">QR code generator</a>, prepare a chat URL with the <a href="/tools/misc/whatsapp-link/">WhatsApp link generator</a>, or check a draft with the <a href="/tools/misc/word-counter/">word and character counter</a>. Each tool has its own page, so you can bookmark the one you use regularly.</p><p>Other utilities cover age calculations, time zones, text styling and audio trimming. Choose by the result you need from the cards below.</p>'],
};
