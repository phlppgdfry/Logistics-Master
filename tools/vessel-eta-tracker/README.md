# VesselETA — CSP Zeebrugge

> Real-time vessel tracking dashboard for container terminal operations. Compares live AIS positions against the planned N4 arrival schedule and alerts planners when ships deviate from their ETA — before they arrive.

**[▶ Live Demo](https://phlppgdfry.github.io/vessel-eta-tracker/)** — no API key needed, demo launches automatically.

---

## The problem

Disrupted sailing schedules are one of the biggest operational challenges for container terminals. When a vessel arrives 6 hours late:

- The **yard plan is wrong** — containers are pre-positioned for a ship that isn't coming
- **Crane crews are misallocated** — expensive idle time or unplanned overtime
- **Truck appointments don't match** — gate congestion, missed slots
- **Vessel stack cutoffs** are missed — cargo rolled to next departure

Early ETA visibility gives operations the time to adapt. This tool surfaces deviations **while the vessel is still at sea**.

---

## Features

| Feature | Description |
|---|---|
| **Demo mode** | Auto-starts with 8 simulated vessels — no API key required |
| **Live AIS feed** | Real vessel positions via aisstream.io WebSocket |
| **KPI dashboard** | Vessels tracked · On-time % · Average deviation · Critical alerts |
| **Directional markers** | Triangle icons rotate to show vessel heading (COG) |
| **ETA deviation** | Calculated ETA vs N4 scheduled ETA, colour-coded by severity |
| **Alert log** | Critical deviations (>120 min) trigger toast + alert log |
| **Vessel detail** | Voyage, service line, scheduled vs calculated ETA, approach line on map |
| **Search & filter** | Filter by vessel name, service line, voyage, or status |
| **ETA chart** | Deviation history for the last 30 updates |
| **CSV export** | One-click export of current vessel state |

---

## How it works

```
Live AIS feed (aisstream.io WebSocket)
        │
        ▼
Filter vessels in bounding box  ←  North Sea / English Channel approach
        │
        ▼
Position + speed  →  calculate real ETA to CSP Zeebrugge berth
        │
        ▼
Compare against N4 planned schedule
        │
        ▼
Deviation > threshold?  →  Alert (toast + log)
```

---

## Quick start

### Option 1 — Demo (no setup)

1. Open `index.html` in any browser
2. Demo launches automatically with 8 simulated vessels

Or use the [hosted version](https://phlppgdfry.github.io/vessel-eta-tracker/).

### Option 2 — Live AIS data

1. Get a **free** API key at [aisstream.io](https://aisstream.io) (sign up with GitHub)
2. Open `index.html`
3. Paste your API key → click **Connect**
4. Live vessels in the North Sea approach appear on the map

---

## ETA deviation colour coding

| Colour | Meaning | Threshold |
|---|---|---|
| 🟢 Green | On schedule or early | < +30 min |
| 🟡 Yellow | Moderate delay | +30 – +120 min |
| 🟠 Orange | Significant delay | +120 – +240 min |
| 🔴 Red | Critical — action required | > +240 min |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML / CSS / JavaScript — zero dependencies, no build step |
| Map | [Leaflet.js](https://leafletjs.com) + CartoDB dark tiles |
| Charts | [Chart.js](https://chartjs.org) |
| AIS data | [aisstream.io](https://aisstream.io) — free WebSocket API |
| Schedule | Simulated N4 data (production: replace with N4 REST API) |

Single file. No server. No framework. Opens directly in browser.

---

## Production integration points

To go from demo to production, replace:

```javascript
// In index.html — the N4 schedule array
const N4 = [
  { mmsi: '477307900', name: 'COSCO SHIPPING AQUARIUS', eta: oh(-0.5), svc: 'AEX', voy: 'AEX-041W' },
  // ...
];
```

With a fetch from your N4 REST API:

```javascript
const N4 = await fetch('/api/n4/expected-arrivals').then(r => r.json());
```

The rest of the logic (ETA calculation, deviation, alerting) works unchanged.

---

## Why Zeebrugge

CSP Zeebrugge handles vessels on the AEX, EC2, and FE4 service loops — connecting the UK, Ireland, Scandinavia and the Baltics through the English Channel and southern North Sea. In disrupted alliance seasons, vessels can run 6–24 hours off schedule. For a terminal processing 1M+ TEU per year, early visibility of those deviations directly reduces rehandles, overtime, and crane idle time.

---

## License

MIT — see [LICENSE](LICENSE)
