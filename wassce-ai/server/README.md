# Payments API (MTN MoMo + Lonestar Cell Money)

## Run locally
1. Create a Postgres DB (Supabase Postgres is supported) and set `DATABASE_URL`.
2. Copy `server/.env.example` to `server/.env` and fill credentials.
3. Start the API: `npm run dev:api`
4. Start the frontend: `npm run dev`

Vite proxies `/api/*` to `http://127.0.0.1:3001`.

## Endpoints
- `POST /api/payments` → initiate payment `{ provider, phone, amount, currency?, userRef? }`
- `GET /api/payments/:id` → payment status (also verifies provider status when `PENDING`)
- `POST /api/webhooks/momo` → MTN callback (expects an `externalRef` / `referenceId`)
- `POST /api/webhooks/lonestar` → Lonestar callback (expects an `externalRef` / `reference`)

## Webhooks (verification)
This implementation supports HMAC verification:
- header: `x-webhook-signature`
- value: hex(HMAC_SHA256(rawBody, WEBHOOK_SECRET_*))

Set `WEBHOOK_REQUIRE_SIGNATURE=true` in production.

## Provider configuration
### MTN MoMo (Collections API)
Set:
- `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, `MTN_MOMO_TARGET_ENV`
- Optional: `MTN_MOMO_CALLBACK_URL` (public URL to `.../api/webhooks/momo`)

### Lonestar Cell Money
Set:
- `LONESTAR_BASE_URL`, `LONESTAR_MERCHANT_ID`, `LONESTAR_API_KEY`, `LONESTAR_API_SECRET`
- `LONESTAR_INIT_PATH` and `LONESTAR_STATUS_PATH` (`{ref}` placeholder)
- Optional: `LONESTAR_CALLBACK_URL` (public URL to `.../api/webhooks/lonestar`)
