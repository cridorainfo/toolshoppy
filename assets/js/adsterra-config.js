// ToolShoppy — Adsterra zone config (currently unused)
// Disabled 2026-07-19: ads.js no longer references Adsterra in OCCURRENCE_POOLS
// (MyBid + AdSense only, per instruction). enabled:false here is a second, redundant
// kill switch in case that ever changes back — zone data is left in place so Adsterra
// can be turned back on by (1) flipping enabled:true and (2) adding 'adsterra' entries
// back into OCCURRENCE_POOLS in assets/js/ads.js.
//
// Banner zone shape (Adsterra "Banner" unit, e.g. 300x250 sidebar):
//   { type: 'banner', key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//     scriptSrc: '//www.highperformanceformat.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/invoke.js',
//     width: 300, height: 250 }
//
// Native zone shape (Adsterra "Native Banner" unit, e.g. in-content):
//   { type: 'native', containerId: 'container-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
//     scriptSrc: '//pl xxxxxxx.profitableratecpm.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/invoke.js' }
//
// Copy the 'key'/container id and script src straight from the snippet Adsterra gives you —
// don't retype them, they're unique per zone.
window.TS_ADSTERRA_CONFIG = {
  enabled: false,
  zones: {
    top: {
      type: 'banner',
      key: '870f612e3a40b0c7a234c4c69ac8ad55',
      scriptSrc: 'https://indefinitelynutmegbile.com/870f612e3a40b0c7a234c4c69ac8ad55/invoke.js',
      width: 728,
      height: 90,
    },
    stickyFooterMobile: {
      type: 'banner',
      key: '22b6b222a28c7358ce0f9c714bfbd519',
      scriptSrc: 'https://indefinitelynutmegbile.com/22b6b222a28c7358ce0f9c714bfbd519/invoke.js',
      width: 320,
      height: 50,
    },
    sidebar: {
      type: 'banner',
      key: 'f75d4115c06863d45b701341069e8f85',
      scriptSrc: 'https://indefinitelynutmegbile.com/f75d4115c06863d45b701341069e8f85/invoke.js',
      width: 300,
      height: 250,
    },
    incontent: {
      type: 'native',
      containerId: 'container-9b01fd014b93f0df725df9331982edbf',
      scriptSrc: 'https://indefinitelynutmegbile.com/9b01fd014b93f0df725df9331982edbf/invoke.js',
    },
  },
};
