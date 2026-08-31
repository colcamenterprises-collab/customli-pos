# Customli POS pre-cutover acceptance

The legacy SBB POS must remain available until every mandatory gate below passes. A PASS requires observed evidence, not assumption.

## 1. Runtime boundary

- [ ] `src/` contains only frontline operational code required by Register, Kitchen Display, Customer Display, shifts, printer/hardware and device connection.
- [ ] No dashboard navigation, finance, reporting, admin, Loyverse-era UI, legacy auth UI or unrelated SBB modules are compiled into the app.
- [ ] SBB-specific behaviour is configuration/reference-tenant data, not a permanent Customli POS platform assumption.
- [ ] `reference/backend/` remains non-runtime reference material only and is not included by TypeScript or Vite application imports.
- [ ] Production data remains in the existing system of record; the Android app does not contain copied customer/order databases, secrets or credentials.

## 2. Android application

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run build` succeeds.
- [ ] `npm run android:prepare` creates/synchronises the Capacitor Android project and installs the Customli native bridge.
- [ ] Android debug APK builds in CI.
- [ ] APK installs alongside the existing SBB POS without package conflict.
- [ ] App identity is `io.customli.pos` / Customli POS.
- [ ] First launch connects to the approved backend and assigns the correct business/device role.
- [ ] App restart returns directly to the saved Register, Kitchen or Customer Display role.
- [ ] Tablet reboot returns to a usable operational state without developer intervention.

## 3. Register equivalence

Test equivalent transactions in legacy SBB POS and Customli POS against the same approved backend/configuration.

- [ ] Direct counter order.
- [ ] Grab order.
- [ ] Burger modifiers/extras/removals.
- [ ] Set/meal components.
- [ ] Notes/special requests.
- [ ] Cash payment.
- [ ] QR/non-cash payment used in production.
- [ ] Discounts currently supported in production.
- [ ] Receipt number/ticket number generation.
- [ ] Gross, net, tax/fees and channel totals match expected production behaviour.
- [ ] No duplicate order is created when checkout is tapped once.
- [ ] Failed checkout produces a clear error and does not silently duplicate/retry a sale.

## 4. Shift and cash control

- [ ] Open shift.
- [ ] Starting cash is correct.
- [ ] Cash sale updates shift correctly.
- [ ] Pay-in/pay-out or cash movements used in production behave correctly.
- [ ] Cash drawer opens only when configured/appropriate.
- [ ] Close shift.
- [ ] Closing totals reconcile with backend/reporting source of truth.

## 5. Kitchen Display

- [ ] Counter order appears.
- [ ] Grab order appears.
- [ ] Online/QR/table order appears where applicable.
- [ ] New-order sound works and can be disabled.
- [ ] Ticket age/urgency display is correct.
- [ ] Modifiers and special requests are visible.
- [ ] Ready transition works.
- [ ] Completed/collected/dispatched transition works.
- [ ] `Clear all ready` closes only ready tickets and preserves history.
- [ ] `CLEAR ALL KITCHEN` requires two confirmations, closes the visible operational queue, and does not delete sales, receipts or order history.
- [ ] Recovery after partial clear failure leaves enough information to review/retry safely.

## 6. Customer Display / callout

- [ ] Ready collection ticket appears on Customer Display.
- [ ] Completed ticket disappears as expected.
- [ ] Native/browser callout says the correct ticket number.
- [ ] Delivery/table orders do not create inappropriate customer collection callouts.

## 7. Printer and hardware

- [ ] Android Nearby Devices permission flow works.
- [ ] Paired printer list loads.
- [ ] Connect succeeds to the production printer.
- [ ] Printer connection status is understandable to staff.
- [ ] Test print succeeds.
- [ ] Direct order receipt prints correctly.
- [ ] Grab order receipt/kitchen print path works as intended.
- [ ] Cash drawer test works.
- [ ] Cash drawer opens automatically only for configured cash sales.
- [ ] Printer disconnect is detected.
- [ ] Reconnect succeeds without reinstalling/restarting the app.
- [ ] App restart can restore configured printer behaviour.

## 8. Network/outage recovery

- [ ] Temporary Wi-Fi loss produces an explicit operational error rather than a blank/broken screen.
- [ ] Restoring Wi-Fi recovers without reinstalling the app.
- [ ] Backend restart/outage recovers cleanly.
- [ ] Repeated user taps during a slow/outage condition do not create duplicate sales.
- [ ] Kitchen can recover from a stale/unusable queue using the protected clear-all action.

## 9. Reconciliation proof

For the controlled test shift, record legacy/expected figures and Customli POS figures side by side.

- [ ] Receipt count matches.
- [ ] Direct gross sales match.
- [ ] Grab gross sales match.
- [ ] Payment-channel totals match.
- [ ] Cash movement matches.
- [ ] Refund/discount figures used in test match.
- [ ] Closing shift total matches.
- [ ] No unexplained orders exist in either direction.

## 10. Cutover rule

Cutover is allowed only when all mandatory items above are PASS or a specifically documented non-applicable item is approved.

1. Close and reconcile the current SBB shift normally.
2. Keep the legacy SBB POS code and route available as rollback.
3. Begin the next shift on Customli POS.
4. Do not delete the legacy implementation during initial production operation.
5. Disable/remove the legacy POS only after stable real-world operation and a successful reconciliation period.

## Evidence to retain

Keep the tested APK build/commit SHA, device role, Android/tablet version, printer model/address, test shift identifier, test order identifiers, reconciliation totals, screenshots for critical screens, and any known exceptions. This becomes the release record for the first production cutover.
