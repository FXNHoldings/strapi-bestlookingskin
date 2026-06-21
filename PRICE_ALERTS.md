# Price-drop email alerts

Visitors set a target price on a product page and get a one-time email (via
**Brevo**) when the live price reaches that target. The check runs as part of
the existing daily price-refresh cron.

## Architecture

The feature spans three codebases:

| Layer | Where | Responsibility |
|---|---|---|
| Storage | Strapi `commerce-price-alert` collection | One row per alert: email, product, targetPrice, alertStatus, cancelToken |
| Sign-up UI + API | `bestlooking.skin` | Form on the product page → `POST /api/price-alert` writes the alert to Strapi |
| Cancel link | `bestlooking.skin` | `GET /api/price-alert/cancel?token=…&id=…` flips the alert to `cancelled` |
| Check + send | `nxt-sourcing` | After the daily reprice, `checkPriceAlerts()` emails any alert whose product is now ≤ target, then marks it `triggered` (fires once) |

### Files

- **Strapi** — `strapi-deploy/strapi/src/api/commerce-price-alert/` (schema +
  controller/routes/services). Fields: `email`, `product` (relation),
  `targetPrice`, `currency`, `priceAtSignup`, `notifiedPrice`, `alertStatus`
  (`active` / `triggered` / `cancelled` — deliberately not the reserved
  `status`), `triggeredAt`, `lastCheckedAt`, `cancelToken`, `source`.
- **nxt-sourcing**
  - `lib/email.ts` — `sendBrevoEmail()` via Brevo's transactional HTTP API
    (`https://api.brevo.com/v3/smtp/email`). `from` is overridable per call, so
    the same code can send from any domain authenticated in Brevo.
  - `lib/price-alerts.ts` — `checkPriceAlerts()`: lists active alerts, computes
    each product's lowest in-stock offer price, emails + marks `triggered` on a
    hit.
  - `app/api/refresh-prices/route.ts` — calls `checkPriceAlerts()` after
    `refreshAllProductPrices()`. Result is returned under `alerts` in the JSON.
  - `lib/config.ts` — `BREVO_API_KEY`, `ALERT_FROM_EMAIL`, `ALERT_FROM_NAME`,
    `ALERT_SITE_URL`.
- **bestlooking.skin**
  - `components/PriceAlertForm.tsx` — client form (email + target; pre-fills
    target at 10 % below current best price).
  - `app/api/price-alert/route.ts` — creates the alert in Strapi.
  - `app/api/price-alert/cancel/route.ts` — token-verified unsubscribe.
  - Wired into `app/products/[slug]/page.tsx` under the Buy button.

## Environment variables

`nxt-sourcing/.env.local`

```
BREVO_API_KEY=          # Brevo v3 API key
ALERT_FROM_EMAIL=alerts@bestlooking.skin
ALERT_FROM_NAME=BestLooking.Skin   # optional, has default
ALERT_SITE_URL=https://bestlooking.skin   # optional, used for product/cancel links
```

`bestlooking.skin/.env.local`

```
STRAPI_WRITE_TOKEN=     # Strapi API token with create perm on commerce-price-alert
                        # (falls back to STRAPI_API_TOKEN if unset)
```

Both apps are Next.js and auto-load `.env.local`; no systemd `EnvironmentFile`
is involved. A change requires a service restart (env is read at process start).

## Deploy / setup steps

1. **Strapi** — deploy the new collection:
   ```
   cd <strapi-deploy dir>
   docker compose up -d --build strapi
   ```
   (Bundle with the `status → *Status` rename rebuild — same image.)
2. **Strapi admin → Settings → API Tokens** — grant the write token `create`
   (and `findOne` + `update`, for the cancel link) on **Commerce · Price Alert**.
3. **Brevo** — verify the sending domain (SPF/DKIM DNS records) so
   `ALERT_FROM_EMAIL` can actually send.
4. **App env + restart** (already done once during initial setup):
   - `systemctl restart bestlooking-skin.service`
   - rebuild nxt-sourcing (`npm run build`) + `systemctl restart nxt-sourcing.service`

## Smoke test

```bash
# 1. Create a test alert with a high target so it triggers immediately
curl -sX POST https://www.bestlooking.skin/api/price-alert \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","productDocumentId":"<docId>","targetPrice":99999}'

# 2. Run the refresh + alert check (secret from PRICE_REFRESH_SECRET)
curl -sX POST http://127.0.0.1:3005/api/refresh-prices \
  -H "Authorization: Bearer $PRICE_REFRESH_SECRET" \
  -H 'Content-Type: application/json' -d '{"limit":1}'
# -> response includes "alerts": { checked, triggered, sent, failed }
```

A triggered alert flips `alertStatus` to `triggered` and is not re-sent.

## Behaviour notes / tunables

- **Fires once.** After sending, the alert becomes `triggered` and is skipped on
  future runs. To re-arm on a later drop, that logic would need to be added.
- **Target default** is 10 % below the current best price (in
  `PriceAlertForm.tsx`).
- **Price source** is the lowest in-stock offer on the product (`lib/price-alerts.ts`,
  `lowestOfferPrice`). Alerts work for any product with offers, not only
  ASIN-refreshed ones.
- The check is **best-effort**: if it throws, the price refresh still succeeds
  and the error is reported under `alerts.error`.
