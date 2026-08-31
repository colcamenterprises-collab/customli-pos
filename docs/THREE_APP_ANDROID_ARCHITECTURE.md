# Customli Android app separation

Customli ships three independently installable Android applications from this repository:

- Customli POS (`io.customli.pos`) — register surface
- Customli KDS (`io.customli.kds`) — kitchen display surface
- Customli CDS (`io.customli.cds`) — customer display surface

Each APK is build-locked to its own role and cannot switch roles from the UI. The three applications continue to share the same React codebase, backend contracts, device connection model, and native bridge code.

User authorization remains a backend responsibility. Device/app separation is an additional boundary, not a replacement for authenticated role/permission checks.

CI builds and publishes one debug APK artifact per variant so all three can be installed side-by-side on one Android tablet during acceptance testing.
