const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:8765';
 try {
  for(const slug of ['akshaya','akshaya-malayalam']) {
   const page = await browser.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>new URL(route.request().url()).origin===origin ? route.continue():route.abort());
   await page.goto(`${origin}/${slug}/`);
   assert.equal(await page.locator('[data-task]:visible').count(),8);
   await page.locator('[data-filter="pdf"]').click();
   assert.equal(await page.locator('[data-task]:visible').count(),4);
   await page.locator('#desk-search').fill('no-such-workflow');
   assert.equal(await page.locator('[data-task]:visible').count(),0);
   await page.locator('#desk-search').fill('');
   await page.locator('[data-filter="all"]').click();
   await page.locator('[data-check]').first().check();
   assert.match(await page.locator('#desk-progress').innerText(),/1/);
   await page.locator('#desk-reset').click();
   assert.equal(await page.locator('[data-check]:checked').count(),0);
   assert.equal(await page.locator('[data-task] a:not([target="_blank"])').count(),0);
   for (const width of [375,1440]) {
    await page.setViewportSize({width,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${slug} overflow ${width}`);
   }
   await page.locator('.theme-toggle').click();
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   await page.reload();
   assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
   await page.setViewportSize({width:375,height:900});
   await page.evaluate(()=>window.scrollTo(0,0));
   fs.mkdirSync('artifacts/akshaya',{recursive:true});
   await page.screenshot({path:`artifacts/akshaya/${slug}-mobile.png`,fullPage:true,animations:'disabled'});
   await page.locator('.theme-toggle').click();
   await page.setViewportSize({width:1440,height:1000});
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`artifacts/akshaya/${slug}-desktop.png`,animations:'disabled'});
   assert.deepEqual(errors,[]);
   await page.close();
   const nojs = await browser.newContext({javaScriptEnabled:false});
   const staticPage=await nojs.newPage();
   await staticPage.goto(`${origin}/${slug}/`);
   assert.equal(await staticPage.locator('[data-task]').count(),8);
   await staticPage.locator('[data-task]').nth(4).locator('summary').click();
   assert.ok(await staticPage.locator('[data-task]').nth(4).locator('a').isVisible());
   await nojs.close();
   console.log(`PASS ${slug}: filters, checklist, links, mobile/desktop, theme, no-JS`);
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

