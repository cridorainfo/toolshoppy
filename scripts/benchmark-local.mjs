// Bounded local-origin baseline. Never sends load to production or upstream feeds.
import { performance } from 'node:perf_hooks';
import { createSiteServer } from '../server.mjs';

const server = createSiteServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const routes = ['/', '/tools/image/compress/', '/tools/pdf/merge/', '/assets/css/main.css', '/assets/js/core.js'];
const total = 500, concurrency = 20;
const latencies = [];
let next = 0, errors = 0, bytes = 0;
const start = performance.now();
try {
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < total) {
      const i = next++;
      const before = performance.now();
      try {
        const response = await fetch(origin + routes[i % routes.length]);
        bytes += (await response.arrayBuffer()).byteLength;
        if (response.status !== 200) errors++;
      } catch { errors++; }
      latencies.push(performance.now() - before);
    }
  }));
  const elapsed = performance.now() - start;
  latencies.sort((a, b) => a - b);
  console.log(JSON.stringify({ requests: total, concurrency, errors, seconds: +(elapsed / 1000).toFixed(2),
    requestsPerSecond: +(total * 1000 / elapsed).toFixed(1), p95Ms: +latencies[Math.ceil(total * .95) - 1].toFixed(1),
    decodedMiB: +(bytes / 1048576).toFixed(2), note: 'Local synthetic origin baseline only; excludes CDN, browsers, real ads, upstream refresh, and production capacity.' }, null, 2));
  if (errors) process.exitCode = 1;
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
