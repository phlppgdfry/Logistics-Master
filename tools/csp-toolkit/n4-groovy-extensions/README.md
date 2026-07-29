# N4 Groovy Extensions

Navis N4 allows terminals to extend its business flow by injecting **Groovy code** at specific hook points — called *code extensions* or *Groovy hooks*. This is the primary way terminal IT developers customise N4 without touching the core product.

This module contains three production-pattern extensions based on real N4 SDK hook names and patterns.

See [`FUNCTIONAL_ANALYSIS.md`](./FUNCTIONAL_ANALYSIS.md) for the requirements analysis
behind the gate interceptor — end-user problem, stakeholders, derived requirements,
design trade-offs, and acceptance criteria — the step before any code was written.

---

## Extensions

### `TbdUnitValidationGroovyImpl.groovy`
**Hook:** `TbdUnitValidation` — fires before a container unit is confirmed in the TOS.

Validates:
- ISO 6346 container ID format (4 letters + 6 digits + check digit)
- Dangerous goods containers flagged for inspection before yard placement
- Reefer containers must have a valid temperature set-point

### `GateTransactionInterceptor.groovy`
**Hook:** Gate workflow interceptor — fires when a truck transaction is processed at the gate.

Handles:
- Cross-checks truck licence plate against VBS booking
- Blocks gate if container has an active customs hold
- Logs transaction with timestamp + operator ID for audit trail

### `ReeferMonitorGroovyImpl.groovy`
**Hook:** `ReeferMonitor` — fires on reefer temperature update messages.

Handles:
- Alerts operations if temperature deviates >2°C from set-point
- Auto-escalates if deviation persists >30 minutes
- Writes alert to N4 event log with container ID + location

---

## How N4 Groovy hooks work

```
External event (truck arrives, temperature update, unit discharge...)
        │
        ▼
N4 business flow — checks for a Groovy hook with matching name
        │
        ▼
Groovy hook runs — can validate, modify, block, or log
        │
        ▼
N4 continues (or halts if hook throws exception)
```

Hooks are loaded via the **Code Extensions** screen in the N4 UI and stored in the N4 database. No server restart required for most extensions.
