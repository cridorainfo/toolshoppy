/**
 * Finance calculator guides. These describe the method and its limits, and
 * deliberately avoid restating tax slabs or GST rate tables: those live on the
 * tool pages, change with the law, and must be verified against official
 * sources (see docs/growth/marketing-and-seo-plan.md, "Facts to re-verify").
 */
export const FINANCE = {
  'finance/emi-calculator': {
    name: 'EMI Calculator',
    kind: 'calc',
    how: [
      'The calculator uses the standard reducing-balance formula: EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the loan amount, r is the monthly interest rate (the annual rate divided by 12) and n is the number of months. Each month’s interest is charged on the balance still outstanding, which is why early EMIs are mostly interest and later ones mostly principal.',
      'It then shows your monthly EMI, the total interest over the loan and the total you will repay. The result updates as you change any input, so you can compare tenures and rates side by side. Banks may add processing fees, insurance or a different rate type, so treat the result as an estimate and confirm with your lender’s sanction letter.',
    ],
    benefits: [
      'Compare home, car and personal loan options in seconds, with quick presets.',
      'See how a longer tenure lowers the EMI but raises total interest.',
      'Results update as you type, with no button and no form.',
      'Your loan details are not stored or sent anywhere.',
    ],
    rows: [
      ['Assumptions', 'Standard reducing-balance formula with a constant rate, clearly stated.', 'Often tied to one product, with fees or promotions built in.', 'Whatever formula you enter, so errors are easy to make.'],
    ],
    better: 'you need an exact amortisation schedule with part-prepayments, floating-rate changes, or fees. Your lender’s statement or a detailed amortisation spreadsheet is more precise.',
    tips: [
      'Try the same loan at two or three tenures to see the interest trade-off.',
      'Use the rate in your sanction letter, not the advertised “starting from” rate.',
      'Remember processing fees and insurance are usually separate costs.',
      'For floating-rate loans, re-run the numbers when the rate changes.',
    ],
    links: [['/tools/finance/income-tax/', 'Income tax calculator'], ['/tools/finance/salary-calculator/', 'Salary calculator'], ['/tools/finance/sip-calculator/', 'SIP calculator']],
  },

  'finance/income-tax': {
    name: 'Income Tax Calculator',
    kind: 'calc',
    how: [
      'You enter your annual gross salary and, for the old regime, the deductions you claim, such as Section 80C. The page computes tax under both regimes: it applies the slabs, subtracts the standard deduction, applies the Section 87A rebate and marginal relief where they apply, adds surcharge if relevant, and then adds 4% health and education cess.',
      'It then shows which regime gives lower tax for your numbers. It is built for resident salaried individuals under 60 with ordinary salary income for FY 2025-26 (AY 2026-27), and it does not cover capital gains or other special-rate income. It is an estimate and not an official tool. Confirm figures with the Income Tax Department’s portal or a chartered accountant before filing.',
    ],
    benefits: [
      'Compare the new and old regime side by side with your own numbers.',
      'See whether your deductions are large enough to make the old regime worthwhile.',
      'Marginal relief, surcharge and cess are included in the estimate.',
      'Income figures stay in your browser and are not collected.',
    ],
    rows: [
      ['Regime comparison', 'Both regimes calculated side by side with the better one highlighted.', 'Many compute one regime at a time or ask for more inputs.', 'Possible, but you maintain the slabs yourself.'],
      ['Scope', 'Resident salaried individuals under 60 with ordinary salary income.', 'Some cover seniors, business income and capital gains.', 'Flexible but manual.'],
    ],
    better: 'you have capital gains, business or professional income, foreign income, or you are a senior citizen. The official e-filing portal or a chartered accountant will account for those correctly.',
    tips: [
      'Enter gross salary before deductions, and only the deductions you can actually claim.',
      'Compare both regimes every year, because the better one can change when your salary or investments change.',
      'Check the financial year on the page matches the year you are planning for.',
      'Use the result for planning and confirm on the official portal before filing.',
    ],
    links: [['/tools/finance/salary-calculator/', 'Salary calculator'], ['/tools/finance/emi-calculator/', 'EMI calculator'], ['/tools/finance/sip-calculator/', 'SIP calculator']],
  },

  'finance/salary-calculator': {
    name: 'Salary Calculator',
    kind: 'calc',
    how: [
      'You enter your annual CTC, the share of it that is basic salary, and a tax regime. The calculator treats CTC as cash gross salary, applies the employee provident fund contribution with its cap, subtracts a professional tax assumption, estimates income tax for the chosen regime and shows approximate monthly in-hand pay.',
      'The assumptions are stated on the page: FY 2025-26 estimate, resident salaried employee under 60, capped employee PF, ₹2,400 annual professional tax, and a ₹1.5 lakh total of deductions for the old regime. Employer PF, gratuity, insurance and bonuses are not deducted separately, so your payslip may differ.',
    ],
    benefits: [
      'Get a quick idea of take-home pay from a job offer’s CTC.',
      'Compare the new and old tax regime on take-home pay.',
      'See PF, tax and gross monthly pay in one view.',
      'Salary numbers stay on your device.',
    ],
    rows: [
      ['Method', 'A transparent set of assumptions shown on the page.', 'Often similar, but assumptions may be hidden.', 'Your employer’s payroll or HR system is the exact source.'],
    ],
    better: 'you need your exact payslip figures. Your offer letter breakdown, HR or payroll system accounts for your company’s structure, variable pay, allowances and city-specific rules.',
    tips: [
      'Ask HR how much of the CTC is fixed and how much is variable.',
      'Check whether employer PF and insurance are inside the CTC.',
      'Use the same regime as your employer’s declaration for a closer match.',
      'Treat the result as an estimate. The first payslip is the real answer.',
    ],
    links: [['/tools/finance/income-tax/', 'Income tax calculator'], ['/tools/finance/emi-calculator/', 'EMI calculator'], ['/tools/finance/sip-calculator/', 'SIP calculator']],
  },

  'finance/gst-calculator': {
    name: 'GST Calculator',
    kind: 'calc',
    how: [
      'In Add GST mode you enter a price without tax and a rate, and the page adds GST to give the total. In Remove GST mode you enter a price that already includes GST and the page works backwards to the base price and the GST amount. It also shows the CGST and SGST split, each half of the total GST for transactions within a state.',
      'The formulas are simple: tax-exclusive price × rate gives GST, and a tax-inclusive price ÷ (1 + rate) gives the base. Use the rate shown on your invoice or the current GST notification for your item, because rates change. Inter-state supplies use IGST instead of the CGST and SGST split.',
    ],
    benefits: [
      'Add or remove GST in one step for invoices and quotes.',
      'See the CGST and SGST halves for intra-state billing.',
      'No spreadsheet or formulas to maintain.',
      'Invoice amounts are not stored or uploaded.',
    ],
    rows: [
      ['Direction', 'Add GST or remove GST from a gross amount.', 'Many only add GST.', 'Possible, but you maintain the formulas.'],
    ],
    better: 'you need a full GST invoice, HSN rate lookups, input-tax credit or filing support. Accounting software or the GST portal handles those.',
    tips: [
      'Check whether the price you were quoted already includes GST before choosing Add or Remove.',
      'Always confirm the rate for your item against the current GST schedule.',
      'Round at the end of the invoice, not on each line, unless your invoicing rule says otherwise.',
      'For UAE transactions, use the UAE VAT calculator instead.',
    ],
    links: [['/tools/finance/uae-vat/', 'UAE VAT calculator'], ['/tools/pdf/pdf-to-excel/', 'Invoices to Excel'], ['/tools/finance/emi-calculator/', 'EMI calculator']],
  },

  'finance/sip-calculator': {
    name: 'SIP Calculator',
    kind: 'calc',
    how: [
      'You enter a monthly SIP amount, an expected annual return and a tenure in years. The page treats the annual return divided by 12 as the monthly rate, assumes each instalment is invested at the start of the month, compounds it for the months it stays invested, and then shows the projected maturity value, the total you invested and the gain.',
      'The expected return is your assumption, not a promise. Real mutual fund returns move up and down, and the result ignores taxes, exit loads and expense changes. Use the calculator to compare scenarios, for example how much a higher monthly amount or a longer tenure changes the outcome.',
    ],
    benefits: [
      'See how small monthly amounts add up over time.',
      'Compare different amounts, returns and tenures quickly.',
      'See invested amount and gain separately.',
      'Nothing about your plans is stored.',
    ],
    rows: [
      ['Return assumption', 'A single return you choose, clearly your assumption.', 'Sometimes pre-filled with past returns that may not repeat.', 'You set the formula and rate.'],
    ],
    better: 'you want to model step-up SIPs, taxes, inflation or sequence-of-returns risk. A detailed planner or an adviser can model those.',
    tips: [
      'Try a conservative return as well as an optimistic one.',
      'Think in real terms: consider inflation when judging the final amount.',
      'Increase the amount, not just the return, to see which lever matters more.',
      'The tool gives estimates only and is not investment advice.',
    ],
    links: [['/tools/finance/fd-calculator/', 'FD / RD calculator'], ['/tools/finance/emi-calculator/', 'EMI calculator'], ['/tools/finance/income-tax/', 'Income tax calculator']],
  },

  'finance/fd-calculator': {
    name: 'FD and RD Calculator',
    kind: 'calc',
    how: [
      'In fixed deposit mode you enter a single deposit, a rate and a tenure. Interest compounds quarterly, and the page shows the maturity amount and the interest earned. In recurring deposit mode you enter a monthly contribution made at the start of each month, with growth derived from quarterly compounding.',
      'The rate is held constant for the whole term. The calculator does not model changing rates, missed instalments, tax deducted at source, income tax on interest or early-withdrawal penalties. Use it to compare offers, then check the bank’s own terms.',
    ],
    benefits: [
      'Estimate maturity for FD and RD with the same tool.',
      'Compare banks by typing different interest rates.',
      'See deposited amount and interest earned separately.',
      'Your deposit details are not stored.',
    ],
    rows: [
      ['Compounding', 'Quarterly compounding, stated clearly.', 'Varies by bank and product.', 'You must set the formula.'],
    ],
    better: 'you need the exact maturity value for a specific bank product, including payout frequency, senior-citizen rates, TDS and penalties. The bank’s own calculator or deposit certificate is the reference.',
    tips: [
      'Use the rate printed for the exact tenure you plan to book.',
      'Remember interest is taxable, so your post-tax return is lower.',
      'For RD, enter the monthly amount you will actually be able to pay.',
      'Compare with a SIP projection only if you understand the risk difference.',
    ],
    links: [['/tools/finance/sip-calculator/', 'SIP calculator'], ['/tools/finance/emi-calculator/', 'EMI calculator'], ['/tools/finance/income-tax/', 'Income tax calculator']],
  },

  'finance/uae-vat': {
    name: 'UAE VAT Calculator',
    kind: 'calc',
    how: [
      'In Add VAT mode you enter an amount in AED without VAT and the page adds the standard 5 percent to give the total. In Remove VAT mode you enter a price that already includes VAT and the page works out the VAT amount and the net price by dividing by 1.05.',
      'The calculator is for the standard rate. Some supplies are zero-rated or exempt, and VAT registration, invoicing and filing rules are set by the Federal Tax Authority. It is an estimator, not tax software.',
    ],
    benefits: [
      'Quickly add or extract 5% VAT on invoices, quotes and shopping.',
      'See net, VAT and gross together.',
      'Amounts are not stored or uploaded.',
      'Free, with no signup.',
    ],
    rows: [
      ['Scope', 'The standard rate, shown clearly.', 'Often also standard rate; some handle zero-rated and exempt supplies.', 'Accounting software handles filings.'],
    ],
    better: 'you need to file returns, handle zero-rated or exempt supplies, or issue tax-compliant invoices. Use accounting software and the FTA’s guidance.',
    tips: [
      'Check whether a quoted price is VAT-inclusive before you choose Add or Remove.',
      'Keep tax invoices in the format the FTA requires.',
      'Round according to your invoicing rules, not mid-calculation.',
      'For Indian GST, use the GST calculator.',
    ],
    links: [['/tools/finance/gst-calculator/', 'GST calculator'], ['/tools/rates/currency-converter/aed-inr/', 'AED to INR'], ['/tools/rates/gold-rate/dubai/', 'Dubai gold rate']],
  },
};
