import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { submitSitemap } from './submit-sitemap.mjs';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const credentials = { client_email: 'test@example.invalid', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) };
test('submits the canonical sitemap with scoped OAuth authentication', async () => {
  const calls = [];
  const result = await submitSitemap({ credentials, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1 ? new Response(JSON.stringify({ access_token: 'test-token' })) : new Response(null, { status: 204 });
  } });
  assert.equal(result, 'https://toolshoppy.com/sitemap.xml');
  assert.equal(calls[1].options.method, 'PUT');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-token');
  assert.ok(calls[1].url.includes('sc-domain%3Atoolshoppy.com'));
  const claims = JSON.parse(Buffer.from(calls[0].options.body.get('assertion').split('.')[1], 'base64url'));
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/webmasters');
});
test('missing credentials fail before any network request', async () => {
  await assert.rejects(submitSitemap({ credentials: {}, fetchImpl: () => assert.fail('unexpected request') }), /GSC_SERVICE_ACCOUNT_JSON/);
});
test('Google authentication and authorization failures are surfaced without secrets', async () => {
  await assert.rejects(submitSitemap({ credentials, fetchImpl: async () => new Response('secret', { status: 401 }) }), /authentication failed \(401\)/);
  let count = 0;
  await assert.rejects(submitSitemap({ credentials, fetchImpl: async () => ++count === 1 ? new Response(JSON.stringify({ access_token: 'secret' })) : new Response('secret', { status: 403 }) }), /submission failed \(403\)/);
});
