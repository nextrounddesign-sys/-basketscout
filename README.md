# BasketScout — East Stroudsburg Alpha v0

A mobile-first proof of concept for building a grocery list and eventually optimizing purchases across local grocers.

## What works now

- Mobile responsive grocery list
- Search and category filters
- +1 / -1 quantity controls
- Selection persists in browser localStorage
- Mock shopping-plan output across GIANT, Walmart, ShopRite, Weis, and ALDI

## Important

The prices in `app.js` are intentionally mock data. They are placeholders for UI and optimizer testing only and must not be shown to users as real prices.

## Run locally

Open `index.html` directly in a browser, or serve this directory with any static web server.

Example with Python:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Next build milestones

1. Replace mock prices with a structured price database.
2. Add store locations for the East Stroudsburg/Stroudsburg alpha.
3. Add `price_observation` records with source, observed date, confidence, and expiration.
4. Add sales, loyalty requirements, and coupons as separate records.
5. Add a two-store / one-store / cheapest-overall optimizer.
6. Add receipt import to bootstrap legitimate local prices.
7. Add backend/API and authentication only after the core comparison flow works.

## Proposed data model

- `products`
- `product_aliases`
- `stores`
- `store_products`
- `price_observations`
- `promotions`
- `coupons`
- `shopping_lists`
- `shopping_list_items`

Every price record should include its source and timestamp so stale prices are never silently presented as current.
