import { put } from '@vercel/blob';
import { createSubscribeHandler } from '../lib/subscriptions.mjs';

const handler = createSubscribeHandler(async (pathname, record) => {
  await put(pathname, JSON.stringify(record), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
});

export const POST = handler;
