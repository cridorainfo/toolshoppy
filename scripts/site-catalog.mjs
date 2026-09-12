import fs from 'node:fs';
import vm from 'node:vm';

// Use the same checked-in catalog for the homepage and all category hubs.
// Never evaluate remote HTML here.
export function readToolCatalog(html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')) {
  const source = html.match(/const liveTools = (\[[\s\S]*?\n  \]);/)?.[1];
  if (!source) throw new Error('Cannot find the homepage tool catalog.');
  const tools = vm.runInNewContext(`(${source})`, {}, { timeout: 1000 });
  const paths = new Set();
  for (const tool of tools) {
    if (!/^\/tools\/[a-z-]+\/[a-z-]+\/$/.test(tool.href) || paths.has(tool.href)) throw new Error(`Invalid or duplicate tool: ${tool.href}`);
    paths.add(tool.href);
  }
  return tools.map(tool => ({ ...tool, key: tool.href.replace(/^\/tools\/|\/$/g, '') }));
}
