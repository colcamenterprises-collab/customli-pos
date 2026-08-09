# Customli POS Extraction Plan

## Objective

Extract the proven operational POS from `final-dashboard-4` into a standalone application without changing the current production behavior or disrupting the live register during an open shift.

## Source baseline

Source repository: `colcamenterprises-collab/final-dashboard-4`
Source branch: `main`

Current operational UI surface identified:

- `client/src/pages/pos/PosRegister.tsx`
- `client/src/pages/pos/PosKitchen.tsx`
- `client/src/pages/pos/PosDisplay.tsx`
- `client/src/pages/pos/PosShifts.tsx`
- `client/src/pages/pos/PosRegisterGate.tsx`
- `client/src/pages/pos/PosCatalog.tsx`
- `client/src/pages/pos/PrinterSettings.tsx`

## Architecture decision

One operational app with device roles:

- Register
- Kitchen Display
- Customer Display

The existing dashboard remains Back Office and the source of truth for configuration.

## Migration principles

1. Extract before redesigning.
2. Preserve existing API contracts initially.
3. Do not migrate or duplicate transactional data.
4. Do not deploy or switch production during an open shift.
5. Keep current production POS as the rollback path until side-by-side acceptance passes.
6. Cut over only after a normal shift close and reconciliation.

## Work phases

### Phase 1 — Map dependencies

Identify all POS dependencies on dashboard code, shared libraries, routes, assets, authentication/device registration, printer/TTS bridge, menu APIs, order APIs, shifts, kitchen and customer display.

### Phase 2 — Standalone shell

Create a minimal standalone React/Capacitor application that can host the existing operational screens without dashboard navigation or unrelated modules.

### Phase 3 — Extract operational code

Move/copy the proven POS components and the smallest required shared dependencies into this repository. Preserve behavior before refactoring.

### Phase 4 — API boundary

Introduce a single configurable API base URL and document all required backend contracts. Initially point to the existing Smash Brothers production backend.

### Phase 5 — Android operational layer

Bring across the proven native Bluetooth printer, printer persistence/reconnect, ESC/POS receipt path, native TTS/callout and device registration behavior.

### Phase 6 — Device roles

Add startup/device-role configuration so a device can launch directly into Register, Kitchen or Customer Display.

### Phase 7 — Production-equivalence test

Install alongside the existing POS using a separate Android package ID. Verify Direct, Grab, modifiers, shifts, kitchen lifecycle, customer display, receipt printing, TTS and reconciliation.

### Phase 8 — Cutover

After a clean shift close/reconciliation, open the next shift on the standalone app. Keep the legacy POS available for rollback until the new app has completed an agreed stable operating period.

## Definition of done

- Standalone repo builds independently.
- No dashboard UI dependency is required at runtime.
- Menu Management remains authoritative in Back Office.
- Register, Kitchen and Customer Display operate through the existing backend contracts.
- Direct and Grab orders preserve modifiers and totals.
- Shared Bluetooth printer works for both order modes.
- Native callout works.
- Shift open/close and reconciliation match current production behavior.
- Side-by-side acceptance passes before production cutover.
