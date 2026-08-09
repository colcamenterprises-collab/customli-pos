# Customli POS

**Customli POS** is the operational point-of-sale application owned and developed by **Customli.io**.

Smash Brothers Burgers is Customer #1 and the reference implementation. It is not the product identity and business-specific behaviour must remain configuration rather than a permanent code assumption.

## Who this product is for

Customli POS is designed first for small-business and medium-enterprise owners and their staff. A customer should not need to understand software architecture, databases or Android development to run their business.

The operating principle is simple: **frontline operation stays obvious and fast; Back Office provides the deeper business capability.**

## Operational app

One application supports three device roles:

- **POS Register** — orders, payments, modifiers, shifts and receipt printing.
- **Kitchen Display** — live production tickets and order handoff.
- **Customer Display** — ready-order ticket display and collection callouts.

The device role is selected during simple setup and can be changed later without reinstalling the product.

## Back Office relationship

Customli POS is deliberately separate from the Back Office product surface. Back Office remains responsible for configuration and deeper management capabilities such as catalogue/menu management, pricing, modifiers, staff administration, reporting, finance, business settings and integrations.

The operational application consumes stable APIs and should not become a second administration system.

## Current technical baseline

The first standalone baseline was extracted from the proven production implementation at:

- Source repository: `colcamenterprises-collab/final-dashboard-4`
- Pinned source commit: `4a6cf40e86fe6eb0353d3eed986d3523c9845083`

The extracted baseline includes the Register, shift gate, Kitchen Display, Customer Display, shift control, printer settings, native Bluetooth/ESC-POS/TTS bridge and post-sale hardware handling.

Reference copies of the current POS, shift and ordering backend routes/services are kept under `reference/backend/` so their working API behaviour can be mapped and stabilised without rewriting everything at once.

## Data safety during extraction

This public repository does **not** contain live customer records, order history, credentials, database secrets or personally identifiable information. Production transactional data remains in the existing system of record during the parallel migration.

## Build

```bash
npm ci
npm run build
```

Every push to `main` and every pull request is type-checked and built automatically.

## Migration rule

The existing SBB production POS remains live and unchanged except for genuinely critical fixes while Customli POS is developed in parallel. The standalone app must pass side-by-side functional, hardware and reconciliation testing before cutover. Operational cutover happens only after a normal shift close and reconciliation.

See `docs/PRODUCT_PRINCIPLES.md`, `docs/API_AND_DATA_BOUNDARY.md`, `docs/SOURCE_SNAPSHOT.md` and `docs/EXTRACTION_PLAN.md` for the working rules behind the product.
