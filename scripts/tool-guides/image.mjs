/**
 * Image tool guides. Exam and passport guides deliberately point to the spec
 * shown on the page instead of repeating numbers, so there is one place to
 * update when an authority changes its rules.
 */
const photoNote = 'Always check the issuing authority’s current notification before you submit. Specifications change, and the preset is a starting point.';

export const IMAGE = {
  'image/compress': {
    name: 'Image Compressor',
    kind: 'image',
    how: [
      'You choose a target size such as 20, 50, 100, 200 or 500 KB, or type your own. For each image the tool encodes a JPEG and adjusts the quality up and down, a binary search, until the file lands as close to your target as it can without going over. For very small targets it can also reduce pixel dimensions.',
      'All of this uses the canvas in your browser, so nothing is uploaded. The result is always a JPEG, which means transparency and animation are not kept. The target is not a guarantee of an exact byte count, so check the size shown after compression.',
    ],
    benefits: [
      'Hit a form’s “under 50 KB” or “under 100 KB” limit without guessing at quality sliders.',
      'Compress several photos at once and download them as a ZIP.',
      'See original and compressed sizes side by side.',
      'Photos stay on your device, which matters for ID and exam photos.',
    ],
    rows: [
      ['Target size', 'Pick a KB target and the tool searches for the best quality that fits.', 'Most use a quality slider or a fixed “smart” level, so you may need several tries.', 'You adjust quality and re-export by hand until it fits.'],
      ['Transparency', 'Output is JPEG. Transparency is not preserved.', 'Many keep PNG transparency by quantising colours.', 'Full control of format and transparency.'],
    ],
    better: 'you need to keep PNG transparency, a specific colour profile, or the best possible quality for printing. A desktop editor, or the Image Converter for PNG or WebP output, fits better.',
    tips: [
      'Start from the largest, clearest original you have. Compressing an already-small photo hurts quality faster.',
      'Check the dimensions required by the form too. Compression does not guarantee them.',
      'Look at faces and text at 100 percent zoom before uploading.',
      'If a form needs exact pixel size and a KB limit, resize first, then compress.',
    ],
    links: [['/tools/image/resize/', 'Resize to exact pixels'], ['/tools/image/govt-photo/', 'Government photo presets'], ['/blog/compress-image-to-20kb-free/', 'Compress to 20 KB guide']],
  },

  'image/resize': {
    name: 'Image Resizer',
    kind: 'image',
    how: [
      'In pixel mode you type a width and height. With the aspect-ratio lock on, changing one number updates the other so the picture is not stretched. In percentage mode a slider scales both sides, so 50 percent gives half the width and half the height.',
      'The resizing is done with the canvas in your browser and the output keeps your original format where possible. Making an image smaller keeps it looking sharp; making it larger cannot add detail that was never captured.',
    ],
    benefits: [
      'Hit an exact width and height required by an application or website.',
      'Resize many photos at once with the same settings.',
      'Percentage mode for quick “make it half the size” jobs.',
      'Private: images are processed in your browser.',
    ],
    rows: [
      ['Modes', 'Exact pixels with aspect lock, or percentage.', 'Often the same; some add presets for social sizes.', 'Full control, including cropping and resampling options.'],
    ],
    better: 'you need to crop to a different shape, rotate a few degrees, or retouch. Resizing changes dimensions only; a photo editor handles composition.',
    tips: [
      'Keep the aspect-ratio lock on unless the form demands a different ratio.',
      'Resizing does not set a KB limit. Use the compressor if the form also has a size limit.',
      'Make images smaller rather than larger when you can, to avoid softness.',
      'Name the output clearly so you do not upload the wrong version.',
    ],
    links: [['/tools/image/compress/', 'Compress to a KB target'], ['/tools/image/govt-photo/', 'Government form photos'], ['/tools/image/convert/', 'Change format']],
  },

  'image/convert': {
    name: 'Image Converter',
    kind: 'image',
    how: [
      'You add images and choose JPG, PNG or WebP as the output. Each file is decoded by your browser and re-encoded in the new format with the canvas, then offered for download individually or as a ZIP.',
      'JPG is smaller and good for photos but has no transparency. PNG is lossless and keeps transparency, so files are larger. WebP is usually smaller than both. HEIC photos from iPhones can be opened only when your browser and operating system can decode them; if one fails, export it as JPG from the Photos app first.',
    ],
    benefits: [
      'Convert iPhone HEIC photos to JPG so any website will accept them.',
      'Switch between JPG, PNG and WebP in one step.',
      'Batch convert and download everything in a ZIP.',
      'No upload, no signup and no watermark.',
    ],
    rows: [
      ['HEIC support', 'Works when your browser and device can decode HEIC.', 'Servers can decode HEIC regardless of your device after upload.', 'Needs codecs or a plugin on some systems.'],
    ],
    better: 'your browser cannot decode a HEIC or RAW file, or you need exact colour management. A server-based converter or a desktop tool handles unusual formats reliably.',
    tips: [
      'Converting a low-quality JPG to PNG does not restore lost detail. It only makes the file larger.',
      'Keep your original. Re-encoding a JPG repeatedly lowers quality each time.',
      'After converting, check the file size. Format change alone does not hit a KB limit.',
      'Use the compressor afterwards if a portal has a size limit.',
    ],
    links: [['/tools/image/compress/', 'Compress to a KB target'], ['/tools/image/resize/', 'Resize'], ['/blog/heic-to-jpg-iphone-india/', 'HEIC to JPG guide']],
  },

  'image/background-remove': {
    name: 'Background Remover',
    kind: 'image',
    how: [
      'The first time you use it, the page downloads a small neural network (U²-Net-P) once and stores it in your browser. For each photo it runs that model locally through ONNX Runtime and WebAssembly to estimate which pixels belong to the main subject.',
      'The result is a transparent PNG with an edge-softness control, or a version placed on a white background. Because the model finds the most prominent subject, clear photos with a distinct person or object work best, while cluttered scenes may need a cleaner source image. The photo itself is never uploaded.',
    ],
    benefits: [
      'Make a passport, ID or product photo with a clean background.',
      'Transparent PNG or white-background download.',
      'Compare before and after with a slider.',
      'Runs on your device, so personal photos stay private.',
    ],
    rows: [
      ['Where the model runs', 'On your device. Only the model file is downloaded.', 'On the provider’s servers after upload.', 'On your computer, often with manual selection tools.'],
      ['Fine detail (hair, glass)', 'A compact model handles everyday photos; very fine detail can look rough.', 'Larger server-side models may handle hair and glass better.', 'Best with manual refinement.'],
    ],
    better: 'you need hair-level precision, glass or transparent objects, or batch product photography at scale. A server-side model or desktop editor will give better edges.',
    tips: [
      'Use even lighting and a subject that contrasts with the background.',
      'Increase edge softness slightly if edges look jagged.',
      'For forms that need a white background, download the white version.',
      'Then use the government photo or passport tool to set the exact size.',
    ],
    links: [['/tools/image/govt-photo/', 'Resize for government forms'], ['/tools/image/passport-photo/', 'Passport photo'], ['/tools/image/sticker-maker/', 'Make a sticker']],
  },

  'image/govt-photo': {
    name: 'Government Photo Resizer',
    kind: 'image',
    how: [
      'You choose a form type such as Kerala PSC, UPSC, SSC, PAN, Aadhaar, passport or Emirates ID, and a background colour. The tool crops your photo to the preset’s aspect ratio, pads it onto the chosen background, scales it to the preset’s pixel size, and then searches for a JPEG quality that keeps the file under the preset’s size limit.',
      'Everything happens in your browser. The presets reflect commonly published requirements, but portals update their rules. The size and limit shown for your chosen preset are the numbers used, so compare them with your form’s current notification before you upload.',
    ],
    benefits: [
      'One page for many forms, with the size, background and KB limit set for you.',
      'Saves a trip to a photo studio or browser café.',
      'Photos are processed on your device, never uploaded to us.',
      'Pairs with the background remover when your photo is not on a plain backdrop.',
    ],
    rows: [
      ['Exam and form presets', 'Built-in presets for Indian exams and IDs, passports and Emirates ID.', 'Generic resize and compress tools; you look up and enter the spec.', 'Manual crop, resize and export in an editor.'],
      ['Meeting the KB limit', 'Automatically adjusts quality to stay under the preset’s limit.', 'Often requires separate steps for dimensions and size.', 'Manual trial and error.'],
    ],
    better: 'the portal wants a particular DPI, colour profile or a face-position check that you cannot verify yourself. A professional studio or the official photo guide may be safer for passport-grade submissions.',
    tips: [
      'Use a recent, front-facing photo with even light and no shadows on the face.',
      'Keep the original so you can regenerate if the rules change.',
      photoNote,
      'Download and open the result to check the face is centred and not clipped.',
    ],
    links: [['/tools/image/background-remove/', 'Remove the background first'], ['/tools/image/compress/', 'Compress to an exact KB'], ['/tools/image/passport-photo/', 'Passport photo maker']],
  },

  'image/govt-photo/psc': {
    name: 'Kerala PSC Photo Resizer',
    kind: 'image',
    how: [
      'This page opens with the Kerala PSC preset already selected. You upload a clear, front-facing photo, and the tool crops it to the preset’s shape, places it on the required background, scales it to the pixel size listed at the top of the page and finds a JPEG quality that fits the size limit.',
      'Processing is done in your browser with the canvas, so your photo is not uploaded. If your photo is not on a plain background, remove the background first, then bring it here.',
    ],
    benefits: [
      'Prepare a PSC-style photo at home without a studio visit.',
      'The size, background and KB limit are applied for you.',
      'Private: the photo stays on your device.',
      'Free with no signup, useful when several applications are due close together.',
    ],
    rows: [
      ['Specific to this form', 'Preset selected on arrival with the spec visible on the page.', 'Generic tools need you to look up and enter the numbers.', 'Manual setup in an editor.'],
    ],
    better: 'the notification asks for a signature image or extra files with their own limits, or the rules changed. Read the current PSC instructions, and use the image compressor for each additional file.',
    tips: [
      'Wear plain clothes, face the camera, keep both ears visible, and avoid shadows.',
      'Common reasons for rejection are wrong dimensions, a file over the limit, or a patterned background.',
      photoNote,
      'Keep the generated file with a clear name so you can reuse it across applications.',
    ],
    links: [['/tools/image/govt-photo/', 'All government presets'], ['/blog/how-to-compress-image-for-psc/', 'PSC photo guide'], ['/tools/image/compress/', 'Compress an image']],
  },

  'image/govt-photo/upsc': {
    name: 'UPSC Photo Resizer',
    kind: 'image',
    how: [
      'The UPSC preset is selected when you arrive. Upload a recent, clear photo and the tool crops it to the correct shape, scales it to the pixel size shown at the top of the page, and encodes a JPEG that stays within the size limit.',
      'All of the work happens in your browser. The page shows the output size and file size so you can confirm them before you upload to the UPSC portal.',
    ],
    benefits: [
      'Get the photo ready before the application window gets busy.',
      'Spec, background and file limit are handled for you.',
      'Your photo is not uploaded anywhere.',
      'Works the same for the many exams that share a similar photo format.',
    ],
    rows: [
      ['Specific to this form', 'Preset selected on arrival, spec shown on the page.', 'Generic tools need manual numbers.', 'Manual setup in an editor.'],
    ],
    better: 'your notification specifies a different size for the photo or for the signature. Check the latest notification for each uploaded file, since UPSC exams can have different instructions.',
    tips: [
      'Use a photo taken within the period the notification allows.',
      'Make sure your face is clearly visible, with a plain background.',
      photoNote,
      'Resize the signature separately using the image resizer and compressor.',
    ],
    links: [['/blog/upsc-photo-size-requirements/', 'UPSC photo requirements'], ['/tools/image/resize/', 'Resize a signature'], ['/tools/image/govt-photo/', 'All presets']],
  },

  'image/govt-photo/ssc': {
    name: 'SSC Photo Resizer',
    kind: 'image',
    how: [
      'The SSC preset is selected when you arrive. You upload a photo and the tool crops, pads and scales it to the pixel size shown at the top of the page, then lowers JPEG quality just enough to fit the file-size limit.',
      'Because the SSC limit is tight, source quality matters: a sharp, high-resolution original compresses more cleanly than one that is already small or blurred. All processing is local to your browser.',
    ],
    benefits: [
      'Meets a tight KB limit without trial and error.',
      'Preset and background are applied for you.',
      'Private: your photo stays on your device.',
      'Useful across CGL, CHSL, MTS and other SSC forms, subject to the notification.',
    ],
    rows: [
      ['Specific to this form', 'Preset selected on arrival with the spec visible.', 'Generic tools need you to enter the numbers.', 'Manual setup.'],
    ],
    better: 'your original is very low quality and the output looks blurry at the size limit. Retake the photo in better light with a higher-resolution camera, then run it through the tool again.',
    tips: [
      'Start with the sharpest, largest photo you have.',
      'Avoid heavy filters or beauty modes, which add detail that compresses poorly.',
      photoNote,
      'Check the face at 100 percent zoom after downloading.',
    ],
    links: [['/tools/image/compress/', 'Compress to an exact KB'], ['/tools/image/background-remove/', 'Remove background'], ['/tools/image/govt-photo/', 'All presets']],
  },

  'image/govt-photo/pan-card': {
    name: 'PAN Card Photo Resizer',
    kind: 'image',
    how: [
      'The PAN preset is selected on arrival. You upload a front-facing photo, and the tool crops it to the preset’s shape, scales it to the pixel size shown at the top of the page, places it on a white background and compresses it to the stated file-size limit.',
      'The preset follows commonly published requirements for online PAN applications. Processing is entirely in your browser; your photo is not sent to any server.',
    ],
    benefits: [
      'Prepare a PAN application photo in a minute.',
      'Dimensions, background and size limit are set automatically.',
      'No upload, no signup.',
      'Same workflow as the other government form presets.',
    ],
    rows: [
      ['Specific to this form', 'Preset selected on arrival with the spec visible.', 'Generic tools need manual numbers.', 'Manual setup.'],
    ],
    better: 'you also need to scan a signature or documents with their own size and format rules. Use the image compressor and PDF tools for those, and always read the portal’s current instructions.',
    tips: [
      'Use a plain, light background and no hats or heavy shadows.',
      'Keep your face centred and fully visible.',
      photoNote,
      'Keep the original so you can regenerate the photo if the portal rejects it.',
    ],
    links: [['/blog/pan-card-photo-online-free/', 'PAN card photo guide'], ['/tools/image/compress/', 'Compress an image'], ['/tools/pdf/protect/', 'Protect your scans']],
  },

  'image/govt-photo/aadhaar': {
    name: 'Aadhaar Photo Resizer',
    kind: 'image',
    how: [
      'The Aadhaar preset is selected on arrival. You upload a recent photo and the tool crops, pads and scales it to the pixel size shown at the top of the page, then compresses it to the stated size limit on a white background.',
      'It runs in your browser, so the photo is never uploaded. Aadhaar enrolment itself involves biometric capture at a centre, so a prepared photo mainly helps with forms and update requests that accept an uploaded image.',
    ],
    benefits: [
      'Ready-to-upload photo for Aadhaar update forms.',
      'Spec and file limit applied automatically.',
      'Private processing on your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Specific to this form', 'Preset selected on arrival with the spec visible.', 'Generic tools need manual numbers.', 'Manual setup.'],
    ],
    better: 'your request needs in-person biometric capture or a photo taken at the enrolment centre. In that case follow the centre’s process; this tool prepares images for uploads only.',
    tips: [
      'Use a recent, front-facing photo with a plain background.',
      'Do not upload photos with heavy filters.',
      photoNote,
      'Protect any Aadhaar PDF you email with the password protect tool.',
    ],
    links: [['/blog/aadhaar-photo-size-online/', 'Aadhaar photo guide'], ['/tools/pdf/protect/', 'Password protect a PDF'], ['/tools/image/govt-photo/', 'All presets']],
  },

  'image/passport-photo': {
    name: 'Passport Photo Maker',
    kind: 'image',
    how: [
      'You pick a country template (India, UAE, US or UK), a background colour, and upload a front-facing photo. The tool crops to the template’s aspect ratio, places the photo on the background, scales it to the pixel size shown, and compresses it to the listed limit.',
      'The output is a digital passport photo for online applications, not a print sheet. Everything runs in your browser, so your photo is never uploaded.',
    ],
    benefits: [
      'Make a digital passport photo at home for online applications.',
      'Templates for India, UAE, US and UK.',
      'Pair with the background remover when your wall is not plain.',
      'Free, with no signup, and private.',
    ],
    rows: [
      ['Country templates', 'India, UAE, US and UK presets with sizes shown.', 'Many offer templates; some charge for downloads (varies).', 'Manual setup against the official guide.'],
      ['Compliance checks', 'Sizing and background only; no automated face-position check.', 'Some paid services check head size and shadows.', 'Studios know the official rules.'],
    ],
    better: 'you need a printed photo, or an automated compliance check of head size and shadows before a passport office. A studio or an official-compliance service is safer for first-time passports.',
    tips: [
      'Use even daylight, face the camera with a neutral expression, and keep glasses glare-free or remove them.',
      'Keep the background plain and avoid shadows behind your head.',
      photoNote,
      'Take the photo at arm’s length or have someone take it, not a selfie close-up.',
    ],
    links: [['/tools/image/background-remove/', 'Remove the background'], ['/tools/image/govt-photo/', 'Exam and ID photos'], ['/tools/image/compress/', 'Compress to a KB limit']],
  },

  'image/passport-photo/india': {
    name: 'India Passport Photo Maker',
    kind: 'image',
    how: [
      'This page opens with the India template. Upload a clear photo and the tool crops it to a square, places it on a white background, scales it to the pixel size shown at the top of the page, and compresses it to the file limit.',
      'Everything is processed in your browser. The sizes follow commonly published Passport Seva requirements, so compare them with the current instructions on the official site.',
    ],
    benefits: [
      'Digital India passport photo without a studio visit.',
      'Square crop, white background and size limit are handled.',
      'Your photo stays on your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Specific to India', 'Template preselected, spec shown on the page.', 'Generic tools need manual numbers.', 'Manual setup.'],
    ],
    better: 'you need a print-ready sheet or an in-person biometric capture. For appointments, the passport centre captures biometrics and may have its own photo process.',
    tips: [
      'Use even lighting with no shadows on the face or wall.',
      'Keep your head straight and eyes open with a neutral expression.',
      photoNote,
      'Name the file clearly and keep a copy for future renewals.',
    ],
    links: [['/tools/image/passport-photo/', 'All passport templates'], ['/tools/image/background-remove/', 'Remove background'], ['/tools/image/compress/', 'Compress']],
  },

  'image/passport-photo/uae': {
    name: 'UAE Passport Photo Maker',
    kind: 'image',
    how: [
      'This page opens with the UAE template. Upload a clear, front-facing photo and the tool crops it, places it on a white background, scales it to the size shown at the top of the page and compresses it to the stated limit.',
      'Processing happens in your browser, so residents and visa applicants can prepare a digital photo without a studio visit. Check the specification against the current instructions of the authority you are applying to.',
    ],
    benefits: [
      'Prepare a photo for UAE passport, Emirates ID or visa-style uploads.',
      'Size, background and file limit are applied for you.',
      'Private: nothing is uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['Specific to the UAE', 'Template preselected, spec shown on the page.', 'Generic tools need manual numbers.', 'Manual setup.'],
    ],
    better: 'the authority does a biometric or face-quality check you cannot reproduce at home. Use a recognised photo studio when the application says a studio photo is required.',
    tips: [
      'Keep a neutral expression, both eyes open, with no heavy shadows.',
      'Head coverings for religious reasons are generally allowed, but the face must remain fully visible.',
      photoNote,
      'Use a recent photo. Authorities often reject old ones.',
    ],
    links: [['/tools/image/passport-photo/', 'All passport templates'], ['/tools/rates/currency-converter/aed-inr/', 'AED to INR'], ['/tools/image/compress/', 'Compress']],
  },

  'image/passport-photo/us': {
    name: 'US Passport Photo Maker',
    kind: 'image',
    how: [
      'This page opens with the US template. Upload a clear photo and the tool crops it to a square, places it on a plain background, scales it to the pixel size shown at the top of the page and compresses it to the file limit.',
      'The work is done in your browser, so your photo is not uploaded. For US passports, the State Department also checks head size, expression and recency, which this tool cannot verify, so read the official photo requirements as well.',
    ],
    benefits: [
      'Digital US passport photo for online submissions.',
      'Square crop, background and size limit are handled.',
      'Private processing on your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Specific to the US', 'Template preselected, spec shown on the page.', 'Generic tools need manual numbers.', 'Manual setup.'],
      ['Head-size checks', 'Not automated; compare with the official guidance yourself.', 'Some paid services include automated checks.', 'Photo studios follow the official template.'],
    ],
    better: 'you want a guarantee of acceptance or a printed photo. A drugstore or a compliance-checking service is safer for first-time applications.',
    tips: [
      'Use a recent photo, face forward, neutral expression, no glasses.',
      'Make sure there are no shadows on the face or behind your head.',
      photoNote,
      'Keep the head at the size the official guidance describes. Leave room around it.',
    ],
    links: [['/tools/image/passport-photo/', 'All passport templates'], ['/tools/image/background-remove/', 'Remove background'], ['/tools/image/compress/', 'Compress']],
  },

  'image/sticker-maker': {
    name: 'WhatsApp Sticker Maker',
    kind: 'image',
    how: [
      'You upload a picture and the tool crops it to a centred square, scales it to 512 × 512 pixels and encodes it as WebP when your browser supports it, or PNG otherwise. It tries to keep the file under about 100 KB, the size WhatsApp expects for static stickers.',
      'The tool creates the sticker image only. It does not add stickers to WhatsApp for you; you still need an app or the messaging app’s own import flow to bundle images into a sticker pack. A transparent subject looks best, so remove the background first when needed.',
    ],
    benefits: [
      'Turn a photo, logo or drawing into a sticker-sized image in seconds.',
      'Correct 512 × 512 size and a small file for chat apps.',
      'Private: the picture stays on your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Output', 'A 512 × 512 sticker image, WebP or PNG. You import it using a sticker app.', 'Some are full sticker-pack apps that add the pack for you.', 'Manual export from an editor.'],
    ],
    better: 'you want to build full sticker packs with names, trays and one-tap adding into WhatsApp. A dedicated sticker-pack app handles packaging and import.',
    tips: [
      'Choose a subject with space around it so it does not get cropped.',
      'Remove the background first for the clean cut-out look.',
      'Check the sticker on both light and dark chat backgrounds.',
      'Keep the original so you can recrop it later.',
    ],
    links: [['/tools/image/background-remove/', 'Remove the background'], ['/tools/misc/whatsapp-link/', 'WhatsApp link maker'], ['/tools/image/compress/', 'Compress']],
  },

  'image/upscale': {
    name: 'Image Upscaler',
    kind: 'image',
    how: [
      'You pick 2×, 3× or 4× and the tool enlarges the image with the canvas and applies a sharpening pass. This is a classic resize with sharpening, not AI super-resolution, so it does not invent new detail.',
      'Enlarging helps when you need more pixels for a layout or a minimum-size requirement. It cannot recover text, faces or fine texture that the original did not capture. Larger scales use more memory, so on a phone start with 2×.',
    ],
    benefits: [
      'Make a small image meet a minimum pixel size.',
      'Pick 2×, 3× or 4× with a sharpening step.',
      'Honest about what it does, with no fake “AI” promise.',
      'Private and free, with no signup.',
    ],
    rows: [
      ['Method', 'Canvas enlargement with sharpening. No generated detail.', 'Some use AI super-resolution that can add plausible detail on powerful servers.', 'Editors offer resampling methods and sharpening controls.'],
    ],
    better: 'you need genuinely recovered detail from a very small photo. AI super-resolution tools, usually server-based, can do more. They also require uploading your picture.',
    tips: [
      'Upscale modestly. 2× usually looks better than 4×.',
      'Judge the result at the size you will actually use it.',
      'Start from the best source file you have, not a screenshot.',
      'Then compress or convert if a platform has size or format limits.',
    ],
    links: [['/tools/image/resize/', 'Resize'], ['/tools/image/compress/', 'Compress'], ['/tools/image/convert/', 'Convert format']],
  },

  'image/ocr': {
    name: 'Image OCR',
    kind: 'image',
    how: [
      'OCR (optical character recognition) reads text from a picture. The page runs Baidu’s open-source PaddleOCR PP-OCRv5 model, converted to ONNX, in your browser through WebAssembly. It first finds where the text is in the image, then recognises the characters.',
      'The first visit downloads a model of about 20 MB, which is cached so later runs can work offline. The image itself is never uploaded. Chinese and English are the strongest; many Latin-script receipts and invoices work well. Clear, straight photos give the best accuracy.',
    ],
    benefits: [
      'Copy text from a receipt, screenshot or document photo instead of retyping.',
      'Download the result as a .txt file.',
      'On-device: private enough for ID cards and invoices.',
      'Free, with no signup.',
    ],
    rows: [
      ['Where recognition runs', 'On your device with PaddleOCR.', 'On the provider’s servers.', 'On your computer.'],
      ['Language coverage', 'Strongest in Chinese and English; many Latin-script documents work.', 'Large services cover many languages.', 'Depends on installed language packs.'],
    ],
    better: 'you need handwriting, Indian-language scripts, or high-volume batch OCR. A cloud OCR service or specialised desktop software will usually do better on those.',
    tips: [
      'Photograph documents flat, in even light, without glare.',
      'Crop away extra background before running OCR.',
      'Proofread numbers, dates and names. OCR can misread similar characters.',
      'For a whole scanned PDF, use OCR PDF instead.',
    ],
    links: [['/tools/pdf/ocr-pdf/', 'OCR a scanned PDF'], ['/tools/pdf/pdf-to-excel/', 'PDF to Excel'], ['/tools/image/compress/', 'Compress']],
  },

  'image/image-to-ascii': {
    name: 'Image to ASCII Art',
    kind: 'image',
    how: [
      'The page reads your image on a canvas, converts it to brightness values and maps each small block of pixels to a character. You can pick Braille dot patterns, block characters or classic ASCII, and an outline-only mode that traces edges.',
      'Because comments on social platforms use proportional fonts and collapse spaces, Braille survives best there. The default width is kept narrow so lines do not wrap in a phone chat bubble, and a mobile preview shows what to expect. You can copy the text, download a .txt or save it as an image.',
    ],
    benefits: [
      'Make text art that fits Instagram, WhatsApp, Facebook, LinkedIn and X character limits.',
      'Outline mode stays recognisable at very small widths.',
      'Mobile preview shows how it will look in a narrow chat bubble.',
      'Free, private and with no signup.',
    ],
    rows: [
      ['Social fit', 'Platform presets for character limits and a phone-width preview.', 'Most produce wide ASCII that breaks on phones.', 'You tune width and fonts yourself.'],
    ],
    better: 'you want a detailed, wide ASCII portrait for a desktop terminal or print. Wider output looks better there and can use a classic monospaced style.',
    tips: [
      'Pick a high-contrast photo with a clear subject.',
      'Keep the width at the default for mobile viewers.',
      'Wrap pasted text in triple backticks in chat apps that support them, so rows line up.',
      'Use “Download as Image” when you want the picture rather than text.',
    ],
    links: [['/tools/misc/font-styler/', 'Fancy font generator'], ['/tools/image/background-remove/', 'Remove background first'], ['/tools/image/resize/', 'Resize']],
  },
};
