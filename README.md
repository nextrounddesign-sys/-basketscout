# BasketScout — East Stroudsburg Alpha v0.2

Mobile-first grocery comparison proof of concept.

## v0.2 changes
- Expanded generic grocery catalog to **254 items**.
- Added optional brand preference per selected grocery.
- Added structured `data.js` model for products, stores, price observations, promotions, and coupons.
- Added five concrete alpha store records.
- Removed mock prices from the comparison flow; the UI now refuses to imply unverified prices are real.
- Preserves quantities and brand preferences in browser `localStorage`.

## Alpha store records
- GIANT — 300 Lincoln Ave, East Stroudsburg, PA 18301
- Walmart Supercenter #2368 — 355 Lincoln Ave, East Stroudsburg, PA 18301
- Weis Markets — 695 N Courtland St, East Stroudsburg, PA 18301
- ShopRite of Stroudsburg — 344 Stroud Mall Rd Ste 100, Stroudsburg, PA 18360
- ALDI — 2995 PA-940, Pocono Summit, PA 18346 (nearby alpha store)

## Data model
`data.js` currently contains:
- `products`
- `stores`
- `priceObservations`
- `promotions`
- `coupons`

Every future price observation should contain a product/store reference, price, observation timestamp, source type/source reference, and confidence. Promotions/coupons remain separate from base price observations.

## Next milestone
Receipt import + structured verified price observations, then the one-store / two-store / cheapest-overall optimizer.
