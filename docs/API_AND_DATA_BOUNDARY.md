# API and data boundary
Phase 1 preserves the proven production API contracts instead of rewriting the backend during client extraction.

Copied route and service implementations under `reference/backend/` are dependency snapshots, not compiled client code.

Operational API families:
- `/api/pos/*` — register menu, modifiers, orders, receipt truth, display, discounts and order status.
- `/api/pos-shifts/*` — current/open/close shift and cash movements.
- `/api/ordering/*` — shared kitchen queue and non-register order lifecycle.

No live customer records, order history, credentials, database secrets or PII are copied into this public repository. Production data stays in the existing system of record until a separately approved backend migration.

`VITE_CUSTOMLI_API_BASE` targets a compatible backend. Cross-origin authenticated operation must be proven before cutover. `VITE_DEV_API_TARGET` provides a development proxy.
