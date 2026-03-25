import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function run() {
  const deleted = await prisma.mission.deleteMany({ where: { id: { startsWith: "disc-" } } });
  console.log("Deleted", deleted.count, "Discord missions");
  const remaining = await prisma.mission.count();
  console.log("Remaining missions:", remaining);
  await prisma.$disconnect();
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
