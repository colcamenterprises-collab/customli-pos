# Customli POS production cutover review — 2026-09-04

## Decision

The standalone Customli operational apps use the existing SBB production backend and database. The cutover changes the operational front end only; it does not create a second sales ledger or move reporting data.

Target production apps:

- **Customli POS v1.0.0** — register, shifts, Bluetooth receipt printer/cash drawer and receipt branding.
- **Customli KDS v1.0.0** — combined live kitchen queue.
- **Customli CDS v1.0.0** — ready-ticket display and collection callouts.

Connected production API for SBB: `https://app.smashbrosburgers.com`.

## Static route and data-flow review

| Function | Standalone client | Production API/data | Review result |
| --- | --- | --- | --- |
| Device connection | `/connect` | validates with `/api/pos/discounts` and sends `x-pos-device-token` | PASS |
| Register gate | `/register` | `/api/pos-shifts/current` | PASS |
| Open/close shift | `/shifts` | `/api/pos-shifts/open`, movement and close routes | PASS — one global open shift |
| POS menu | `/register` | `/api/pos/menu?price_mode=direct|grab` from `ordering_menu_items` and categories | PASS |
| Menu images | POS cards use backend `image_url` | relative backend images retry against connected API base | FIXED FOR CUTOVER |
| Modifiers | POS item flow | `/api/pos/menu/:id/modifiers` and backend selection validation | PASS |
| Direct/Grab pricing | POS mode selector | canonical direct/grab prices in `ordering_menu_items` | PASS |
| Discounts | POS | `/api/pos/discounts` and management endpoints | PASS |
| Ticket number | POS | `/api/pos/orders/next-ticket`, generated/stored by backend | PASS |
| Create sale | POS | `POST /api/pos/orders` | PASS |
| Shift ownership | backend | new order stores `pos_shift_id` for the current open shift | PASS |
| Payment | backend | confirmed row in `ordering_payments`; order marked paid | PASS |
| Order items | backend | `ordering_order_items` | PASS |
| Item modifiers | backend | `ordering_order_item_modifiers` | PASS |
| Set upgrades | backend | parent charge plus fries/drink set-component rows | PASS |
| Grab references | backend | GF number, customer name/mobile stored on order | PASS |
| Receipt data | POS post-sale | `/api/pos/orders/:id/receipt` returns order + items + modifiers | PASS |
| Print audit | POS post-sale | `/api/pos/orders/:id/print-event` | PASS |
| Receipt printing | POS native bridge | Bluetooth ESC/POS, reconnect/retry | PASS BY CODE; physical printer confirmation required at cutover |
| Receipt branding | `/printer` | device-local config: uploaded logo, name, location, website, membership QR | FIXED/EXPOSED FOR CUTOVER |
| Cash drawer | POS native bridge | pulse after dual-copy cash receipt when enabled | PASS BY CODE; physical confirmation required at cutover |
| Kitchen queue | `/kitchen` | `/api/ordering/kitchen/orders`, statuses submitted/accepted/in_kitchen/ready | PASS |
| Kitchen sources | KDS | combined `ordering_orders` queue includes counter, Grab, online, delivery, QR/table/tablet | PASS |
| Kitchen status | KDS | ordering status route for online-family orders; POS status route for POS/Grab | PASS |
| Customer display | `/display` | `/api/pos/display/orders` ready POS/Grab tickets | PASS — parity with current production behavior |
| Ready callout | KDS/CDS | Android native TTS with browser fallback | STRENGTHENED FOR CUTOVER |
| Dashboard receipts | SBB dashboard | unified reporting reads live `ordering_orders` as `sbb_pos` | PASS |
| Dashboard receipt items | SBB dashboard | detail query reads `ordering_order_items`, modifiers, notes and set-component flags | PASS |
| Dashboard payments | SBB dashboard | detail query reads `ordering_payments` | PASS |
| Item sales/reporting | SBB dashboard | unified ledger joins live orders/items/menu/category/costing | PASS |
| App version | all standalone apps | visible badge + Android versionName 1.0.0/versionCode 10000 | FIXED FOR CUTOVER |

## Reporting ownership

The SBB reporting layer already defines live SBB POS as the canonical source after `2026-08-09T03:00:00+07:00`. Standalone POS sales are written to the same `ordering_orders`, `ordering_order_items`, `ordering_order_item_modifiers` and `ordering_payments` tables consumed by unified reporting. No export, sync or duplicate ingestion step is required.

## Parity check against extracted live POS

The standalone baseline was extracted from the production dashboard POS implementation. A repository comparison from the pinned extraction source to current dashboard main shows no subsequent changes to the principal operational pages `PosRegister.tsx`, `PosKitchen.tsx`, `PosDisplay.tsx` or `PosShifts.tsx`. Production changes since extraction around hardware/receipt support are superseded by the standalone native printer and receipt implementation.

## Known non-cutover issues / deliberate parity

- Customer Display currently shows ready `pos_direct` and `grab` tickets, matching the existing production display endpoint. Expanding CDS to all online channels is a later product enhancement, not required to replace tonight's current behavior.
- Unified receipt detail currently reports live receipt staff as blank and its detail-level discount field has legacy mapping limitations. The live order, payment, items, modifiers, totals and unified overview/receipt ledger remain captured. These are reporting refinements, not loss of standalone POS transaction data.
- Receipt branding and printer selection are device-local in v1.0.0. Central tenant-level branding is a future white-label product improvement.
- Android outputs are currently debug APKs. They are suitable for controlled SBB internal deployment; production signing/distribution should be completed before broad commercial distribution.

## Production cutover sequence

1. Keep the existing embedded SBB POS installed as emergency fallback, but do not operate both POS frontends concurrently.
2. Install Customli POS v1.0.0 on the checkout Samsung, Customli KDS v1.0.0 on the kitchen device and Customli CDS v1.0.0 on the customer display device.
3. Connect all three to the live SBB API using the existing POS device connection code.
4. On the POS device open **Printer & Receipt Setup** before opening the shift:
   - select/connect the paired Bluetooth printer;
   - confirm 58 mm paper;
   - leave automatic printing enabled;
   - enable cash drawer attachment/automatic cash opening if used;
   - upload/save the SBB receipt logo and branding if desired;
   - send a printer test and drawer test.
5. Open the normal live shift with the correct cashier and starting float.
6. Complete the first real low-value direct transaction and verify, in order:
   - POS returns a ticket number;
   - receipt prints;
   - cash drawer behavior is correct for payment type;
   - ticket appears on KDS;
   - KDS can mark it ready;
   - CDS displays/announces the ticket;
   - KDS can complete/clear it;
   - SBB Dashboard Receipts contains the transaction, items/modifiers and payment;
   - SBB reporting reflects the sale.
7. If that chain passes, continue the shift on standalone apps. If a P0 operational failure occurs, stop creating new standalone sales and use the existing embedded POS fallback rather than running both simultaneously.

## Cutover gate

Static architecture/data review: **PASS with the cutover fixes in this branch**.

Remaining gates before handing the shop to v1.0.0:

- repository CI/type/build pass on the final cutover commit;
- current-head code review has no unresolved production blocker;
- all three Android APKs build successfully;
- printer/drawer physical check on the Samsung;
- first live transaction confirms the end-to-end operational chain.
