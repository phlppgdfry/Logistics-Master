# Functional Analysis — Gate Transaction Interceptor

How this extension went from an end-user problem to a technical design. Written as an
IT Analyst–Developer would document it before writing code, not after.

---

## 1. Problem statement (as reported by end users)

Gate clerks at CSP Zeebrugge flagged three recurring issues during peak hours:

1. Trucks arriving without a matching VBS booking still reached the gate lane before
   being turned away, causing queue build-up.
2. Containers under an active customs hold were occasionally released because the hold
   status was checked manually, not automatically, at the point of transaction.
3. Collect transactions without a valid PIN required a phone call to the shipping line,
   interrupting the gate flow.

None of these were TOS defects — they were gaps between what Navis N4 enforces out of
the box and what CSP's actual gate process requires.

## 2. Stakeholders consulted

| Stakeholder | Concern |
|---|---|
| Gate clerks | Fewer manual checks, clear rejection reasons drivers can act on |
| Operations supervisor | No customs/compliance exposure from missed holds |
| VBS/gate control | Single source of truth for plate ↔ booking matching |

## 3. Requirements derived from the above

- **R1** — Every gate transaction must be checked against an active VBS booking before
  the transaction is approved; no booking → hard block, not a warning.
- **R2** — Any active hold in the categories `CUSTOMS`, `EDO`, or `RELEASE` must block
  gate-out automatically; the exception message must name the hold(s) so the clerk can
  explain the rejection to the driver without escalating.
- **R3** — Collect (`OUT`) transactions must validate the PIN at the point of
  transaction, not after the fact.
- **R4** — Every transaction (approved or blocked) must be written to an audit trail
  with timestamp, container, and plate — needed for the monthly gate-compliance report
  operations already runs manually today.

## 4. Design decisions and trade-offs

- **Hook point:** N4's gate transaction interceptor was chosen over a Camco GOS-side
  change because N4 is the system of record for holds — validating there avoids a
  second source of truth.
- **Fail-fast, not fail-soft:** each check (`checkVbsMatch`, `checkCustomsHold`,
  `checkPinNumber`) throws immediately rather than collecting all errors, because a
  blocked gate transaction needs one clear reason for the clerk and driver, not a list.
- **Stubbed lookups:** `lookupVbsPlate`, `lookupActiveHolds`, `lookupContainerPin` are
  stand-ins for the real VBS API / N4 `HoldApplicability` calls — kept separate so the
  validation logic is testable independent of live system access.
- **R4 satisfied as a side effect:** `logAudit()` runs on both the approved and blocked
  paths, so the existing manual compliance report becomes a query instead of a
  spreadsheet exercise.

## 5. Acceptance criteria

- [x] Transaction with no VBS booking is rejected before gate opens (R1)
- [x] Transaction with a plate mismatch against the VBS booking is rejected (R1)
- [x] Transaction with an active customs/EDO/release hold is rejected, hold ID(s) named (R2)
- [x] Collect transaction with missing or wrong PIN is rejected (R3)
- [x] Every transaction outcome is logged with timestamp, container ID, plate (R4)

See `GateTransactionInterceptor.groovy` for the implementation and its `main()`
simulator, which exercises all five criteria above.
