# swiftcargosolutions — Tracking Website + Admin Dashboard

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

Open `admin.html`. Offline demo mode uses this passcode:

```
admin221r
```

Change this by editing the check in `js/app.js` (search for `admin221r`).

When Supabase is configured, the dashboard uses the owner email and password from
Supabase Auth instead of the demo passcode. This is required for authenticated
multi-device writes.

## The "database"

The site keeps a localStorage fallback for offline demos. For multi-device operation, configure `js/supabase-config.js` with a Supabase URL and anon key, run `supabase-schema.sql`, and enable Realtime for the `shipments` table. Client tracking then reads shared shipment rows and receives live updates while the dashboard is open on another device. Never put a Supabase service-role key in the browser.

`data/seed.json` documents the local schema, while `supabase-schema.sql` is the shared database schema and access policies.

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

- **Branding/name:** search `js/app.js` and `index.html` for "swiftcargosolutions".
- **Colors:** all defined as CSS variables at the top of `css/style.css` (`:root { ... }`).
- **Cities/routes:** edit the `CITIES` object in `js/app.js`.
