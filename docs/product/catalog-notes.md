# Catalog notes

`src/data/catalog.ts` is a snapshot of [www.monis.rent](https://www.monis.rent) taken on **2026-10-11**.

## Source

- Product data (name, slug, `weekly_price`, `monthly_price`, `sale`, `enable_instant`, images) was read from the page data embedded in the monis.rent category pages.
- Images are served from `https://strapi.monis.rent/uploads/…`. All 38 image URLs and product slugs returned HTTP 200 on 2026-10-11.
- Each real item links to `https://www.monis.rent/products/<slug>`.

## Pricing rules

- Prices are USD list prices per week and per month, stored as integer cents.
- `sale` is a discount percentage: effective price = list × (100 − sale) / 100, rounded to the cent. Example: the desk lamp at $4.00 with `sale` 20 costs $3.20, consistent with the site's "from $3/week" (the site rounds down).
- Monthly savings shown in the UI = weekly total × 52 / 12 − monthly total.
- Delivery fees are calculated by monis.rent at checkout from location and weight; this app never computes or promises them.
- "Can arrive today" means every item has `enable_instant`; otherwise "Arrives tomorrow" (monis.rent's standard next-day delivery).

## Assumptions

- **Sale on monthly prices:** we assume `sale` also applies to monthly prices.
- **Desk widths:** Electrical Adjustable Desk 120 cm and Mechanical Adjustable Desk 140 cm are assumptions (monis.rent does not list them). The Dual-Motor desk uses its largest variant, 160 cm.
- **Bundles:** presets mirror the contents of the Essentials, Founders, Trading and Studio bundles. The bundle discount is not applied because its exact rule is unknown.

## Concept items

monis.rent lists only one chair and no plants, but the brief needs at least two chairs and mentions plants. These items are added as **concept items**: no slug, no photo, an indicative price, and a visible "Concept" badge.

| id             | Name               | Weekly | Monthly |
| -------------- | ------------------ | ------ | ------- |
| chair-basic    | Basic Task Chair   | $5.00  | $14.00  |
| chair-premium  | Premium Ergo Chair | $15.00 | $40.00  |
| plant-monstera | Monstera Plant     | $2.00  | $6.00   |
| plant-snake    | Snake Plant        | $1.50  | $4.00   |

Product insight for monis.rent: a single chair model limits choice for the people who sit the longest.
