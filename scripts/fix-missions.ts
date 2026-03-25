import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function run() {
  // 1. Delete all existing missions
  const deleted = await prisma.mission.deleteMany({});
  console.log("Cleared all", deleted.count, "missions");

  // 2. Add Discord missions back, categorized like the Discord forums
  // Beginner Missions (from beginners-missions forum)
  const beginnerMissions = [
    { id: "beg-1", title: "Reach Level 60", description: "Reach Level 60 in Attack, Strength, Hitpoint, Defense, Fishing, Cooking. 500 silver needed to increase level cap from 40 to 60.", category: "beginner", xpReward: 200, sortOrder: 1 },
    { id: "beg-2", title: "Full Iron Gear", description: "Obtain full Iron Gear from Amber in Camp North Hill: Iron Helmet, Iron Body Armor, Iron Kiteshield.", category: "beginner", xpReward: 250, sortOrder: 2, prerequisiteId: "beg-1" },
    { id: "beg-3", title: "Fish 100 Carp", description: "Fish a total of 100 Carp. Fishing and cooking are essential for survival in corrupted zones.", category: "beginner", xpReward: 200, sortOrder: 3, prerequisiteId: "beg-2" },
    { id: "beg-4", title: "T4 Artifact Zone", description: "Upgrade your weapon, collect essential ranged materials, secure silver-generating items, and farm at least 3,000 Royal Favor in the T4 Artifact Zone.", category: "beginner", xpReward: 400, sortOrder: 4, prerequisiteId: "beg-3" },
  ];

  // Medium Missions (from medium-missions forum)
  const mediumMissions = [
    { id: "med-1", title: "T4 Dungeon Farming", description: "Farm the T4 Dungeon east of Camp North Hill and collect core dungeon-tier upgrades, weapons, and materials.", category: "medium", xpReward: 500, sortOrder: 5, prerequisiteId: "beg-4" },
    { id: "med-2", title: "Level 80 Combat Skills", description: "Raise your next set of core combat skills to the Level 80 cap. Unlock your second major mid-game power spike.", category: "medium", xpReward: 600, sortOrder: 6, prerequisiteId: "med-1" },
    { id: "med-3", title: "Ranged Begins", description: "Raise your Ranged skill and acquire ranged weapons. Begin mastering ranged combat for T4+ zones.", category: "medium", xpReward: 500, sortOrder: 7, prerequisiteId: "med-2" },
    { id: "med-4", title: "Steel/Adamantine Armor", description: "Purchase any three Steel or Adamantine armor pieces from Matilda to complete your first mid-game defensive setup.", category: "medium", xpReward: 500, sortOrder: 8, prerequisiteId: "med-3" },
  ];

  // Hard Missions (from hard-missions forum)
  const hardMissions = [
    { id: "hard-1", title: "T4 Swamps Farming", description: "Start farming in T4 Swamps and complete 1 upgrade option. Purchase Adamantine gear from Matilda.", category: "hard", xpReward: 750, sortOrder: 9, prerequisiteId: "med-4" },
    { id: "hard-2", title: "Endgame Gear", description: "Farm T4 Swamps and complete a full Adamantine or Steel gear setup with upgraded weapons.", category: "hard", xpReward: 800, sortOrder: 10, prerequisiteId: "hard-1" },
    { id: "hard-3", title: "Reach Level 99", description: "Unlock and achieve Level 99 in your core stats by entering and mastering T5 endgame zones.", category: "hard", xpReward: 1000, sortOrder: 11, prerequisiteId: "hard-2" },
    { id: "hard-4", title: "300K Royal Favor", description: "Accumulate 300,000 Royal Favor by farming T5 zones. The final milestone proving complete mastery of the endgame loop.", category: "hard", xpReward: 2000, sortOrder: 12, prerequisiteId: "hard-3" },
  ];

  const allMissions = [...beginnerMissions, ...mediumMissions, ...hardMissions];

  for (const m of allMissions) {
    await prisma.mission.create({
      data: { ...m, type: "CORE", isActive: true },
    });
    console.log(`  + [${m.category}] ${m.title} (${m.xpReward} XP)`);
  }

  console.log(`\nDone. ${allMissions.length} missions added (${beginnerMissions.length} beginner, ${mediumMissions.length} medium, ${hardMissions.length} hard)`);
  await prisma.$disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
