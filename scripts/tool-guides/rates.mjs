/**
 * Rates guides. Data sources match lib/rates-api.mjs and lib/fuel-api.mjs:
 * Goodreturns (India/Kerala gold, Kerala silver, fuel), DahabPulse (UAE gold),
 * gold-api.com (silver spot) and Frankfurter (USD/INR). Rates refresh in the
 * background every few minutes, fuel every few hours. If a source changes its
 * markup the API fails visibly rather than showing a wrong number.
 */
export const RATES = {
  'rates/gold-rate': {
    name: 'Gold Rate Today',
    kind: 'rates',
    how: [
      'ToolShoppy’s server reads gold prices for Kerala and India from Goodreturns and UAE prices from DahabPulse, refreshes them in the background every few minutes, and keeps the last good value if a source is briefly unavailable. The page shows 24K, 22K and 18K per gram, a 7-day trend, and, for the UAE, per-tola figures (a tola is about 11.664 g).',
      'Lower carats are derived from 24K by purity: 22K is 22/24 of the 24K price. A jeweller’s price adds making charges, GST and its own margin on top of the gold value, so the number you pay in a shop is higher than the reference rate. Treat the page as an indicative benchmark for planning, and confirm the board rate with your jeweller before buying.',
    ],
    benefits: [
      'Check Kerala, India and Dubai gold in one place, in rupees or dirhams.',
      '22K, 24K and 18K per gram, plus a 7-day trend.',
      'District pages for Kerala when you want local context.',
      'No signup, no pop-ups asking for your phone number.',
    ],
    rows: [
      ['Where the number comes from', 'Named public sources, refreshed every few minutes and labelled as indicative.', 'Often a single association or shop rate, sometimes without the source named.', 'Your jeweller’s board rate on the day.'],
      ['Making charges and GST', 'Not included. Add them yourself from your jeweller’s quote.', 'Some show indicative “jewellery price” estimates.', 'Included on the final bill.'],
    ],
    better: 'you are about to buy or sell. The exact board rate, making charges and buyback terms of your jeweller decide the price, so ask for a written quote and compare two or three shops.',
    tips: [
      'Use the page to spot trends and to compare days, not to negotiate a price.',
      'Ask your jeweller for the making charge as a percentage and the GST on the bill.',
      'For hallmarked jewellery, check the hallmark and the purity stamped on the piece.',
      'Compare gold in AED with the Currency Converter if you are buying in Dubai for India.',
    ],
    links: [['/tools/rates/gold-rate/kerala/', 'Kerala gold rate'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate'], ['/tools/rates/currency-converter/aed-inr/', 'AED to INR'], ['/blog/kerala-gold-rate-today-explained/', 'Gold rate explained']],
  },

  'rates/gold-rate/dubai': {
    name: 'Dubai Gold Rate',
    kind: 'rates',
    how: [
      'The Dubai page reads UAE spot-based prices in dirhams from DahabPulse through ToolShoppy’s rates endpoint, refreshed every few minutes. It shows 24K, 22K and 18K per gram and per tola, where a tola is about 11.664 g.',
      'Shop prices in the Gold Souk or at a jeweller include making charges and VAT on the making charge, and are negotiable, so the figure here is a reference, not an offer. If you are sending or carrying gold to India, remember that import rules, duty and allowances apply; check the customs guidance for your situation.',
    ],
    benefits: [
      'Check Dubai prices in AED per gram before you shop or visit the Gold Souk.',
      '24K, 22K and 18K in one view.',
      'Pair with the AED to INR converter to estimate the rupee value.',
      'Free, with no signup.',
    ],
    rows: [
      ['Price type', 'Indicative reference rate per gram and per tola.', 'Shop and association rates that may already include margins.', 'The shop’s quoted price including making charges.'],
    ],
    better: 'you are buying: ask each shop for a written price breakdown with the gold rate used, making charges and VAT. For import to India, check customs rules from an official source.',
    tips: [
      'Ask each shop which rate it uses and how making charges are calculated.',
      'Compare the price per gram after making charges across shops.',
      'Keep invoices and certificates for any gold you plan to carry.',
      'Check the AED to INR rate on the day for a rupee estimate.',
    ],
    links: [['/tools/rates/gold-rate/', 'Gold rate today'], ['/tools/rates/currency-converter/aed-inr/', 'AED to INR'], ['/tools/rates/silver-rate/uae/', 'UAE silver rate']],
  },

  'rates/silver-rate': {
    name: 'Silver Rate Today',
    kind: 'rates',
    how: [
      'The Kerala and India silver rate is read from Goodreturns and the UAE reference comes from the international silver price from gold-api.com converted with a current exchange rate. The values refresh every few minutes through ToolShoppy’s rates endpoint, and the page shows per-gram and per-kg figures with a 7-day trend.',
      'Silver in a shop carries making charges, GST and a dealer margin, and coin or bar premiums vary. The figure here is an indicative reference to see where the market is, not a price you can transact at.',
    ],
    benefits: [
      'See silver per gram and per kg for Kerala, India and the UAE.',
      'Track the 7-day trend before a purchase.',
      'District pages for Kerala for local context.',
      'Free, with no signup.',
    ],
    rows: [
      ['Price type', 'Indicative per-gram and per-kg reference.', 'Dealer or association rate, often with margins.', 'The dealer’s quote on the day.'],
    ],
    better: 'you are buying or selling silver. Ask the dealer for a written quote that shows the rate, making charges and GST.',
    tips: [
      'Compare days, not minutes. Silver can move quickly.',
      'Ask whether a quote is for fine silver or a lower purity alloy.',
      'For coins and bars, ask about the premium over the metal value.',
      'Compare with the gold rate for a sense of the gold-silver ratio.',
    ],
    links: [['/tools/rates/gold-rate/', 'Gold rate today'], ['/tools/rates/silver-rate/uae/', 'UAE silver rate'], ['/tools/rates/currency-converter/', 'Currency converter']],
  },

  'rates/silver-rate/uae': {
    name: 'UAE Silver Rate',
    kind: 'rates',
    how: [
      'The UAE silver page uses the international silver spot price from gold-api.com, converted into dirhams with a current exchange rate, and refreshed every few minutes through ToolShoppy’s rates endpoint. It is shown per gram so it is easy to compare with a shop’s per-gram quote.',
      'A shop quote in the UAE will differ from the reference because of its margin, purity and making charges. Use the page to see the direction of the market and to ask better questions of the seller.',
    ],
    benefits: [
      'Silver in AED per gram at a glance.',
      'Easy comparison with a jeweller’s quote.',
      'Pairs with the AED to INR converter for rupee estimates.',
      'Free, with no signup.',
    ],
    rows: [
      ['Price type', 'Indicative spot-based reference in AED.', 'Dealer rates with margins.', 'The dealer’s quoted price.'],
    ],
    better: 'you are buying: ask the seller for the purity, weight, making charge and VAT in writing.',
    tips: [
      'Ask which purity the price refers to.',
      'Compare two or three quotes before buying.',
      'Check the exchange rate if you are comparing with INR prices.',
      'Remember VAT can apply to the making charge or the item.',
    ],
    links: [['/tools/rates/silver-rate/', 'Silver rate today'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate'], ['/tools/rates/currency-converter/aed-inr/', 'AED to INR']],
  },

  'rates/petrol-price': {
    name: 'Petrol and Diesel Price',
    kind: 'rates',
    how: [
      'ToolShoppy’s server reads state-wise petrol and diesel prices from Goodreturns and refreshes them every few hours, because pump prices usually change at most once a day. You pick a state and the page shows today’s petrol and diesel per litre, with a link to each major state’s own page.',
      'Prices differ between states because each state adds its own VAT and local levies to the central price, and prices can vary slightly between cities and pumps. The figures are indicative, so confirm at your pump if the exact amount matters.',
    ],
    benefits: [
      'Check petrol and diesel prices in major states in one place.',
      'See why a neighbouring state can be cheaper or dearer.',
      'State pages load fast and need no signup.',
      'Useful for road trips and fleet planning.',
    ],
    rows: [
      ['Coverage', 'Major states, with state-level figures and a refresh every few hours.', 'Some list city-wise prices and history.', 'The pump display on the day.'],
    ],
    better: 'you need city- or pump-level prices, or a long price history for analysis. Oil company websites and apps publish city-wise prices.',
    tips: [
      'Compare nearby states before a long drive near a border.',
      'Remember prices can differ slightly between cities in the same state.',
      'Check the date shown, because prices update at set times.',
      'Combine with an EMI calculator if you are planning a vehicle purchase.',
    ],
    links: [['/tools/rates/petrol-price/kerala/', 'Kerala petrol price'], ['/tools/finance/emi-calculator/', 'EMI calculator'], ['/tools/rates/gold-rate/', 'Gold rate']],
  },

  'rates/currency-converter': {
    name: 'Currency Converter',
    kind: 'rates',
    how: [
      'The converter uses indicative market exchange rates, with USD/INR from Frankfurter, and converts between Gulf currencies (AED, SAR, KWD, OMR), USD and INR. You type an amount, pick the pair or use a preset such as AED to INR, and see the result and the unit rate. A reverse button swaps the pair.',
      'These are mid-market style rates for estimation. Banks and exchange houses use their own buy and sell rates and add fees, so the amount you receive when you send money will be different. Compare the final amount you would receive across your options, not only the headline rate.',
    ],
    benefits: [
      'One-tap presets for AED, SAR, KWD, OMR and USD to INR.',
      'Quickly estimate remittances before you send money home.',
      'Reverse the pair with one click.',
      'Free, with no signup.',
    ],
    rows: [
      ['Rate type', 'Indicative mid-market style rate for estimating.', 'Banks and exchange houses show buy and sell rates with a spread.', 'The rate and fees you actually get when you send.'],
      ['Fees', 'Not included.', 'Shown separately or built into the rate.', 'Quoted at the time of transfer.'],
    ],
    better: 'you are about to send money. Compare the total amount received after fees and spread from your bank, exchange house and remittance apps.',
    tips: [
      'Compare “amount received” in rupees, not the exchange rate alone.',
      'Check the transfer fee and any minimum amount.',
      'Rates move through the day, so do not rely on a screenshot from yesterday.',
      'Use the gold rate page to compare Dubai and Kerala gold prices in rupees.',
    ],
    links: [['/tools/rates/currency-converter/aed-inr/', 'AED to INR'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate'], ['/tools/finance/uae-vat/', 'UAE VAT calculator']],
  },

  'rates/currency-converter/aed-inr': {
    name: 'AED to INR Converter',
    kind: 'rates',
    how: [
      'This page is the AED to INR view of the currency converter. You enter an amount in dirhams and it shows the rupee equivalent from an indicative market rate, refreshed through ToolShoppy’s rates endpoint.',
      'The rate you receive when you send money differs from the headline number because exchange houses and banks add a spread and fees. Use this page to estimate, then compare the final rupee amount across the options you have.',
    ],
    benefits: [
      'Quick dirham to rupee estimate for remittances.',
      'Pairs with the Dubai gold rate page.',
      'Reverse and other Gulf pairs are on the main converter.',
      'Free, with no signup.',
    ],
    rows: [
      ['Rate type', 'Indicative rate for estimating.', 'Buy and sell rates with a spread.', 'The rate and fees quoted at transfer.'],
    ],
    better: 'you are sending money. Check the actual amount received from each provider, with fees included, on the day you send.',
    tips: [
      'Compare total rupees received, not just the rate.',
      'Look for transfer fees and minimum amounts.',
      'Check the rate again right before you send.',
      'Use the main converter for SAR, KWD, OMR and USD.',
    ],
    links: [['/tools/rates/currency-converter/', 'All currency pairs'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate'], ['/tools/finance/uae-vat/', 'UAE VAT calculator']],
  },
};
