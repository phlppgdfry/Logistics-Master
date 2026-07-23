<div align="center">

<br/>

# ECS × Digital Twin
### Building a digital twin of the European supply chain.

<br/>

[![Live Site](https://img.shields.io/badge/Live%20Site-phlppgdfry.github.io-c8702a?style=for-the-badge&logo=github)](https://phlppgdfry.github.io/ecs-digital-twin/)
[![Status](https://img.shields.io/badge/Status-Strategic%20Pitch-1e3050?style=for-the-badge)](https://phlppgdfry.github.io/ecs-digital-twin/)
[![Built With](https://img.shields.io/badge/Built%20With-HTML%20%2F%20CSS%20%2F%20JS-152035?style=for-the-badge&logo=html5)](https://phlppgdfry.github.io/ecs-digital-twin/)
[![Deploy](https://img.shields.io/github/actions/workflow/status/KippieG/ecs-digital-twin/deploy.yml?style=for-the-badge&label=Deploy)](https://github.com/KippieG/ecs-digital-twin/actions)

<br/>

> *A strategic vision for the Digital Solutions Expert role at ECS European Containers —*  
> *prepared before day one, designed to last a decade.*

<br/>

---

</div>

## What This Is

A fully interactive strategic pitch deck, built as a web experience, proposing a **Digital Twin of ECS's intermodal supply chain**.

ECS operates across 35+ European countries — truck, rail, ferry and customs in a single ecosystem. The pitch argues that ECS's biggest untapped advantage is the operational data it already generates, and that a digital twin would turn that data into a proactive decision engine.

→ **[View the live site](https://phlppgdfry.github.io/ecs-digital-twin/)**

---

## The Problem

| Pain Point | Today | With Digital Twin |
|---|---|---|
| **Fragmented visibility** | Truck, rail, ferry, customs live in separate systems — decisions travel through inboxes | One source of truth. Every stakeholder sees the same picture, always |
| **Reactive decisions** | A ferry delay, customs hold or rail issue is handled after the fact — optimal window is already closed | Disruptions detected in seconds, optimal fallback ranked and actioned before impact |
| **Unused data** | Years of TMS, ERP and carrier data captured but rarely used to simulate or predict | Every historical decision trains the model — the system gets sharper every week |

---

## The Idea: Three Pillars

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│                     │  │                     │  │                     │
│  01  Live Network   │  │  02  What-If        │  │  03  AI-Driven      │
│      Model          │  │      Simulation     │  │      Optimisation   │
│                     │  │                     │  │                     │
│  Every container,   │  │  Ferry delayed?     │  │  Routes that cut    │
│  route, hub and     │  │  Rail at capacity?  │  │  empty km. Mode     │
│  warehouse mirrored │  │  Customs hold?      │  │  choices that       │
│  in real time.      │  │  Pick the optimal   │  │  protect margin.    │
│  One source of      │  │  fallback in        │  │  Planning aligned   │
│  truth.             │  │  seconds.           │  │  with CSRD targets. │
│                     │  │                     │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## Impact

> *Directional estimates based on comparable intermodal digital-twin programs in Europe and North America.*

| KPI | Baseline | Target | Change |
|---|---|---|---|
| **On-Time Delivery** | 95% | 98%+ | ↑ +3pp |
| **Empty Kilometres** | Current network | — | ↓ 12–18% |
| **CO₂ per Container** | Current mix | — | ↓ 8–15% |
| **Customer ETA Calls** | High volume | — | ↓ 40% |

---

## What-If Simulator

The site includes an **interactive scenario simulator** — pick a disruption and see the before/after:

| Scenario | Without Twin | With Twin | Time Saved |
|---|---|---|---|
| **Ferry delayed 4h** | 4 hours of manual rebooking across 3 systems | Auto-detected → ranked fallback → approved in 9 min | **3h 46m** |
| **Rail at capacity** | Manual load assessment + spot broker outreach + missed windows | 8 loads auto-identified, pre-approved broker triggered | **4h 22m** |
| **Customs hold** | Reactive scramble, customer calls, credits issued | Flagged 36h in advance, rerouted before it hits | **36h advance** |

---

## Roadmap

```
Phase 01  ·  0–3 months   ·  Corridor Pilot: Zeebrugge ↔ UK
──────────────────────────────────────────────────────────────
  ✦ Map one corridor end-to-end
  ✦ Connect TMS + carrier APIs
  ✦ Establish baseline KPIs
  ✦ First live dashboard
  ✦ Stakeholder sign-off

Phase 02  ·  3–6 months   ·  Live Twin + Simulation
──────────────────────────────────────────────────────────────
  ✦ Real-time visibility layer
  ✦ First what-if scenarios
  ✦ Disruption alerting
  ✦ Weekly decision loop
  ✦ KPI tracking vs baseline

Phase 03  ·  6–12 months  ·  Scale + AI Optimisation
──────────────────────────────────────────────────────────────
  ✦ Additional corridors
  ✦ AI routing recommendations
  ✦ Customer-facing ETA portal
  ✦ CSRD sustainability reporting
  ✦ Full network coverage
```

---

## Why Now

**EU CSRD 2026** — Sustainability reporting mandatory for mid-size firms. CO₂-per-shipment data will no longer be optional. ECS needs this infrastructure now.

**AI tooling is mature** — Two years ago this required a dedicated ML team. Today, modern APIs, open-source simulation libraries and LLM-powered planning tools make this buildable with a small, focused team inside 12 months.

**Structural moat** — Every intermodal competitor is still reactive. The first operator to run a live digital twin builds a cost and service advantage that compounds every quarter.

---

## Data Architecture

The twin is built on feeds ECS **already generates** — no new data collection needed in phase one.

| Source | Type | Phase |
|---|---|---|
| TMS / ERP exports | Booking, routing, invoicing | Phase 1 |
| Carrier & vessel APIs | P&O, DFDS, rail operator feeds | Phase 1 |
| Customs & port systems | PLDA, port community platforms | Phase 2 |
| Weather & disruption feeds | External real-time risk signals | Phase 2 |
| Customer ETA portal | Proactive shipment visibility | Phase 3 |

---

## ECS by the Numbers

| | | | | | |
|---|---|---|---|---|---|
| **35+** countries | **6K+** weekly loads | **45%** land on rail | **95%+** on-time | **170K** sqm warehousing | **104 Kt** CO₂ saved/yr |

---

## Tech Stack

This pitch site is intentionally a **single static HTML file** — zero dependencies, instant load, works anywhere.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](.)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](.)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=flat-square&logo=github)](https://phlppgdfry.github.io/ecs-digital-twin/)

Features used:
- SVG network diagram with CSS flow animations
- Intersection Observer API for scroll-triggered fade-ins
- Animated stat counters
- Interactive what-if simulator (vanilla JS, no frameworks)

---

<div align="center">

<br/>

*"Ik heb me verdiept in jullie intermodale werking. Wat opvalt is hoeveel optimalisatiepotentieel*  
*daar zit via data. Een digital twin van jullie supply chain zou ECS proactief laten optimaliseren*  
*op kosten, timing en duurzaamheid."*

<br/>

**Not a candidate. *An asset* — from day one.**

<br/>

Philippe Godfroy · philgodf@gmail.com

</div>
