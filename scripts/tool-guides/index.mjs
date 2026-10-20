/**
 * Shared comparison framing and the merged guide map.
 *
 * Comparisons describe general approaches (browser-side vs server-side vs
 * desktop). They do not quote competitors' current prices or limits, which
 * change; each table carries a disclaimer saying so.
 */
import { PDF } from './pdf.mjs';
import { IMAGE } from './image.mjs';
import { MISC } from './misc.mjs';
import { FINANCE } from './finance.mjs';
import { RATES } from './rates.mjs';

const DISCLAIMER =
  'This compares general approaches, not every product. Other services change their features, limits and pricing, so check their current terms before deciding.';

export const KINDS = {
  pdf: {
    vsTitle: 'ToolShoppy vs iLovePDF, Smallpdf and desktop software',
    otherCol: 'Server-based online tools (e.g. iLovePDF, Smallpdf)',
    thirdCol: 'Desktop software (e.g. Adobe Acrobat)',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'Where your file is processed',
        'In your browser. The file is not uploaded to ToolShoppy.',
        'Uploaded to the provider’s servers, then deleted later under their stated policy.',
        'On your own computer.',
      ],
      [
        'Account and cost',
        'No signup, no email. Free to use.',
        'Free use is often capped by file size, tasks per day or features; some features need an account or paid plan (varies by provider).',
        'Needs installing; advanced features usually need a paid licence (varies).',
      ],
    ],
  },
  image: {
    vsTitle: 'ToolShoppy vs server-based image tools and desktop editors',
    otherCol: 'Server-based image tools',
    thirdCol: 'Desktop editors (e.g. Photoshop, GIMP)',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'Where your photo is processed',
        'In your browser. The photo is not uploaded to ToolShoppy.',
        'Uploaded to the provider’s servers, then deleted later under their stated policy.',
        'On your own computer.',
      ],
      [
        'Account and cost',
        'No signup, no email. Free to use.',
        'Often free with limits on size, batch count or quality; some require an account (varies).',
        'Needs installing and some learning; some editors are paid.',
      ],
    ],
  },
  video: {
    vsTitle: 'ToolShoppy vs server-based video tools and desktop apps',
    otherCol: 'Server-based video tools',
    thirdCol: 'Desktop and phone apps (e.g. HandBrake, VLC, CapCut)',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'Where your video is processed',
        'In your browser, so the video is not uploaded. It does use your device’s memory and processor.',
        'Uploaded to a server, which can take a long time for large files, then processed there.',
        'On your own device, usually with full access to its hardware.',
      ],
      [
        'Account and cost',
        'No signup, no email. Free to use.',
        'Often free with file-size, length or watermark limits (varies).',
        'Needs installing; some are paid or add watermarks on free plans.',
      ],
    ],
  },
  misc: {
    vsTitle: 'ToolShoppy vs other online tools and apps',
    otherCol: 'Typical online tools',
    thirdCol: 'Apps and software',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'Where your input is processed',
        'In your browser. What you type is not sent to ToolShoppy.',
        'Often processed on the provider’s servers (varies by tool).',
        'On your own device.',
      ],
      [
        'Account and cost',
        'No signup, no email. Free to use.',
        'Frequently free, but may show prompts to sign up or upgrade.',
        'Needs installing; some are paid.',
      ],
    ],
  },
  calc: {
    vsTitle: 'ToolShoppy vs bank calculators and spreadsheets',
    otherCol: 'Bank, fintech and portal calculators',
    thirdCol: 'Spreadsheet (Excel, Google Sheets)',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'Your figures',
        'Calculated in your browser and not stored by ToolShoppy.',
        'Some ask for contact details or an account before showing results (varies).',
        'Stay in your own file.',
      ],
      [
        'Setup effort',
        'Open the page and type. Results update as you change inputs.',
        'Open the page; the assumptions may be hidden or tied to one product.',
        'You build and check the formulas yourself.',
      ],
    ],
  },
  rates: {
    vsTitle: 'ToolShoppy vs jeweller, news and exchange-house sources',
    otherCol: 'Jeweller, news and rate websites',
    thirdCol: 'Bank or exchange house / pump or shop',
    disclaimer: DISCLAIMER,
    rows: () => [
      [
        'What the number means',
        'An indicative reference rate, labelled as such, with a link back to the tool’s assumptions.',
        'Can be a retail or association rate that already includes shop-specific spreads or charges.',
        'The rate you would actually transact at on the day.',
      ],
      [
        'Account and cost',
        'No signup, no email. Free to read.',
        'Usually free; some sites add pop-ups or ask for sign-up.',
        'Free to ask, but you must visit or call.',
      ],
    ],
  },
};

export const GUIDES = { ...PDF, ...IMAGE, ...MISC, ...FINANCE, ...RATES };
