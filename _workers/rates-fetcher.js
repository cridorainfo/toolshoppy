/**
 * Cloudflare Worker — daily rates fetcher (deploy separately).
 * Cron: 0 0 * * * (6:00 AM IST) — configure in Cloudflare dashboard.
 *
 * Fetches gold/silver/currency benchmarks and writes to KV or
 * updates /api/rates.json via R2/Pages deploy hook.
 *
 * Until deployed, tools read the static seed at /api/rates.json.
 */
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(updateRates(env));
  },

  async fetch(request, env) {
    if (request.method === 'GET' && new URL(request.url).pathname === '/api/rates.json') {
      const cached = env.RATES_KV ? await env.RATES_KV.get('rates', 'json') : null;
      if (cached) {
        return Response.json(cached, {
          headers: { 'Cache-Control': 'public, max-age=3600' },
        });
      }
    }
    return new Response('Rates worker — bind RATES_KV and schedule cron.', { status: 404 });
  },
};

async function updateRates(env) {
  // TODO: plug in MCX gold, UAE gold API, exchangerate source
  const now = new Date().toISOString();
  const payload = {
    updated_at: now,
    source_note: 'Auto-updated by Cloudflare Worker',
    // Merge with live fetches when API keys are configured
  };
  if (env.RATES_KV) {
    await env.RATES_KV.put('rates', JSON.stringify(payload));
  }
}
