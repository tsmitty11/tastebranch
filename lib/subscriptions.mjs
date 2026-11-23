import { createHash } from 'node:crypto';

const LIMIT = 2048;
const success = 'Thanks — we’ll notify you when tastebranch launches.';

function reply(request, status, message) {
  const headers = { 'Cache-Control': 'no-store' };
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>tastebranch signup</title><body style="background:#101813;color:#e8efe3;font:18px/1.6 system-ui;padding:10vh 8vw"><h1>tastebranch</h1><p>${message}</p><a href="/#start" style="color:#b4dca3">Back to tastebranch</a></body></html>`, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return Response.json({ ok: status < 400, message }, { status, headers });
}

export function createSubscribeHandler(save) {
  return async function subscribe(request) {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const origin = request.headers.get('origin');
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
      return reply(request, 403, 'Please submit the form from tastebranch.');
    }
    const type = request.headers.get('content-type')?.split(';')[0];
    if (!['application/json', 'application/x-www-form-urlencoded'].includes(type)) return reply(request, 415, 'Unsupported form format.');
    if (Number(request.headers.get('content-length')) > LIMIT) return reply(request, 413, 'This submission is too large.');
    let data;
    try {
      const reader = request.body?.getReader();
      if (!reader) return reply(request, 400, 'Please enter your email address.');
      const chunks = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > LIMIT) { await reader.cancel(); return reply(request, 413, 'This submission is too large.'); }
        chunks.push(value);
      }
      const text = Buffer.concat(chunks).toString('utf8');
      data = type === 'application/json' ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
    } catch { return reply(request, 400, 'Please check your email and try again.'); }
    if (!data || typeof data !== 'object') return reply(request, 400, 'Please enter a valid email address.');
    // A hidden field catches basic automated submissions without storing them.
    if (data.website) return reply(request, 200, success);
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return reply(request, 400, 'Please enter a valid email address.');
    const key = createHash('sha256').update(email).digest('hex');
    try {
      await save(`subscribers/${key}.json`, { email, subscribedAt: new Date().toISOString(), source: 'tastebranch-landing', consent: 'launch notification' });
    } catch {
      console.error('Subscription storage unavailable');
      return reply(request, 503, 'We couldn’t save your email right now. Please try again later.');
    }
    return reply(request, 200, success);
  };
}
