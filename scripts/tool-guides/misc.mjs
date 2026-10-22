/**
 * Misc and video tool guides. Video/audio details match the FFmpeg settings in
 * each page: compress = H.264 CRF 23/28/32, trim = stream copy with an
 * H.264 re-encode fallback, status splitter = 30 s parts at 1080x1920,
 * audio output = MP3 via libmp3lame.
 */
export const MISC = {
  'misc/qr-generator': {
    name: 'QR Code Generator',
    kind: 'misc',
    how: [
      'You pick what the code should hold: a link or text (including UPI payment links), Wi-Fi details, a contact card (vCard), a WhatsApp chat link, or a list of items for bulk creation. The page encodes your input into a QR pattern right in your browser and redraws it as you type.',
      'The code stores your data directly, so it is a static QR: it does not expire, has no tracking and does not depend on a ToolShoppy server. The flip side is that you cannot change what an already printed code points to. Bulk mode makes numbered PNG files in a ZIP, up to 50 lines.',
    ],
    benefits: [
      'Make QR codes for links, Wi-Fi, contacts, WhatsApp chats and UPI payments in one place.',
      'No expiry and no tracking, because nothing is routed through a server.',
      'Download PNGs in several sizes, or a ZIP in bulk.',
      'Free, with no signup and no watermark.',
    ],
    rows: [
      ['Code type', 'Static QR codes that encode your data directly.', 'Many push “dynamic” codes that route through their servers and can stop working if a plan ends.', 'Designer tools offer styling but usually need an account.'],
      ['Scan analytics', 'None. No tracking.', 'Dynamic codes usually include scan counts, often on paid plans.', 'Not applicable.'],
    ],
    better: 'you need scan statistics, the ability to change the destination after printing, or heavily branded designs. A dynamic QR service or a design tool fits that job.',
    tips: [
      'Test every code with at least two phones before printing.',
      'Leave a clear blank border around the code and keep strong contrast.',
      'Use a short link for dense content, because simpler codes scan more reliably.',
      'Choose a larger size when printing on posters or packaging.',
    ],
    links: [['/tools/misc/whatsapp-link/', 'WhatsApp link generator'], ['/tools/pdf/merge/', 'PDF tools']],
  },

  'misc/word-counter': {
    name: 'Word Counter',
    kind: 'misc',
    how: [
      'As you type or paste, the page splits the text at whitespace to count words, counts characters with and without spaces, finds sentences by full stops, question marks and exclamation marks, and estimates reading time at 200 words per minute.',
      'Everything is computed in your browser and updates live. Rules differ between systems: hyphenated words count as one, and languages written without spaces need a different method. For an application with a hard limit, check the destination’s own counter.',
    ],
    benefits: [
      'Check essay, SOP, caption and bio length as you write.',
      'See words, characters, characters without spaces, sentences and reading time together.',
      'Text is not uploaded, so drafts stay private.',
      'Free, with no signup.',
    ],
    rows: [
      ['Counting method', 'Splits on whitespace; sentences by punctuation.', 'Word processors use their own rules and may count differently.', 'Built into Word and Docs.'],
    ],
    better: 'a portal or exam enforces its own count, or you are writing in a language without spaces between words. Match the destination’s counter in the final check.',
    tips: [
      'Paste only the text you want counted, without headings or references.',
      'Abbreviations and decimals can add extra sentences.',
      'Allow a few words of buffer under hard limits.',
      'Use the character count for social posts, not the word count.',
    ],
    links: [['/tools/misc/font-styler/', 'Fancy font generator'], ['/tools/misc/text-handwriting/', 'Text to handwriting'], ['/tools/misc/qr-generator/', 'QR generator']],
  },

  'misc/age-calculator': {
    name: 'Age Calculator',
    kind: 'misc',
    how: [
      'You enter a date of birth and, optionally, an “as of” date. The page counts complete years, then complete months, then the remaining days between the two dates, and also reports total days and the next birthday.',
      'Using an as-of date lets you check age on a deadline, such as an exam’s closing date, rather than today. For birthdays on the 29th to 31st in months that are shorter, the calculation uses the last day of the month. It all runs in your browser and nothing is saved.',
    ],
    benefits: [
      'Check eligibility for exams and forms that ask for age on a particular date.',
      'See years, months and days together, plus total days.',
      'Know the next birthday and how far away it is.',
      'Your date of birth is not stored.',
    ],
    rows: [
      ['Date of reference', 'Choose any as-of date, not only today.', 'Many only compute age as of today.', 'Spreadsheet formulas can do it but need setup.'],
    ],
    better: 'an eligibility rule defines age differently, for example counting from a specific cut-off or using completed years in a unique way. Follow the notification’s wording over any calculator.',
    tips: [
      'Set the as-of date to the notification’s reference date for exams.',
      'Check dates in day-month-year order to avoid swapping day and month.',
      'Keep a screenshot only if you are comfortable storing the date of birth.',
      'Re-check borderline cases against the official rules.',
    ],
    links: [['/tools/misc/timezone-converter/', 'Time zone converter'], ['/tools/misc/bmi-calculator/', 'BMI calculator'], ['/tools/image/govt-photo/', 'Government form photo']],
  },

  'misc/bmi-calculator': {
    name: 'BMI Calculator',
    kind: 'misc',
    how: [
      'BMI is weight in kilograms divided by height in metres squared. You enter height and weight in metric or imperial units, and the page converts as needed, shows the number and places it in a standard category: under 18.5, 18.5 to 24.9, 25 to 29.9, or 30 and above.',
      'It is a screening number, not a diagnosis. It does not separate muscle from fat, does not account for age, sex or body shape, and some Indian and Asian guidelines use lower cut-offs than the standard ones. Use it as a conversation starter with a doctor, not as medical advice.',
    ],
    benefits: [
      'Get a quick BMI in metric or imperial units.',
      'See the category and adjust inputs to compare.',
      'Nothing about your weight is stored or uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['What it tells you', 'A single screening number with standard categories.', 'Health apps may combine BMI with other measures.', 'A clinician considers your whole health picture.'],
    ],
    better: 'you are making health decisions, are a child or teenager, pregnant, or very muscular. A doctor can use better measures than BMI alone.',
    tips: [
      'Measure height without shoes and weight at a consistent time of day.',
      'Use the same units on both fields.',
      'Do not use BMI alone to judge fitness, especially for athletes.',
      'Ask a doctor which cut-offs suit you.',
    ],
    links: [['/tools/misc/age-calculator/', 'Age calculator'], ['/tools/misc/word-counter/', 'Word counter'], ['/tools/finance/', 'Finance calculators']],
  },

  'misc/font-styler': {
    name: 'Fancy Font Generator',
    kind: 'misc',
    how: [
      'This is not a font download. The page replaces ordinary letters with look-alike characters from Unicode, such as bold, italic, script and bubble variants, and shows the same text in many styles. You copy the style you like and paste it into a bio, caption or message.',
      'Because they are normal text characters, they paste into most apps without installing anything. Support depends on the app and the device’s fonts, and some characters may show as empty boxes. Screen readers may read them oddly, so keep important information in plain text.',
    ],
    benefits: [
      'Style an Instagram, WhatsApp or Telegram bio in seconds.',
      'Copy-paste output with no app or font install.',
      'Local only: what you type is not uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['How styling works', 'Unicode look-alike characters you can paste anywhere.', 'Same approach; some add decorative symbols.', 'Real fonts need installing and only work in that app.'],
    ],
    better: 'accessibility, search or exact branding matters. Use a real font in a design tool, because styled characters can be unreadable to screen readers and can reduce search discoverability.',
    tips: [
      'Test the text on another phone before you rely on it.',
      'Use styled text sparingly for names and short phrases, not paragraphs.',
      'Keep a plain-text copy of important wording such as phone numbers and links.',
      'Some platforms count styled characters differently toward length limits.',
    ],
    links: [['/tools/misc/word-counter/', 'Word counter'], ['/tools/image/image-to-ascii/', 'Image to text art'], ['/tools/misc/whatsapp-link/', 'WhatsApp link']],
  },

  'misc/text-handwriting': {
    name: 'Text to Handwriting',
    kind: 'misc',
    how: [
      'You type or paste text, choose a handwriting-style font (Casual, Neat or Cursive) and a paper background (white, blue ruled or cream). The page draws the text onto a canvas using fonts available on your device and lets you download it as a PNG.',
      'It does not copy anyone’s real handwriting, and the look can vary between Windows, macOS and mobile because installed fonts differ. Long lines are not wrapped automatically, so add line breaks yourself and check the preview before you download.',
    ],
    benefits: [
      'Make a handwritten-style note, label or greeting image quickly.',
      'Choose from a few styles and paper backgrounds.',
      'Text is processed on your device only.',
      'Free, with no signup.',
    ],
    rows: [
      ['Handwriting source', 'Handwriting-style fonts on your device. Not your own handwriting.', 'Some let you train or upload a personal handwriting sample.', 'Font editors can build a font from your handwriting.'],
    ],
    better: 'you want a font that matches your own handwriting, or you need accessible, searchable text. Create a personal handwriting font, and keep a plain-text version for accessibility.',
    tips: [
      'Add manual line breaks to avoid text running off the page.',
      'Preview on both desktop and phone if the look matters.',
      'Use it for personal notes and designs; follow your school or workplace honesty rules for assignments.',
      'Keep the original text in case you need to edit it later.',
    ],
    links: [['/tools/misc/font-styler/', 'Fancy font generator'], ['/tools/misc/word-counter/', 'Word counter'], ['/tools/pdf/image-to-pdf/', 'Images to PDF']],
  },

  'misc/timezone-converter': {
    name: 'Time Zone Converter',
    kind: 'misc',
    how: [
      'You choose a source and destination time zone, enter a date and time, and the page converts it using the time zone database built into your browser. That database includes daylight saving rules, so a date in summer or winter converts with the correct offset for that day.',
      'It runs entirely on your device. Quick shortcuts cover popular pairs such as India to Dubai, India to US Eastern and India to the UK. Always include the date, since the offset between two places can change during the year.',
    ],
    benefits: [
      'Plan calls between India, the Gulf, the UK and the US.',
      'Daylight saving is handled for the date you enter.',
      'No account and nothing stored.',
      'Free to use.',
    ],
    rows: [
      ['Daylight saving', 'Uses your browser’s time zone data for the date you choose.', 'Most do the same; some only show current time.', 'Calendar apps handle this for scheduled events.'],
    ],
    better: 'you are scheduling a recurring meeting across many people. Your calendar app can propose times in each person’s own zone and adjust automatically.',
    tips: [
      'Enter the exact date, not just the time, for future events.',
      'Check the zone: IST, GST (Gulf), EST/EDT and GMT/BST are different.',
      'Write the time in both zones in your invitation.',
      'Re-check around clock-change weekends.',
    ],
    links: [['/tools/misc/age-calculator/', 'Age calculator'], ['/tools/rates/currency-converter/', 'Currency converter'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate']],
  },

  'misc/whatsapp-link': {
    name: 'WhatsApp Link Generator',
    kind: 'misc',
    how: [
      'You enter a phone number with its country code (no plus sign) and, if you like, a pre-filled message. The page builds a wa.me link from them. When someone opens the link, WhatsApp opens a chat with that number and the message ready to send.',
      'The tool only builds the link. It does not send anything, and the number and message are visible to anyone who has the link. Everything is generated in your browser and not stored.',
    ],
    benefits: [
      'Give customers a one-tap way to message you from a bio, website or poster.',
      'Pre-fill a message such as “Hi, I’d like to order…”.',
      'Combine with a QR code for print.',
      'Free, with no signup.',
    ],
    rows: [
      ['What it does', 'Builds a standard wa.me click-to-chat link.', 'Same link; some add short URLs and analytics.', 'WhatsApp Business has its own link and catalog tools.'],
    ],
    better: 'you want automated replies, a product catalog or team inbox features. WhatsApp Business and its tools cover that.',
    tips: [
      'Include the country code, for example 91 for India or 971 for the UAE.',
      'Open the finished link yourself to confirm the right chat appears.',
      'Avoid private details in the pre-filled message.',
      'Make a QR code of the link for flyers and shop counters.',
    ],
    links: [['/tools/misc/qr-generator/', 'QR generator'], ['/tools/image/sticker-maker/', 'Sticker maker']],
  },

  'misc/audio-cutter': {
    name: 'Audio Cutter',
    kind: 'misc',
    how: [
      'You choose an audio file, set a start and end time in seconds, and the page cuts that section using FFmpeg compiled to WebAssembly in your browser. The clip is exported as an MP3, or as an AAC file if MP3 encoding is unavailable in your browser.',
      'The first use downloads the processing engine, then it runs on your device with no upload. Long recordings use more memory, and which input formats work depends on your browser. Always play the exported clip to confirm it starts and ends where you intended.',
    ],
    benefits: [
      'Make a phone ringtone or alert from a favourite section.',
      'Trim silence or interviews to the useful part.',
      'Private: the audio never leaves your device.',
      'Free, with no signup.',
    ],
    rows: [
      ['Where cutting runs', 'On your device with FFmpeg (WebAssembly).', 'On the provider’s servers after upload.', 'Audio editors run locally and show a waveform.'],
      ['Precision', 'Start and end in seconds. No waveform view.', 'Many show a waveform for precise cutting.', 'Waveform editing with fades and effects.'],
    ],
    better: 'you need a waveform to cut precisely, add fades, or edit multiple tracks. Use an audio editor for that.',
    tips: [
      'Add a small buffer before and after a word or beat so it is not clipped.',
      'Listen to the whole result before using it as a ringtone.',
      'Keep your original file in case you need a different cut.',
      'If the audio is inside a video, extract it with Video to MP3 first.',
    ],
    links: [['/tools/video/to-audio/', 'Video to MP3'], ['/tools/video/trim/', 'Trim a video'], ['/tools/video/compress/', 'Compress a video']],
  },

  'video/compress': {
    name: 'Video Compressor',
    kind: 'video',
    how: [
      'You pick a preset (High quality, Balanced or Smallest) and a video. The page loads FFmpeg compiled to WebAssembly, a download of about 30 MB the first time, and re-encodes the video with H.264 at a constant rate factor of 23, 28 or 32 and AAC audio. A higher number means a smaller file and lower quality.',
      'Everything is done on your device, so there is no upload wait, but encoding speed and memory depend on your phone or computer. Very long or high-resolution videos can be slow or fail on weak devices.',
    ],
    benefits: [
      'Shrink a video so it can be sent on WhatsApp, email or an upload form.',
      'Three presets so you do not need to understand codecs.',
      'The video stays on your device.',
      'Free, with no signup and no watermark.',
    ],
    rows: [
      ['Time to start', 'No upload. The first run downloads the engine, then processing starts.', 'Uploading a large video can take longer than the compression.', 'Starts immediately with full hardware acceleration.'],
      ['Size limits', 'Limited by your device’s memory.', 'File-size or length limits on free plans are common.', 'Limited only by disk space.'],
    ],
    better: 'you need to compress hours of footage, choose exact bitrates, or use hardware acceleration. HandBrake or your editing software is much faster for large files.',
    tips: [
      'Start with Balanced and watch the result before trying Smallest.',
      'Close other tabs on phones to free memory.',
      'Trim unnecessary sections first with the Video Trimmer.',
      'Keep the original until you have checked the compressed file.',
    ],
    links: [['/tools/video/trim/', 'Trim first'], ['/tools/video/status-splitter/', 'Split for WhatsApp Status'], ['/tools/video/to-audio/', 'Extract audio']],
  },

  'video/trim': {
    name: 'Video Trimmer',
    kind: 'video',
    how: [
      'You choose a video, set a start and end time in seconds and the page cuts that section with FFmpeg in your browser. It first tries a fast “stream copy” that does not re-encode, which keeps quality and is quick. Because of how video is stored, a copy cut starts on the nearest keyframe, so the start can be slightly off.',
      'If that fails, it falls back to re-encoding with H.264, which cuts at the exact time but takes longer. As with other browser-based video tools, long or high-resolution files need more memory.',
    ],
    benefits: [
      'Cut a clip to share without installing an editor.',
      'Fast copy mode keeps the original quality when it works.',
      'Private: the video is not uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['Cutting method', 'Stream copy first (fast, keyframe-aligned), then re-encode as a fallback.', 'Usually re-encodes after upload.', 'Frame-accurate cutting with a timeline.'],
    ],
    better: 'you need frame-accurate cuts, transitions or multiple clips on a timeline. A video editor is the right tool for that.',
    tips: [
      'Preview the first and last seconds of the output before you share it.',
      'Allow a second of margin on either side if the start looks a little early.',
      'Trim before compressing so you only compress what you need.',
      'Keep the original video until you have checked the clip.',
    ],
    links: [['/tools/video/compress/', 'Compress the clip'], ['/tools/video/status-splitter/', 'Split for Status'], ['/tools/video/to-audio/', 'Extract audio']],
  },

  'video/to-audio': {
    name: 'Video to MP3',
    kind: 'video',
    how: [
      'You choose a video and the page strips out the video track and encodes the audio as an MP3 using FFmpeg in WebAssembly. The first use downloads the processing engine, then everything runs on your device.',
      'A video with no audio track produces nothing useful. Large or high-resolution videos use a lot of memory, and which input formats work depends on your browser. Preview the MP3 to check its length and sound.',
    ],
    benefits: [
      'Save a lecture, interview or your own recording as audio.',
      'MP3 output plays almost everywhere.',
      'No upload, so private recordings stay with you.',
      'Free, with no signup.',
    ],
    rows: [
      ['Where conversion runs', 'On your device with FFmpeg.', 'On the provider’s servers after upload.', 'On your computer.'],
    ],
    better: 'you want to download audio from online platforms, which this tool does not do and which may breach their terms, or you need a lossless audio format. Use your own recordings or properly licensed media.',
    tips: [
      'Convert only media you have the right to use.',
      'Cut the audio to the part you need with the Audio Cutter.',
      'Try a shorter clip or a desktop browser if the conversion fails.',
      'Check the volume on the output before you share it.',
    ],
    links: [['/tools/misc/audio-cutter/', 'Audio cutter'], ['/tools/video/trim/', 'Trim a video'], ['/tools/video/compress/', 'Compress a video']],
  },

  'video/status-splitter': {
    name: 'WhatsApp Status Splitter',
    kind: 'video',
    how: [
      'You choose a long video (or a tall image) and the page cuts the video into 30-second parts. Each part is scaled into a vertical 1080 × 1920 frame, with black bars added when the shape does not match, and encoded with H.264 and AAC. The parts are bundled in a ZIP.',
      'It works with FFmpeg in your browser, so the video is not uploaded. Because every part is re-encoded, processing takes time and memory, especially for long or high-resolution videos.',
    ],
    benefits: [
      'Post a long video as a series of Status updates without losing the end.',
      'Vertical 9:16 sizing so it fills the screen.',
      'Download all parts in one ZIP.',
      'Free, private and with no signup.',
    ],
    rows: [
      ['Output', 'Equal 30-second parts in 1080 × 1920, zipped.', 'Some split and upload straight to apps.', 'Editors let you split at chosen points.'],
    ],
    better: 'you want to cut at specific moments rather than every 30 seconds, or add captions and transitions. A video editor lets you choose the break points.',
    tips: [
      'Trim the video first so only the content you want is split.',
      'Check the first and last seconds of each part.',
      'Post the parts in order, and note the numbering in your caption.',
      'Status limits can change, so confirm the current length in WhatsApp.',
    ],
    links: [['/tools/video/trim/', 'Trim a video'], ['/tools/video/compress/', 'Compress a video'], ['/tools/image/sticker-maker/', 'Sticker maker']],
  },
};
