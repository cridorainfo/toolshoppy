const { chromium } = require('playwright');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const results=[];
 for (const width of [375,1440]) {
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  for(const route of ['/','/about/','/blog/how-to-merge-pdf-free/','/tools/image/compress/','/tools/image/upscale/','/tools/misc/word-counter/','/tools/finance/']) {
   const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.auditCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.auditCLS+=e.value;}).observe({type:'layout-shift',buffered:true});});
   await page.goto('http://127.0.0.1:8766'+route,{waitUntil:'networkidle'});
   const info=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth>innerWidth,cls:window.auditCLS,domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,logoLoaded:document.querySelector('.logo-mark').naturalWidth>0}));
   if(route==='/tools/misc/word-counter/') {await page.locator('#textIn').fill('one two three');info.counter=await page.locator('#words').textContent();}
   if(width===375&&['/about/','/tools/image/compress/','/blog/how-to-merge-pdf-free/'].includes(route))await page.screenshot({path:'artifacts/seo-'+route.split('/').filter(Boolean).join('-')+'.png',fullPage:true});
   results.push({width,route,...info,errors});await page.close();
  }
  await context.close();
 }
 await browser.close();fs.writeFileSync('artifacts/seo-browser.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 if(results.some(r=>r.errors.length||r.overflow||r.h1!==1||!r.logoLoaded))process.exitCode=1;
})();
