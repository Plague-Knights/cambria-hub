import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function run() {
  // Clear all missions
  const deleted = await prisma.mission.deleteMany({});
  console.log("Cleared", deleted.count, "missions");

  // Delete old seasons, create new ones
  await prisma.season.deleteMany({});

  const s3 = await prisma.season.create({
    data: { id: "s3", name: "Season 3", description: "Current season missions", startsAt: new Date("2025-07-01"), endsAt: new Date("2025-10-01"), isActive: true },
  });
  const s4 = await prisma.season.create({
    data: { id: "s4", name: "Season 4", description: "Upcoming season", startsAt: new Date("2025-10-01"), endsAt: new Date("2026-01-01"), isActive: false },
  });
  console.log("Created seasons:", s3.name, s4.name);

  // First Landing Missions (the Discord beginner/medium/hard ones)
  const firstLanding = [
    { id: "fl-1", title: "Reach Level 60", description: "Reach Level 60 in Attack, Strength, Hitpoint, Defense, Fishing, Cooking. 500 silver needed to increase level cap from 40 to 60.", category: "first-landing", xpReward: 200, sortOrder: 1 },
    { id: "fl-2", title: "Full Iron Gear", description: "Obtain full Iron Gear from Amber in Camp North Hill: Iron Helmet, Iron Body Armor, Iron Kiteshield.", category: "first-landing", xpReward: 250, sortOrder: 2, prerequisiteId: "fl-1" },
    { id: "fl-3", title: "Fish 100 Carp", description: "Fish a total of 100 Carp. Fishing and cooking are essential for survival in corrupted zones.", category: "first-landing", xpReward: 200, sortOrder: 3, prerequisiteId: "fl-2" },
    { id: "fl-4", title: "T4 Artifact Zone", description: "Upgrade your weapon, collect essential ranged materials, secure silver-generating items, and farm at least 3,000 Royal Favor in the T4 Artifact Zone.", category: "first-landing", xpReward: 400, sortOrder: 4, prerequisiteId: "fl-3" },
    { id: "fl-5", title: "T4 Dungeon Farming", description: "Farm the T4 Dungeon east of Camp North Hill and collect core dungeon-tier upgrades, weapons, and materials.", category: "first-landing", xpReward: 500, sortOrder: 5, prerequisiteId: "fl-4" },
    { id: "fl-6", title: "Level 80 Combat Skills", description: "Raise your next set of core combat skills to the Level 80 cap. Unlock your second major mid-game power spike.", category: "first-landing", xpReward: 600, sortOrder: 6, prerequisiteId: "fl-5" },
    { id: "fl-7", title: "Steel/Adamantine Armor", description: "Purchase any three Steel or Adamantine armor pieces from Matilda to complete your first mid-game defensive setup.", category: "first-landing", xpReward: 500, sortOrder: 7, prerequisiteId: "fl-6" },
    { id: "fl-8", title: "T4 Swamps Farming", description: "Start farming in T4 Swamps and complete 1 upgrade option. Purchase Adamantine gear from Matilda.", category: "first-landing", xpReward: 750, sortOrder: 8, prerequisiteId: "fl-7" },
    { id: "fl-9", title: "Reach Level 99", description: "Unlock and achieve Level 99 in your core stats by entering and mastering T5 endgame zones.", category: "first-landing", xpReward: 1000, sortOrder: 9, prerequisiteId: "fl-8" },
    { id: "fl-10", title: "300K Royal Favor", description: "Accumulate 300,000 Royal Favor by farming T5 zones. The final milestone proving complete mastery of the endgame loop.", category: "first-landing", xpReward: 2000, sortOrder: 10, prerequisiteId: "fl-9" },
  ];

  // S3 Missions (same content for now as placeholder)
  const s3Missions = [
    { id: "s3-1", title: "Reach Level 60", description: "Reach Level 60 in Attack, Strength, Hitpoint, Defense, Fishing, Cooking. 500 silver needed to increase level cap from 40 to 60.", category: "s3", xpReward: 200, sortOrder: 1, seasonId: "s3" },
    { id: "s3-2", title: "Full Iron Gear", description: "Obtain full Iron Gear from Amber in Camp North Hill: Iron Helmet, Iron Body Armor, Iron Kiteshield.", category: "s3", xpReward: 250, sortOrder: 2, prerequisiteId: "s3-1", seasonId: "s3" },
    { id: "s3-3", title: "Fish 100 Carp", description: "Fish a total of 100 Carp. Fishing and cooking are essential for survival in corrupted zones.", category: "s3", xpReward: 200, sortOrder: 3, prerequisiteId: "s3-2", seasonId: "s3" },
    { id: "s3-4", title: "T4 Artifact Zone", description: "Upgrade your weapon, collect essential ranged materials, secure silver-generating items, and farm at least 3,000 Royal Favor in the T4 Artifact Zone.", category: "s3", xpReward: 400, sortOrder: 4, prerequisiteId: "s3-3", seasonId: "s3" },
    { id: "s3-5", title: "T4 Dungeon Farming", description: "Farm the T4 Dungeon east of Camp North Hill and collect core dungeon-tier upgrades, weapons, and materials.", category: "s3", xpReward: 500, sortOrder: 5, prerequisiteId: "s3-4", seasonId: "s3" },
    { id: "s3-6", title: "Level 80 Combat Skills", description: "Raise your next set of core combat skills to the Level 80 cap.", category: "s3", xpReward: 600, sortOrder: 6, prerequisiteId: "s3-5", seasonId: "s3" },
    { id: "s3-7", title: "Steel/Adamantine Armor", description: "Purchase any three Steel or Adamantine armor pieces from Matilda.", category: "s3", xpReward: 500, sortOrder: 7, prerequisiteId: "s3-6", seasonId: "s3" },
    { id: "s3-8", title: "T4 Swamps Farming", description: "Start farming in T4 Swamps and complete 1 upgrade option.", category: "s3", xpReward: 750, sortOrder: 8, prerequisiteId: "s3-7", seasonId: "s3" },
    { id: "s3-9", title: "Reach Level 99", description: "Unlock and achieve Level 99 in your core stats by entering and mastering T5 endgame zones.", category: "s3", xpReward: 1000, sortOrder: 9, prerequisiteId: "s3-8", seasonId: "s3" },
    { id: "s3-10", title: "300K Royal Favor", description: "Accumulate 300,000 Royal Favor by farming T5 zones.", category: "s3", xpReward: 2000, sortOrder: 10, prerequisiteId: "s3-9", seasonId: "s3" },
  ];

  // Duel Arena placeholder
  const duelMissions = [
    { id: "duel-1", title: "First Duel", description: "Enter the Duel Arena and complete your first duel.", category: "duel-arena", xpReward: 300, sortOrder: 1 },
    { id: "duel-2", title: "Win 5 Duels", description: "Win 5 duels in the Duel Arena.", category: "duel-arena", xpReward: 500, sortOrder: 2, prerequisiteId: "duel-1" },
    { id: "duel-3", title: "Duel Streak", description: "Win 3 duels in a row without losing.", category: "duel-arena", xpReward: 1000, sortOrder: 3, prerequisiteId: "duel-2" },
  ];

  const all = [...firstLanding, ...s3Missions, ...duelMissions];
  for (const m of all) {
    await prisma.mission.create({ data: { ...m, type: "CORE", isActive: true } });
  }

  console.log(`\nSeeded ${all.length} missions:`);
  console.log(`  First Landing: ${firstLanding.length}`);
  console.log(`  Season 3: ${s3Missions.length}`);
  console.log(`  Duel Arena: ${duelMissions.length}`);

  await prisma.$disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
