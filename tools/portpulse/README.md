<div align="center">

<img src="public/favicon.svg" width="72" alt="PortPulse logo" />

# PortPulse

### Dead Time Analytics voor haventerminals

**Maak verborgen inefficiëntie realtime zichtbaar — en weet exact hoeveel het kost.**

[![Live Demo](https://img.shields.io/badge/▶%20Open%20Live%20Demo-portpulse--blue.vercel.app-06b6d4?style=for-the-badge&logoColor=white)](https://portpulse-blue.vercel.app)
&nbsp;
[![GitHub](https://img.shields.io/badge/Broncode-GitHub-1f2937?style=for-the-badge&logo=github&logoColor=white)](https://github.com/phlppgdfry/portpulse)

</div>

---

## Wat lost dit op?

In een drukke zeehaven zoals Zeebrugge verwerken terminals dagelijks **honderden trucks**.  
Elke truck die wacht, kost geld. Elke crane die stilstaat, kost geld. Elke shift die slecht loopt, kost geld.

**Het probleem:** iedereen *voelt* de inefficiëntie — maar niemand kan exact meten *waar* de tijd verloren gaat.

Data zit verspreid over Excel, SAP, radio's, papieren, en terminal software. Planners werken reactief.  
Er is geen centraal overzicht. Geen voorspelling. Geen AI.

**PortPulse verandert dat.**

> "Waze voor havenoperaties" — realtime zichtbaarheid op elke truck, elke lane, elke contractor.

---

## Functies

### Dashboard
- **Live kostenteller** — ziet in real-time hoeveel dead time vandaag al kost (tikt per seconde omhoog)
- **5 KPI-kaarten** — gem. wachttijd, dead time uren, kosten, trucks verwerkt, efficiëntiescore
- **Live alert banner** — actieve bottlenecks met severity, locatie, aantal getroffen trucks
- **Wachttijd chart** — area chart per uur met congestion pieken en KPI-drempelwaarde
- **Live bottlenecks panel** — top 3 verstoringen met progressie-balk en tijdstempel

### Analyse
- **Week trend overzicht** — efficiëntiescore en wachttijd per dag van de week
- **Congestion heatmap** — 12 lanes × 24 uur, kleurcodering groen→rood per tijdslot
- **Shift performantie** — dag / avond / nacht vergelijking op score en wachttijd
- **Dead time oorzaken** — gestapelde verdeling: gate congestion, kraan stilstand, douane, shift overdracht

### Contractors
- **Ranking tabel** — gesorteerd op efficiëntiescore met trend (verbeterend / stabiel / verslechterend)
- **Zoekfunctie** — filter op contractor naam
- **Automatische tip** — kostenverschil tussen beste en slechtste contractor berekend

### AI Insights
- **Spaaroverzicht** — totaal wekelijks + jaarlijks potentieel per terminal
- **4 AI-aanbevelingen** — concreet, met impact in euro's en AI-confidence score
  - Kostenbesparing: routing optimalisaties
  - Aandachtspunten: verzwakkende contractors
  - Patroon detectie: structurele pieken

### Terminal Switcher
- **4 terminals** — ZCT, ICO, CSP, DP World Zeebrugge
- Alle KPI's schalen automatisch per terminal

---

## Tech Stack

| Laag | Technologie |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| Grafieken | Recharts |
| Iconen | Lucide React |
| State | React Context |
| Deploy | Vercel |

---

## Lokaal draaien

```bash
git clone https://github.com/phlppgdfry/portpulse.git
cd portpulse
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Roadmap

- [ ] Supabase backend — echte real-time events via WebSockets
- [ ] CSV import — upload exports uit TOS (NAVIS, SAP) direct inladen
- [ ] GPS integratie — truck tracking binnen het terminal terrein
- [ ] Multi-terminal dashboard — vergelijk 2 terminals naast elkaar
- [ ] Mobiele app — chauffeurs melden events via QR-scan
- [ ] Email alerts — automatische notificaties bij kritieke bottlenecks
- [ ] Exporteer rapport — PDF rapportage per shift of week

---

## Waarom dit werkt

Havens denken in **throughput**, **minuten** en **utilization**.

Zelfs een kleine optimalisatie heeft grote impact:

| Verbetering | Impact |
|---|---|
| 7 min sneller per truck bij 1.200 trucks/dag | **+140 uur/dag beschikbaar** |
| 1 bottleneck minder per shift | **−€8.400/week kosten** |
| Lane routing optimalisatie | **€18.600/week bespaard** |

PortPulse maakt dit meetbaar, zichtbaar, en herhaalbaar.

---

## Contact

**Philippe Godfroy**  
Zeebrugge, België  
[github.com/phlppgdfry](https://github.com/phlppgdfry)

---

<div align="center">
  <sub>Gebouwd voor de logistieke cluster van Zeebrugge · Schaalbaar naar Rotterdam, Hamburg, Antwerpen</sub>
</div>
