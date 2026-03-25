import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const missions = [
  // Beginner missions
  { id:"disc-b1", title:"Reach Level 60", description:"Reach Level 60 in Attack, Strength, Hitpoint, Defense, Fishing, Cooking. 500 silver needed to increase level cap from 40 to 60.", type:"CORE" as const, category:"getting-started", xpReward:200, sortOrder:11 },
  { id:"disc-b2", title:"Full Iron Gear", description:"Obtain full Iron Gear from Amber in Camp North Hill: Iron Helmet, Iron Body Armor, Iron Kiteshield.", type:"CORE" as const, category:"gathering", xpReward:250, sortOrder:12, prerequisiteId:"disc-b1" },
  { id:"disc-b3", title:"Fish 100 Carp", description:"Fish a total of 100 Carp. Fishing and cooking are essential for survival in corrupted zones.", type:"CORE" as const, category:"gathering", xpReward:200, sortOrder:13, prerequisiteId:"disc-b2" },
  { id:"disc-b4", title:"T4 Artifact Zone", description:"Upgrade your weapon, collect essential ranged materials, secure silver-generating items, and farm at least 3,000 Royal Favor in the T4 Artifact Zone.", type:"CORE" as const, category:"combat", xpReward:400, sortOrder:14, prerequisiteId:"disc-b3" },
  // Medium missions
  { id:"disc-m1", title:"T4 Dungeon Farming", description:"Farm the T4 Dungeon east of Camp North Hill and collect core dungeon-tier upgrades, weapons, and materials.", type:"CORE" as const, category:"combat", xpReward:500, sortOrder:15, prerequisiteId:"disc-b4" },
  { id:"disc-m2", title:"Level 80 Combat Skills", description:"Raise your next set of core combat skills to the Level 80 cap. Unlock your second major mid-game power spike.", type:"CORE" as const, category:"combat", xpReward:600, sortOrder:16, prerequisiteId:"disc-m1" },
  { id:"disc-m3", title:"Steel/Adamantine Armor", description:"Purchase any three Steel or Adamantine armor pieces from Matilda to complete your first mid-game defensive setup.", type:"CORE" as const, category:"trading", xpReward:500, sortOrder:17, prerequisiteId:"disc-m2" },
  // Hard missions
  { id:"disc-h1", title:"T4 Swamps Farming", description:"Start farming in T4 Swamps and complete 1 upgrade option. Purchase Adamantine gear from Matilda.", type:"CORE" as const, category:"combat", xpReward:750, sortOrder:18, prerequisiteId:"disc-m3" },
  { id:"disc-h2", title:"Reach Level 99", description:"Unlock and achieve Level 99 in your core stats by entering and mastering T5 endgame zones.", type:"CORE" as const, category:"combat", xpReward:1000, sortOrder:19, prerequisiteId:"disc-h1" },
  { id:"disc-h3", title:"300K Royal Favor", description:"Accumulate 300,000 Royal Favor by farming T5 zones. The final milestone proving complete mastery of the endgame loop.", type:"CORE" as const, category:"general", xpReward:2000, sortOrder:20, prerequisiteId:"disc-h2" },
];

async function seed() {
  console.log("Seeding Discord missions...");
  for (const m of missions) {
    await prisma.mission.upsert({
      where: { id: m.id },
      update: { title: m.title, description: m.description },
      create: { ...m, isActive: true },
    });
    console.log("  +", m.title);
  }
  const count = await prisma.mission.count();
  console.log(`Done. Total missions in DB: ${count}`);
  await prisma.$disconnect();
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
