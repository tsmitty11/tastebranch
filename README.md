# tastebranch

A responsive Hugo landing page with Tailwind CSS 4 and DaisyUI 5. Requires Hugo (tested with 0.143.1) and Node 24.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:1313. Hugo reloads template changes; Tailwind watches CSS and template classes.

## Production

```sh
npm ci
npm run build
```

Deploy the generated `public/` directory. For a real domain, set `baseURL` in `hugo.toml` or pass Hugo's `--baseURL` option. Fonts are self-hosted and their licenses copied during the build.

## Content to finish before launch

- Set `params.contactURL` in `hugo.toml` to a booking URL or `mailto:` address. Intentionally blank for now; contact link appears when configured.
- Connect a private Vercel Blob store before enabling production signups (details below).
- Set `params.showShowcase = true` to restore the hidden intermediate CTA, example work, and philosophy sections.
- Replace the two clearly labeled illustrative concepts with real projects when available.
- Replace the honest testimonial placeholder with approved client feedback.
- Confirm the proposed third impact item: “0 handoff decks between you and launch.”

The page and FAQ content live in `layouts/index.html`; styles and responsive breakpoints live in `assets/css/main.css`.

## Visual direction

Forest black `#101813`, deep green surfaces `#19271E`, soft ivory-green text `#E8EFE3`, and pale phosphor-green `#B4DCA3` accents. Moss and sage gradients nod to branches and vintage computer monitors. Mona Sans uses weight 700 and width 125 for headings and buttons; body text uses Inter Regular. The supplied logo is rendered white for contrast.

## Email signup on Vercel

The form posts to `/api/subscribe`, a Vercel Node.js Function. It stores one private JSON record per normalized email under `subscribers/`, using a SHA-256 filename. Repeat signups update that record. No email marketing service is involved, and no confirmation emails are sent.

When deploying:

1. Import this repository into Vercel. `vercel.json` selects Hugo, runs `npm run build`, and serves `public/` alongside the API function. Use Node 24.
2. Create a **private** Vercel Blob store in the project's Storage tab and connect it to the project. Provide the SDK's supported store credentials (`BLOB_READ_WRITE_TOKEN`, or `BLOB_STORE_ID` with the linked project's OIDC access). Keep credentials server-side. Connect the required deployment environments and redeploy after connecting storage.
3. Submit a test signup on the deployed site and confirm its record appears under `subscribers/` in the private store. The JSON contains the email, latest signup timestamp, source, and consent wording. Records can be downloaded from the store dashboard.

Without storage credentials, the endpoint returns an error and the form does not claim the email was saved. `npm run dev` serves the Hugo frontend only; use `vercel dev` with linked environment credentials to exercise the actual API locally. A static-only host cannot run this endpoint.

Validation includes a server-side email check, a 2 KB request cap, same-origin checks, and a hidden honeypot. These are basic abuse checks, not a distributed rate limiter; a Vercel Firewall rate-limit rule for `/api/subscribe` can be added if needed.

Run `npm test` for handler validation, deduplication, storage-failure, and no-JavaScript form tests. These use an injected storage stub; a live Blob write must be checked after the store is connected.
