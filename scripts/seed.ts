import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding Cambria Mission Hub...");

  // Create a default season
  const season = await prisma.season.upsert({
    where: { id: "season-2" },
    update: {},
    create: {
      id: "season-2",
      name: "Season 2",
      description: "The current Cambria season with new challenges and rewards.",
      startsAt: new Date("2025-04-11"),
      endsAt: new Date("2025-07-11"),
      isActive: true,
    },
  });
  console.log("  Season:", season.name);

  // Core missions (permanent onboarding)
  const coreMissions = [
    { id: "core-1", title: "Welcome to Cambria", description: "Create your character and enter the world of Cambria.", category: "getting-started", xpReward: 50, sortOrder: 1, icon: "scroll" },
    { id: "core-2", title: "First Steps", description: "Complete the starter island tutorial and earn your first 100 Silver.", category: "getting-started", xpReward: 100, sortOrder: 2, prerequisiteId: "core-1", icon: "footprints" },
    { id: "core-3", title: "Gather Resources", description: "Gather 50 of any resource (wood, fish, ore).", category: "gathering", xpReward: 150, sortOrder: 3, prerequisiteId: "core-2", icon: "pickaxe" },
    { id: "core-4", title: "Craft Your First Item", description: "Use the crafting station to create any item.", category: "crafting", xpReward: 150, sortOrder: 4, prerequisiteId: "core-3", icon: "hammer" },
    { id: "core-5", title: "Win Your First Fight", description: "Defeat a monster in PvE combat.", category: "combat", xpReward: 200, sortOrder: 5, prerequisiteId: "core-4", icon: "sword" },
    { id: "core-6", title: "Trade at the Market", description: "Buy or sell an item at the marketplace.", category: "trading", xpReward: 200, sortOrder: 6, prerequisiteId: "core-5", icon: "coins" },
    { id: "core-7", title: "Reach Level 5", description: "Earn enough XP to reach Level 5 in any skill.", category: "general", xpReward: 300, sortOrder: 7, prerequisiteId: "core-6", icon: "star" },
    { id: "core-8", title: "Defeat a Boss", description: "Take down a world boss in the devastated lands.", category: "combat", xpReward: 500, sortOrder: 8, prerequisiteId: "core-7", icon: "shield" },
  ];

  for (const m of coreMissions) {
    await prisma.mission.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, type: "CORE", isActive: true },
    });
  }
  console.log(`  ${coreMissions.length} core missions`);

  // Seasonal missions
  const seasonalMissions = [
    { id: "s2-1", title: "Silver Rush", description: "Earn 10,000 Silver in a single session.", category: "trading", xpReward: 500, sortOrder: 1, seasonId: "season-2", icon: "gem" },
    { id: "s2-2", title: "Monster Slayer", description: "Defeat 50 monsters during Season 2.", category: "combat", xpReward: 750, sortOrder: 2, seasonId: "season-2", icon: "skull" },
    { id: "s2-3", title: "Master Gatherer", description: "Gather 500 total resources during Season 2.", category: "gathering", xpReward: 600, sortOrder: 3, seasonId: "season-2", icon: "basket" },
    { id: "s2-4", title: "Artifact Hunter", description: "Collect 25 Artifacts from the devastated lands.", category: "general", xpReward: 1000, sortOrder: 4, seasonId: "season-2", icon: "trophy" },
    { id: "s2-5", title: "Royal Favor", description: "Earn 500 Royal Favor through completing quests and trading.", category: "trading", xpReward: 1500, sortOrder: 5, seasonId: "season-2", icon: "fire" },
  ];

  for (const m of seasonalMissions) {
    await prisma.mission.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, type: "SEASONAL", isActive: true, startsAt: new Date("2025-04-11"), endsAt: new Date("2025-07-11") },
    });
  }
  console.log(`  ${seasonalMissions.length} seasonal missions`);

  // Guides
  const guides = [
    { slug: "getting-started", title: "Getting Started in Cambria", category: "getting-started", sortOrder: 1, content: "# Welcome to Cambria\n\nCambria is a risk-to-earn MMO where every action carries real stakes.\n\n## First Steps\n1. Create your character\n2. Complete the starter island\n3. Earn 100 Silver for the boat fare\n4. Travel to the mainland\n\n## Key Mechanics\n- **Gathering**: Fish, mine, and woodcut to collect resources\n- **Crafting**: Turn resources into valuable items\n- **Combat**: Fight monsters (PvE) or other players (PvP)\n- **Trading**: Buy and sell on the marketplace" },
    { slug: "combat-guide", title: "Combat & PvE Guide", category: "combat", sortOrder: 2, content: "# Combat in Cambria\n\n## PvE Combat\nFight monsters across the devastated lands to earn loot and XP.\n\n## World Bosses\nTeam up with other Knights to take down powerful bosses for rare drops.\n\n## Tips\n- Check your gear before venturing into dangerous zones\n- Bring food for healing during fights\n- Start with low-risk areas before exploring deeper territory" },
    { slug: "gathering-guide", title: "Gathering & Resources", category: "gathering", sortOrder: 3, content: "# Gathering Resources\n\n## Skills\n- **Fishing**: Catch fish at water sources\n- **Mining**: Mine ore from rocks\n- **Woodcutting**: Chop trees for lumber\n\n## Tips\n- Higher skill levels unlock better resources\n- Some spots are more dangerous but yield rarer materials\n- Energy regenerates passively - plan your gathering runs" },
    { slug: "trading-guide", title: "Trading & Economy", category: "trading", sortOrder: 4, content: "# The Cambria Economy\n\n## Currency\n- **Silver**: Main in-game currency\n- **Royal Favor**: Secondary currency for special items\n\n## Marketplace\nBuy and sell items with other players.\n\n## Tips\n- Watch market prices before selling\n- Rare crafted items command premium prices\n- Build relationships with regular traders" },
  ];

  for (const g of guides) {
    await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {},
      create: { ...g, isPublished: true },
    });
  }
  console.log(`  ${guides.length} guides`);

  console.log("Seed complete!");
  await prisma.$disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
