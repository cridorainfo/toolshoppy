/**
 * Cloudflare Worker — daily rates refresh (optional cron).
 * Primary live endpoint: Pages Function at /functions/api/rates.js
 */
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshRates(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/rates' && env.RATES_KV) {
      const cached = await env.RATES_KV.get('rates', 'json');
      if (cached) {
        return Response.json(cached, {
          headers: { 'Cache-Control': 'public, max-age=300' },
        });
      }
    }
    return new Response('Use Cloudflare Pages Function /api/rates', { status: 404 });
  },
};

async function refreshRates(env) {
  // Optional: call same upstream feeds as functions/api/rates.js and persist to KV
  if (!env.RATES_KV) return;
  const res = await fetch('https://toolshoppy.com/api/rates');
  if (res.ok) {
    const data = await res.json();
    await env.RATES_KV.put('rates', JSON.stringify(data));
  }
}
