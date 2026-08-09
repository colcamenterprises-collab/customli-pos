# Customli POS

Standalone operational application for Smash Brothers Burgers POS.

## Scope

This repository is being extracted from `colcamenterprises-collab/final-dashboard-4` as a dedicated operational app containing:

- POS Register
- Kitchen Display
- Customer Display
- Shift operations
- Device registration / role selection
- Native Android Bluetooth receipt printing
- Native order callouts / TTS

Back-office configuration remains in the existing Smash Brothers dashboard. Menu Management, pricing, modifiers, reporting, finance and administration stay authoritative there. This app consumes the existing production POS APIs and data contracts.

## Migration rule

The existing production POS remains live and unchanged except for critical fixes until this standalone application passes side-by-side production-equivalence testing. Cutover occurs only after a normal shift close/reconciliation.

## Current phase

Phase 1: dependency mapping and baseline extraction from the current production POS.
