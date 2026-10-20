// Maintenance-only command. Credentials are never sent to browser code.
import { createSign } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export async function submitSitemap({ credentials, site = 'sc-domain:toolshoppy.com', fetchImpl = fetch }) {
  if (!credentials?.client_email || !credentials?.private_key) throw new Error('Set GSC_SERVICE_ACCOUNT_JSON with a Google service account key.');
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = encode({ alg: 'RS256', typ: 'JWT' }) + '.' + encode({
    iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/webmasters',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  });
  const assertion = unsigned + '.' + createSign('RSA-SHA256').update(unsigned).sign(credentials.private_key, 'base64url');
  const tokenResponse = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST', signal: AbortSignal.timeout(30000),
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!tokenResponse.ok) throw new Error(`Google authentication failed (${tokenResponse.status}). Check the service account and API access.`);
  const token = (await tokenResponse.json()).access_token;
  if (!token) throw new Error('Google returned no access token.');
  const sitemap = 'https://toolshoppy.com/sitemap.xml';
  const response = await fetchImpl(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemap)}`, {
    method: 'PUT', signal: AbortSignal.timeout(30000), headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Sitemap submission failed (${response.status}). Verify the property name and grant the service account Search Console access.`);
  return sitemap;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON || '{}');
    const sitemap = await submitSitemap({ credentials, site: process.env.GSC_SITE_URL || undefined });
    console.log(`Submitted ${sitemap}. Submission does not guarantee indexing.`);
  } catch (error) {
    console.error(error instanceof SyntaxError ? 'GSC_SERVICE_ACCOUNT_JSON must be valid JSON.' : error.message);
    process.exitCode = 1;
  }
}
