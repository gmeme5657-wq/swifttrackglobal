# Swift Courier — Tracking Website + Admin Dashboard

A complete courier / delivery tracking site: a customer-facing tracking page with a live map,
and a separate admin dashboard for managing shipments, drivers, and email notifications.

## What's inside

```
swift-courier/
├── index.html        Main site (customer tracking + admin dashboard)
├── css/style.css      All styling
├── js/app.js           All app logic, data model, map, and simulated live tracking
├── data/seed.json      Reference database schema + sample data
└── README.md
```

## Running it

**Locally:** just double-click `index.html` — it opens in your browser and works immediately, no install or server needed.

**Hosting it:** upload the whole folder to any static host — Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3, or a normal shared-hosting `public_html` folder. No build step, no server-side code required. Just make sure the `css/`, `js/`, and `data/` folders stay alongside `index.html`.

## Admin dashboard

Click **Admin dashboard** in the top nav. Demo passcode:

```
admin221r
```

Change this by editing the check in `js/app.js` (search for `admin221r`).

## The "database"

This build uses the browser's built-in **localStorage** as a small local database — it persists shipments, drivers, and notifications between visits with zero setup, and needs no server. It's per-browser (not shared between different visitors), which is normal for a self-contained static demo.

`data/seed.json` documents the exact schema (shipments, drivers, notifications) so you — or a developer — can wire it up to a real backend later.

## Try the demo

On the home page, track one of the seeded shipments:
- `SC100234567` — in transit
- `SC100234568` — out for delivery
- `SC100234569` — delivered
- `SC100234570` — picked up

Positions on the map actually move over time (simulated live movement, updates every few seconds).

## Connecting a real backend

To move this from demo to production, two things need real infrastructure — everything else already works as-is:

1. **Real email sending** — the Notifications tab currently just logs a "sent" record. To send actual emails, add a small backend endpoint (e.g. using SendGrid, Postmark, or AWS SES) and call it from `sendNotification()` in `js/app.js` instead of just pushing to the local log.
2. **Real live GPS** — driver positions are currently simulated by interpolating toward the destination. For real tracking, a driver mobile app (or browser geolocation) would need to periodically POST real coordinates to a backend, which this site would then poll or subscribe to (e.g. via WebSockets) instead of `tickMovement()`.

Swapping `loadData()` / `persist()` in `js/app.js` to call your API instead of `localStorage` is the main integration point — the rest of the UI works unchanged.

## Customizing

- **Branding/name:** search `js/app.js` and `index.html` for "Swift Courier".
- **Colors:** all defined as CSS variables at the top of `css/style.css` (`:root { ... }`).
- **Cities/routes:** edit the `CITIES` object in `js/app.js`.
