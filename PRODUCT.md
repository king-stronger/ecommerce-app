# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A visitor browsing a small demo shop. They need to see what is for sale and where to go next, without a second task competing with the purchase.

## Product Purpose

A portfolio storefront on the ecommerce API: catalog, guest cart, and checkout without a real payment charge. Success on the first surface is a clear path from the homepage to a product.

## Positioning

The shop is a thin client of an existing OpenAPI backend. Guest checkout and the admin catalog already exist on the API. The storefront does not invent payments, reviews, or search.

## Operating Context

Local demo. API on port 8787, app on the SvelteKit dev server. Seeded catalog: vêtements, chaussures, sacs, accessoires, with product photos, shipping methods, coupon WELCOME10. Admin stays in Scalar.

## Capabilities and Constraints

- Public catalog, guest cart cookie, checkout, and order lookup are live on the API.
- Prices are integer cents, currency EUR.
- Shop name is undecided. The header uses "Boutique" until a name is chosen.
- Color is a warm shop: cream ground, spruce department bar, amber actions. Corners are rounded.
- No AI search, no reviews, no payment provider.

## Brand Commitments

The header is the shop mark, the account, and the cart. Categories are a list directly under it, then the landing shows those rayons and their products with photos and prices. One primary action on the opening panel. References: Allbirds for warmth and rounded product photos, Amazon for the department list and a visible price.

## Evidence on Hand

Seeded product names, descriptions, prices, placeholder images, category names, shipping prices (Standard 4,99 €, Express 9,99 €), and coupon WELCOME10 (10 % off from 20 €, cap 15 €). Do not invent reviews, stock stories, or brand claims.

## Product Principles

- One next step is visible without reading the whole page.
- Real catalog data only.
- The header stays the shop mark, account, and cart. Categories live in the list under it.
- Admin and payment stay out of this storefront pass.
