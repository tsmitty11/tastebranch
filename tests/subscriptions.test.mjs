import test from 'node:test';
import assert from 'node:assert/strict';
import { createSubscribeHandler } from '../lib/subscriptions.mjs';

const request = (body, headers = {}, method = 'POST') => new Request('https://tastebranch.test/api/subscribe', {
  method, headers: { 'Content-Type': 'application/json', Origin: 'https://tastebranch.test', ...headers },
  ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
});

test('normalizes addresses and uses one deterministic record per subscriber', async () => {
  const writes = new Map();
  const handler = createSubscribeHandler(async (path, data) => writes.set(path, data));
  assert.equal((await handler(request({ email: ' Founder@Example.com ' }))).status, 200);
  assert.equal((await handler(request({ email: 'founder@example.com' }))).status, 200);
  assert.equal(writes.size, 1);
  const [path, record] = [...writes][0];
  assert.match(path, /^subscribers\/[a-f0-9]{64}\.json$/);
  assert.equal(record.email, 'founder@example.com');
  assert.equal(record.consent, 'launch notification');
});

test('rejects malformed, oversized and cross-origin requests without writing', async () => {
  let calls = 0;
  const handler = createSubscribeHandler(async () => { calls++; });
  for (const data of [null, {}, { email: 'bad' }, { email: ['a@b.co'] }, { email: 'a@b.co\nother' }]) {
    assert.equal((await handler(request(data))).status, 400);
  }
  assert.equal((await handler(request({ email: 'a@b.co' }, { Origin: 'https://elsewhere.test' }))).status, 403);
  assert.equal((await handler(request({ email: 'a'.repeat(3000) }))).status, 413);
  assert.equal((await handler(request({}, {}, 'GET'))).status, 405);
  const malformed = new Request('https://tastebranch.test/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal((await handler(malformed)).status, 400);
  assert.equal(calls, 0);
});

test('does not store honeypot submissions', async () => {
  let stored = false;
  const handler = createSubscribeHandler(async () => { stored = true; });
  await handler(request({ email: 'a@b.co', website: 'bot' }));
  assert.equal(stored, false);
});

test('does not claim success if storage fails', async t => {
  t.mock.method(console, 'error', () => {});
  const handler = createSubscribeHandler(async () => { throw Error('unavailable'); });
  const response = await handler(request({ email: 'a@b.co' }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('supports native form submission without JavaScript', async () => {
  let stored;
  const handler = createSubscribeHandler(async (_, record) => { stored = record; });
  const response = await handler(new Request('https://tastebranch.test/api/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'text/html' },
    body: 'email=founder%40example.com&website=',
  }));
  assert.equal(response.status, 200);
  assert.equal(stored.email, 'founder@example.com');
  assert.match(await response.text(), /notify you when tastebranch launches/);
});
