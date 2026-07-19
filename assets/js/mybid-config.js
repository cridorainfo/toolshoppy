// ToolShoppy — MyBid banner config
// The MyBid loader script itself is a single site-wide tag already in every page's <head>
// (data-admpid identifies the publisher account). This file only maps which banner unit
// id fills which .ad-slot placement. ads.js re-injects the loader script next to each
// banner div so MyBid picks up slots that get added after page load (lazy-loaded ads).
window.TS_MYBID_CONFIG = {
  admpid: '448541',
  scriptSrc: 'https://js.mbidadm.com/static/scripts.js',
  banners: {
    sidebar: '2025008',   // 300x250
    incontent: '2025009', // 300x100
  },
};
