// FY 2025-26 / AY 2026-27: resident salaried individuals under 60,
// ordinary slab-rate income only. Source: Income Tax Department:
// https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1
(function (global) {
  'use strict';
  function slabTax(income, regime) {
    var slabs = regime === 'new'
      ? [[400000, 0], [800000, .05], [1200000, .10], [1600000, .15], [2000000, .20], [2400000, .25], [Infinity, .30]]
      : [[250000, 0], [500000, .05], [1000000, .20], [Infinity, .30]];
    var previous = 0, tax = 0;
    slabs.forEach(function (slab) {
      tax += Math.max(0, Math.min(income, slab[0]) - previous) * slab[1];
      previous = slab[0];
    });
    return tax;
  }
  function taxOnIncome(income, regime) {
    var tax = slabTax(income, regime);
    if (regime === 'new') {
      if (income <= 1200000) return 0;
      tax = Math.min(tax, income - 1200000); // Section 87A marginal relief.
    } else if (income <= 500000) return 0;
    var tiers = [[5000000, .10], [10000000, .15], [20000000, .25]];
    if (regime === 'old') tiers.push([50000000, .37]);
    var threshold = 0, surcharge = 0, previousRate = 0;
    tiers.forEach(function (tier) {
      if (income > tier[0]) { threshold = tier[0]; previousRate = surcharge; surcharge = tier[1]; }
    });
    var total = tax * (1 + surcharge);
    if (threshold) total = Math.min(total, slabTax(threshold, regime) * (1 + previousRate) + income - threshold);
    return Math.round(total * 1.04);
  }
  function salaryTax(gross, regime, deductions) {
    gross = Math.max(0, Number(gross) || 0);
    deductions = regime === 'old' ? Math.max(0, Number(deductions) || 0) : 0;
    return taxOnIncome(Math.max(0, gross - (regime === 'new' ? 75000 : 50000) - deductions), regime);
  }
  global.TSIncomeTax = { salaryTax: salaryTax };
})(window);
