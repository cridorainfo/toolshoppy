import fs from 'node:fs';
import { SERVICE_SEARCH_CONTENT } from './service-search-content.mjs';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const [key, copy] of Object.entries(SERVICE_SEARCH_CONTENT)) {
  const file = new URL(`../tools/${key}/index.html`, import.meta.url);
  const before = fs.readFileSync(file, 'utf8');
  let html = before.replace(/<title>[^<]*<\/title>/, `<title>${esc(copy.title)}</title>`);
  for (const [tag, value] of [['name="description"', copy.description], ['property="og:title"', copy.title], ['property="og:description"', copy.description], ['name="twitter:title"', copy.title], ['name="twitter:description"', copy.description]]) {
    html = html.replace(new RegExp(`<meta ${tag} content="[^"]*">`), `<meta ${tag} content="${esc(value)}">`);
  }
  html = html.replace(/(<div class="tool-header">[\s\S]*?<h1>)[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/, `$1${esc(copy.h1)}</h1>\n    <p>${esc(copy.intro)}</p>`);
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (block, json) => {
    const schema = JSON.parse(json);
    if (['WebApplication', 'SoftwareApplication'].includes(schema['@type'])) {
      schema.name = copy.name; schema.description = copy.description;
    } else if (schema['@type'] === 'FAQPage' && copy.faqs) {
      schema.mainEntity = copy.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }));
    } else return block;
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  });
  if (copy.faqs) {
    const faqStart = html.lastIndexOf('  <div class="content-section">', html.indexOf('<h2>Frequently asked questions</h2>'));
    const faqEnd = html.indexOf('</main>', faqStart);
    if (faqStart < 0 || faqEnd < 0) throw new Error(`Cannot find final FAQ section for ${key}`);
    html = html.slice(0, faqStart) + `  <div class="content-section">\n    <h2>Frequently asked questions</h2>\n${copy.faqs.map(([q, a]) => `    <div class="faq-item"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('\n')}\n  </div>\n` + html.slice(faqEnd);
  }
  const content = `  <!-- service-search:start -->\n${copy.sections.map(([heading, body]) => `  <section class="content-section">\n    <h2>${esc(heading)}</h2>\n    ${body}\n  </section>`).join('\n')}\n  <!-- service-search:end -->\n`;
  // Replace only our managed content; preserve the processing UI and scripts.
  html = html.replace(/  <!-- service-search:start -->[\s\S]*?  <!-- service-search:end -->\r?\n/g, '');
  const at = html.indexOf('  <div class="content-section">');
  if (at < 0) throw new Error(`No content insertion point for ${key}`);
  html = html.slice(0, at) + content + html.slice(at);
  if (html !== before) fs.writeFileSync(file, html);
}
console.log(`Updated search content for ${Object.keys(SERVICE_SEARCH_CONTENT).length} existing service pages.`);
