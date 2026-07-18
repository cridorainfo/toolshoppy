// ToolShoppy — Adsterra zone config (fill in after creating ad units in the Adsterra dashboard)
// All 4 placements route through Adsterra when a zone is set below; a placement falls back to
// AdSense automatically if its zone here is null. See assets/js/ads.js for the routing logic.
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
