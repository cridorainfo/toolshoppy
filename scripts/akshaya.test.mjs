import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {isAdFree} from './lib/page-policy.mjs';

for (const [file,lang] of [['akshaya.html','en'],['akshaya-malayalam.html','ml']]) {
 test(`${lang} desk contains crawlable workflows, matching FAQ and language alternates`, () => {
  const html = readFileSync(file,'utf8');
  assert.match(html,new RegExp(`<html lang="${lang}"`));
  assert.equal((html.match(/data-task /g)||[]).length,8);
  assert.equal((html.match(/data-check /g)||[]).length,5);
  const graph = JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const faq = graph.find(s=>s['@type']==='FAQPage');
  for (const q of faq.mainEntity) {
   assert.ok(html.includes(`<h3>${q.name}</h3><p>${q.acceptedAnswer.text}</p>`));
  }
  for (const locale of ['en','ml','x-default']) assert.ok(html.includes(`hreflang="${locale}"`));
  assert.ok(isAdFree(file));
  assert.ok(!html.includes('adsbygoogle'));
  for (const [,href] of html.matchAll(/href="(\/tools\/[^"#]+)"/g)) assert.ok(existsSync(`.${href}index.html`),href);
 });
}
test('desk is discoverable and both pages are in the sitemap',()=>{
 const home = readFileSync('index.html','utf8');
 const sitemap = readFileSync('sitemap.xml','utf8');
 for(const slug of ['akshaya','akshaya-malayalam']) {
  assert.ok(home.includes(`href="/${slug}/"`));
  assert.ok(sitemap.includes(`https://toolshoppy.com/${slug}/`));
 }
});
