# SBB 58mm receipt design

The standalone POS owns receipt presentation and printing.

## Operational hierarchy

1. SBB logo/brand header.
2. Copy label (`CASHIER COPY` / `CUSTOMER COPY`).
3. Large order identity. Grab orders use `GF-<number>` plus customer name; direct orders use the short POS ticket number.
4. Bagging checklist. Every primary sellable item starts with `[ ]`; modifiers, set components and notes remain indented below the parent item.
5. Payment/totals and order timestamp.
6. Membership QR placeholder and bold website footer.

## Print behaviour

A completed order produces one printer job containing two receipts: cashier copy first, customer copy second. The cash drawer pulse is still sent only once after the complete print job succeeds.

The temporary membership QR destination is `https://smashbrosburgers.com/membership`. It can be replaced when the membership site is ready without changing the receipt layout.

## Logo

The printer formatter currently leaves a clearly marked brand-header hook. Replace it with the supplied monochrome SBB raster logo asset when the final logo is provided. The receipt must remain readable if raster logo printing is unavailable.
