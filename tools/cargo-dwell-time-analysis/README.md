# 🚢 Cargo Dwell Time Analysis — Port of Zeebrugge

> **Business Analysis Case** · Logistics & Port Operations · SQL · Process Improvement · KPI Design

[![Status](https://img.shields.io/badge/Status-Complete-green)](.) [![Type](https://img.shields.io/badge/Type-BA%20Portfolio-blue)](.) [![Sector](https://img.shields.io/badge/Sector-Logistics-orange)](.)

---

## 🎯 Problem Statement

Container terminals at the Port of Zeebrugge are experiencing an average dwell time of **6.4 days** per container — **38% above the sector benchmark of 4.6 days**. This results in:

- 💸 **€2.1M annual demurrage costs**
- 📉 Reduced terminal throughput capacity
- 😤 Declining service levels for shippers and shipping lines

This project identifies root causes and proposes targeted interventions to **reduce average dwell time by 25%**.

---

## 📊 Key Findings

| # | Root Cause | % of Delayed Containers | Addressable via EDI? |
|---|-----------|------------------------|---------------------|
| 1 | Documentation delay (manual B/L) | **43%** | ✅ Yes |
| 2 | Customs clearance backlog | 22% | ⚠️ Partial |
| 3 | Port congestion (Tue/Wed peak) | 15% | ❌ No |
| 4 | Late shipper pickup | 12% | ❌ No |
| 5 | Inspection required | 8% | ❌ No |

**Additional insight:** 61% of weekly arrivals cluster on Tuesday/Wednesday, overwhelming customs pre-clearance capacity.

---

## 📈 Baseline vs Target KPIs

| KPI | Baseline | Target | Delta |
|-----|----------|--------|-------|
| Avg. Dwell Time | 6.4 days | 4.8 days | **−25%** |
| Containers >5 days | 43% | 22% | **−21pp** |
| Doc Processing Time | 4.2h | 1.1h | **−74%** |
| Annual Demurrage | €2.1M | €1.26M | **−€840K** |
| EDI Adoption Rate | ~20% | ≥80% | **+60pp** |

---

## 🔧 Recommendations

### 🔴 HIGH Priority
- **EDI Integration** with Evergreen Europe & MSC Zeebrugge
  - Est. impact: −1.8 days avg dwell time
  - Implementation: Q1 2025 · Investment: €85,000 · ROI: 4 months

- **Automate B/L Matching & Pre-clearance Notifications**
  - Reduces doc processing from 4.2h → 1.1h
  - Zero hardware cost — software configuration only

### 🟡 MEDIUM Priority
- **Redistribute Import Arrival Scheduling**
  - Coordinate with top 5 shippers to balance Tue/Wed peak
  - Est. impact: −0.4 days · Cost: €0

### 🟢 LOW Priority
- **Mobile Supervisor Dashboard**
  - Real-time dwell time monitoring on terminal floor
  - Development: 6 weeks · Cost: €12,000

---

## 🗂️ Project Structure
cargo-dwell-time-analysis/
│
├── README.md                      ← You are here
├── BRD.md                         ← Business Requirements Document
├── UserStories.md                 ← MoSCoW prioritized user stories
│
├── sql/
│   ├── queries.sql                ← 4 PostgreSQL analysis queries
│   └── schema.md                  ← Database schema documentation
│
├── process/
│   ├── as-is-flow.svg             ← Current state BPMN diagram
│   └── to-be-flow.svg             ← Future state BPMN diagram
│
├── dashboards/
│   └── analysis-data.xlsx         ← 500-row dataset (4 sheets)
│
└── findings/
├── executive-summary.pdf      ← 1-page management summary
└── executive-summary.md       ← GitHub-rendered summary

---

## 🛠️ Tools & Methods

| Category | Tools Used |
|----------|-----------|
| **Data Analysis** | PostgreSQL, Excel (pivot tables), Power BI |
| **Process Mapping** | BPMN 2.0, Lucidchart, Fishbone (Ishikawa) |
| **Requirements** | BRD, MoSCoW prioritization, Connextra user stories |
| **Stakeholders** | Terminal ops (2), Customs liaison (1), Shipping agents (3), Finance (1) |
| **Methodology** | As-Is/To-Be analysis, 5 Whys, Root Cause Analysis |

---

## 📋 Methodology

Stakeholder interviews → understand pain points
As-Is process mapping → document current flow
Data analysis (SQL) → quantify root causes
Root cause analysis → Fishbone + 5 Whys
To-Be process design → propose optimized flow
Business case → ROI calculation & recommendations
KPI framework → monitor post-implementation


---

## 📁 Dataset Overview

The `analysis-data.xlsx` contains 4 worksheets:

| Sheet | Rows | Description |
|-------|------|-------------|
| Container_Movements | 500 | Raw container data Jan 2023–Jun 2024 |
| Monthly_KPI_Summary | 18 | Rolling KPIs per month |
| Agent_Benchmark | 5 | Shipping agent performance comparison |
| Data_Dictionary | 11 | Field definitions & data sources |

---

## 👤 About

**Philippe Godfroy** — IT Developer & Business Analyst  
📍 Knokke-Heist, Belgium · Reviewell BV  
🔗 [GitHub](https://github.com/phlppgdfry) · [LinkedIn](https://linkedin.com/in/philippe-godfroy)

> *This project is part of my Business Analyst portfolio, demonstrating end-to-end BA methodology applied to a realistic logistics case in the port sector.*

---

*Analysis period: Jan 2023 – Jun 2024 · Dataset: 500 container movements · Stakeholders: 7*
