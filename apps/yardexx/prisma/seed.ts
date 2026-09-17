import { PrismaClient, CapacityType, Region } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { databaseConfig } from "../lib/database-config";

const adapter = new PrismaPg(databaseConfig());
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding YardExx Benelux database...");

  const pwd = await bcrypt.hash("demo1234", 12);
  const adminPwd = await bcrypt.hash("admin1234", 12);

  // Belgian terminals
  const terminalsBE = await Promise.all([
    prisma.terminal.upsert({ where: { id: "t-ant-1" }, update: {}, create: { id: "t-ant-1", name: "Noord Terminal Antwerpen", region: "antwerp", contactName: "Jan Vermeersch", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-ant-2" }, update: {}, create: { id: "t-ant-2", name: "Linker Oever Terminal", region: "antwerp", contactName: "Sofie De Backer", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-zee-1" }, update: {}, create: { id: "t-zee-1", name: "Zeebrugge West RoRo", region: "zeebrugge", contactName: "Marc Claeys", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-zee-2" }, update: {}, create: { id: "t-zee-2", name: "Achterhaven Bulk Terminal", region: "zeebrugge", contactName: "Els Verstraete", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-ghe-1" }, update: {}, create: { id: "t-ghe-1", name: "North Sea Port Gent", region: "ghent", contactName: "Pieter Nijs", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-lie-1" }, update: {}, create: { id: "t-lie-1", name: "Port de Liège Container", region: "liege", contactName: "Michel Dubois", verifiedAt: new Date() } }),
  ]);

  // Dutch terminals
  const terminalsNL = await Promise.all([
    prisma.terminal.upsert({ where: { id: "t-rot-1" }, update: {}, create: { id: "t-rot-1", name: "Rotterdam Maasvlakte Terminal", region: "rotterdam", contactName: "Henk van den Berg", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-rot-2" }, update: {}, create: { id: "t-rot-2", name: "ECT Delta Terminal", region: "rotterdam", contactName: "Roos Smit", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-ams-1" }, update: {}, create: { id: "t-ams-1", name: "Port of Amsterdam Bulk", region: "amsterdam", contactName: "Klaas Hoekstra", verifiedAt: new Date() } }),
    prisma.terminal.upsert({ where: { id: "t-vli-1" }, update: {}, create: { id: "t-vli-1", name: "Zeeland Seaports Vlissingen", region: "vlissingen", contactName: "Anke de Groot", verifiedAt: new Date() } }),
  ]);

  const allTerminals = [...terminalsBE, ...terminalsNL];

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@yardexx.com" },
    update: {},
    create: { email: "admin@yardexx.com", password: adminPwd, role: "admin", terminalId: terminalsBE[0].id },
  });

  // Demo users (one per terminal)
  for (let i = 0; i < allTerminals.length; i++) {
    const email = `demo${i + 1}@yardexx.com`;
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: pwd, role: "operator", terminalId: allTerminals[i].id },
    });
  }

  // Listings — rich spread across Benelux
  const now = new Date();
  const d = (days: number) => new Date(now.getTime() + days * 86400000);

  const listings: Array<{
    id: string; terminalId: string; side: "offer" | "demand";
    capacityType: CapacityType; region: Region;
    volumeM2: number; pricePerM2PerDay: number;
    availableFrom: Date; availableTo: Date; description: string;
    isSublet?: boolean; isGreen?: boolean; certifications?: string[];
  }> = [
    { id: "l-001", terminalId: "t-ant-1", side: "offer", capacityType: "container", region: "antwerp", volumeM2: 5000, pricePerM2PerDay: 0.85, availableFrom: d(7), availableTo: d(37), description: "Gecertificeerde stackruimte, directe kaaiaansluiting kaai 742. Reefer-pluggen aanwezig.", certifications: ["AEO", "ISPS"] },
    { id: "l-002", terminalId: "t-ant-2", side: "demand", capacityType: "container", region: "antwerp", volumeM2: 3000, pricePerM2PerDay: 0.90, availableFrom: d(10), availableTo: d(30), description: "Piekvraag door MSC import Q3. Flexibele timing, min. 2000 m²." },
    { id: "l-003", terminalId: "t-zee-1", side: "offer", capacityType: "roro", region: "zeebrugge", volumeM2: 12000, pricePerM2PerDay: 0.60, availableFrom: d(5), availableTo: d(65), description: "Grote RoRo-zone. Geschikt voor automotive, beveiliging 24/7." },
    { id: "l-004", terminalId: "t-zee-2", side: "demand", capacityType: "roro", region: "zeebrugge", volumeM2: 5000, pricePerM2PerDay: 0.65, availableFrom: d(14), availableTo: d(60), description: "Tijdelijke overloop voertuiglading (Volvo/Audi). Beveiliging vereist." },
    { id: "l-005", terminalId: "t-ghe-1", side: "offer", capacityType: "dry_bulk", region: "ghent", volumeM2: 8000, pricePerM2PerDay: 0.45, availableFrom: d(3), availableTo: d(93), description: "Overdekte bulkopslag, crane-ready. Directe kaaiaansluiting, min. 3000 m².", isGreen: true },
    { id: "l-006", terminalId: "t-ant-2", side: "offer", capacityType: "ev_storage", region: "antwerp", volumeM2: 2500, pricePerM2PerDay: 1.25, availableFrom: d(0), availableTo: d(14), description: "Brandveilige EV-opslag met blusvoorzieningen. Gecertificeerd voor batterijopslag.", certifications: ["Battery-Safe"] },
    { id: "l-007", terminalId: "t-rot-1", side: "offer", capacityType: "container", region: "rotterdam", volumeM2: 15000, pricePerM2PerDay: 0.92, availableFrom: d(14), availableTo: d(74), description: "Maasvlakte 2 stackruimte, hoge capaciteit, 24/7 bereikbaar.", isSublet: true },
    { id: "l-008", terminalId: "t-rot-2", side: "demand", capacityType: "container", region: "rotterdam", volumeM2: 8000, pricePerM2PerDay: 0.95, availableFrom: d(7), availableTo: d(37), description: "Overloopcapaciteit gezocht voor piekperiode Q3. ECT-gecertificeerd vereist.", certifications: ["ECT"] },
    { id: "l-009", terminalId: "t-ams-1", side: "offer", capacityType: "warehouse", region: "amsterdam", volumeM2: 10000, pricePerM2PerDay: 0.75, availableFrom: d(0), availableTo: d(120), description: "Cross-dock warehouse bij haven. 15 docks beschikbaar.", isGreen: true },
    { id: "l-010", terminalId: "t-vli-1", side: "offer", capacityType: "truck_parking", region: "vlissingen", volumeM2: 7000, pricePerM2PerDay: 0.15, availableFrom: d(21), availableTo: d(81), description: "Beveiligde truck parking met sanitaire voorzieningen. ISPS-gecertificeerd.", certifications: ["ISPS"] },
    { id: "l-011", terminalId: "t-lie-1", side: "offer", capacityType: "container", region: "liege", volumeM2: 4000, pricePerM2PerDay: 0.65, availableFrom: d(5), availableTo: d(45), description: "Binnenhaventerminal Luik. Intermodaal (barge/rail/weg). Ideaal for hinterland distributie." },
  ];

  for (const l of listings) {
    await prisma.listing.upsert({ where: { id: l.id }, update: {}, create: l });
  }

  console.log(`✅ Seeded ${allTerminals.length} terminals, ${listings.length} listings`);
  console.log("\nDemo accounts:");
  console.log("  admin@yardexx.com   / admin1234  (admin — kan terminals verifiëren)");
  console.log("  demo1@yardexx.com   / demo1234   (Antwerpen)");
  console.log("  demo7@yardexx.com   / demo1234   (Rotterdam)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
